// Firebase 구성
const firebaseConfig = {
    // Firebase 콘솔에서 가져온 구성 정보를 여기에 입력
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firebase 서비스 참조
const auth = firebase.auth();
const db = firebase.firestore ? firebase.firestore() : null;