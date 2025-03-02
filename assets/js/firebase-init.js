// Firebase 구성 객체
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
const app = firebase.initializeApp(firebaseConfig);

// Firestore 데이터베이스 참조
const db = firebase.firestore();

// Firebase 인증 참조
const auth = firebase.auth();

// 한국어 설정 (필요시)
auth.languageCode = 'ko';

// 로그인 상태 변경 감지
auth.onAuthStateChanged(function(user) {
  const userLoggedIn = document.getElementById('user-logged-in');
  const userLoggedOut = document.getElementById('user-logged-out');
  
  if (user) {
    // 사용자가 로그인한 경우
    console.log('로그인된 사용자:', user.displayName || user.email);
    
    if (userLoggedIn && userLoggedOut) {
      userLoggedIn.style.display = 'block';
      userLoggedOut.style.display = 'none';
      
      // 로그인 사용자 정보 업데이트
      updateUserInfo(user);
    }
  } else {
    // 사용자가 로그아웃한 경우
    console.log('로그인되지 않음');
    
    if (userLoggedIn && userLoggedOut) {
      userLoggedIn.style.display = 'none';
      userLoggedOut.style.display = 'block';
    }
  }
});

// 사용자 정보 업데이트 함수
function updateUserInfo(user) {
  const userNameElement = document.getElementById('user-name');
  const userIdElement = document.getElementById('user-id');
  const profileInitialElement = document.getElementById('profile-initial');
  
  if (userNameElement) {
    userNameElement.textContent = user.displayName || '사용자';
  }
  
  if (profileInitialElement) {
    const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U';
    profileInitialElement.textContent = initial;
  }
  
  // Firestore에서 추가 사용자 정보 가져오기
  db.collection('users').doc(user.uid).get()
    .then((doc) => {
      if (doc.exists && userIdElement) {
        const userData = doc.data();
        userIdElement.textContent = userData.username ? `@${userData.username}` : '';
      }
    })
    .catch((error) => {
      console.error('사용자 데이터 가져오기 오류:', error);
    });
}