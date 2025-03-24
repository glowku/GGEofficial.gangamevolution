// Déclarations des éléments DOM et variables globales
window.scoreValueElement = document.getElementById("score-value");
const homepage = document.getElementById("homepage");
const mainContent = document.getElementById("main-content");
const passwordInput = document.getElementById("passwordInput");
const submitButton = document.getElementById("submitPassword");
const errorMessage = document.getElementById("error");
const multiplierElement = document.getElementById("multiplier");
const playersCounter = document.getElementById("players-counter");
const connectWalletButton = document.getElementById("connectWallet");
const mintNFTButton = document.getElementById("mintNFT");
const mintQuantityInput = document.getElementById("mintQuantity");

// Variables de jeu
window.score = parseInt(localStorage.getItem("savedScore")) || 0;
window.highScore = parseInt(localStorage.getItem("savedHighScore")) || 0;
window.connectedWallet = null;
window.eggClicks = parseInt(localStorage.getItem("eggClicks")) || 0;
window.lives = parseInt(localStorage.getItem("savedLives")) || 3;
window.missedParticles = parseInt(localStorage.getItem("missedParticles")) || 0;
let scoreMultiplier = 1;
let isPowerUpActive = false;
let powerUpCooldown = false;
let powerUpTimeout = null;
let connectedPlayers = 0;
let lastBossScoreThreshold = 0;
let isBossAlive = false;
let bgmPausedTime = 0;
let bossSound = null;
let missileInterval = null;
let hasUserInteracted = false;
let isBombSoundPlaying = false;
let comboStreak = 0;
let lastClickTime = 0;
const comboTimeout = 2000;
let consecutiveStars = 0;

const audioSources = {
  buttonClick: "https://717ba62886d24aaab5c9d1c296df3e32.ipfs.4everland.link/ipfs/bafkreicvepownm2jk6duwpj6gi4u5ofj5tcidfaf6ps5hhvo4k5kgl5cme",
  frog: "https://717ba62886d24aaab5c9d1c296df3e32.ipfs.4everland.link/ipfs/bafkreig4veq3mx6h2zxqfohhn5v2q6amryxiqj6m7cmz5jgvpx3pcrncga",
  hover: "https://717ba62886d24aaab5c9d1c296df3e32.ipfs.4everland.link/ipfs/bafkreidqoj75zryomr45patsfx4zwvfoi4p6kt7okxqqrvw6grl23x2pe4",
  powerUpMultiplier: "https://717ba62886d24aaab5c9d1c296df3e32.ipfs.4everland.link/ipfs/bafkreihf7bihz5daxjxpzd4tfmklxu634ruf3zjuxii5gy25qjwowr4saa",
  powerUpBonus: "https://717ba62886d24aaab5c9d1c296df3e32.ipfs.4everland.link/ipfs/bafkreiff7ucu6stzg4mqzq22pdd3k53bsrsqzlr7ybzmxe67m2o7xj24au",
  egg: "https://717ba62886d24aaab5c9d1c296df3e32.ipfs.4everland.link/ipfs/bafkreiff7ucu6stzg4mqzq22pdd3k53bsrsqzlr7ybzmxe67m2o7xj24au",
  robotClick: "https://717ba62886d24aaab5c9d1c296df3e32.ipfs.4everland.link/ipfs/bafkreigcfpditz7slztqx7lbgyij3jafxql52opklpm7gkyqdj7ibkibvu",
  robotDefeat: "https://d7db7e0895e49b82241e7e22fa07c8f8.ipfs.4everland.link/ipfs/bafkreihgogviytkvshtudxdh5nbbkkrihaxduc5yg4k3ut6ti3kbw7p7f4",
  bossDefeat: "https://d7db7e0895e49b82241e7e22fa07c8f8.ipfs.4everland.link/ipfs/bafkreienekjhrwcqzqiunlzfseyc3sxj25y4eh2g5dvo3jmora5y7dul2a",
  bossAppear: "https://717ba62886d24aaab5c9d1c296df3e32.ipfs.4everland.link/ipfs/bafybeien5jxmazsb6xcfl53y7xinyenz2c7hoo42ks2kcvqpxgohbsjr6u",
  missileHit: "https://717ba62886d24aaab5c9d1c296df3e32.ipfs.4everland.link/ipfs/bafkreiaonkxhdmsfk7wvkzemyyxqigu5miimjdyr5hcnbm3tznkcbarz3i",
  heartGain: "https://717ba62886d24aaab5c9d1c296df3e32.ipfs.4everland.link/ipfs/bafkreihkeez6hjk4fh62g6p5cgu3v3mcymcoowvy23cojtv45cgigvltrm",
  bombExplode: "https://717ba62886d24aaab5c9d1c296df3e32.ipfs.4everland.link/ipfs/bafkreiaonkxhdmsfk7wvkzemyyxqigu5miimjdyr5hcnbm3tznkcbarz3i"
};

const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const particleReductionFactor = isMobileOrTablet ? 0.45 : 1;

const particleLimits = {
  egg: { max: 15, current: 0, min: Math.round(5 * 0.8 * 0.75 * particleReductionFactor) },
  frog: { max: Math.round(20 * 0.85 * particleReductionFactor), current: 0, min: Math.round(2 * 0.85 * particleReductionFactor) },
  pixel: { max: Math.round(100 * 0.8 * particleReductionFactor), current: 0, min: Math.round(10 * 0.8 * particleReductionFactor) },
  powerUp: { max: Math.round(5 * 0.85 * particleReductionFactor), current: 0, min: Math.round(1 * 0.85 * particleReductionFactor) },
  robot: { max: Math.round(1 * 0.85 * particleReductionFactor), current: 0, min: 0 },
  boss: { max: 1, current: 0, min: 0 },
  dragon: { max: 1, current: 0, min: 0 },
  robotBoss: { max: 1, current: 0, min: 0 },
  missile: { max: 5, current: 0, min: 0 },
  heart: { max: 1, current: 0, min: 0 },
  bomb: { max: 1, current: 0, min: 0 }
};

if (isMobileOrTablet) {
  const metaViewport = document.createElement('meta');
  metaViewport.name = "viewport";
  metaViewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
  document.head.appendChild(metaViewport);
}

// ABI et configuration du contrat
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "quantity",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_SUPPLY",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tokenPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
const contractAddress = "0xAE6a76D106FD5F799a2501e1D563852Da88c3Db5";
let contract;
let provider;

async function connectContract() {
  provider = window.ethereum || window.web3?.currentProvider;
  if (!provider) {
    showCustomPopup("No Web3 provider detected! Please install MetaMask or enable Brave Wallet.");
    return false;
  }
  const web3 = new Web3(provider);
  contract = new web3.eth.Contract(contractABI, contractAddress);
  return true;
}

async function updateProgressBar() {
  if (!contract) return;
  try {
    const totalSupply = await contract.methods.totalSupply().call();
    const maxSupply = await contract.methods.MAX_SUPPLY().call();
    const progress = (totalSupply / maxSupply) * 100;
    document.getElementById("progress").style.width = `${progress}%`;
    document.getElementById("progress-text").innerText = `${totalSupply}/${maxSupply}`;
  } catch (error) {
    console.error("Failed to fetch total supply:", error);
  }
}

async function getMintPrice() {
  if (!contract) return 0;
  try {
    return await contract.methods.tokenPrice().call();
  } catch (error) {
    console.error("Failed to fetch mint price:", error);
    return 0;
  }
}

function resetBossState() {
  isBossAlive = false;
  lastBossScoreThreshold = 0;
  if (bossSound) {
    bossSound.pause();
    bossSound.currentTime = 0;
    bossSound = null;
  }
  if (missileInterval) {
    clearInterval(missileInterval);
    missileInterval = null;
  }
  document.body.classList.remove("boss-active");
  resumeBGM();
}

function initializeScoreDisplay() {
  window.scoreValueElement.innerHTML = `
    lvl: <span id="level-number">${getLevelFromScore(window.score)}</span> ⚡: <span id="score-number">${window.score}</span> (x${scoreMultiplier}) - High: <span id="high-score-number">${window.highScore}</span> - ❤️: <span id="lives-number">${window.lives}</span> - Quest: <span id="mission-number">${100 - window.eggClicks}</span> eggs
  `;
  window.scoreNumberElement = document.getElementById("score-number");
  window.missionNumberElement = document.getElementById("mission-number");
  window.levelNumberElement = document.getElementById("level-number");
  window.livesNumberElement = document.getElementById("lives-number");
  window.highScoreNumberElement = document.getElementById("high-score-number");
}

document.addEventListener("click", () => {
  hasUserInteracted = true;
  if (!soundEnabled) {
    soundEnabled = true;
    updateVolume(0.25);
    if (bgm.paused && bgmPausedTime === 0) playNextTrack();
  }
}, { once: true });

document.addEventListener("touchstart", () => {
  hasUserInteracted = true;
  if (!soundEnabled) {
    soundEnabled = true;
    updateVolume(0.25);
    if (bgm.paused && bgmPausedTime === 0) playNextTrack();
  }
}, { once: true });

window.addEventListener("load", async () => {
  await connectContract();
  await updateProgressBar();
  resetBossState();
  initializeScoreDisplay();
  showWelcomePopup();
  await checkUserBanStatus();
  startParticleGeneration();
});

async function checkUserBanStatus() {
  if (!window.bannedWalletsRef) return;
  if (!window.userIp) await window.fetchUserIp();
  const ipKey = `ip_${window.userIp?.replace(/\./g, '_')}`;
  const ipBanSnapshot = await window.bannedWalletsRef?.child(ipKey).once('value');
  if (ipBanSnapshot?.val() === true) {
    showCustomPopup("You are banned by IP!");
    disableGame();
    return;
  }
  if (window.connectedWallet) {
    const sanitizedWallet = window.connectedWallet.replace(/[^a-zA-Z0-9]/g, '');
    const walletBanSnapshot = await window.bannedWalletsRef?.child(sanitizedWallet).once('value');
    if (walletBanSnapshot?.val() === true) {
      showCustomPopup("This wallet is banned!");
      disableGame();
    }
  }
}

function disableGame() {
  document.body.innerHTML = "<h1 style='color: red; text-align: center; margin-top: 50px;'>You are banned from the game.</h1>";
  document.body.style.pointerEvents = "none";
}

submitButton.addEventListener("click", () => {
  const password = passwordInput.value;
  if (["69", "420", "42", "404", "48"].includes(password)) {
    homepage.style.display = "none";
    mainContent.style.display = "block";
    if (!soundEnabled) {
      soundEnabled = true;
      updateVolume(0.25);
    }
    const lastLogin = localStorage.getItem("lastLogin");
    const today = new Date().toISOString().split("T")[0];
    if (lastLogin !== today) {
      window.score += 5000;
      updateScore(0);
      localStorage.setItem("lastLogin", today);
      showCustomPopup("Daily bonus: +5000 points!");
    }
  } else {
    errorMessage.style.display = "block";
  }
});

function updateScore(points) {
  if (!window.scoreValueElement) return;
  const finalPoints = points * scoreMultiplier;
  window.score += finalPoints;

  if (window.score > window.highScore) window.highScore = window.score;
  if (window.score < 0) {
    window.lives--;
    window.score = 0;
    if (window.lives <= 0) resetGame();
    else {
      triggerDamageEffect();
      showCustomPopup(`Lost 1 ❤️! Remaining ❤️: ${window.lives}`);
    }
  }
  if (window.missedParticles >= 42) {
    window.lives--;
    window.missedParticles = 0;
    if (window.lives <= 0) resetGame();
    else {
      triggerDamageEffect();
      showCustomPopup(`Missed too many particles! Lost 1 ❤️. Remaining ❤️: ${window.lives}`);
    }
  }

  localStorage.setItem("savedScore", window.score);
  localStorage.setItem("savedHighScore", window.highScore);
  localStorage.setItem("savedLives", window.lives);
  localStorage.setItem("missedParticles", window.missedParticles);
  localStorage.setItem("eggClicks", window.eggClicks);
  multiplierElement.style.display = isPowerUpActive ? "inline" : "none";
  multiplierElement.textContent = `x${scoreMultiplier}`;
  const level = getLevelFromScore(window.score);

  window.scoreNumberElement.textContent = window.score;
  window.missionNumberElement.textContent = 100 - window.eggClicks;
  window.levelNumberElement.textContent = level;
  window.livesNumberElement.textContent = window.lives;
  window.highScoreNumberElement.textContent = window.highScore;

  window.scoreValueElement.innerHTML = `
    lvl: <span id="level-number">${level}</span> ⚡: <span id="score-number">${window.score}</span> (x${scoreMultiplier}) - High: <span id="high-score-number">${window.highScore}</span> - ❤️: <span id="lives-number">${window.lives}</span> - Quest: <span id="mission-number">${100 - window.eggClicks}</span> eggs
  `;
  window.scoreNumberElement = document.getElementById("score-number");
  window.missionNumberElement = document.getElementById("mission-number");
  window.levelNumberElement = document.getElementById("level-number");
  window.livesNumberElement = document.getElementById("lives-number");
  window.highScoreNumberElement = document.getElementById("high-score-number");

  adjustParticleDensity();
  if (window.updateLeaderboard) window.updateLeaderboard();
}

function resetGame() {
  window.lives = 3;
  window.missedParticles = 0;
  window.score = 0;
  window.eggClicks = 0;
  scoreMultiplier = 1;
  isPowerUpActive = false;
  powerUpCooldown = false;
  if (powerUpTimeout) clearTimeout(powerUpTimeout);
  comboStreak = 0;
  lastClickTime = 0;
  consecutiveStars = 0;
  triggerDamageEffect();
  showCustomPopup("Game Over! ❤️ reset to 3. Score reset to 0.");
  document.querySelectorAll('.snowflake').forEach(p => p.remove());
  Object.keys(particleLimits).forEach(type => particleLimits[type].current = 0);
  if (missileInterval) {
    clearInterval(missileInterval);
    missileInterval = null;
  }
  cleanupBoss();
  startParticleGeneration();
  updateScore(0);
  localStorage.setItem("savedScore", window.score);
  localStorage.setItem("savedLives", window.lives);
  localStorage.setItem("missedParticles", window.missedParticles);
  localStorage.setItem("eggClicks", window.eggClicks);
}

function cleanupBoss() {
  isBossAlive = false;
  document.body.classList.remove("boss-active");
  if (missileInterval) {
    clearInterval(missileInterval);
    missileInterval = null;
  }
  if (bossSound) {
    bossSound.pause();
    bossSound.currentTime = 0;
    bossSound = null;
  }
  resumeBGM();
}

function resumeBGM() {
  if (bgmPausedTime > 0 && soundEnabled && hasUserInteracted) {
    bgm.currentTime = bgmPausedTime;
    bgmPausedTime = 0;
    playAudioCrossBrowser(bgm).catch(error => {
      console.error("Erreur reprise BGM:", error);
      playNextTrack();
    });
  } else if (soundEnabled && hasUserInteracted && bgm.paused) {
    playNextTrack();
  }
}

function animateBossMovement(particle, type, duration) {
  let posX = parseFloat(particle.style.left) || Math.random() * 80 + 10;
  let posY = parseFloat(particle.style.top) || Math.random() * 80 + 10;
  let speedX = (Math.random() * 2 - 1) * 0.5;
  let speedY = (Math.random() * 2 - 1) * 0.5;
  let scale = 1;
  let scaleDirection = 1;

  const moveBoss = () => {
    if (!document.body.contains(particle)) return;

    posX += speedX;
    posY += speedY;

    if (posX < 5) { posX = 5; speedX = Math.abs(speedX); }
    if (posX > 95) { posX = 95; speedX = -Math.abs(speedX); }
    if (posY < 5) { posY = 5; speedY = Math.abs(speedY); }
    if (posY > 95) { posY = 95; speedY = -Math.abs(speedY); }

    scale += scaleDirection * 0.02;
    if (scale > 1.2) scaleDirection = -1;
    if (scale < 0.8) scaleDirection = 1;

    particle.style.left = `${posX}vw`;
    particle.style.top = `${posY}vh`;
    particle.style.transform = `scale(${scale}) rotate(${Math.random() * 360}deg)`;

    if (Math.random() < 0.05) {
      speedX = (Math.random() * 2 - 1) * 0.5;
      speedY = (Math.random() * 2 - 1) * 0.5;
    }
    if (Math.random() < 0.1) particle.style.opacity = Math.random() * 0.5 + 0.5;

    requestAnimationFrame(moveBoss);
  };

  moveBoss();
}

function createParticle(type, points, symbol, duration, color, soundSrc, clickCount = 1, powerUpType = "multiplier") {
  if (particleLimits[type].current >= particleLimits[type].max) return null;

  const particle = document.createElement("div");
  particle.className = `${type}-snowflake snowflake`;
  particle.innerText = symbol;
  particle.style.left = `${Math.random() * 100}vw`;

  let adjustedDuration = type === "egg" ? Math.random() * 6 + 8 + 3 :
                        type === "frog" ? Math.random() * 12 + 10 :
                        type === "pixel" ? Math.random() * 4 + 3 :
                        type === "powerUp" ? Math.random() * 7 + 10 :
                        type === "robot" ? Math.random() * 10 + 15 :
                        type === "boss" ? (Math.random() * 10 + 15) * 1.7 :
                        type === "dragon" ? (Math.random() * 10 + 10) * 1.5 :
                        type === "robotBoss" ? (Math.random() * 10 + 15) * 1.7 :
                        type === "missile" ? Math.random() * 4 + 4 :
                        type === "heart" ? Math.random() * 10 + 12 :
                        type === "bomb" ? Math.random() * 8 + 10 : duration;

  particle.style.animationDuration = `${adjustedDuration}s`;
  particle.style.opacity = Math.random() * 0.5 + 0.5;
  particle.style.fontSize = type === "egg" ? `${Math.random() * 3 + 1.5}rem` :
                           type === "frog" ? `${Math.random() * 2 + 1}rem` :
                           type === "powerUp" ? `${Math.random() * 2 + 1}rem` :
                           type === "robot" ? `${Math.random() * 2 + 3}rem` :
                           type === "boss" ? "4rem" :
                           type === "dragon" ? "5rem" :
                           type === "robotBoss" ? "4.5rem" :
                           type === "missile" ? `${Math.random() * 3 + 2}rem` :
                           type === "heart" ? `${Math.random() * 2 + 1.5}rem` :
                           type === "bomb" ? `${Math.random() * 2 + 3}rem` : "1.5rem";
  particle.style.color = color;

  const startRotate = Math.random() * 360;
  const endRotate = startRotate + (Math.random() * 720 - 360);
  particle.style.setProperty('--start-rotate', `${startRotate}deg`);
  particle.style.setProperty('--end-rotate', `${endRotate}deg`);
  particle.style.transform = type === "egg" ? `rotate(${Math.random() * 360}deg) scale(1.2, 0.6)` : `rotate(${Math.random() * 360}deg)`;

  particle.dataset.duration = adjustedDuration;
  particle.dataset.powerUpType = powerUpType;
  document.body.appendChild(particle);
  particleLimits[type].current++;

  if (isPowerUpActive) {
    const originalDuration = parseFloat(particle.dataset.duration);
    let speedMultiplier = type === "egg" ? 0.75 * 0.80 :
                         type === "frog" ? 0.75 * 0.60 :
                         type === "powerUp" ? 0.75 * 0.40 :
                         type === "robot" ? 0.75 :
                         (type === "boss" || type === "dragon" || type === "robotBoss" || type === "missile" || type === "heart" || type === "bomb") ? 0.75 : 0.75;
    particle.style.animationDuration = `${originalDuration * speedMultiplier}s`;
  }

  let clicksRemaining = clickCount;

  particle.addEventListener("click", function handler(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    if (type === "powerUp") {
      if (powerUpType === "multiplier" && !powerUpCooldown) {
        consecutiveStars++;
        scoreMultiplier = consecutiveStars > 1 ? Math.min(scoreMultiplier * 2, 20) : Math.min(scoreMultiplier + 2, 20);
        isPowerUpActive = true;
        powerUpCooldown = true;
        activatePowerUpEffects();
        showBonusText(`x${scoreMultiplier} 🕒16s`, mouseX, mouseY);
        if (powerUpTimeout) clearTimeout(powerUpTimeout);
        powerUpTimeout = setTimeout(() => {
          scoreMultiplier = 1;
          isPowerUpActive = false;
          powerUpCooldown = false;
          consecutiveStars = 0;
          deactivatePowerUpEffects();
        }, 16000);
        playSound(audioSources.powerUpMultiplier, false);
      } else if (powerUpType === "bonus") {
        consecutiveStars = 0;
        const bonusPoints = (isPowerUpActive ? 10000 : 5000) * scoreMultiplier;
        showBonusText(`+${bonusPoints} ⚡`, mouseX, mouseY);
        updateScore(bonusPoints / scoreMultiplier);
        playSound(audioSources.powerUpBonus, false);
      }
      particle.remove();
      particleLimits[type].current--;
    } else if (type === "robot") {
      consecutiveStars = 0;
      clicksRemaining--;
      const currentTime = Date.now();
      if (currentTime - lastClickTime <= comboTimeout) comboStreak++;
      else comboStreak = 1;
      lastClickTime = currentTime;
      const comboBonus = comboStreak * 10;
      showBonusText(`+${69 * scoreMultiplier + comboBonus} ⚡ (Combo x${comboStreak})`, mouseX, mouseY);
      updateScore(69 + comboBonus / scoreMultiplier);
      playSound(audioSources.robotClick, false);
      particle.style.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      if (comboStreak >= 10) particle.classList.add("combo-fire-effect");
      if (clicksRemaining <= 0) {
        particle.classList.remove("combo-fire-effect");
        playSound(audioSources.robotDefeat, false);
        particle.remove();
        particleLimits[type].current--;
      }
    } else if (type === "boss" || type === "dragon" || type === "robotBoss") {
      consecutiveStars = 0;
      clicksRemaining--;
      const currentTime = Date.now();
      if (currentTime - lastClickTime <= comboTimeout) comboStreak++;
      else comboStreak = 1;
      lastClickTime = currentTime;
      const comboBonus = comboStreak * 10;
      playSound(audioSources.robotClick, false);
      particle.style.color = `hsl(${Math.random() * 360}, 100%, ${type === "boss" ? "50" : type === "dragon" ? "70" : "60"}%)`;
      updateScore(420 + comboBonus / scoreMultiplier);
      showBonusText(`+${420 * scoreMultiplier + comboBonus} ⚡ (Combo x${comboStreak})`, mouseX, mouseY);
      if (clicksRemaining <= 0) {
        showBonusText(`+${points * scoreMultiplier} ⚡`, mouseX, mouseY);
        updateScore(points);
        playSound(audioSources.bossDefeat, false);
        particle.remove();
        particleLimits[type].current--;
        cleanupBoss();
      }
    } else if (type === "missile") {
      consecutiveStars = 0;
      window.lives--;
      triggerDamageEffect();
      document.body.classList.remove("shake-effect");
      void document.body.offsetWidth;
      document.body.classList.add("shake-effect");
      playSound(audioSources.missileHit, false);
      if (window.lives <= 0) resetGame();
      particle.remove();
      particleLimits[type].current--;
    } else if (type === "heart") {
      consecutiveStars = 0;
      const heartsToAdd = isPowerUpActive ? 2 : 1;
      window.lives = Math.min(5, window.lives + heartsToAdd);
      showBonusText(`+${heartsToAdd} ❤️`, mouseX, mouseY);
      updateScore(0);
      playSound(audioSources.heartGain, false);
      particle.remove();
      particleLimits[type].current--;
    } else if (type === "bomb") {
      consecutiveStars = 0;
      const livesToLose = isPowerUpActive ? 2 : 1;
      window.lives = Math.max(0, window.lives - livesToLose);
      showBonusText(`-${livesToLose} ❤️`, mouseX, mouseY);
      triggerDamageEffect();
      document.body.classList.remove("shake-effect");
      void document.body.offsetWidth;
      document.body.classList.add("shake-effect");
      updateScore(0);
      playSound(audioSources.bombExplode, false);
      if (window.lives <= 0) resetGame();
      scoreMultiplier = 1;
      isPowerUpActive = false;
      powerUpCooldown = false;
      if (powerUpTimeout) clearTimeout(powerUpTimeout);
      deactivatePowerUpEffects();
      comboStreak = 0;
      lastClickTime = 0;
      showCustomPopup("Bomb exploded! Multiplier and Combo reset to x1.");
      particle.remove();
      particleLimits[type].current--;
    } else if (type === "egg") {
      consecutiveStars = 0;
      window.eggClicks++;
      if (window.eggClicks >= 100) {
        updateScore(10000);
        showCustomPopup("Mission completed: +10000 points for clicking 100 eggs!");
        window.eggClicks = 0;
      }
      const currentTime = Date.now();
      if (currentTime - lastClickTime <= comboTimeout) comboStreak++;
      else comboStreak = 1;
      lastClickTime = currentTime;
      const comboBonus = comboStreak * 10;
      showBonusText(`+${points * scoreMultiplier + comboBonus} ⚡ (Combo x${comboStreak})`, mouseX, mouseY);
      updateScore(points + comboBonus / scoreMultiplier);
      playSound(soundSrc, false);
      if (comboStreak >= 10) particle.classList.add("combo-fire-effect");
      particle.remove();
      particleLimits[type].current--;
    } else if (type === "frog") {
      consecutiveStars = 0;
      const currentTime = Date.now();
      if (currentTime - lastClickTime <= comboTimeout) comboStreak++;
      else comboStreak = 1;
      lastClickTime = currentTime;
      const comboBonus = comboStreak * 10;
      showBonusText(`+${points * scoreMultiplier + comboBonus} ⚡ (Combo x${comboStreak})`, mouseX, mouseY);
      updateScore(points + comboBonus / scoreMultiplier);
      playSound(soundSrc, false);
      if (comboStreak >= 10) particle.classList.add("combo-fire-effect");
      particle.remove();
      particleLimits[type].current--;
    } else {
      consecutiveStars = 0;
      const currentTime = Date.now();
      if (currentTime - lastClickTime <= comboTimeout) comboStreak++;
      else comboStreak = 1;
      lastClickTime = currentTime;
      const comboBonus = comboStreak * 10;
      updateScore(points + comboBonus / scoreMultiplier);
      playSound(soundSrc, false);
      if (comboStreak >= 10) particle.classList.add("combo-fire-effect");
      particle.remove();
      particleLimits[type].current--;
    }
  });

  if (type !== "missile" && type !== "boss" && type !== "dragon" && type !== "robotBoss" && type !== "heart" && type !== "bomb") {
    particle.addEventListener("animationend", () => {
      if (document.body.contains(particle)) {
        window.missedParticles++;
        localStorage.setItem("missedParticles", window.missedParticles);
        showCustomPopup(`Missed a ${type}! (${window.missedParticles}/42)`);
        comboStreak = 0;
        lastClickTime = 0;
        particle.remove();
        particleLimits[type].current--;
        updateScore(0);
      }
    }, { once: true });
  }

  if (type === "robot" || type === "boss" || type === "dragon" || type === "robotBoss" || type === "missile" || type === "heart" || type === "bomb") {
    particle.style.top = `${Math.random() * 80 + 10}vh`;
    particle.style.left = `${Math.random() * 80 + 10}vw`;
    particle.style.bottom = "auto";
    particle.style.position = "fixed";

    if (type === "robot") {
      const randomMove = Math.random();
      if (randomMove < 0.2) particle.style.animation = `moveSideways ${adjustedDuration}s ease-in-out infinite alternate, changeColor 5s infinite`;
      else if (randomMove < 0.6) particle.style.animation = `snowUp ${adjustedDuration}s linear infinite, changeColor 5s infinite, moveSideways ${Math.random() * 5 + 3}s ease-in-out infinite alternate`;
      else particle.style.animation = `snowDown ${adjustedDuration}s linear infinite, changeColor 5s infinite, moveSideways ${Math.random() * 5 + 3}s ease-in-out infinite alternate`;
    } else if (type === "boss" || type === "dragon" || type === "robotBoss") {
      animateBossMovement(particle, type, adjustedDuration);
    } else if (type === "missile" || type === "heart" || type === "bomb") {
      particle.style.animation = `snowUp ${adjustedDuration}s linear infinite`;
    }

    if ((type === "boss" || type === "dragon" || type === "robotBoss") && particleLimits[type].current === 1 && !isBossAlive) {
      isBossAlive = true;
      bgmPausedTime = bgm.currentTime;
      bgm.pause();
      bossSound = new Audio(audioSources.bossAppear);
      bossSound.volume = soundEnabled ? volumeSlider.value * 0.06 : 0;
      bossSound.loop = true;
      if (hasUserInteracted && soundEnabled) {
        playAudioCrossBrowser(bossSound).catch(error => {
          console.error("Erreur son boss:", error);
          bossSound.src = "https://egg1.4everland.store/mp3/video-game-boss-fiight-259885.mp3";
          playAudioCrossBrowser(bossSound);
        });
      }
      document.body.classList.add("boss-active");
      missileInterval = setInterval(() => {
        if (Math.random() < 0.5 && particleLimits.missile.current < particleLimits.missile.max && isBossAlive) createMissile();
      }, 1000);
    }
  }

  setTimeout(() => {
    if (document.body.contains(particle)) {
      particle.remove();
      particleLimits[type].current--;
      if (type === "boss" || type === "dragon" || type === "robotBoss") cleanupBoss();
    }
  }, Math.max(adjustedDuration * 1000, 30000));

  return particle;
}

function createMissile() {
  if (particleLimits.missile.current < particleLimits.missile.max) createParticle("missile", 0, "🧨", Math.random() * 4 + 4, "red", audioSources.missileHit, 1);
}

function createHeartParticle() {
  if (particleLimits.heart.current < particleLimits.heart.max) createParticle("heart", 0, "❤️", Math.random() * 10 + 12, "pink", audioSources.heartGain, 1);
}

function createBombParticle() {
  if (particleLimits.bomb.current < particleLimits.bomb.max) createParticle("bomb", 0, "💣", Math.random() * 8 + 10, "orange", audioSources.bombExplode, 1);
}

function triggerDamageEffect() {
  document.body.classList.add("damage-effect");
  setTimeout(() => document.body.classList.remove("damage-effect"), 1000);
}

function activatePowerUpEffects() {
  document.body.classList.add("power-up-active");
  document.querySelectorAll("#main-content .glitch-text").forEach(el => el.classList.add("power-up-text-active"));
  document.querySelectorAll("#main-content .glitch-text-yellow").forEach(el => el.classList.add("power-up-text-yellow-active"));
  bgm.playbackRate = 1.05;
  multiplierElement.style.display = "inline";
  multiplierElement.textContent = `x${scoreMultiplier}`;
  updateScore(0);
}

function deactivatePowerUpEffects() {
  document.body.classList.remove("power-up-active");
  document.querySelectorAll("#main-content .glitch-text").forEach(el => el.classList.remove("power-up-text-active"));
  document.querySelectorAll("#main-content .glitch-text-yellow").forEach(el => el.classList.remove("power-up-text-yellow-active"));
  bgm.playbackRate = 1.0;
  multiplierElement.style.display = "none";
  updateScore(0);
}

function createEggSnowflakes(count = 1) {
  const actualCount = Math.min(count, particleLimits.egg.max - particleLimits.egg.current);
  for (let i = 0; i < actualCount; i++) createParticle("egg", 69, "O", Math.random() * 6 + 8 + 3, "#ff0", audioSources.egg, 1);
}

function createFrogSnowflake() {
  createParticle("frog", 420, "🐸", Math.random() * 12 + 10, "rgba(0, 255, 0, 0.8)", audioSources.frog, 1);
}

function createPixelSnowflake() {
  createParticle("pixel", 0, "", Math.random() * 4 + 3, "white", null, 1);
}

function createPowerUpSnowflake() {
  const powerUpType = Math.random() < 0.5 ? "multiplier" : "bonus";
  const symbol = powerUpType === "multiplier" ? "★" : "🍀";
  createParticle("powerUp", powerUpType === "multiplier" ? 0 : (isPowerUpActive ? 10000 : 5000), symbol, Math.random() * 7 + 10, "#ff0", audioSources.powerUp, 1, powerUpType);
}

function createRobotSnowflake() {
  createParticle("robot", 69, "🤖", Math.random() * 7 + 20, "#00f", audioSources.robotClick, 16);
}

function createBossSnowflake() {
  createParticle("boss", 42000, "👾", 20, "#ff00ff", audioSources.bossDefeat, 42);
}

function createDragonSnowflake() {
  createParticle("dragon", 100000, "🐉", 20, "#00ff00", audioSources.bossDefeat, 50);
}

function createRobotBossSnowflake() {
  createParticle("robotBoss", 50000, "🥚", 25, "#f0f", audioSources.bossDefeat, 50);
}

function getLevelFromScore(score) {
  const scoreLevels = [];
  for (let i = 0; i <= 100; i++) {
    if (i <= 50) scoreLevels[i] = i * 10000 + Math.pow(i, 2) * 1000;
    else if (i <= 90) scoreLevels[i] = 5000000 + (i - 50) * 500000;
    else scoreLevels[i] = 25000000 + (i - 90) * 47500000;
  }
  for (let i = 100; i >= 0; i--) if (score >= scoreLevels[i]) return i;
  return 0;
}

function adjustParticleDensity() {
  const reductionFactor = 0.88 * 0.9 * 0.8 * particleReductionFactor;
  const currentLevel = getLevelFromScore(window.score);
  const bossScoreThreshold = Math.floor(window.score / 669000) * 669000;

  particleLimits.egg.max = Math.round((15 + (currentLevel * 2)) * reductionFactor);
  const levelFactor = Math.min(currentLevel / 20, 1);
  const exponentialFactor = Math.min(1 + Math.pow(currentLevel / 10, 1.5), 5);

  if (window.score >= 669000 && bossScoreThreshold > lastBossScoreThreshold && !isBossAlive && window.score > 0) {
    lastBossScoreThreshold = bossScoreThreshold;
    const bossIndex = (bossScoreThreshold / 669000) % 3;
    switch (bossIndex) {
      case 0: createBossSnowflake(); break;
      case 1: createRobotBossSnowflake(); break;
      case 2: createDragonSnowflake(); break;
    }
    particleLimits.frog.max = Math.round(80 * reductionFactor * exponentialFactor);
    particleLimits.pixel.max = Math.round(120 * reductionFactor * exponentialFactor);
    createEggSnowflakes(Math.round(particleLimits.egg.max * 0.5));
  }

  if (currentLevel >= 20) {
    particleLimits.frog.max = Math.round(60 * reductionFactor * exponentialFactor);
    particleLimits.pixel.max = Math.round(100 * reductionFactor * exponentialFactor);
    createEggSnowflakes(Math.round(particleLimits.egg.max * 0.5));
  } else if (currentLevel >= 15) {
    particleLimits.frog.max = Math.round(40 * reductionFactor * exponentialFactor);
    particleLimits.pixel.max = Math.round(90 * reductionFactor * exponentialFactor);
    createEggSnowflakes(Math.round(particleLimits.egg.max * 0.5));
  } else if (currentLevel >= 10) {
    particleLimits.frog.max = Math.round(15 * reductionFactor * exponentialFactor);
    particleLimits.pixel.max = Math.round(70 * reductionFactor * exponentialFactor);
    createEggSnowflakes(Math.round(particleLimits.egg.max * 0.5));
  } else {
    particleLimits.frog.max = Math.round(10 * reductionFactor * exponentialFactor * levelFactor);
    particleLimits.pixel.max = Math.round(50 * reductionFactor * exponentialFactor * levelFactor);
    createEggSnowflakes(Math.round(particleLimits.egg.max * 0.5));
  }

  particleLimits.egg.min = Math.round(3 * reductionFactor * 0.75 * exponentialFactor * levelFactor);
  particleLimits.frog.min = Math.round(1 * reductionFactor * exponentialFactor * levelFactor);
  particleLimits.pixel.min = Math.round(5 * reductionFactor * exponentialFactor * levelFactor);

  if (Math.random() < 0.05) createHeartParticle();
  const bombProbability = 0.03 + (currentLevel * 0.002);
  if (Math.random() < bombProbability) createBombParticle();
}

function startParticleGeneration() {
  createEggSnowflakes(Math.round(5 * 0.9 * 0.8 * 0.75 * particleReductionFactor));
  setInterval(() => {
    const currentLevel = getLevelFromScore(window.score);
    const eggProbability = 0.05 + (currentLevel / 100) * 0.15;
    if (particleLimits.egg.current < particleLimits.egg.max && Math.random() < eggProbability) createEggSnowflakes(1);
    if (particleLimits.frog.current < particleLimits.frog.min || Math.random() < 0.1) createFrogSnowflake();
    if (particleLimits.pixel.current < particleLimits.pixel.min || Math.random() < 0.2) createPixelSnowflake();
    if (particleLimits.powerUp.current < particleLimits.powerUp.min || Math.random() < 0.05) createPowerUpSnowflake();
    if (particleLimits.robot.current === 0 && Math.random() < (currentLevel >= 10 ? 0.05 : 0.03)) createRobotSnowflake();
    adjustParticleDensity();
  }, 500);
}

function showCustomPopup(message) {
  const popup = document.createElement("div");
  popup.className = "custom-popup";
  popup.innerHTML = message;
  const closeButton = document.createElement("button");
  closeButton.innerText = "X";
  closeButton.className = "popup-close-button";
  closeButton.addEventListener("click", () => popup.remove());
  popup.appendChild(closeButton);
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}

function showWelcomePopup() {
  const popup = document.createElement("div");
  popup.className = "custom-popup";
  popup.innerHTML = `
    <h2 class="glitch-text-yellow">Welcome to Gang Game Evolution!</h2>
    <p style="color: white; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);">Points: Click on objects to earn points:</p>
    <ul style="color: white; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);">
      <li>Egg (O): 69 points</li>
      <li>Frog (🐸): 420 points</li>
      <li>Robot (🤖): 69 points/click (16 clicks)</li>
      <li>Power-Up (★/🍀): 5000 or 10000 points (bonus), x2 to x20 multiplier</li>
      <li>Boss (👾): 42000 points (42 clicks)</li>
      <li>Robot Boss (🥚): 50000 points (50 clicks)</li>
      <li>Dragon (🐉): 100000 points (50 clicks)</li>
      <li>Heart (❤️): +1 ❤️ (or +2 if power-up active)</li>
      <li>Bomb (💣): -1 ❤️ per click (-2 if power-up active)</li>
    </ul>
    <p style="color: white; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);">How to play: Reach levels (0-100) up to 500M points!</p>
  `;
  const closeButton = document.createElement("button");
  closeButton.innerText = "X";
  closeButton.className = "popup-close-button";
  closeButton.addEventListener("click", () => popup.remove());
  popup.appendChild(closeButton);
  document.body.appendChild(popup);
}

function showBonusText(text, x, y) {
  const bonusText = document.createElement("div");
  bonusText.className = "bonus-text";
  bonusText.innerText = text;
  bonusText.style.left = `${x}px`;
  bonusText.style.top = `${y - 50}px`;
  bonusText.style.position = "fixed";
  bonusText.style.zIndex = "1000";
  document.body.appendChild(bonusText);
  setTimeout(() => bonusText.remove(), 1000);
}

const playlist = [
  "https://egg1.4everland.store/mp3/SoundHelix-Song-1%20(1).mp3",
  "https://d7db7e0895e49b82241e7e22fa07c8f8.ipfs.4everland.link/ipfs/bafybeid4gz24cavk3k4pb56jdk7tiv6e5o5mqhk64bkvdo3xt2bfhcyjte",
  "https://d7db7e0895e49b82241e7e22fa07c8f8.ipfs.4everland.link/ipfs/bafybeigye44anrkpadhk6whh4tr2h4c7rqhcnadwqukdphejqbl4jhzpmq",
  "https://d7db7e0895e49b82241e7e22fa07c8f8.ipfs.4everland.link/ipfs/bafybeie5pnsxn6ow34w3kdlax2vd33dvptf4pjpk63pmxbutzmuja3s7i4",
  "https://717ba62886d24aaab5c9d1c296df3e32.ipfs.4everland.link/ipfs/bafybeifrwxesik5ijlon7izmq5rlxs4fixqvgyrs5ne5ryjdwjix7k3hk4",
  "https://d7db7e0895e49b82241e7e22fa07c8f8.ipfs.4everland.link/ipfs/bafybeicrmk3dq3e34tvgjr4nre6nntnspzvr4dxpcfmu77loig434geik4"
];
let currentTrackIndex = 0;
const bgm = new Audio(playlist[currentTrackIndex]);
bgm.volume = 0.006;
let soundEnabled = false;

function playAudioCrossBrowser(audio) {
  if (!audio) return Promise.reject("Audio non défini");
  if (!hasUserInteracted || !soundEnabled) return Promise.reject("Son désactivé ou pas d'interaction utilisateur");
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    return playPromise.catch(error => {
      console.error("Erreur lecture audio:", error);
      return new Promise((resolve) => {
        setTimeout(() => {
          audio.play().then(resolve).catch(() => {
            console.error("Échec relecture après délai");
            resolve();
          });
        }, 500);
      });
    });
  }
  return Promise.resolve();
}

function playNextTrack() {
  if (!soundEnabled || !hasUserInteracted || isBossAlive) return;
  bgm.pause();
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  bgm.src = playlist[currentTrackIndex];
  bgm.load();
  bgm.volume = soundEnabled ? volumeSlider.value * 0.06 : 0;
  playAudioCrossBrowser(bgm).catch(error => {
    console.error("Erreur piste suivante:", error);
    setTimeout(playNextTrack, 1000);
  });
}

bgm.addEventListener("ended", playNextTrack);

function playSound(src, randomizePitch = false) {
  if (!soundEnabled || !src || !hasUserInteracted) return;
  if (src === audioSources.bombExplode && isBombSoundPlaying) return;
  const audio = new Audio(src);
  audio.volume = soundEnabled ? volumeSlider.value * 0.06 : 0;
  if (randomizePitch) audio.playbackRate = Math.random() * 2.75 + 0.25;
  playAudioCrossBrowser(audio).then(() => {
    if (src === audioSources.bombExplode) {
      isBombSoundPlaying = true;
      audio.addEventListener('ended', () => isBombSoundPlaying = false, { once: true });
    }
  }).catch(error => console.error("Erreur son:", error));
}

document.querySelectorAll(".glitch-button, .pixel-button").forEach(button => {
  button.addEventListener("mouseover", () => playSound(audioSources.hover, true));
  button.addEventListener("click", () => playSound(audioSources.buttonClick, false));
});

const muteButton = document.getElementById("muteButton");
const volumeSlider = document.getElementById("volumeSlider");

function updateVolume(volume) {
  const adjustedVolume = Math.pow(volume, 2) * 0.06;
  bgm.volume = soundEnabled ? adjustedVolume : 0;
  if (bossSound) bossSound.volume = soundEnabled ? adjustedVolume : 0;
  soundEnabled = volume > 0;
  muteButton.innerText = soundEnabled ? "🔊" : "🔇";
  if (soundEnabled && bgm.paused && bgmPausedTime === 0 && hasUserInteracted) playNextTrack();
  else if (!soundEnabled && !bgm.paused) bgm.pause();
}

volumeSlider.value = 0.25;
muteButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  volumeSlider.value = soundEnabled ? 0.25 : 0;
  updateVolume(volumeSlider.value);
});
volumeSlider.addEventListener("input", () => updateVolume(parseFloat(volumeSlider.value)));

function truncateWallet(wallet) {
  if (!wallet) return "Not connected";
  return `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`;
}

connectWalletButton.addEventListener("click", async () => {
  provider = window.ethereum || window.web3?.currentProvider;
  if (!provider) {
    showCustomPopup("No Web3 provider detected! Please install MetaMask or enable Brave Wallet.");
    return;
  }

  const web3 = new Web3(provider);
  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const fullWallet = accounts[0];
    window.connectedWallet = truncateWallet(fullWallet);
    window.userIdentifier = null;

    const sanitizedWallet = fullWallet.replace(/[^a-zA-Z0-9]/g, '');
    const walletBanSnapshot = await window.bannedWalletsRef?.child(sanitizedWallet).once('value');
    if (walletBanSnapshot?.val() === true) {
      showCustomPopup("This wallet is banned!");
      return;
    }

    const ipKey = `ip_${window.userIp?.replace(/\./g, '_')}`;
    const ipBanSnapshot = await window.bannedWalletsRef?.child(ipKey).once('value');
    if (ipBanSnapshot?.val() === true) {
      showCustomPopup("You are banned by IP!");
      return;
    }

    await getUserIdentifier?.();
    await window.updateLeaderboard?.();

    connectWalletButton.innerText = `Connected: ${window.connectedWallet}`;
    connectWalletButton.disabled = true;
    connectWalletButton.classList.add("connected");
    mintNFTButton.disabled = false;
    connectedPlayers++;
    playersCounter.innerText = `Players: ${connectedPlayers}`;

    if (window.leaderboardRef) {
      const userRef = window.leaderboardRef.child(sanitizedWallet);
      userRef.once('value', (snapshot) => {
        const data = snapshot.val();
        window.score = data ? data.score : window.score;
        window.highScore = data ? data.highScore : window.highScore;
        window.lives = data ? data.lives : 3;
        window.missedParticles = data ? data.missedParticles || 0 : 0;
        updateScore(0);
      });
    }

    provider.on('disconnect', () => {
      window.connectedWallet = null;
      window.userIdentifier = null;
      getUserIdentifier?.();
      connectWalletButton.innerText = "Connect Wallet";
      connectWalletButton.disabled = false;
      connectWalletButton.classList.remove("connected");
      mintNFTButton.disabled = true;
      connectedPlayers--;
      playersCounter.innerText = `Players: ${connectedPlayers}`;
      showCustomPopup("Wallet disconnected!");
    });

    showCustomPopup(`Wallet connected: ${window.connectedWallet}`);
  } catch (error) {
    console.error("Erreur connexion wallet:", error);
    showCustomPopup("Failed to connect wallet: " + error.message);
  }
});

mintNFTButton.addEventListener("click", async () => {
  if (!window.connectedWallet) {
    showCustomPopup("Please connect your wallet first!");
    return;
  }

  if (!contract) {
    await connectContract();
    if (!contract) return;
  }

  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const account = accounts[0];
    const quantity = parseInt(mintQuantityInput.value);
    if (isNaN(quantity) || quantity < 1 || quantity > 50) {
      showCustomPopup("Please enter a valid quantity between 1 and 50!");
      return;
    }

    const mintPrice = await getMintPrice();
    const totalCost = BigInt(mintPrice) * BigInt(quantity);

    const tx = await contract.methods.mint(quantity).send({ 
      from: account, 
      value: totalCost.toString()
    });
    console.log(`Minted ${quantity} NFTs successfully!`, tx);
    showCustomPopup(`Successfully minted ${quantity} Unique Eggs!`);
    await updateProgressBar();
  } catch (error) {
    console.error("Minting failed:", error);
    showCustomPopup("Minting failed: " + error.message);
  }
});

function optimizePerformance() {
  const particles = document.querySelectorAll('.snowflake');
  if (particles.length > 200 * particleReductionFactor) {
    particles.forEach((p, i) => { if (i < particles.length - (150 * particleReductionFactor)) p.remove(); });
  }
}

setInterval(optimizePerformance, 5000);