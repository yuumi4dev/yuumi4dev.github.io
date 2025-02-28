// Firebase 구성
const firebaseConfig = {
    apiKey: "AIzaSyD2YzgyegEuCZ0ZoP4GEVnNsZMOcqsolrE",
    authDomain: "githubioproject.firebaseapp.com",
    projectId: "githubioproject",
    storageBucket: "githubioproject.appspot.com",
    messagingSenderId: "8593894041",
    appId: "1:8593894041:web:e1ec36a1dc5cbad8886608",
    measurementId: "G-X8CMBLXV52"
  };
  
  // Firebase 초기화
  firebase.initializeApp(firebaseConfig);
  
  // Firebase 서비스 참조
  const auth = firebase.auth();
  const db = firebase.firestore ? firebase.firestore() : null;