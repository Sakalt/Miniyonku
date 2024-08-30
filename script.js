const canvas = document.getElementById('race-canvas');
const ctx = canvas.getContext('2d');
let raceStarted = false;
let backgroundPosition = 0;
let tireSettings = JSON.parse(localStorage.getItem("tireSettings")) || { material: "hiepita", wheel: "standard" };
let tireDurability = 100; // タイヤの耐久度（100が最大）

// タイヤの特性とホイール設定を適用する
function applyCustomization() {
  const tireMaterial = document.getElementById('tire-select').value;
  const wheelType = document.getElementById('wheel-select').value;
  tireSettings = { material: tireMaterial, wheel: wheelType };
  localStorage.setItem("tireSettings", JSON.stringify(tireSettings));
  alert(`タイヤ: ${tireMaterial}, ホイール: ${wheelType} を設定しました`);
}

// レースの開始
function startRace() {
  if (!raceStarted) {
    raceStarted = true;
    requestAnimationFrame(updateRace);
  }
}

// レースの更新
function updateRace() {
  if (raceStarted) {
    // 背景をスクロール
    backgroundPosition -= getTireSpeed(tireSettings.material);
    canvas.style.backgroundPosition = `${backgroundPosition}px 0`;
    drawMini4WD();
    requestAnimationFrame(updateRace);
  }
}

// ミニ四駆を描画
function drawMini4WD() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // ミニ四駆の車体
  ctx.fillStyle = "red";
  ctx.fillRect(100, 200, 50, 30);

  // タイヤを描画
  drawTires(tireSettings.material);
}

// タイヤを描画する関数
function drawTires(material) {
  const tireColors = {
    hiepita: "#a4c2f4",
    ice: "#add8e6",
    hard: "#333333",
    void: "#ff69b4"
  };
  
  ctx.fillStyle = tireColors[material];
  ctx.beginPath();
  ctx.arc(110, 230, 10, 0, 2 * Math.PI); // 前輪
  ctx.arc(140, 230, 10, 0, 2 * Math.PI); // 後輪
  ctx.fill();
}

// タイヤ素材による速度変動
function getTireSpeed(material) {
  const speeds = {
    hiepita: 3,
    ice: 6,
    hard: 4,
    void: 2
  };
  
  const randomFactor = Math.random() * 0.5 - 0.25; // ランダム変動
  let speed = speeds[material] + randomFactor;
  
  if (material === 'ice') {
    tireDurability -= 0.5; // 氷は早く摩耗
    if (tireDurability <= 0) {
      speed = 1; // タイヤが溶けた場合、速度低下
    }
  }
  
  return speed;
}

// タイヤ補充機能
function refillTires() {
  tireDurability = 100;
  alert("タイヤを補充しました！");
}

// 初期化
applyCustomization();
