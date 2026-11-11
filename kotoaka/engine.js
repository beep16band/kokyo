'use strict';

globalThis.KotoEngine = (() => {
  const cards = globalThis.KotoCards;
  const bank = globalThis.KotoQuestions;
  const story = globalThis.KotoStory;
  const emptyStats = () => ({ attempts:0, correct:0, streak:0, due:false, last:0 });
  const maxProgress = story.days.reduce((total, day) => total + day.acts.length, 0);
  const fresh = () => ({
    version:1, progress:0, owned:Object.fromEntries(cards.starters.map(id => [id,1])),
    deck:cards.starters.slice(), ink:0, dry:0, history:{}, recent:[], claims:{},
    wins:0, losses:0, draws:0, pending:[]
  });
  const isObject = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
  const count = (value, max = 1000000) =>
    Number.isInteger(value) && value >= 0 ? Math.min(max,value) : 0;
  const has = (object, key) => typeof key === 'string' && Object.hasOwn(object,key);

  function parseSave(input) {
    if (!isObject(input) || input.version !== 1 ||
        !isObject(input.owned) || !isObject(input.history) || !Array.isArray(input.deck)) {
      throw new Error('コトアカのセーブファイルを選んでください。');
    }
    const state = fresh();
    state.progress = count(input.progress,maxProgress);
    ['ink','wins','losses','draws'].forEach(key => { state[key] = count(input[key]); });
    state.dry = count(input.dry,3);
    cards.all.forEach(({id}) => {
      const copies = count(input.owned[id]);
      if (copies) state.owned[id] = copies;
    });
    const deck = [...new Set(input.deck.filter(id => has(state.owned,id)))];
    state.deck = [...new Set([...deck,...cards.starters])].slice(0,5);
    bank.all.forEach(({id}) => {
      const row = input.history[id];
      if (!isObject(row) || !count(row.attempts)) return;
      const attempts = count(row.attempts);
      const correct = count(row.correct,attempts);
      state.history[id] = { attempts, correct, streak:count(row.streak,correct),
        due:row.due === true, last:count(row.last,8640000000000000) };
    });
    if (Array.isArray(input.recent)) {
      state.recent = input.recent.slice(0,60).filter(row =>
        isObject(row) && has(bank.byId,row.id) && typeof row.correct === 'boolean'
      ).map(row => ({id:row.id,correct:row.correct,at:count(row.at,8640000000000000)}));
    }
    if (isObject(input.claims)) {
      [...bank.units.map(unit => unit.id), ...Object.keys(cards.milestones)].forEach(key => {
        if (input.claims[key] === true) state.claims[key] = true;
      });
    }
    if (Array.isArray(input.pending)) {
      state.pending = [...new Set(input.pending.filter(id => has(cards.byId,id)))].slice(0,5);
    }
    return state;
  }

  function shuffle(items, random = Math.random) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copy[i],copy[j]] = [copy[j],copy[i]];
    }
    return copy;
  }

  function questionSet(state, {grade, field, level, size, review}, random = Math.random) {
    let pool = bank.all.filter(q => (!grade || grade === q.grade) &&
      (!field || field === q.field) && (!level || level === q.level));
    if (review) pool = pool.filter(q => state.history[q.id]?.due);
    const selected = shuffle(pool,random).slice(0,size);
    return selected.map(q => ({q, options:shuffle(q.options,random)}));
  }

  function grant(state, id, rewards, reason) {
    if (!has(cards.byId,id)) return false;
    const owned = state.owned[id] || 0;
    state.owned[id] = owned + 1;
    rewards.push({id, reason, duplicate:owned > 0});
    return true;
  }

  function grantMilestone(state, id, rewards, reason) {
    if (state.claims[id]) return;
    if (grant(state,id,rewards,reason)) state.claims[id] = true;
  }

  function draw(state, {field, preferNew = false, exclude = []} = {}, random = Math.random) {
    let pool = cards.all.filter(card => !exclude.includes(card.id));
    if (preferNew && pool.some(card => !state.owned[card.id])) {
      pool = pool.filter(card => !state.owned[card.id]);
    }
    const related = field ? pool.filter(card => card.field === field) : [];
    if (related.length && random() < .55) pool = related;
    return pool[Math.floor(random() * pool.length)].id;
  }

  function tally(state, field) {
    return bank.all.filter(q => !field || q.field === field).reduce((total,q) => {
      const row = state.history[q.id];
      if (row) {
        total.attempts += row.attempts;
        total.correct += row.correct;
        total.due += Number(row.due);
      }
      return total;
    },{attempts:0, correct:0, due:0});
  }

  function answer(state, q, option, random = Math.random, now = Date.now()) {
    if (!q.options.includes(option)) throw new Error('選択肢が見つかりません。');
    const correct = q.correct === option;
    const row = state.history[q.id] || emptyStats();
    const reviewWin = correct && row.due;
    const rewards = [];
    let ink = 0;
    row.attempts++;
    row.correct += Number(correct);
    row.streak = correct ? row.streak + 1 : 0;
    row.due = !correct;
    row.last = now;
    state.history[q.id] = row;
    state.recent.unshift({id:q.id, correct, at:now});
    state.recent = state.recent.slice(0,60);
    if (tally(state).attempts % 4 === 0) ink++;
    if (correct) {
      const chance = [.38,.44,.5][q.level - 1];
      if (state.dry >= 3 || random() < chance) {
        grant(state,draw(state,{field:q.field},random),rewards,'正解ドロップ');
        state.dry = 0;
      } else state.dry++;
      if (reviewWin) {
        ink++;
        grantMilestone(state,'s072',rewards,'初めての復習正解');
      }
      const unit = bank.units.find(item => item.id === q.unit);
      if (!state.claims[unit.id] && unit.questions.every(id => state.history[id]?.correct > 0)) {
        state.claims[unit.id] = true;
        grant(state,draw(state,{field:q.field,preferNew:true},random),rewards,'単元クリア');
        ink++;
      }
    }
    state.ink += ink;
    return { correct, rewards, ink, reviewWin };
  }

  function exchange(state, id) {
    const item = has(cards.byId,id) && cards.byId[id];
    if (!item || state.owned[id] || state.ink < item.cost) return false;
    state.ink -= item.cost;
    return grant(state,id,[],'交換');
  }

  function recycle(state, id) {
    if (!has(cards.byId,id) || (state.owned[id] || 0) < 2) return false;
    state.owned[id]--;
    state.ink++;
    return true;
  }

  function scene(state) {
    if (state.progress === maxProgress) return null;
    let start = 0;
    for (const [dayIndex, day] of story.days.entries()) {
      if (state.progress < start + day.acts.length) {
        const actIndex = state.progress - start;
        return {day, dayIndex, act:day.acts[actIndex], actIndex};
      }
      start += day.acts.length;
    }
    return null;
  }

  function finishScene(state) {
    const current = scene(state);
    const rewards = [];
    if (!current) return rewards;
    state.progress++;
    if (current.act.card) grantMilestone(state,current.act.card,rewards,'学園の物語');
    return rewards;
  }

  const arenas = {
    yard:{title:'中庭', rival:'日向晴', face:'haru', rule:'基本', unlock:2,
      same:false, plus:false, combo:false, cpu:['s003','s012','s022','p05','s048']},
    library:{title:'図書室', rival:'春日詩織', face:'shiori', rule:'Same・Combo', unlock:8,
      same:true, plus:false, combo:true, cpu:['p12','s067','s072','s081','p26']},
    hall:{title:'光庭ホール', rival:'月城紬', face:'tsumugi', rule:'Same・Plus・Combo', unlock:11,
      same:true, plus:true, combo:true, cpu:['p19','s057','s090','s100','p27']}
  };

  function neighbors(index) {
    return [
      index >= 3 ? index - 3 : -1, index % 3 < 2 ? index + 1 : -1,
      index < 6 ? index + 3 : -1, index % 3 > 0 ? index - 1 : -1
    ];
  }

  function place(board, index, item, owner, rule) {
    if (!Number.isInteger(index) || index < 0 || index > 8 || board[index]) return null;
    const next = board.slice();
    next[index] = {id:item.id, owner};
    const sides = neighbors(index).flatMap((near, side) => near >= 0 && board[near] ? [{
      near, ours:item.sides[side], theirs:cards.byId[board[near].id].sides[(side + 2) % 4]
    }] : []);
    const same = rule.same ? sides.filter(edge => edge.ours === edge.theirs) : [];
    const plus = rule.plus ? sides.filter(edge =>
      sides.some(other => edge !== other && edge.ours + edge.theirs === other.ours + other.theirs)
    ) : [];
    const opposing = edges => edges.filter(edge => board[edge.near].owner !== owner);
    const sameTargets = same.length >= 2 ? opposing(same) : [];
    const plusTargets = opposing(plus);
    const special = [...new Set([...sameTargets,...plusTargets].map(edge => edge.near))];
    const normal = opposing(sides).filter(edge => edge.ours > edge.theirs).map(edge => edge.near);
    const flips = [...new Set([...special,...normal])];
    const flip = near => { next[near] = {...next[near],owner}; };
    const messages = [];
    if (sameTargets.length) messages.push('Same');
    if (plusTargets.length) messages.push('Plus');
    flips.forEach(flip);
    if (rule.combo) {
      const chain = special.slice();
      for (let step = 0; step < chain.length; step++) {
        const origin = chain[step];
        const source = cards.byId[next[origin].id];
        neighbors(origin).forEach((near,side) => {
          const target = next[near];
          if (!target || target.owner === owner) return;
          if (source.sides[side] > cards.byId[target.id].sides[(side + 2) % 4]) {
            flip(near);
            chain.push(near);
            flips.push(near);
          }
        });
      }
      if (chain.length > special.length) messages.push('Combo');
    }
    return {board:next,flips,messages};
  }

  function score(board, playerHand, cpuHand) {
    return board.reduce((result, cell) => {
      if (cell) result[cell.owner]++;
      return result;
    },{player:playerHand.length,cpu:cpuHand.length});
  }

  function cpuMove(board, hand, playerHand, arena, random = Math.random) {
    let best = null;
    hand.forEach((id,handIndex) => board.forEach((cell,index) => {
      if (cell) return;
      const result = place(board,index,cards.byId[id],'cpu',arena);
      const outward = neighbors(index).reduce((risk, near, side) =>
        risk + Number(near >= 0 && !result.board[near]) * Math.max(0,6 - cards.byId[id].sides[side]),0);
      let reply = 0;
      if (arena.combo) {
        playerHand.forEach(other => result.board.forEach((occupied,position) => {
          if (occupied) return;
          reply = Math.max(reply,place(result.board,position,cards.byId[other],'player',arena).flips.length);
        }));
      }
      const value = result.flips.length * 4 - outward * .22 - reply * 1.5 + random() * .12;
      if (!best || value > best.value) best = {result,handIndex,index,value};
    }));
    return best;
  }

  function settle(state, result, cpuDeck) {
    if (result === 'win') {
      state.wins++;
      state.ink += 2;
      state.pending = cpuDeck.slice();
    } else if (result === 'draw') {
      state.draws++;
      state.ink++;
    } else {
      state.losses++;
      state.ink++;
    }
  }

  function claimBattle(state, id) {
    if (!state.pending.includes(id)) return false;
    const received = grant(state,id,[],'対戦報酬');
    if (received) state.pending = [];
    return received;
  }

  return { fresh, parseSave, shuffle, questionSet, tally, answer, exchange, recycle,
    scene, finishScene, maxProgress, arenas, neighbors, place, score, cpuMove, settle, claimBattle };
})();
