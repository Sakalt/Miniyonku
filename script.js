const canvas = document.getElementById('race-canvas');
const ctx = canvas.getContext('2d');
let raceStarted = false;
let backgroundPosition = 0;
let tireSettings = JSON.parse(localStorage.getItem("tireSettings")) || { material: "hiepita", wheel: "standard" };
let tireDurability = 100; // タイヤの耐久度（100が最大）
let boosting = false; // 走る状態
let viewAngle = 0; // 現在の視点

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
  { x: 100, y: 250, speed: 0, material: "hard" },
  { x: 100, y: 350, speed: 0, material: "wind" } // 追加したタイヤタイプ
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

// 視点の切り替え
function changeView() {
  viewAngle = (viewAngle + 1) % 4; // 0, 1, 2, 3 の視点を循環
  drawScene();
}

// タイヤの耐久度を補充する
function refillTires() {
  tireDurability = 100; // タイヤの耐久度を最大にリセット
  alert("タイヤの耐久度を補充しました");
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
  
  // タイヤの耐久度管理（プレイヤー用）
  if (playerCar.material === 'ice') {
    tireDurability -= 0.5; // 氷は早く摩耗
    if (tireDurability <= 0) {
      playerCar.speed = 1; // タイヤが溶けた場合、速度低下
    }
  }
  if (playerCar.material === 'wind') {
    tireDurability -= 0.8; // 「wind」は速く摩耗
    if (tireDurability <= 0) {
      playerCar.speed = 1; // タイヤが消耗した場合、速度低下
    }
  }
}

// CPUのミニ四駆を更新
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
    void: 2,
    spike: 5,
    aero: 4.5,
    offroad: 3.5,
    grip: 3.2,
    mystic: 3,
    wind: 8,
    rain: 4
  };

  return baseSpeeds[material] || 3; // デフォルトの速度
}

// シーンを描画
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 選択された視点に応じて描画
  switch (viewAngle) {
    case 0:
      // 上からの視点
      drawTopView();
      break;
    case 1:
      // 正面からの視点
      drawFrontView();
      break;
    case 2:
      // 側面からの視点
      drawSideView();
      break;
    case 3:
      // 後ろからの視点
      drawRearView();
      break;
  }
}

// ミニ四駆を描画（上からの視点）
function drawTopView() {
  // 自分のミニ四駆を描画
  drawMini4WD(playerCar.x, playerCar.y, tireSettings.material);

  // CPUミニ四駆を描画
  cpuCars.forEach(cpu => {
    drawMini4WD(cpu.x, cpu.y, cpu.material);
  });
}

// ミニ四駆を描画（正面からの視点）
function drawFrontView() {
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // 自分のミニ四駆を描画
  drawMini4WD(playerCar.x, playerCar.y, tireSettings.material);

  // CPUミニ四駆を描画
  cpuCars.forEach(cpu => {
    drawMini4WD(cpu.x, cpu.y, cpu.material);
  });

  ctx.restore();
}

// ミニ四駆を描画（側面からの視点）
function drawSideView() {
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // 自分のミニ四駆を描画
  drawMini4WD(playerCar.x, playerCar.y, tireSettings.material);

  // CPUミニ四駆を描画
  cpuCars.forEach(cpu => {
    drawMini4WD(cpu.x, cpu.y, cpu.material);
  });

  ctx.restore();
}

// ミニ四駆を描画（後ろからの視点）
function drawRearView() {
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // 自分のミニ四駆を描画
  drawMini4WD(playerCar.x, playerCar.y, tireSettings.material);

  // CPUミニ四駆を描画
  cpuCars.forEach(cpu => {
    drawMini4WD(cpu.x, cpu.y, cpu.material);
  });

  ctx.restore();
}

// ミニ四駆を描画
function drawMini4WD(x, y, material) {
  // 車体の長方形（タイヤと重なる位置）
  ctx.fillStyle = "blue"; // 車体の色
  ctx.fillRect(x + 5, y + 10, 60, 20); // 車体（薄っぺらく）

  // 電池部分（車体の上に）
  ctx.fillStyle = "gray";
  ctx.fillRect(x + 20, y, 30, 10); // 電池部分
  
  // タイヤを描画
  drawTires(x + 5, y + 10, material);
}

// タイヤを描画する関数
function drawTires(x, y, material) {
  const tireColors = {
    hiepita: "#a4c2f4",
    ice: "#add8e6",
    hard: "#333333",
    void: "#ff69b4",
    spike: "#ff4500",
    aero: "#00bfff",
    offroad: "#006400",
    grip: "#d3d3d3",
    mystic: "#8a2be2",
    wind: "#f4f4f4",
    rain: "#4682b4"
  };

  const wheelColors = {
    standard: "#666666",
    custom: "#000000"
  };

  ctx.fillStyle = wheelColors[tireSettings.wheel];
  ctx.beginPath();
  ctx.arc(x + 5, y + 20, 10, 0, 2 * Math.PI); // 前輪のホイール
  ctx.arc(x + 55, y + 20, 10, 0, 2 * Math.PI); // 後輪のホイール
  ctx.fill();

  ctx.fillStyle = tireColors[material];
  ctx.beginPath();
  ctx.arc(x + 5, y + 20, 8, 0, 2 * Math.PI); // 前輪のタイヤ
  ctx.arc(x + 55, y + 20, 8, 0, 2 * Math.PI); // 後輪のタイヤ
  ctx.fill();
}

// 初期化
function init() {
  document.getElementById('start-button').addEventListener('click', startRace);
  document.getElementById('boost-button').addEventListener('click', toggleBoost);
  document.getElementById('view-button').addEventListener('click', changeView);
  document.getElementById('apply-button').addEventListener('click', applyCustomization);
  document.getElementById('refill-button').addEventListener('click', refillTires); // タイヤ補充ボタンの追加
}

init();
