// =======================
// English Quest RPG - 完全版 script.js
// =======================

/* --------- ゲーム状態 --------- */
let stage = 1;
const maxStage = 10;

let playerName = "HERO";
let playerLv = 1;
const maxPlayerHP = 100;
let playerHP = maxPlayerHP;

let maxEnemyHP = 100;
let enemyHP = maxEnemyHP;

let correctAnswersTotal = 0; // 累積正解（レベルUP判定）
let totalAnswers = 0;

let questionTimer = null;
let timerDuration = 15; // 秒
let timerTickInterval = 100; // ms 単位でバー更新

// ステージ内で出した問題の記録（重複防止）
const usedQuestions = {};

// 結果ログ（最終画面で STAGE10 のみ表示するために保存）
const reviewResults = []; // { stage, q, selected, correct, ok }

/* --------- DOM 要素 --------- */
const startScreen = document.getElementById("start-screen");
const battleScreen = document.getElementById("battle-screen");
const endingScreen = document.getElementById("ending-screen");

const playerNameEl = document.getElementById("player-name");
const playerLvEl = document.getElementById("player-lv");
const stageNumberEl = document.getElementById("stage-number");
const enemyNameEl = document.getElementById("enemy-name");

const questionText = document.getElementById("question-text");
const choicesContainer = document.getElementById("choices-container");

const timerFill = document.getElementById("timer-fill");
const resultMessage = document.getElementById("result-message");

const playerHpFill = document.getElementById("player-hp-fill");
const enemyHpFill = document.getElementById("enemy-hp-fill");

const stageIntro = document.getElementById("stage-intro");
const levelupBanner = document.getElementById("levelup-banner");
const stageOverlay = document.getElementById("stage-overlay");
const stagePopupNumber = document.getElementById("stage-popup-number");


const resultsList = document.getElementById("results-list");
const finalLvEl = document.getElementById("final-lv");
const correctTotalEl = document.getElementById("correct-total");

/* --------- 問題データ（あなた提供のもの） --------- */
const stageQuestions = {
  1: [
    { q: "“protect” の意味は？", options: ["守る", "踊る", "笑う", "忘れる"], a: "守る" },
    { q: "“dangerous” の意味は？", options: ["危険な", "美しい", "寒い", "壊れた"], a: "危険な" },
    { q: "“secret” の意味は？", options: ["秘密", "音楽", "砂漠", "目的"], a: "秘密" },
    { q: "“victory” の意味は？", options: ["勝利", "失敗", "未来", "旅"], a: "勝利" },
  ],
  2: [
    { q: "“destroy” の意味は？", options: ["破壊する", "作る", "叫ぶ", "信じる"], a: "破壊する" },
    { q: "“ancient” の意味は？", options: ["古代の", "最近の", "急な", "静かな"], a: "古代の" },
    { q: "“freedom” の意味は？", options: ["自由", "城", "天気", "種類"], a: "自由" },
    { q: "“survive” の意味は？", options: ["生き残る", "解く", "泳ぐ", "燃える"], a: "生き残る" },
  ],
  3: [
    { q: "“defeat” の意味は？", options: ["打ち負かす", "支える", "磨く", "泣く"], a: "打ち負かす" },
    { q: "“kingdom” の意味は？", options: ["王国", "記憶", "事件", "薬"], a: "王国" },
    { q: "“curse” の意味は？", options: ["呪い", "祈り", "贈り物", "道"], a: "呪い" },
    { q: "“escape” の意味は？", options: ["逃げる", "集まる", "選ぶ", "寝る"], a: "逃げる" },
  ],
  4: [
    { q: "The hero ___ the forest to find the source of the dark power.", options: ["enters", "enter", "entered", "entering"], a: "enters" },
    { q: "Many people were too ___ to go into the forest at night.", options: ["afraid", "brave", "proud", "lucky"], a: "afraid" },
    { q: "“If we ___ together, we can win,” the knight said.", options: ["fight", "fought", "fights", "fighting"], a: "fight" },
    { q: "No one knew ___ the strange sound was coming from.", options: ["where", "what", "how", "why"], a: "where" },
  ],
  5: [
    { q: "“sacred” の意味は？", options: ["神聖な", "怪しい", "不安定な", "騒がしい", "永遠の"], a: "神聖な" },
    { q: "“betray” の意味は？", options: ["裏切る", "強調する", "隠す", "許す", "再建する"], a: "裏切る" },
    { q: "“peaceful” の意味は？", options: ["激しい", "暖かい", "平和な", "臆病な", "正確な"], a: "平和な" },
    { q: "“vanish” の意味は？", options: ["消える", "支持する", "進化する", "交換する", "告白する"], a: "消える" },
    { q: "“destiny” の意味は？", options: ["運命", "証拠", "財産", "誤解", "傷跡"], a: "運命" },
  ],
  6: [
    { q: "The hero and his friend couldn’t decide ___ to go next.", options: ["when", "what", "where", "why"], a: "where" },
    { q: "We must keep walking, ___ it’s getting dark.", options: ["so", "because", "but", "if"], a: "but" },
    { q: "He promised to come back before the sun ___.", options: ["rise", "rises", "rose", "sets"], a: "sets" },
    { q: "They were tired, but none of them wanted to ___ up.", options: ["give", "gives", "gave", "giving"], a: "give" },
  ],
  7: [
    { q: "“Are you ready?” the knight asked, as if he ___ the end was near.", options: ["knows", "knew", "has known", "will know"], a: "knew" },
    { q: "The village was quiet, as if nothing ___ happened.", options: ["has", "had", "will", "would"], a: "had" },
    { q: "She gave the hero a map ___ help him find the castle.", options: ["so to", "in order to", "so that", "for"], a: "so that" },
    { q: "The hero wondered ___ the enemy was waiting for them.", options: ["if", "what", "how", "because"], a: "if" },
  ],
  8: [
    { q: "One boy is looking forward to ___ tha hero.", options: ["meet", "met", "meeting", "being met"], a: "meeting" },
    { q: "They found a small village ___ nobody live.", options: ["in which", "that", "where", "in where"], a: "in which" },
    { q: "The boy ___ to be a hero since he was little.", options: ["had wanted", "want", "wants", "wanted"], a: "had wanted" },
  ],
  9: [
    { q: "A brave hero never ___ his friends behind.", options: ["leaves", "left", "leaving", "leave"], a: "leaves" },
    { q: "The journey was long, but the team ___ together.", options: ["stayed", "stay", "staying", "stays"], a: "stayed" },
    { q: "They prepared supplies ___ the trip.", options: ["for", "to", "with", "at"], a: "for" },
  ],
  10: [
    { q: "A brave hero never ___ his friends behind.", options: ["leaves", "left", "leaving", "leave"], a: "leaves" },
    { q: "We must keep walking, ___ it’s getting dark.", options: ["so", "because", "but", "if"], a: "but" },
    { q: "“If we ___ together, we can win,” the knight said.", options: ["fight", "fought", "fights", "fighting"], a: "fight" },
    { q: "“Are you ready?” the knight asked, as if he ___ the end was near.", options: ["knows", "knew", "has known", "will know"], a: "knew" },
    { q: "“betray” の意味は？", options: ["裏切る", "許す", "支える", "笑う"], a: "裏切る" },
    { q: "“sacred” の意味は？", options: ["神聖な", "不安定な", "騒がしい", "永遠の"], a: "神聖な" },
  ]
};

/* --------- ユーティリティ --------- */
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

/* --------- ゲーム開始ボタン --------- */
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("retry-btn")?.addEventListener("click", () => location.reload());

function startGame() {
  const nameInput = document.getElementById("player-name-input").value.trim();
  if (nameInput) playerName = nameInput;
  playerNameEl.textContent = playerName;

  // 初期状態リセット
  stage = 1;
  playerLv = 1;
  playerLvEl.textContent = playerLv;
  playerHP = maxPlayerHP;
  enemyHP = maxEnemyHP;
  correctAnswersTotal = 0;
  totalAnswers = 0;
  reviewResults.length = 0;

  // usedQuestions 初期化
  for (let i = 1; i <= maxStage; i++) usedQuestions[i] = [];

  // 画面切替
  startScreen.classList.add("hidden");
  battleScreen.classList.remove("hidden");

  // battle-screen 背景は JS で上書きされる（CSS body::before はスタート画面の背景）
  startStage();
}

/* --------- ステージ開始 --------- */
function startStage() {
 
 // ===== 敵画像リスト追加 =====
 const enemyImages = [
  "images/enemy_stage1.png",
  "images/enemy_stage2.png",
  "images/enemy_stage3.png",
  "images/enemy_stage4.png",
  "images/enemy_stage5.png",
  "images/enemy_stage6.png",
  "images/enemy_stage7.png",
  "images/enemy_stage8.png",
  "images/enemy_stage9.png",
  "images/boss_final.png"
 ];

 // ステージに応じて敵画像切り替え
 const enemyImgEl = document.getElementById("enemy-img");
 if (enemyImgEl) {
  enemyImgEl.src = enemyImages[stage - 1] || enemyImages[enemyImages.length - 1];
 }


 // ステージ表示
  stageNumberEl.textContent = stage;
  enemyNameEl.textContent = stage === 10 ? "Final Boss" : `Enemy ${stage}`;

  // プレイヤーHPを全回復（要望）
  playerHP = maxPlayerHP;
  // 敵HPはステージに応じて調整（形だけ）
  maxEnemyHP = 100 + (stage - 1) * 10;
  enemyHP = maxEnemyHP;

  updateHPBars();

  // battle-screen 背景をステージ画像に変更
  const s = stageQuestions[stage] ? `stage${stage}_bg.png` : `stage${Math.min(stage,10)}_bg.png`;
  // このHTMLでは #battle-screen に背景をセットできます
  const battleEl = document.getElementById("battle-screen");
  if (battleEl) battleEl.style.backgroundImage = `url('images/${s}')`;

  // STAGEイントロ
  showStageIntro(stage, () => {
    // 問題エントリ開始
    setTimeout(() => showQuestion(), 200); // 少し遅延
  });
}

function showStageIntro(num, cb) {
  console.log("showStageIntro called", num);

  if (!stageOverlay) {
    console.error("stageOverlay not found");
    if (cb) cb();
    return;
  }

  if (!stagePopupNumber) {
    console.error("stagePopupNumber not found");
    if (cb) cb();
    return;
  }

  stagePopupNumber.textContent = num;
  stageOverlay.classList.remove("hidden");

  setTimeout(() => {
    stageOverlay.classList.add("hidden");
    if (typeof cb === "function") cb();
  }, 1500);
}


console.log("★ showQuestion called");


/* --------- 問題表示 --------- */
let currentQuestion = null;
function showQuestion() {
  const list = stageQuestions[stage];
  if (!list || list.length === 0) {
    // 問題がない場合はステージクリア扱い
    return stageClear();
  }

  // 未出題のみを抽出
  const remaining = list.filter(q => !usedQuestions[stage].includes(q.q));
  if (remaining.length === 0) {
    // ステージの全問題を出し終えた -> クリア（あるいは繰り返し仕様ならリセット）
    return stageClear();
  }

  // ランダムに1問選ぶ（重複なし）
  currentQuestion = remaining[Math.floor(Math.random() * remaining.length)];
  usedQuestions[stage].push(currentQuestion.q);

  // 表示
  questionText.textContent = currentQuestion.q;
  choicesContainer.innerHTML = "";

  // シャッフルしてボタン作成
  const opts = shuffle([...currentQuestion.options]);
  opts.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "btn choice-btn";
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(btn,opt);
    choicesContainer.appendChild(btn);
  });

  // タイマー開始
  startTimer(timerDuration);
}

/* --------- タイマー --------- */
let timerRemaining = 0;
function startTimer(seconds) {
  clearInterval(questionTimer);
  timerRemaining = seconds;
  updateTimerBar();

  questionTimer = setInterval(() => {
    timerRemaining -= timerTickInterval / 1000;
    if (timerRemaining < 0) timerRemaining = 0;
    updateTimerBar();
    if (timerRemaining <= 0) {
      clearInterval(questionTimer);
      // タイムアップは不正解扱い
      handleAnswer(null, null, true);
    }
  }, timerTickInterval);
}
function updateTimerBar() {
  if (!timerFill) return;
  const pct = Math.max(0, (timerRemaining / timerDuration) * 100);
  timerFill.style.width = pct + "%";
}


// ===== キャラのモーション切り替え関数 =====
function setHeroMotion(type) {
  const hero = document.getElementById("player-img");
  if (!hero) return;

  if (type === "attack") {
    hero.src = "images/hero_attack.png";
  } else if (type === "damage") {
    hero.src = "images/hero_damage.png";
  } else {
    hero.src = "images/hero.png"; // 通常
  }
}



/* --------- 回答処理 --------- */
function handleAnswer(clickedButton, selectedOption, isTimeout = false) {
  clearInterval(questionTimer);
  totalAnswers++;

  const correct = currentQuestion ? currentQuestion.a : null;
  const isCorrect = !isTimeout && selectedOption === correct;

  // すべての選択肢ボタンを取得
  const buttons = document.querySelectorAll(".choice-btn");

  // 全ボタンを判定表示
  buttons.forEach(btn => {
    btn.disabled = true;

    if (btn.textContent === correct) {
      // 正解は必ず緑
      btn.classList.add("correct");
    } else {
      // それ以外は必ず赤
      btn.classList.add("wrong");
    }
  });

  // ===== モーション =====
  if (isCorrect) {
    setHeroMotion("attack");
    shakeScreen();
  } else {
    setHeroMotion("damage");
  }
  setTimeout(() => setHeroMotion("normal"), 700);

  // CORRECT / FALSE 表示
  if (resultMessage) {
    resultMessage.textContent = isCorrect ? "CORRECT" : "FALSE";
    resultMessage.classList.add("show");
    setTimeout(() => resultMessage.classList.remove("show"), 700);
  }

  // ダメージ処理
  if (isCorrect) {
    enemyHP -= 35;
    correctAnswersTotal++;
  } else {
    playerHP -= 15;
  }

  if (enemyHP < 0) enemyHP = 0;
  if (playerHP < 0) playerHP = 0;
  updateHPBars();

  // ログ
  reviewResults.push({
    stage,
    q: currentQuestion ? currentQuestion.q : "(timeout)",
    selected: selectedOption ?? "(TIMEUP)",
    correct,
    ok: isCorrect
  });

  // レベルアップ
  if (correctAnswersTotal > 0 && correctAnswersTotal % 3 === 0) {
    playerLv++;
    playerLvEl.textContent = playerLv;
    showLevelUp();
  }

  if (enemyHP <= 0) return setTimeout(stageClear, 700);
  if (playerHP <= 0) return setTimeout(gameOver, 700);

  if (stage === 10 && usedQuestions[10]?.length >= 6) {
    return setTimeout(endGame, 700);
  }

  setTimeout(showQuestion, 700);
}


/* --------- ステージクリア / 次ステージ --------- */
function stageClear() {
  // ステージクリアは敵を倒した場合に呼ばれる想定
  // 結果ログに勝利を追加（ステージ単位でWIN判定）
  // 判定: このステージで enemyHP === 0 があれば勝ち
  const didWin = enemyHP <= 0;
  // 留意： reviewResults に個別の問ログは既に追加されているのでここでは summary を追加する
  reviewResults.push({ stage, summary: didWin ? "WIN" : "CLEAR" });

  // 次ステージ or 終了
  if (stage >= maxStage) {
  // STAGE10クリアで終了
  return setTimeout(endGame, 800);
} else {
  stage++;

  // 次ステージではプレイヤーHPを全回復
  playerHP = maxPlayerHP;

  // 次のステージへ
  setTimeout(startStage, 900);
 }
}

/* --------- レベルアップ演出 --------- */
function showLevelUp() {
  if (!levelupBanner) return;
  levelupBanner.classList.remove("hidden");
  levelupBanner.classList.add("level-up-banner", "show");
  // 少し表示
  setTimeout(() => {
    levelupBanner.classList.remove("show");
    levelupBanner.classList.add("hidden");
  }, 1400);
  // 任意：レベルアップで少しHP回復（ただしステージ開始時に全回復するため任意）
  playerHP = Math.min(maxPlayerHP, playerHP + 30);
  updateHPBars();
}

/* --------- ゲームオーバー / 終了 --------- */
function gameOver() {
  // 敗北として終了画面へ
  endGame(false);
}

// ---------- 替え用：endGame 関数（この関数だけ既存と置き換えてください） ----------
// ---------- 全ステージの結果を表示する endGame 関数（置き換え版） ----------
// ---------- 正しい endGame（完成版） ----------
function endGame() {
  clearInterval(questionTimer);

  battleScreen.classList.add("hidden");
  endingScreen.classList.remove("hidden");

  resultsList.innerHTML = "";

  // ステージごとにまとめる
  const byStage = {};
  reviewResults.forEach(r => {
    if (!byStage[r.stage]) byStage[r.stage] = [];
    byStage[r.stage].push(r);
  });

  for (let st = 1; st <= maxStage; st++) {
    if (!byStage[st]) continue;

    const header = document.createElement("li");
    header.style.fontWeight = "bold";
    header.textContent = `=== STAGE ${st} Results ===`;
    resultsList.appendChild(header);

    byStage[st].forEach((r, idx) => {
      if (r.ok !== undefined) {
        const li = document.createElement("li");

        const qText = r.q || "(question)";
        const your =
          r.selected === null || r.selected === "(TIMEUP)"
            ? "(TIMEUP)"
            : r.selected;

        const correct = r.correct ?? "(no answer)";
        const mark = r.ok ? "✅" : "❌";

        li.textContent =
          `Q${idx + 1}: ${mark} ${qText} — Your: ${your} / Ans: ${correct}`;

        resultsList.appendChild(li);
      }
    });

    // summary
    const summaries = byStage[st].filter(r => r.summary);
    summaries.forEach(s => {
      const li = document.createElement("li");
      li.style.marginLeft = "10px";
      li.textContent = `→ ${s.summary}`;
      resultsList.appendChild(li);
    });
  }

  finalLvEl.textContent = playerLv;

  const correctAll = reviewResults.filter(r => r.ok === true).length;
  const totalAll = reviewResults.filter(r => r.ok !== undefined).length;

  correctTotalEl.textContent = `${correctAll} / ${totalAll}`;
}

/* --------- HP 更新 UI --------- */
function updateHPBars() {
  if (playerHpFill)
    playerHpFill.style.width = `${(playerHP / maxPlayerHP) * 100}%`;

  if (enemyHpFill)
    enemyHpFill.style.width = `${(enemyHP / maxEnemyHP) * 100}%`;
}

/* --------- 初期 UI セット --------- */
document.addEventListener("DOMContentLoaded", () => {
  playerNameEl.textContent = playerName;
  playerLvEl.textContent = playerLv;
  updateHPBars();
});

// ===== 画面揺れ =====
function shakeScreen() {
  const game = document.getElementById("battle-screen");
  if (!game) return;

  game.classList.add("shake");
  setTimeout(() => game.classList.remove("shake"), 400);
}



