// Firebase configuration
const firebaseConfig = {
  apiKey: "-",
  authDomain: "x",
  databaseURL: "x",
  projectId: "gangamevolution",
  storageBucket: "x",
  messagingSenderId: "794957521542",
  appId: "x",
  measurementId: "G-RRTMQMDCR1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export database reference
const database = firebase.database();
window.database = database;
window.leaderboardRef = database.ref('leaderboard');
window.bannedWalletsRef = database.ref('bannedWallets');
window.anonymousUsersRef = database.ref('anonymousUsers'); // Nouvelle branche pour les utilisateurs anonymes
