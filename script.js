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
  { x: 100, y: 350, speed: 0, material: "wind" } // 新しいタイヤタイプ
];

// タイヤの特性とホイール設定を適用する
function applyCustomization() {
  const tireMaterial = document.getElementById('tire-select').value;
  const wheelType = document.getElementById('wheel-select').value;
  
  const target = prompt("タイヤを変更する対象（プレイヤーまたはCPU0〜3）を指定してください:");

  if (target === 'プレイヤー') {
    tireSettings.material = tireMaterial;
    playerCar.material = tireMaterial; // プレイヤーのミニ四駆に適用
  } else if (target.startsWith('CPU')) {
    const cpuIndex = parseInt(target.substring(3));
    if (cpuIndex >= 0 && cpuIndex < cpuCars.length) {
      cpuCars[cpuIndex].material = tireMaterial; // 指定したCPUのミニ四駆に適用
    } else {
      alert("無効なCPUインデックスです");
      return;
    }
  } else {
    alert("無効な対象です");
    return;
  }

  tireSettings.wheel = wheelType;
  localStorage.setItem("tireSettings", JSON.stringify(tireSettings));
  alert(`タイヤ: ${tireMaterial}, ホイール: ${wheelType} を設定しました`);
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
  } else if (playerCar.material === 'wind') {
    tireDurability -= 0.4; // windタイヤも摩耗する
    if (tireDurability <= 0) {
      playerCar.speed = 2; // タイヤの摩耗で速度低下
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

// タイヤの速度を取得
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
    rain: 4,
    wind: 7 // 新しいタイヤタイプ
  };

  let speed = baseSpeeds[material] || 3; // デフォルトの速度
  
  // ランダム変動
  const randomFactor = Math.random() * 0.5 - 0.25;
  speed += randomFactor;
  
  return speed;
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
  ctx.fillRect(x, y, 50, 30);

  // タイヤの描画
  drawTires(x, y, material);
}

// タイヤの描画
function drawTires(x, y, material) {
  ctx.fillStyle = getTireColor(material);
  ctx.beginPath();
  ctx.arc(x + 10, y + 25, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + 40, y + 25, 10, 0, Math.PI * 2);
  ctx.fill();
}

// タイヤの色を取得
function getTireColor(material) {
  const colors = {
    hiepita: "#a4c2f4",
    ice: "#add8e6",
    hard: "#d3d3d3",
    void: "#000000",
    spike: "#ff4500",
    aero: "#87ceeb",
    offroad: "#9acd32",
    grip: "#ff6347",
    mystic: "#dda0dd",
    rain: "#87cefa",
    wind: "#00ff00" // 新しいタイヤの色
    };

  return colors[material] || "black";
}

// 初期設定
function init() {
  const tireSelect = document.getElementById('tire-select');
  const wheelSelect = document.getElementById('wheel-select');

  // タイヤの選択肢を追加
  Object.keys(getTireColor()).forEach(material => {
    const option = document.createElement('option');
    option.value = material;
    option.textContent = material;
    tireSelect.appendChild(option);
  });

  // ホイールの選択肢を追加
  ['standard', 'racing', 'offroad'].forEach(wheel => {
    const option = document.createElement('option');
    option.value = wheel;
    option.textContent = wheel;
    wheelSelect.appendChild(option);
  });

  document.getElementById('start-race').addEventListener('click', startRace);
  document.getElementById('boost-toggle').addEventListener('click', toggleBoost);
  document.getElementById('view-change').addEventListener('click', changeView);
  document.getElementById('apply-customization').addEventListener('click', applyCustomization);
}

// 初期化
init();
