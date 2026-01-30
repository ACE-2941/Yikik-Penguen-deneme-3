const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 640;

let puan = 0;
let gameActive = true;
let gameOverTimer = 0;

// ASSETLER
const penguinImg = new Image();
penguinImg.src = "assets/penguin.png";

const bgImg = new Image();
bgImg.src = "assets/arka-plan.jpg"; // JPG uzantın

const buzImg = new Image();
buzImg.src = "assets/buz.png"; // Yeni buz parçası asseti

const penguin = {
    x: 148,
    y: 540,
    w: 64, h: 64,
    frameX: 0,
    frameY: 0,
    maxFrames: 5,
    fps: 0,
    stagger: 8,
    velocityY: 0,
    gravity: 0.8,
    isJumping: false
};

let obstacles = [];
let timer = 0;
let moveDir = 0;

// KONTROLLER
window.onkeydown = (e) => {
    if (e.key === "ArrowLeft") moveDir = -1;
    if (e.key === "ArrowRight") moveDir = 1;
    if (e.key === " " || e.key === "ArrowUp") jump();
    // Oyun bittiyse ve biraz zaman geçtiyse herhangi bir tuşla restart
    if (!gameActive && gameOverTimer > 60) resetGame();
};
window.onkeyup = () => moveDir = 0;

function jump() {
    if (!penguin.isJumping && gameActive) {
        penguin.velocityY = -16;
        penguin.isJumping = true;
        penguin.frameY = 2;
        penguin.maxFrames = 2;
    }
}

// OYUNU SIFIRLAMA FONKSİYONU (Donmayı engeller)
function resetGame() {
    puan = 0;
    obstacles = [];
    gameActive = true;
    gameOverTimer = 0;
    penguin.x = 148;
    penguin.y = 540;
    penguin.velocityY = 0;
    timer = 0;
}

function update() {
    if (!gameActive) {
        gameOverTimer++;
        if (gameOverTimer > 180) resetGame(); // 3 saniye sonra otomatik başla
        return;
    }

    penguin.x += moveDir * 8;
    penguin.y += penguin.velocityY;
    penguin.velocityY += penguin.gravity;

    if (penguin.y > 540) {
        penguin.y = 540;
        penguin.isJumping = false;
        penguin.velocityY = 0;
        penguin.frameY = 0;
        penguin.maxFrames = 5;
    }

    if (penguin.x < 0) penguin.x = 0;
    if (penguin.x > canvas.width - penguin.w) penguin.x = canvas.width - penguin.w;

    // HIZ DENGESİ: 100 puana kadar yavaş (3 hızında), sonra hızlanır.
    let oyunHizi = (puan < 100) ? 3 : 3 + (puan - 100) * 0.05;
    
    // Engel Üretim Sıklığı (Başlarda daha az engel)
    let uretimSikligi = (puan < 100) ? 70 : 55;

    if (++timer > uretimSikligi) {
        obstacles.push({ x: Math.random() * (canvas.width - 40), y: -40, s: 40 });
        timer = 0;
    }

    obstacles.forEach((o, i) => {
        o.y += oyunHizi;
        if (o.y > canvas.height) {
            obstacles.splice(i, 1);
            puan++;
        }
        // Çarpışma Testi
        if (penguin.x + 15 < o.x + o.s && penguin.x + 45 > o.x && 
            penguin.y + 10 < o.y + o.s && penguin.y + 55 > o.y) {
            gameActive = false;
        }
    });

    penguin.fps++;
    if (penguin.fps % penguin.stagger === 0) {
        penguin.frameX = (penguin.frameX + 1) % penguin.maxFrames;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Arka Plan
    if (bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#87ceeb";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Penguen
    if (penguinImg.complete && penguinImg.naturalWidth > 0) {
        ctx.drawImage(penguinImg, penguin.frameX * 64, penguin.frameY * 40, 64, 40, penguin.x, penguin.y, 64, 64);
    } else {
        ctx.fillStyle = "black";
        ctx.fillRect(penguin.x, penguin.y, 40, 40);
    }

    // 3. Buz Engelleri
    obstacles.forEach(o => {
        if (buzImg.complete && buzImg.naturalWidth > 0) {
            ctx.drawImage(buzImg, o.x, o.y, o.s, o.s);
        } else {
            ctx.fillStyle = "white"; // Buz resmi yoksa beyaz kutu
            ctx.fillRect(o.x, o.y, o.s, o.s);
        }
    });

    // 4. Puan
    ctx.fillStyle = "white";
    ctx.font = "bold 26px Arial";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.fillText("PUAN: " + puan, 20, 45);
    ctx.shadowBlur = 0;

    // 5. Penguen Finito Ekranı
    if (!gameActive) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "yellow";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Penguen Finito", canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Toplam Puan: " + puan, canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText("Yeniden Başlıyor...", canvas.width / 2, canvas.height / 2 + 90);
        ctx.textAlign = "left";
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
