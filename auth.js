// Firebase 설정
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// 로그인 처리
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // 로그인 상태 지속 설정
        if (remember) {
            auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } else {
            auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
        }
        
        // Firebase 로그인
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // 로그인 성공
                const user = userCredential.user;
                showToast('로그인 성공!');
                
                // 로그인 후 메인 페이지로 이동
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            })
            .catch((error) => {
                // 로그인 실패
                const errorCode = error.code;
                let errorMessage = '로그인에 실패했습니다.';
                
                if (errorCode === 'auth/user-not-found') {
                    errorMessage = '등록되지 않은 이메일입니다.';
                } else if (errorCode === 'auth/wrong-password') {
                    errorMessage = '비밀번호가 일치하지 않습니다.';
                } else if (errorCode === 'auth/invalid-email') {
                    errorMessage = '유효하지 않은 이메일 형식입니다.';
                }
                
                showToast(errorMessage, 'error');
            });
    });
}

// 회원가입 처리
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // 비밀번호 확인
        if (password !== confirmPassword) {
            showToast('비밀번호가 일치하지 않습니다.', 'error');
            return;
        }
        
        // 비밀번호 길이 확인
        if (password.length < 8) {
            showToast('비밀번호는 8자 이상이어야 합니다.', 'error');
            return;
        }
        
        // Firebase 회원가입
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // 회원가입 성공
                const user = userCredential.user;
                
                // 사용자 프로필 업데이트
                return user.updateProfile({
                    displayName: name
                }).then(() => {
                    showToast('회원가입 성공!');
                    
                    // 회원가입 후 로그인 페이지로 이동
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                });
            })
            .catch((error) => {
                // 회원가입 실패
                const errorCode = error.code;
                let errorMessage = '회원가입에 실패했습니다.';
                
                if (errorCode === 'auth/email-already-in-use') {
                    errorMessage = '이미 사용 중인 이메일입니다.';
                } else if (errorCode === 'auth/invalid-email') {
                    errorMessage = '유효하지 않은 이메일 형식입니다.';
                } else if (errorCode === 'auth/weak-password') {
                    errorMessage = '보안에 취약한 비밀번호입니다.';
                }
                
                showToast(errorMessage, 'error');
            });
    });
}

// 소셜 로그인 - Google
const googleButtons = document.querySelectorAll('.btn-google');
googleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                showToast('Google 로그인 성공!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }).catch((error) => {
                showToast('Google 로그인 실패', 'error');
            });
    });
});

// 소셜 로그인 - GitHub
const githubButtons = document.querySelectorAll('.btn-github');
githubButtons.forEach(button => {
    button.addEventListener('click', () => {
        const provider = new firebase.auth.GithubAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                showToast('GitHub 로그인 성공!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }).catch((error) => {
                showToast('GitHub 로그인 실패', 'error');
            });
    });
});

// 비밀번호 표시/숨김 토글
const togglePasswordButtons = document.querySelectorAll('.toggle-password');
togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
        const passwordInput = this.previousElementSibling;
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
});

// 로그인 상태 확인
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        const authLinks = document.querySelector('.auth-links');
        const userProfileMenu = document.querySelector('.user-profile-menu');
        
        if (authLinks && userProfileMenu) {
            if (user) {
                // 로그인된 경우
                authLinks.style.display = 'none';
                userProfileMenu.style.display = 'flex';
                
                // 사용자 이름 표시
                const userNameElement = document.querySelector('.user-name');
                if (userNameElement) {
                    userNameElement.textContent = user.displayName || '사용자';
                }
                
                // 프로필 이미지 설정
                const userImgElement = document.querySelector('.user-img img');
                if (userImgElement) {
                    if (user.photoURL) {
                        userImgElement.src = user.photoURL;
                    } else {
                        // 기본 이미지 사용
                        userImgElement.src = '/api/placeholder/40/40';
                    }
                }
            } else {
                // 로그아웃된 경우
                authLinks.style.display = 'flex';
                userProfileMenu.style.display = 'none';
            }
        }
    });
});

// 로그아웃 기능
function logout() {
    auth.signOut().then(() => {
        showToast('로그아웃 되었습니다.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }).catch((error) => {
        showToast('로그아웃 실패', 'error');
    });
}

// 알림 표시 함수
function showToast(message, type = 'success') {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 토스트 추가
    document.body.appendChild(toast);
    
    // 토스트 애니메이션
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 토스트 자동 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}