// Références Firebase déjà définies via window.database dans votre configuration
window.leaderboardRef = window.database.ref('leaderboard');
window.bannedWalletsRef = window.database.ref('bannedWallets');
window.anonymousUsersRef = window.database.ref('anonymousUsers');

const leaderboardList = document.getElementById("leaderboard-list");
const shareScoreButton = document.getElementById("shareScore");

window.leaderboard = [];
window.lastUpdatedScore = null;
window.lastUpdatedHighScore = null;
window.isUpdatingLeaderboard = false;
window.userIp = null;
window.userIdentifier = null;
window.previousIdentifier = null;

window.fetchUserIp = async function() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    window.userIp = data.ip;
    return window.userIp;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'IP :", error);
    window.userIp = 'unknown_' + Math.random().toString(36).substr(2, 9);
    return window.userIp;
  }
};

async function getUserIdentifier() {
  if (!window.userIp) {
    await window.fetchUserIp();
  }

  const ipKey = window.userIp.replace(/\./g, '_');

  if (window.connectedWallet) {
    const identifier = generatePseudonym(window.connectedWallet);
    if (window.userIdentifier && window.userIdentifier.match(/^AnonymeFrog\d+$/)) {
      window.previousIdentifier = window.userIdentifier;
    }
    window.userIdentifier = identifier;
    await window.anonymousUsersRef.child(ipKey).set(identifier).catch(error => {
      console.error("Erreur lors de l'écriture de l'identifiant pour wallet :", error);
    });
    if (window.previousIdentifier) {
      const sanitizedPreviousIdentifier = window.previousIdentifier.replace(/[^a-zA-Z0-9]/g, '');
      await window.leaderboardRef.child(sanitizedPreviousIdentifier).remove().catch(error => {
        console.error("Erreur lors de la suppression de l'ancienne entrée :", error);
      });
      window.previousIdentifier = null;
    }
    return identifier;
  }

  return new Promise((resolve) => {
    window.anonymousUsersRef.child(ipKey).once('value', (snapshot) => {
      let identifier = snapshot.val();
      if (!identifier || !String(identifier).match(/^Frog\d+$/)) {
        const counterRef = window.anonymousUsersRef.child('globalCounter');
        counterRef.transaction((currentValue) => {
          return (currentValue || 0) + 1;
        }, (error, committed, snapshot) => {
          if (error) {
            console.error("Erreur lors de l'incrémentation du compteur :", error);
            const randomId = Math.floor(Math.random() * 1000000);
            identifier = `Frog${randomId}`;
            window.userIdentifier = identifier;
            resolve(identifier);
            return;
          } else if (committed) {
            const count = snapshot.val();
            identifier = `Frog${count}`;
            if (!identifier.match(/^Frog\d+$/)) {
              console.error("Identifiant invalide généré :", identifier);
              const randomId = Math.floor(Math.random() * 1000000);
              identifier = `Frog${randomId}`;
              window.userIdentifier = identifier;
              resolve(identifier);
              return;
            }
            window.anonymousUsersRef.child(ipKey).set(identifier)
              .then(() => {
                window.userIdentifier = identifier;
                resolve(identifier);
              })
              .catch((error) => {
                console.error("Erreur lors de l'écriture de l'identifiant :", error);
                window.userIdentifier = identifier;
                resolve(identifier);
              });
          }
        });
      } else {
        window.userIdentifier = identifier;
        resolve(identifier);
      }
    });
  });
}

function generatePseudonym(identifier) {
  if (!identifier) return "UnknownFrog";
  if (String(identifier).match(/^Frog\d+$/)) {
    return `Anonyme${identifier}`;
  }
  if (String(identifier).match(/^0x[a-fA-F0-9]{4}\.\.\.[a-fA-F0-9]{4}$/)) {
    const simpleHash = String(identifier).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `BasedFrog${simpleHash % 1000}`;
  }
  if (String(identifier).match(/^0x[a-fA-F0-9]{40}$/)) {
    const truncated = `${String(identifier).slice(0, 6)}...${String(identifier).slice(-4)}`;
    const simpleHash = truncated.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `BasedFrog${simpleHash % 1000}`;
  }
  console.warn(`Identifiant non reconnu : ${identifier}, utilisation du format par défaut`);
  return `OLDFrog${String(identifier).slice(-4)}`;
}

async function cleanInvalidEntries() {
  try {
    const anonymousSnapshot = await window.anonymousUsersRef.once('value');
    const anonymousData = anonymousSnapshot.val();
    if (!anonymousData) {
      console.log("Aucune donnée dans anonymousUsers à nettoyer.");
    } else {
      const anonymousUpdates = {};
      Object.entries(anonymousData).forEach(([key, identifier]) => {
        if (identifier && !String(identifier).match(/^Frog\d+$/) && !String(identifier).match(/^BasedFrog\d+$/)) {
          anonymousUpdates[key] = null;
        }
      });
      if (Object.keys(anonymousUpdates).length > 0) {
        await window.anonymousUsersRef.update(anonymousUpdates);
        console.log("Entrées invalides supprimées de anonymousUsers :", Object.keys(anonymousUpdates).length);
      } else {
        console.log("Aucune entrée invalide trouvée dans anonymousUsers.");
      }
    }

    const leaderboardSnapshot = await window.leaderboardRef.once('value');
    const leaderboardData = leaderboardSnapshot.val();
    if (!leaderboardData) {
      console.log("Aucune donnée dans leaderboard à nettoyer.");
      return;
    }

    const leaderboardUpdates = {};
    Object.entries(leaderboardData).forEach(([key, entry]) => {
      const identifier = entry.identifier || key;
      if (!identifier.match(/^AnonymeFrog\d+$/) && !identifier.match(/^BasedFrog\d+$/) && !identifier.match(/^OLDFrog[a-zA-Z0-9]{4}$/)) {
        leaderboardUpdates[key] = null;
      }
    });

    if (Object.keys(leaderboardUpdates).length > 0) {
      await window.leaderboardRef.update(leaderboardUpdates).catch(error => {
        console.error("Erreur lors de la suppression des entrées invalides du leaderboard :", error);
      });
      console.log("Entrées invalides supprimées de leaderboard :", Object.keys(leaderboardUpdates).length);
    } else {
      console.log("Aucune entrée invalide trouvée dans leaderboard.");
    }
  } catch (error) {
    console.error("Erreur lors du nettoyage des entrées invalides :", error);
  }
}

// Nouvelle logique pour éviter les doublons dès la mise à jour
window.updateLeaderboard = async function () {
  if (!window.leaderboardRef || window.isUpdatingLeaderboard) {
    return;
  }

  if (!window.userIdentifier) {
    await getUserIdentifier();
  }

  if (!window.userIp) {
    await window.fetchUserIp();
  }

  if (!window.userIdentifier) {
    console.error("Échec de la récupération de l'identifiant utilisateur");
    return;
  }

  const currentScore = window.score || 0;
  const currentHighScore = Math.max(window.highScore || 0, window.score || 0);
  if (window.lastUpdatedScore === currentScore && window.lastUpdatedHighScore === currentHighScore) {
    return;
  }

  window.isUpdatingLeaderboard = true;
  const sanitizedIdentifier = window.userIdentifier.replace(/[^a-zA-Z0-9]/g, '');

  // Vérifier les entrées existantes pour l'IP actuelle
  const leaderboardSnapshot = await window.leaderboardRef.once('value');
  const leaderboardData = leaderboardSnapshot.val();
  let existingEntryKey = null;

  if (leaderboardData) {
    for (const [key, entry] of Object.entries(leaderboardData)) {
      if (entry.ip === window.userIp && key !== sanitizedIdentifier) {
        existingEntryKey = key;
        break;
      }
    }
  }

  const playerEntry = {
    identifier: window.userIdentifier,
    score: currentScore,
    highScore: currentHighScore,
    lives: window.lives || 3,
    missedParticles: window.missedParticles || 0,
    ip: window.userIp,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  };

  // Mettre à jour l'entrée actuelle
  await window.leaderboardRef.child(sanitizedIdentifier).set(playerEntry)
    .then(() => {
      window.lastUpdatedScore = currentScore;
      window.lastUpdatedHighScore = currentHighScore;
      console.log("Leaderboard mis à jour avec succès pour :", sanitizedIdentifier);
    })
    .catch((error) => {
      console.error("Erreur lors de la mise à jour du classement :", error);
    });

  // Supprimer l'ancienne entrée si elle existe
  if (existingEntryKey) {
    await window.leaderboardRef.child(existingEntryKey).remove()
      .then(() => {
        console.log(`Ancienne entrée supprimée pour IP ${window.userIp} : ${existingEntryKey}`);
      })
      .catch(error => {
        console.error("Erreur lors de la suppression de l'ancienne entrée :", error);
      });
  }

  window.isUpdatingLeaderboard = false;
};

function updateLeaderboardDisplay() {
  if (!leaderboardList) {
    console.error("Element leaderboard-list non trouvé dans le DOM.");
    return;
  }

  let bannedWallets = {};
  window.bannedWalletsRef.once('value')
    .then(bannedSnapshot => {
      const bannedData = bannedSnapshot.val();
      bannedWallets = bannedData ? Object.keys(bannedData).reduce((acc, wallet) => ({ ...acc, [wallet]: true }), {}) : {};
      console.log("bannedWallets récupéré avec succès :", bannedWallets);

      window.leaderboardRef.on('value', (leaderboardSnapshot) => {
        try {
          const data = leaderboardSnapshot.val();

          if (!data) {
            console.log("Aucune donnée dans leaderboard.");
            leaderboardList.innerHTML = "<li>No players yet!</li>";
            return;
          }

          const leaderboardArray = Object.entries(data)
            .map(([key, entry]) => {
              return {
                identifier: entry.identifier || key,
                score: entry.score || 0,
                highScore: entry.highScore || 0,
                lives: entry.lives || 3
              };
            })
            .filter(entry => !bannedWallets[entry.identifier.replace(/[^a-zA-Z0-9]/g, '')]);

          const top10 = leaderboardArray
            .sort((a, b) => b.highScore - a.highScore)
            .slice(0, 10);

          leaderboardList.innerHTML = top10.length > 0
            ? top10.map((entry, index) => {
                const displayName = entry.identifier;
                const paddedName = displayName.padEnd(20, ' ');
                return `<li>${index + 1}. ${paddedName}- Score: ${entry.score.toString().padStart(6, ' ')} (High: ${entry.highScore.toString().padStart(6, ' ')}) ❤️: ${entry.lives}</li>`;
              }).join("")
            : "<li>No players yet!</li>";

          if (window.userIdentifier && window.score !== undefined && window.highScore !== undefined && window.lives !== undefined) {
            const displayName = window.userIdentifier;
            const paddedName = displayName.padEnd(20, ' ');
            const userEntry = `<li style="color: yellow;">YOUR SCORE - ${paddedName}- Score: ${window.score.toString().padStart(6, ' ')} (High: ${window.highScore.toString().padStart(6, ' ')}) ❤️: ${window.lives}</li>`;
            leaderboardList.innerHTML += userEntry;
          }
        } catch (error) {
          console.error("Erreur lors de la mise à jour du leaderboard :", error.message);
          leaderboardList.innerHTML = `<li>Error loading leaderboard: ${error.message}</li>`;
        }
      }, (error) => {
        console.error("Erreur lors de l'écoute des changements du leaderboard :", error);
        leaderboardList.innerHTML = `<li>Error loading leaderboard: ${error.message}</li>`;
      });
    })
    .catch(error => {
      console.error("Erreur lors de la lecture de bannedWallets :", error);
    });
}

shareScoreButton.addEventListener("click", () => {
  const tweet = `I scored ${window.score || 0} (High: ${window.highScore || 0}) on GGE! Join the MEME universe: gangamevolution.site #GAMEBased`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, "_blank");
  showCustomPopup("Score shared!");
});

window.banWallet = function(wallet) {
  if (!window.bannedWalletsRef) return;
  const sanitizedWallet = wallet.replace(/[^a-zA-F0-9]/g, '');
  window.bannedWalletsRef.child(sanitizedWallet).set(true)
    .then(() => {
      console.log(`Wallet ${wallet} banned successfully`);
    })
    .catch(error => console.error("Error while banning:", error));
};

window.unbanWallet = function(wallet) {
  if (!window.bannedWalletsRef) return;
  const sanitizedWallet = wallet.replace(/[^a-zA-F0-9]/g, '');
  window.bannedWalletsRef.child(sanitizedWallet).remove()
    .then(() => {
      console.log(`Wallet ${wallet} unbanned successfully`);
    })
    .catch(error => console.error("Error while unbanning:", error));
};

document.addEventListener("DOMContentLoaded", async () => {
  await getUserIdentifier();
  await cleanInvalidEntries();
  updateLeaderboardDisplay();
});

setInterval(() => {
  if (window.updateLeaderboard) window.updateLeaderboard();
}, 5000);

window.addEventListener('beforeunload', () => {
  window.leaderboardRef.off('value');
});

function getLevelFromScore(score) {
  const scoreLevels = [];
  for (let i = 0; i <= 100; i++) {
    if (i <= 50) {
      scoreLevels[i] = i * 10000 + Math.pow(i, 2) * 1000;
    } else if (i <= 90) {
      scoreLevels[i] = 5000000 + (i - 50) * 500000;
    } else {
      scoreLevels[i] = 25000000 + (i - 90) * 47500000;
    }
  }

  for (let i = 100; i >= 0; i--) {
    if (score >= scoreLevels[i]) return i;
  }
  return 0;
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

// Suppression de consolidateLeaderboard car inutile avec la nouvelle logique
async function consolidateLeaderboard() {
  console.log("Consolidation non nécessaire : les doublons sont gérés dans updateLeaderboard.");
}