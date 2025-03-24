// Variables pour l'anti-cheat
let clickHistory = [];
const MAX_CLICKS_PER_SECOND = 109;
const BAN_THRESHOLD_SECONDS = 1;

// Fonction pour suivre les clics
function trackClick() {
  const now = Date.now();
  clickHistory.push(now);

  // Filtrer les clics dans la dernière seconde
  const recentClicks = clickHistory.filter(time => now - time <= BAN_THRESHOLD_SECONDS * 1000);
  clickHistory = recentClicks;

  // Vérifier le taux de clics
  if (recentClicks.length > MAX_CLICKS_PER_SECOND) {
    banCheater();
  }
}

// Ajouter un listener global pour tous les clics sur les particules
document.addEventListener("click", (e) => {
  const particle = e.target.closest(".egg-snowflake, .frog-snowflake, .powerUp-snowflake, .robot-snowflake, .boss-snowflake, .dragon-snowflake, .robotBoss-snowflake");
  if (particle) {
    trackClick();
  }
});

// Fonction pour bannir un tricheur
async function banCheater() {
  if (!window.userIdentifier || window.isBanning) return;

  window.isBanning = true;
  const wallet = window.connectedWallet || window.userIdentifier;
  const ip = await fetchUserIp(); // Utilise la fonction existante

  // Bannir dans Firebase
  const sanitizedWallet = wallet.replace(/[^a-zA-Z0-9]/g, '');
  const sanitizedIp = ip.replace(/\./g, '_');
  window.bannedWalletsRef.child(sanitizedWallet).set(true);
  window.bannedWalletsRef.child(`ip_${sanitizedIp}`).set(true);

  // Écrire dans le fichier FTP (simulé via une fonction fictive, à adapter)
  await updateBannedFile({ wallet: sanitizedWallet, ip: sanitizedIp });

  showCustomPopup(`Cheating detected! Wallet ${wallet.substring(0, 6)}... and IP ${ip} banned.`);
  window.connectedWallet = null;
  window.userIdentifier = null;
  connectWalletButton.innerText = "Connect Wallet";
  connectWalletButton.disabled = false;
  connectWalletButton.classList.remove("connected");
  mintNFTButton.disabled = true;
  window.isBanning = false;
}

