// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgTK0b3C9bZ7Pe4NYKpPBCLKct1l6XZVM",
  authDomain: "gangamevolution.firebaseapp.com",
  databaseURL: "https://gangamevolution-default-rtdb.firebaseio.com",
  projectId: "gangamevolution",
  storageBucket: "gangamevolution.firebasestorage.app",
  messagingSenderId: "794957521542",
  appId: "1:794957521542:web:f6cfdff0edbc081da76707",
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