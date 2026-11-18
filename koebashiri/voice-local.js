'use strict';

window.KoebashiriLocalVoice = (() => {
  const libraryURL = 'https://cdn.jsdelivr.net/npm/vosk-browser@0.0.8/dist/vosk.js';
  const libraryIntegrity = 'sha384-nqyY8clHf93uBYFkgkACShMTuvE3U57yXSJaf0Ws+XgzcoUe6OB/1BiOfHqKOWeg';
  const modelURL = 'https://huggingface.co/rhasspy/vosk-models/resolve/8e5f85a35b402c35022b5af62c101dd6a06d0219/ja/vosk-model-small-ja-0.22.zip';
  // These spellings use the model's vocabulary and the game's existing reading aliases.
  // The unknown word and competing readings give off-script speech a path of its own.
  const vocabulary = JSON.stringify([
    '月日 は', 'はく たい の 価格 に し て', '行き交う 年 も', 'また 旅人 なり',
    '舟 の 上 に', '生涯 を 浮かべ', '馬 の 口 捕らえ て', '老い を むかう る 者 は',
    '日々 旅 に し て', '旅 を 住処 と す', '古人 も 多く', '旅 に 死せ る あり',
    'ひゃく だい の', '客 に し て', 'か きゃく に し て', '[unk]'
  ]);
  const Audio = window.AudioContext || window.webkitAudioContext;
  let modelPromise;

  function supported() {
    return Boolean(window.isSecureContext && navigator.mediaDevices?.getUserMedia &&
      Audio?.prototype.createScriptProcessor && window.WebAssembly && window.Worker && window.indexedDB);
  }

  function loadLibrary() {
    if (window.Vosk) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = libraryURL;
      script.integrity = libraryIntegrity;
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      const timeout = setTimeout(() => failed(), 25000);
      function failed() {
        clearTimeout(timeout);
        script.remove();
        reject(new Error('Cannot load the recognition engine'));
      }
      script.onload = () => {
        clearTimeout(timeout);
        if (window.Vosk?.Model) resolve();
        else failed();
      };
      script.onerror = failed;
      document.head.append(script);
    });
  }

  function prepare() {
    modelPromise ??= loadLibrary().then(() => new Promise((resolve, reject) => {
      const model = new window.Vosk.Model(modelURL, -1);
      const timeout = setTimeout(() => failed(), 180000);
      function failed() {
        clearTimeout(timeout);
        try { model.terminate(); } catch {}
        reject(new Error('Cannot prepare the Japanese model'));
      }
      model.on('load', message => {
        if (!message.result) return failed();
        clearTimeout(timeout);
        resolve(model);
      });
      model.on('error', failed);
    })).catch(error => {
      modelPromise = undefined;
      throw error;
    });
    return modelPromise;
  }

  class LocalRecognition {
    constructor(model) {
      this.model = model;
      this.results = [];
      this.pending = 0;
      this.closed = false;
      this.draining = false;
      this.voicedAt = null;
      this.lastVoiceAt = null;
    }

    async start() {
      try {
        // Resume in the tap handler so Safari can activate Web Audio.
        this.context = new Audio();
        const resumed = this.context.resume();
        void resumed.catch(() => {});
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true }
        });
        if (this.closed) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        this.stream = stream;
        await resumed;
        if (this.closed) return;
        this.recognizer = new this.model.KaldiRecognizer(this.context.sampleRate, vocabulary);
        this.recognizer.setWords(true);
        this.recognizer.on('partialresult', message => this.receive(message.result.partial, false));
        this.recognizer.on('result', ({ result }) => {
          const text = result.result?.map(word => word.conf < 0.8 ? '[unk]' : word.word).join(' ') ?? result.text;
          this.receive(text, true);
        });
        this.recognizer.on('error', () => this.fail('recognition-error'));
        this.source = this.context.createMediaStreamSource(stream);
        this.processor = this.context.createScriptProcessor(4096, 1, 1);
        this.muted = this.context.createGain();
        this.muted.gain.value = 0;
        this.processor.onaudioprocess = event => this.accept(event.inputBuffer);
        this.source.connect(this.processor);
        this.processor.connect(this.muted);
        this.muted.connect(this.context.destination);
        stream.getAudioTracks().forEach(track => track.addEventListener('ended', () => this.fail('audio-capture')));
        this.onstart?.();
      } catch (error) {
        this.fail(error.name === 'NotAllowedError' || error.name === 'SecurityError' ? 'not-allowed' : 'audio-capture');
      }
    }

    accept(buffer) {
      if (this.closed || this.draining) return;
      const now = performance.now();
      const samples = buffer.getChannelData(0);
      let energy = 0;
      for (const sample of samples) energy += sample * sample;
      // Use signal level only to measure spoken time. Vosk determines the text.
      if (Math.sqrt(energy / samples.length) >= 0.012) {
        this.lastVoiceAt = now;
        if (this.voicedAt === null) {
          this.voicedAt = now - buffer.duration * 1000;
          this.onspeechstart?.({ timeStamp: this.voicedAt });
        }
      }
      try {
        ++this.pending;
        this.recognizer.acceptWaveform(buffer);
      } catch {
        this.fail('recognition-error');
      }
    }

    receive(value, final) {
      if (this.closed) return;
      const last = this.draining && final && this.pending === 0;
      if (this.pending > 0) --this.pending;
      const text = value?.replaceAll('[unk]', '（聞き取り不明）').trim() || '';
      if (final && this.voicedAt !== null) {
        this.onspeechend?.({ timeStamp: this.lastVoiceAt });
        this.voicedAt = null;
        this.lastVoiceAt = null;
      }
      if (text || this.lastPartial) {
        const resultIndex = this.results.length;
        const result = Object.assign([{ transcript: text }], { isFinal: final });
        if (final && text) this.results.push(result);
        this.onresult?.({
          resultIndex,
          results: !final && text ? this.results.concat([result]) : this.results
        });
      }
      this.lastPartial = !final && Boolean(text);
      if (last && !this.closed) {
        this.abort();
        this.onend?.();
      }
    }

    stopInput() {
      if (this.processor) this.processor.onaudioprocess = null;
      this.source?.disconnect();
      this.processor?.disconnect();
      this.muted?.disconnect();
      this.source = this.processor = this.muted = null;
      this.stream?.getTracks().forEach(track => track.stop());
      this.stream = null;
      if (this.context && this.context.state !== 'closed') void this.context.close().catch(() => {});
      this.context = null;
    }

    stop() {
      if (this.closed || this.draining) return;
      this.draining = true;
      this.stopInput();
      if (this.recognizer) this.recognizer.retrieveFinalResult();
      else {
        this.abort();
        this.onend?.();
      }
    }

    abort() {
      if (this.closed) return;
      this.closed = true;
      this.stopInput();
      this.recognizer?.remove();
      this.recognizer = null;
    }

    fail(error) {
      if (this.closed) return;
      this.abort();
      this.onerror?.({ error });
    }
  }

  return { supported, prepare, LocalRecognition };
})();
