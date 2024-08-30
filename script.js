const canvas = document.getElementById('race-canvas');
const ctx = canvas.getContext('2d');
let raceStarted = false;
let backgroundPosition = 0;
let tireSettings = JSON.parse(localStorage.getItem("tireSettings")) || { material: "hiepita", wheel: "standard" };
let tireDurability = 100; // タイヤの耐久度（100が最大）
let boosting = false; // 走る状態

// プレイヤーの設定
const playerCar = {
  x: 100,
  y: 350,
  speed: 0,
  material: tireSettings.material
};

// CPUの設定
const cpuCars = [
  { x: 100, y: 50, speed: 0, material: "hiepita" },
  { x: 100, y: 150, speed: 0, material: "ice" },
  { x: 100, y: 250, speed: 0, material: "hard" }
];

// タイヤの特性とホイール設定を適用する
function applyCustomization() {
  const tireMaterial = document.getElementById('tire-select').value;
  const wheelType = document.getElementById('wheel-select').value;
  tireSettings = { material: tireMaterial, wheel: wheelType };
  localStorage.setItem("tireSettings", JSON.stringify(tireSettings));
  alert(`タイヤ: ${tireMaterial}, ホイール: ${wheelType} を設定しました`);
  playerCar.material = tireMaterial; // プレイヤーのミニ四駆に適用
}

// レースの開始
function startRace() {
  if (!raceStarted) {
    raceStarted = true;
    backgroundPosition = 0; // 背景の位置リセット
    playerCar.x = 100; // プレイヤーのミニ四駆位置リセット
    cpuCars.forEach(cpu => cpu.x = 100); // CPUのミニ四駆位置リセット
    requestAnimationFrame(updateRace);
  }
}

// 走るボタンのトグル
function toggleBoost() {
  boosting = !boosting;
  document.querySelector('button[onclick="toggleBoost()"]').textContent = boosting ? "走る停止" : "走る";
}

// レースの更新
function updateRace() {
  if (raceStarted) {
    // 背景をスクロール
    backgroundPosition -= getTireSpeed(tireSettings.material);
    canvas.style.backgroundPosition = `${backgroundPosition}px 0`;
    
    // プレイヤーとCPUのミニ四駆を更新
    updatePlayerCar();
    updateCpuCars();
    
    drawScene();
    requestAnimationFrame(updateRace);
  }
}

// プレイヤーのミニ四駆を更新
function updatePlayerCar() {
  playerCar.speed = getTireSpeed(playerCar.material);
  if (boosting) {
    playerCar.speed *= 1.5; // 走る状態の加速
  }
  playerCar.x += playerCar.speed;
}

// シーンを描画
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 自分のミニ四駆を描画
  drawMini4WD(playerCar.x, playerCar.y, tireSettings.material);

  // CPUミニ四駆を描画
  cpuCars.forEach(cpu => {
    drawMini4WD(cpu.x, cpu.y, cpu.material);
  });
}

// ミニ四駆を描画
function drawMini4WD(x, y, material) {
  // 車体の長方形（細長い）
  ctx.fillStyle = "blue"; // 車体の色
  ctx.fillRect(x, y, 60, 30); // 車体

  // 電池部分（細長い長方形の上）
  ctx.fillStyle = "gray";
  ctx.fillRect(x + 10, y - 10, 40, 10); // 電池部分
  
  // タイヤを描画
  drawTires(x, y, material);
}

// タイヤを描画する関数
function drawTires(x, y, material) {
  const tireColors = {
    hiepita: "#a4c2f4",
    ice: "#add8e6",
    hard: "#333333",
    void: "#ff69b4"
  };

  const wheelColors = {
    standard: "#666666",
    custom: "#000000"
  };
  
  ctx.fillStyle = wheelColors[tireSettings.wheel];
  ctx.beginPath();
  ctx.arc(x + 10, y + 30, 10, 0, 2 * Math.PI); // 前輪のホイール
  ctx.arc(x + 50, y + 30, 10, 0, 2 * Math.PI); // 後輪のホイール
  ctx.fill();

  ctx.fillStyle = tireColors[material];
  ctx.beginPath();
  ctx.arc(x + 10, y + 30, 8, 0, 2 * Math.PI); // 前輪のタイヤ
  ctx.arc(x + 50, y + 30, 8, 0, 2 * Math.PI); // 後輪のタイヤ
  ctx.fill();
}

// CPUの速度を更新
function updateCpuCars() {
  cpuCars.forEach(cpu => {
    cpu.speed = getTireSpeed(cpu.material);
    cpu.x += cpu.speed;
  });
}

// タイヤ素材による速度変動
function getTireSpeed(material) {
  const baseSpeeds = {
    hiepita: 3,
    ice: 6,
    hard: 4,
    void: 2
  };
  
  let speed = baseSpeeds[material];
  
  const randomFactor = Math.random() * 0.5 - 0.25; // ランダム変動
  speed += randomFactor;
  
  // タイヤの耐久度管理（氷の場合）
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
