'use strict';

(() => {
  const Cards = KotoCards;
  const Bank = KotoQuestions;
  const Story = KotoStory;
  const Engine = KotoEngine;
  const saveKey = 'kokyo.kotoaka.save.v1';
  const main = document.querySelector('#main');
  const notice = document.querySelector('#notice');
  const importFile = document.querySelector('#import-file');
  const filters = {grade:0, field:'', level:0, size:5};
  const collection = {group:'all', status:'all', query:''};
  const formatDate = new Intl.DateTimeFormat('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
  const tag = (label, style = '') => `<span class="tag ${style}">${label}</span>`;
  const btn = (label, action, style = 'primary', value = '') =>
    `<button type="button" class="btn ${style}" data-action="${action}" data-value="${value}">${label}</button>`;
  const esc = value => String(value).replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const levelNames = ['','基礎','標準','発展'];
  const arrows = ['上','右','下','左'];
  const rewardName = id => Cards.byId[id].name;
  let storageOk = true;
  let state = load();
  let view = 'campus';
  let storyLine = -1;
  let quiz = null;
  let battle = null;
  let deckMode = false;
  let draft = [];
  let cardDialog = '';
  let noticeTimer;

  function load() {
    try {
      const raw = localStorage.getItem(saveKey);
      return raw ? Engine.parseSave(JSON.parse(raw)) : Engine.fresh();
    } catch {
      storageOk = false;
      return Engine.fresh();
    }
  }

  function save() {
    try {
      localStorage.setItem(saveKey,JSON.stringify(state));
      storageOk = true;
    } catch { storageOk = false; }
  }

  function announce(message) {
    clearTimeout(noticeTimer);
    notice.textContent = message;
    notice.classList.add('visible');
    noticeTimer = setTimeout(() => {
      notice.classList.remove('visible');
      notice.textContent = '';
    },4200);
  }

  function heading(label, title, description = '') {
    return `<div class="heading"><p class="eyebrow">${label}</p><h1>${title}</h1>${description ? `<p class="muted">${description}</p>` : ''}</div>`;
  }

  function portrait(face, label, size = '') {
    return `<span class="portrait portrait-${face} ${size}" aria-hidden="true">${label}</span>`;
  }

  function rewardsText(rewards) {
    return rewards.map(item => `${rewardName(item.id)}${item.duplicate ? '（重複）' : ''}`).join('、');
  }

  function render() {
    document.querySelectorAll('[data-view]').forEach(node => {
      if (!node.closest('nav')) return;
      if (node.dataset.view === view) node.setAttribute('aria-current','page');
      else node.removeAttribute('aria-current');
    });
    const pages = {campus,study,battle:battlePage,cards:cardsPage,save:savePage};
    main.innerHTML = pages[view]();
    drawArt(main);
  }

  function go(target) {
    const changed = view !== target;
    if (changed) cardDialog = '';
    view = target;
    render();
    if (changed) {
      window.scrollTo(0,0);
      main.focus({preventScroll:true});
    }
  }

  function stageArt(place) {
    if (place.includes('ホール')) return 'hall';
    if (place.includes('中庭')) return 'yard';
    if (place.includes('部室')) return 'club';
    if (place.includes('1年A組')) return 'classroom';
    return 'library';
  }

  function campus() {
    const current = Engine.scene(state);
    const {day, dayIndex, act, actIndex} = current || {day:Story.days.at(-1),dayIndex:4,act:null,actIndex:2};
    const known = Object.keys(state.owned).length;
    const studying = Engine.tally(state);
    const days = Story.days.map((item,index) => {
      const status = index < dayIndex || !current ? 'done' : index === dayIndex ? 'current' : '';
      return `<li class="${status}"><span class="day-marker">${status === 'done' ? '✓' : '0' + (index + 1)}</span><div><small>${item.date}</small><strong>${item.label}</strong></div></li>`;
    }).join('');
    const schedule = day.acts.map((item,index) =>
      `<div class="schedule-item ${current && index === actIndex ? 'active' : ''}"><span>${item.label}</span><b>${item.title}</b><small>${!current || index < actIndex ? '✓' : index === actIndex ? '●' : '○'}</small></div>`
    ).join('');
    const hero = act && storyLine >= 0 ? sceneView(day,act) : `
      <section class="hero scene-library">
        <div class="hero-content">
          <div class="hero-kicker"><span></span> 第1章　${Story.title}</div>
          <h1>僕のコトバ<br>アカデミア</h1>
          <p class="hero-desc">${current ? '転入生・藤原律として、言葉とカードを手に<br class="wide-only">学園での五日間を過ごそう。' : '青いしおりを挟んだまま、<br>春のことば祭は幕を閉じた。'}</p>
          <div class="actions">${current ? btn(state.progress === 0 ? '学園生活をはじめる →' : '学園生活を続ける →','story-start') : btn('集中学習へ →','go','primary','study')}
            ${current ? btn('集中学習','go','ghost','study') : btn('カード対戦へ','go','ghost','battle')}</div>
        </div>
        <div class="hero-caption"><span>✧</span> ${current ? '中央図書室' : '第1章 読了'}</div>
      </section>`;
    return `<div class="campus-layout">
      ${hero}
      <aside class="panel calendar"><div class="between"><p class="eyebrow">学園の予定</p>${tag(current ? day.date : '読了','accent')}</div>
        <h2>${current ? day.label : '五日間の記録'}</h2><p class="muted compact">${current ? day.note : '授業・集中学習・カード対戦の記録は、ここから先も続きます。'}</p>
        <ol class="timeline">${days}</ol>
      </aside>
      <section class="panel schedule"><div class="between"><h2>${current ? '今日の時間割' : '最終日の時間割'}</h2><span class="muted small">${day.date}</span></div><div class="schedule-list">${schedule}</div></section>
      <section class="panel campus-stats"><h2>律の記録</h2><div class="stat-grid">
        <button data-action="go" data-value="cards"><strong>${known}<small>/151</small></strong><span>カード</span></button>
        <button data-action="go" data-value="save"><strong>${studying.attempts}<small>問</small></strong><span>解いた問題</span></button>
        <button data-action="go" data-value="battle"><strong>${state.wins}<small>勝</small></strong><span>対戦</span></button>
      </div></section>
    </div>`;
  }

  function sceneView(day, act) {
    const line = act.lines[storyLine];
    const face = line && Story.faces[line[0]];
    const isLast = storyLine >= act.lines.length - 1;
    return `<section class="hero narrative scene-${stageArt(act.place)}">
      <div class="scene-top"><div>${tag(day.date + ' · ' + act.label,'accent')}<h1>${act.title}</h1></div><span>${act.place}</span></div>
      <div class="dialogue">
        ${act.poem && (storyLine === 0 || isLast) ? `<figure class="poem"><blockquote>${Story.poem}</blockquote><figcaption>${Story.author}</figcaption></figure>` : ''}
        ${line ? `<div class="speaker">${face ? portrait(face[1],face[0]) : ''}<div><b>${line[0]}</b><p>${line[1]}</p></div></div>` : ''}
        <div class="actions story-actions">
          ${isLast ? [
            act.field ? btn('授業の問題を解く','class-quiz','secondary',act.field) : '',
            act.rival ? btn('対戦卓へ','scene-battle','secondary',act.rival) : '',
            btn(state.progress === Engine.maxProgress - 1 ? '第1章を読み終える' : '次の時間へ →','story-finish')
          ].join('') : btn('続きを読む →','story-next')}
          <span class="muted small">${Math.min(storyLine + 1,act.lines.length)} / ${act.lines.length}</span>
        </div>
      </div>
    </section>`;
  }

  function select(label, id, values, current) {
    return `<label>${label}<select id="${id}">${values.map(([value,name]) =>
      `<option value="${value}" ${String(current) === String(value) ? 'selected' : ''}>${name}</option>`
    ).join('')}</select></label>`;
  }

  function study() {
    if (quiz) return quizPage();
    const due = Engine.tally(state).due;
    const units = Bank.units.filter(unit => !filters.grade || unit.grade === filters.grade);
    return heading('集中学習','国語の演習','学年・分野・難易度を選ぶと、問題と選択肢の順序が変わります。') + `
      <div class="study-grid">
        <section class="panel">
          <h2>ランダム演習</h2>
          <div class="form-grid">
            ${select('学年','study-grade',[[0,'全学年'],[1,'1年'],[2,'2年'],[3,'3年']],filters.grade)}
            ${select('分野','study-field',[['','全分野'],...Object.entries(Bank.fields).map(([id,[name]]) => [id,name])],filters.field)}
            ${select('難易度','study-level',[[0,'すべて'],[1,'基礎'],[2,'標準'],[3,'発展']],filters.level)}
            ${select('出題数','study-size',[[3,'3問'],[5,'5問'],[10,'10問']],filters.size)}
          </div>
          <div class="actions">${btn('演習をはじめる →','quiz-start')}</div>
        </section>
        <section class="panel review-panel">
          <p class="eyebrow">復習</p><h2>まちがえた問題</h2>
          <div class="review-count">${due}<small>問</small></div>
          <p class="muted">直近でまちがえた問題から出題します。正解すれば復習リストから外れます。</p>
          ${due ? btn('復習する →','quiz-review','secondary') : '<p class="small muted">いま復習する問題はありません。</p>'}
        </section>
      </div>
      <section class="panel unit-panel"><div class="between"><h2>単元から選ぶ</h2><span class="muted small">${units.length}単元</span></div>
        <div class="unit-grid">${units.map(unit => {
          const done = unit.questions.filter(id => state.history[id]?.correct).length;
          const [name,glyph] = Bank.fields[unit.field];
          return `<button type="button" class="unit" data-action="quiz-unit" data-value="${unit.id}">
            <span class="field-glyph">${glyph}</span><span><small>${unit.grade}年 · ${name}</small><strong>${unit.name}</strong></span><span class="unit-progress">${done === unit.questions.length ? '✓' : done + '/' + unit.questions.length}</span>
          </button>`;
        }).join('')}</div>
      </section>`;
  }

  function quizPage() {
    const {items,index,feedback,correct,label,origin} = quiz;
    const total = items.length;
    if (index >= total) {
      return heading(label,'演習結果') + `<section class="panel quiz-shell">
        <p class="result-score">${correct}<small> / ${total} 問正解</small></p>
        <p>${quiz.rewardCount}枚のカードと、${quiz.ink}個の交換ポイントを獲得しました。</p>
        <p class="muted">復習待ち ${Engine.tally(state).due}問</p>
        <div class="actions">${btn(origin === 'campus' ? '学園へ戻る' : '学習メニューへ','quiz-exit')}
        ${origin !== 'campus' && Engine.tally(state).due ? btn('まちがえた問題を復習','quiz-review','secondary') : ''}</div>
      </section>`;
    }
    const {q,options} = items[index];
    return heading(label,'国語の演習') + `<section class="panel quiz-shell">
      <div class="between quiz-head"><div class="actions">${tag(q.grade + '年')}${tag(Bank.fields[q.field][0])}${tag(levelNames[q.level],'accent')}</div><b>${index + 1} / ${total}</b></div>
      <progress max="${total}" value="${index + (feedback ? 1 : 0)}" aria-label="演習の進み具合"></progress>
      ${q.passage ? `<div class="passage"><div class="eyebrow">本文・資料</div><p>${esc(q.passage)}</p></div>` : ''}
      <h2 class="prompt">${esc(q.prompt)}</h2>
      <div class="choices">${options.map((option,i) => {
        const style = !feedback ? '' : option === q.correct ? 'correct' : i === feedback.choice ? 'wrong' : '';
        return `<button type="button" data-action="quiz-answer" data-value="${i}" class="choice ${style}" ${feedback ? 'disabled' : ''}><span>${'ABCD'[i]}</span><b>${esc(option)}</b></button>`;
      }).join('')}</div>
      ${feedback ? `<div class="feedback ${feedback.correct ? 'success' : ''}" tabindex="-1">
        <h3>${feedback.correct ? '正解！' : '正答　' + esc(q.correct)}</h3>
        <p>${esc(q.explanation)}</p><p class="basis"><b>根拠</b> ${esc(q.evidence)}</p>
        ${feedback.rewards.length ? `<p class="earned">獲得カード　${rewardsText(feedback.rewards)}</p>` : ''}
        ${feedback.ink ? `<p class="earned">交換ポイント ＋${feedback.ink}</p>` : ''}
      </div>` : ''}
      <div class="actions">
        ${feedback ? btn(index + 1 === total ? '演習結果へ →' : '次の問題へ →','quiz-next') : ''}
        ${btn('中断して戻る','quiz-exit','ghost')}
      </div>
    </section>`;
  }

  function startQuiz(options, label, origin = 'study') {
    const items = Engine.questionSet(state,options);
    if (!items.length) { announce('この条件で出題できる問題がありません。'); return; }
    quiz = {items,index:0,correct:0,rewardCount:0,ink:0,label,origin,feedback:null};
    go('study');
  }

  function answerQuiz(index) {
    if (!quiz || quiz.feedback || !quiz.items[quiz.index]) return;
    const {q,options} = quiz.items[quiz.index];
    if (!options[index]) return;
    const result = Engine.answer(state,q,options[index]);
    quiz.correct += Number(result.correct);
    quiz.rewardCount += result.rewards.length;
    quiz.ink += result.ink;
    quiz.feedback = {...result,choice:index};
    save();
    render();
    main.querySelector('.feedback').focus();
  }

  function battlePage() {
    if (battle) return matchPage();
    return heading('カード対戦','学園の対戦卓','カードを選び、空いているマスに置いて、相手のカードをひっくり返そう。') + `
      ${state.pending.length ? rewardPanel() : ''}
      <div class="arena-grid">${Object.entries(Engine.arenas).map(([id,arena]) => {
        const open = state.progress >= arena.unlock;
        const day = Math.floor(arena.unlock / 3) + 1;
        return `<section class="panel arena scene-${id}"><div class="between">${portrait(arena.face,arena.rival[2],'large')}${tag(arena.rule,'accent')}</div>
          <h2>${arena.title}</h2><p>${arena.rival}</p>
          ${open ? btn('対戦する →','battle-start','primary',id) : `<p class="small muted">${day}日目の放課後に開放</p>`}
        </section>`;
      }).join('')}</div>
      <section class="panel rules"><h2>遊び方</h2><dl>
        <dt>基本</dt><dd>お互いに5枚持って開始。置いたカードの上下左右の数が、隣の相手カードの向かい合う数より大きければ反転します。9マスが埋まった時点で、手札を含め自分の色が多い側の勝ちです。</dd>
        <dt>Same</dt><dd>向かい合う数が同じ辺が2組以上あると、その組の相手カードが反転します。</dd>
        <dt>Plus</dt><dd>向かい合う数を足した合計が同じ辺が2組以上あると、その組の相手カードが反転します。</dd>
        <dt>Combo</dt><dd>Same・Plusで反転したカードから、通常の大小比較でさらに連鎖します。自分のカードもSame・Plusの一致判定に使えます。</dd>
        <dt>対戦報酬</dt><dd>勝ったら相手のデッキから1枚と交換ポイント2個。引き分け・敗戦では交換ポイント1個が入ります。自分のカードは手元に残ります。</dd>
      </dl><div class="actions">${btn('デッキを編成','deck-open','secondary')}</div></section>`;
  }

  function startBattle(id) {
    const arena = Engine.arenas[id];
    if (!arena || state.progress < arena.unlock) return;
    if (state.pending.length) { go('battle'); announce('前の勝利報酬のカードを選んでください。'); return; }
    if (battle) { go('battle'); return; }
    battle = {id,arena,board:Array(9).fill(null),player:state.deck.slice(),cpu:arena.cpu.slice(),
      selected:null,turn:state.wins + state.losses + state.draws, busy:false, result:null, flashes:[],
      message:'手札からカードを選んでください。'};
    battle.busy = battle.turn % 2 === 1;
    if (battle.busy) battle.message = '相手が先攻です。';
    go('battle');
    if (battle.busy) queueCpu(battle);
  }

  function queueCpu(current) {
    setTimeout(() => {
      if (battle !== current || battle.result) return;
      const move = Engine.cpuMove(current.board,current.cpu,current.player,current.arena);
      if (!move) return;
      const id = current.cpu.splice(move.handIndex,1)[0];
      current.board = move.result.board;
      current.flashes = move.result.flips;
      current.message = `${current.arena.rival}が「${rewardName(id)}」を配置。${describeMove(move.result)}`;
      current.busy = false;
      endIfReady(current);
      if (view === 'battle') render();
    },430);
  }

  function describeMove(move) {
    const effects = move.messages.length ? move.messages.join('・') + '！ ' : '';
    return effects + (move.flips.length ? move.flips.length + '枚反転。' : '');
  }

  function playMove(position) {
    if (!battle || battle.busy || battle.result || !battle.selected) return;
    const item = Cards.byId[battle.selected];
    const move = Engine.place(battle.board,position,item,'player',battle.arena);
    if (!move) return;
    battle.board = move.board;
    battle.player = battle.player.filter(id => id !== item.id);
    battle.selected = null;
    battle.flashes = move.flips;
    battle.message = `「${item.name}」を配置。${describeMove(move)}`;
    endIfReady(battle);
    if (!battle.result) {
      battle.busy = true;
      queueCpu(battle);
    }
    render();
  }

  function endIfReady(current) {
    if (!current.board.every(Boolean)) return;
    const score = Engine.score(current.board,current.player,current.cpu);
    current.result = score.player === score.cpu ? 'draw' : score.player > score.cpu ? 'win' : 'loss';
    Engine.settle(state,current.result,current.arena.cpu);
    save();
  }

  function rewardPanel() {
    return `<section class="panel prize"><h2>勝利報酬を選ぶ</h2><div class="hand">${state.pending.map(id =>
      `<button type="button" class="card-button" aria-label="${rewardName(id)}を受け取る" data-action="battle-prize" data-value="${id}">${cardTile(Cards.byId[id])}</button>`
    ).join('')}</div></section>`;
  }

  function matchPage() {
    const {arena,board,player,cpu,selected,busy,result,flashes,message} = battle;
    const points = Engine.score(board,player,cpu);
    const resultLabel = {win:'勝利！',loss:'敗戦',draw:'引き分け'}[result];
    return heading('カード対戦',arena.title,arena.rival + 'との対戦') + `
      <div class="match-layout">
        <section class="panel board-panel">
          <div class="scoreboard"><span class="player-score">律 <b>${points.player}</b></span>${tag(arena.rule)}<span class="cpu-score"><b>${points.cpu}</b> 相手</span></div>
          <div class="board" aria-label="3×3の対戦盤">
            ${board.map((cell,index) => cell ? `<div class="cell occupied ${cell.owner} ${flashes.includes(index) ? 'flipped' : ''}" aria-label="${index + 1}マス目、${cell.owner === 'player' ? '律' : '相手'}のカード">${cardTile(Cards.byId[cell.id],true)}</div>`
              : `<button type="button" class="cell empty" data-action="battle-place" data-value="${index}" aria-label="${Math.floor(index / 3) + 1}行${index % 3 + 1}列に置く" ${busy || !selected || result ? 'disabled' : ''}><span>＋</span></button>`).join('')}
          </div>
          <p class="battle-log" aria-live="polite">${resultLabel ? resultLabel + '　' : ''}${message}</p>
        </section>
        <section class="panel hand-panel"><div class="between"><h2>${result ? '対戦結果' : '律の手札'}</h2>${tag('相手の手札 ' + cpu.length + '枚')}</div>
          ${result ? `<p>${resultLabel}　${points.player} 対 ${points.cpu}</p><p class="earned">交換ポイント ＋${result === 'win' ? '2' : '1'}</p>` :
            `<p class="muted compact">${busy ? '相手の手番です。' : selected ? '盤面の空いているマスを選びます。' : '置きたいカードを選びます。'}</p>
            <div class="hand player-hand">${player.map(id => `<button type="button" class="card-button ${selected === id ? 'selected' : ''}" aria-pressed="${selected === id}" data-action="battle-select" data-value="${id}" ${busy ? 'disabled' : ''}>${cardTile(Cards.byId[id])}</button>`).join('')}</div>`}
          <div class="actions">${btn(result ? '対戦卓へ戻る' : '対戦を中断','battle-exit','ghost')}</div>
        </section>
      </div>${state.pending.length ? rewardPanel() : ''}`;
  }

  function cardTile(card, mini = false) {
    const image = card.serial <= 4
      ? portrait(Object.values(Story.faces)[card.serial - 1][1],Object.values(Story.faces)[card.serial - 1][0],'tile-face')
      : `<canvas width="140" height="120" data-art="${card.id}" aria-hidden="true"></canvas>`;
    return `<div class="card-tile ${card.group === '人物' ? 'person' : 'spirit'} ${mini ? 'mini' : ''}">
      <span class="card-level">Lv ${card.level}</span>
      <div class="tile-art">${image}</div>
      <div class="card-nums" aria-label="${arrows.map((label,i) => label + card.sides[i]).join('、')}">${card.sides.map((number,i) =>
        `<span aria-hidden="true" class="num n${i}">${number}</span>`
      ).join('')}</div>
      <strong>${card.name}</strong>
    </div>`;
  }

  function cardsPage() {
    const distinct = Object.keys(state.owned).length;
    if (deckMode) return deckPage();
    return heading('コレクション','カード図鑑') + `
      <section class="panel collection-panel"><div class="between">
        <div><h2>${distinct} / ${Cards.all.length} 種</h2><p class="muted compact">人物 ${Cards.all.filter(card => card.group === '人物' && state.owned[card.id]).length}/51　言霊 ${Cards.all.filter(card => card.group === '言霊' && state.owned[card.id]).length}/100</p></div>
        <div class="actions">${tag('交換ポイント ' + state.ink,'accent')}${btn('デッキ編成','deck-open','secondary')}</div>
      </div><progress max="${Cards.all.length}" value="${distinct}" aria-label="カード収集状況"></progress>
        <p class="muted compact">4問解くたびに交換ポイントが1個たまります。重複したカードもポイントにできます。</p>
        <div class="form-grid collection-filters">
          ${select('種類','card-group',[['all','すべて'],['人物','人物'],['言霊','言霊']],collection.group)}
          ${select('収集状況','card-status',[['all','すべて'],['owned','入手済み'],['missing','未入手'],['copies','重複あり']],collection.status)}
          <label>カード名で検索<input type="search" id="card-query" value="${esc(collection.query)}" placeholder="例：藤原"></label>
        </div>
        <div id="collection-results">${collectionResults()}</div>
      </section>${cardDialog ? inspectCard(cardDialog) : ''}`;
  }

  function collectionResults() {
    const query = collection.query.normalize('NFKC').trim();
    const matches = Cards.all.filter(card => {
      const copies = state.owned[card.id] || 0;
      return (collection.group === 'all' || card.group === collection.group) &&
        (collection.status === 'all' || (collection.status === 'owned' && copies > 0) ||
          (collection.status === 'missing' && copies === 0) || (collection.status === 'copies' && copies > 1)) &&
        (!query || card.name.normalize('NFKC').includes(query));
    });
    return matches.length ? `<div class="collection-grid">${matches.map(card => {
      const copies = state.owned[card.id] || 0;
      return `<button type="button" class="card-button ${copies ? '' : 'unowned'}" data-action="card-open" data-value="${card.id}" aria-label="${card.name}、${copies ? copies + '枚所持' : '未入手'}">
        ${cardTile(card)}<span class="owned-label">${copies ? copies + '枚' : '未入手'}</span></button>`;
    }).join('')}</div>` : '<p class="muted">条件に合うカードがありません。</p>';
  }

  function inspectCard(id) {
    const card = Cards.byId[id];
    const copies = state.owned[id] || 0;
    return `<dialog id="card-detail" aria-labelledby="card-title"><div class="detail">
      <div class="between"><span class="eyebrow">${card.group}カード</span>${btn('閉じる','card-close','ghost')}</div>
      <div class="detail-grid"><div>${cardTile(card)}</div><div><h2 id="card-title">${card.name}</h2><p>${card.note}</p>
        <p class="muted compact">入手条件　${card.acquisition}</p>
        <p class="compact">${arrows.map((name,index) => name + ' ' + card.sides[index]).join('　')}</p>
        <p>${copies ? copies + '枚所持' : '未入手'} · 交換ポイント ${state.ink}</p>
        <div class="actions">
          ${copies > 1 ? btn('重複1枚を交換ポイントに','card-recycle','secondary',id) : ''}
          ${!copies && state.ink >= card.cost ? btn(card.cost + 'ポイントで交換','card-exchange','primary',id) : ''}
          ${!copies && state.ink < card.cost ? `<p class="muted small">交換に必要なポイント　${card.cost}</p>` : ''}
        </div>
      </div></div>
    </div></dialog>`;
  }

  function showDialog() {
    const dialog = document.querySelector('#card-detail');
    if (!dialog) return;
    dialog.showModal();
    dialog.addEventListener('cancel',event => { event.preventDefault(); closeDialog(); });
  }

  function closeDialog() {
    const id = cardDialog;
    cardDialog = '';
    render();
    main.querySelector(`[data-action="card-open"][data-value="${id}"]`)?.focus({preventScroll:true});
  }

  function deckPage() {
    const owned = Cards.all.filter(item => state.owned[item.id]);
    return heading('カード編成','デッキを組む','入手済みカードから、異なる5種類を選びます。') + `
      <section class="panel"><div class="between"><h2>デッキ ${draft.length} / 5</h2><div class="actions">
        ${btn('図鑑へ戻る','deck-close','ghost')}${draft.length === 5 ? btn('デッキを保存','deck-save') : ''}
      </div></div><div class="hand deck-slots">${Array.from({length:5},(_,index) => draft[index]
        ? `<button type="button" class="card-button selected" data-action="deck-toggle" data-value="${draft[index]}">${cardTile(Cards.byId[draft[index]])}</button>`
        : '<div class="deck-empty">空き</div>').join('')}</div></section>
      <section class="panel unit-panel"><h2>入手済みカード</h2><div class="collection-grid">${owned.map(item =>
        `<button type="button" class="card-button ${draft.includes(item.id) ? 'selected' : ''}" aria-pressed="${draft.includes(item.id)}" data-action="deck-toggle" data-value="${item.id}">${cardTile(item)}</button>`
      ).join('')}</div></section>`;
  }

  function savePage() {
    const total = Engine.tally(state);
    const fields = Object.entries(Bank.fields).map(([id,[name]]) => ({id,name,...Engine.tally(state,id)}))
      .sort((a,b) => (b.due - a.due) || ((b.attempts - b.correct) - (a.attempts - a.correct)));
    const weakest = fields.find(item => item.due > 0);
    return heading('学習履歴・セーブ','記録') + `
      <div class="study-grid">
        <section class="panel"><div class="between"><h2>学習の記録</h2>${tag(total.attempts + '問解答','accent')}</div>
          <div class="record-list">${fields.map(row => {
            const percent = row.attempts ? Math.round(row.correct / row.attempts * 100) : 0;
            return `<div><div class="between"><strong>${row.name}</strong><span class="small muted">${row.attempts ? percent + '% · 復習 ' + row.due + '問' : '未学習'}</span></div><progress max="100" value="${percent}" aria-label="${row.name}の正答率"></progress></div>`;
          }).join('')}</div>
          ${weakest ? `<p>復習待ちが最も多い分野は「${weakest.name}」です。</p>${btn('この分野を復習','weak-review','secondary',weakest.id)}` : ''}
        </section>
        <section class="panel"><h2>セーブとロード</h2>
          <p>${storageOk ? '学園生活・学習・カードの進み具合は、このブラウザに自動で保存します。' : 'このブラウザでは自動保存が利用できません。セーブファイルで進み具合を保存できます。'}</p>
          <p class="muted">別の端末で続けるときは、セーブファイルを読み込んでください。会話・演習・対戦は、その途中の画面を閉じると、最後に確定した記録から再開します。</p>
          <div class="actions">${btn('セーブを保存','export')}${btn('セーブを読み込む','import','secondary')}</div>
          <div class="record-battle"><h3>対戦成績</h3><p>${state.wins}勝　${state.losses}敗　${state.draws}分</p></div>
          <details class="credits"><summary>学習内容と出典</summary><p class="small muted">光村図書『国語』1〜3年の年間指導計画・指導事項配列表を学習項目の整理に参照しました。現代の問題文と資料はオリジナルです。古典の引用元は各問題と物語に記載しています。</p></details>
        </section>
      </div>
      <section class="panel unit-panel"><h2>最近の解答</h2>
        ${state.recent.length ? `<ul class="history">${state.recent.slice(0,15).map(row => {
          const question = Bank.byId[row.id];
          return `<li>${tag(row.correct ? '正解' : '不正解',row.correct ? 'accent' : 'rose')}<span>${esc(question.prompt)}</span><small>${formatDate.format(row.at)}</small></li>`;
        }).join('')}</ul>` : '<p class="muted">演習を始めると、ここに解答が記録されます。</p>'}
      </section>`;
  }

  function exportSave() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kotoaka-save.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  }

  function updateCollection() {
    const results = document.querySelector('#collection-results');
    if (!results) return;
    results.innerHTML = collectionResults();
    drawArt(results);
  }

  function drawArt(root) {
    root.querySelectorAll('canvas[data-art]').forEach(canvas => {
      const card = Cards.byId[canvas.dataset.art];
      const c = canvas.getContext('2d');
      if (!c) return;
      const hue = (card.serial * 137.5) % 360;
      const grad = c.createLinearGradient(0,0,140,120);
      grad.addColorStop(0,`hsl(${hue} 45% 33%)`);
      grad.addColorStop(1,`hsl(${(hue + 34) % 360} 58% 12%)`);
      c.fillStyle = grad;
      c.fillRect(0,0,140,120);
      c.strokeStyle = `hsl(${hue} 70% 78% / .48)`;
      for (let n = 0; n < 9; n++) {
        const angle = n * Math.PI * 2 / 9 + card.serial / 8;
        c.beginPath();
        c.moveTo(70 + Math.cos(angle) * 35,57 + Math.sin(angle) * 35);
        c.lineTo(70 + Math.cos(angle) * 67,57 + Math.sin(angle) * 67);
        c.stroke();
      }
      c.beginPath();
      c.arc(70,56,36,0,Math.PI*2);
      c.stroke();
      if (card.group === '人物') {
        c.fillStyle = `hsl(${hue} 43% 78%)`;
        c.beginPath();
        c.moveTo(27,116);
        c.quadraticCurveTo(35,86,63,80);
        c.lineTo(77,80);
        c.quadraticCurveTo(103,86,113,116);
        c.closePath();
        c.fill();
        c.fillStyle = '#e4bc99';
        c.beginPath();
        c.ellipse(70,61,19,24,0,0,Math.PI*2);
        c.fill();
        c.fillStyle = `hsl(${hue} 24% ${13 + card.serial % 12}%)`;
        c.beginPath();
        c.moveTo(49,64);
        c.quadraticCurveTo(45,32 + card.serial % 10,57,34);
        c.quadraticCurveTo(69,18 + card.serial % 9,84,34);
        c.quadraticCurveTo(95,39,91,66);
        c.lineTo(80,48 + card.serial % 8);
        c.lineTo(55,49);
        c.closePath();
        c.fill();
        if (['古代','平安','中世','漢文・海外'].includes(card.motif)) {
          c.beginPath();
          c.moveTo(58,37); c.lineTo(62,21); c.lineTo(75 + card.serial % 9,24); c.lineTo(83,37);
          c.fill();
        }
        c.fillStyle = '#31242a';
        c.fillRect(61,61,3,2); c.fillRect(76,61,3,2);
      } else {
        c.fillStyle = 'rgba(255,255,255,.12)';
        c.beginPath();
        c.moveTo(70,12); c.lineTo(110,56); c.lineTo(70,103); c.lineTo(30,56); c.closePath();
        c.fill(); c.stroke();
        c.fillStyle = '#fff1de';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.font = 'bold 40px serif';
        c.fillText(card.name.replace(/^[A-Za-z]/,'').charAt(0) || card.motif,70,60);
      }
    });
  }

  const actions = {
    go,
    'story-start'() { if (Engine.scene(state)) { storyLine = 0; render(); focusAction('story-next'); } },
    'story-next'() { storyLine++; render(); focusAction('story-next','story-finish'); },
    'story-finish'() {
      const rewards = Engine.finishScene(state);
      storyLine = -1;
      save();
      render();
      if (rewards.length) announce('カード獲得　' + rewardsText(rewards));
      focusAction('story-start','go');
    },
    'class-quiz'(field) {
      const day = Engine.scene(state)?.dayIndex || 0;
      startQuiz({grade:day === 4 ? 3 : 1,field,size:3},'授業 · ' + Bank.fields[field][0],'campus');
    },
    'scene-battle':startBattle,
    'quiz-start'() { startQuiz(filters,'ランダム演習'); },
    'quiz-unit'(id) {
      const unit = Bank.units.find(item => item.id === id);
      if (unit) startQuiz({grade:unit.grade,field:unit.field,size:unit.questions.length},unit.name);
    },
    'quiz-review'() { startQuiz({review:true,size:10},'まちがえた問題の復習'); },
    'weak-review'(field) { startQuiz({review:true,size:10,field},Bank.fields[field][0] + 'の復習'); },
    'quiz-answer'(index) { answerQuiz(Number(index)); },
    'quiz-next'() {
      if (!quiz?.feedback) return;
      quiz.index++;
      quiz.feedback = null;
      render();
      main.querySelector('.choice')?.focus({preventScroll:true});
      main.querySelector('.heading').scrollIntoView({block:'start'});
    },
    'quiz-exit'() {
      const origin = quiz?.origin || 'study';
      quiz = null;
      go(origin);
      window.scrollTo(0,0);
    },
    'battle-start':startBattle,
    'battle-select'(id) {
      if (!battle || battle.busy || !battle.player.includes(id)) return;
      battle.selected = battle.selected === id ? null : id;
      render();
      const selector = battle.selected ? '[data-action="battle-place"]:not(:disabled)' :
        `[data-action="battle-select"][data-value="${id}"]`;
      main.querySelector(selector)?.focus({preventScroll:true});
    },
    'battle-place'(position) { playMove(Number(position)); },
    'battle-exit'() {
      if (battle && !battle.result && !window.confirm('この対戦を終了して対戦卓に戻りますか？')) return;
      battle = null;
      render();
    },
    'battle-prize'(id) {
      if (!Engine.claimBattle(state,id)) return;
      save(); render(); announce('カード獲得　' + rewardName(id));
    },
    'deck-open'() { cardDialog = ''; draft = state.deck.slice(); deckMode = true; go('cards'); },
    'deck-close'() { deckMode = false; render(); },
    'deck-toggle'(id) {
      if (!state.owned[id]) return;
      if (draft.includes(id)) draft = draft.filter(item => item !== id);
      else if (draft.length < 5) draft.push(id);
      else { announce('先にデッキから1枚外してください。'); return; }
      render();
    },
    'deck-save'() {
      if (draft.length !== 5) return;
      state.deck = draft.slice();
      deckMode = false;
      save(); render(); announce('デッキを保存しました。');
    },
    'card-open'(id) { if (Cards.byId[id]) { cardDialog = id; render(); showDialog(); } },
    'card-close':closeDialog,
    'card-recycle'(id) {
      if (!Engine.recycle(state,id)) return;
      save(); render(); showDialog(); announce('交換ポイント ＋1');
    },
    'card-exchange'(id) {
      if (!Engine.exchange(state,id)) return;
      save(); render(); showDialog(); announce('カード獲得　' + rewardName(id));
    },
    export:exportSave,
    import() { importFile.click(); }
  };

  function focusAction(...names) {
    for (const name of names) {
      const button = main.querySelector(`[data-action="${name}"]`);
      if (button) { button.focus({preventScroll:true}); return; }
    }
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('button[data-view],button[data-action]');
    if (!target) return;
    if (target.dataset.view) go(target.dataset.view);
    else actions[target.dataset.action]?.(target.dataset.value);
  });

  main.addEventListener('change', event => {
    const {id,value} = event.target;
    if (id.startsWith('study-')) {
      const key = id.slice(6);
      filters[key] = key === 'field' ? value : Number(value);
      if (key === 'grade') {
        render();
        document.getElementById(id).focus({preventScroll:true});
      }
    }
    if (id === 'card-group') { collection.group = value; updateCollection(); }
    if (id === 'card-status') { collection.status = value; updateCollection(); }
  });

  main.addEventListener('input', event => {
    if (event.target.id !== 'card-query') return;
    collection.query = event.target.value;
    updateCollection();
  });

  importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    importFile.value = '';
    if (!file) return;
    try {
      if (file.size > 1000000) throw new Error('セーブファイルが大きすぎます。');
      const restored = Engine.parseSave(JSON.parse(await file.text()));
      if (!window.confirm('読み込んだデータで今の記録を置き換えますか？')) return;
      state = restored;
      quiz = null; battle = null; storyLine = -1; cardDialog = ''; deckMode = false;
      save(); render(); announce('セーブを読み込みました。');
    } catch (error) {
      announce(error instanceof SyntaxError ? 'セーブファイルを読み取れませんでした。' : error.message);
    }
  });

  render();
})();
