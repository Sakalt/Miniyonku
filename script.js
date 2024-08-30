const canvas = document.getElementById('race-canvas');
const ctx = canvas.getContext('2d');
let raceStarted = false;
let backgroundPosition = 0;
let tireSettings = JSON.parse(localStorage.getItem("tireSettings")) || { material: "hiepita", wheel: "standard" };
let tireDurability = 100; // タイヤの耐久度（100が最大）

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
    updateCpuCars();
    drawScene();
    requestAnimationFrame(updateRace);
  }
}

// シーンを描画
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 自分のミニ四駆を描画
  drawMini4WD(100, 350, tireSettings.material);

  // CPUミニ四駆を描画
  cpuCars.forEach(cpu => {
    drawMini4WD(cpu.x, cpu.y, cpu.material);
  });
}

// ミニ四駆を描画
function drawMini4WD(x, y, material) {
  ctx.fillStyle = "red";
  ctx.fillRect(x, y, 50, 30);

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
  
  ctx.fillStyle = tireColors[material];
  ctx.beginPath();
  ctx.arc(x + 10, y + 30, 10, 0, 2 * Math.PI); // 前輪
  ctx.arc(x + 40, y + 30, 10, 0, 2 * Math.PI); // 後輪
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
