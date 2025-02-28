document.addEventListener('DOMContentLoaded', function() {
    // 요소 참조
    const loginContainer = document.getElementById('login-container');
    const userContainer = document.getElementById('user-container');
    const userEmail = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');

    // 인증 페이지 요소 (auth.html에서만 사용)
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const resetPasswordCard = document.getElementById('reset-password-card');
    const authMessage = document.getElementById('auth-message');
    
    // 로그인 폼 요소
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginButton = document.getElementById('login-button');
    const googleLoginButton = document.getElementById('google-login');
    const githubLoginButton = document.getElementById('github-login');
    
    // 회원가입 폼 요소
    const signupName = document.getElementById('signup-name');
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');
    const signupConfirmPassword = document.getElementById('signup-confirm-password');
    const signupButton = document.getElementById('signup-button');
    const googleSignupButton = document.getElementById('google-signup');
    const githubSignupButton = document.getElementById('github-signup');
    
    // 비밀번호 재설정 요소
    const resetEmail = document.getElementById('reset-email');
    const resetButton = document.getElementById('reset-button');
    const backToLoginButton = document.getElementById('back-to-login');

    // 인증 상태 변경 감지
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // 로그인된 상태
            if (loginContainer) {
                loginContainer.style.display = 'none';
            }
            if (userContainer) {
                userContainer.style.display = 'block';
                userEmail.textContent = user.email;
            }
            
            // 사용자 정보 저장 (필요한 경우)
            if (db) {
                db.collection('users').doc(user.uid).set({
                    email: user.email,
                    lastLogin: new Date()
                }, { merge: true });
            }
        } else {
            // 로그아웃 상태
            if (loginContainer) {
                loginContainer.style.display = 'block';
            }
            if (userContainer) {
                userContainer.style.display = 'none';
            }
        }
    });

    // 로그아웃 버튼 이벤트 리스너
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            auth.signOut().then(function() {
                // 로그아웃 성공
                console.log('로그아웃 성공');
            }).catch(function(error) {
                // 로그아웃 실패
                console.error('로그아웃 오류:', error);
            });
        });
    }

    // 인증 페이지 탭 전환 (auth.html에서만)
    if (authTabs) {
        authTabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                // 모든 탭과 폼에서 active 클래스 제거
                authTabs.forEach(t => t.classList.remove('active'));
                authForms.forEach(f => f.classList.remove('active'));
                
                // 클릭된 탭에 active 클래스 추가
                this.classList.add('active');
                
                // 해당 폼 활성화
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId + '-form').classList.add('active');
                
                // 비밀번호 재설정 카드 숨기기
                if (resetPasswordCard) {
                    resetPasswordCard.style.display = 'none';
                }
                
                // 메시지 초기화
                if (authMessage) {
                    authMessage.style.display = 'none';
                    authMessage.textContent = '';
                    authMessage.className = 'auth-message';
                }
            });
        });
    }

    // 로그인 폼 제출
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            const email = loginEmail.value.trim();
            const password = loginPassword.value;
            
            if (!email || !password) {
                showMessage('이메일과 비밀번호를 입력해주세요.', 'error');
                return;
            }
            
            auth.signInWithEmailAndPassword(email, password)
                .then(function(userCredential) {
                    // 로그인 성공
                    showMessage('로그인 성공! 리디렉션 중...', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                })
                .catch(function(error) {
                    // 로그인 실패
                    let errorMessage;
                    switch (error.code) {
                        case 'auth/user-not-found':
                            errorMessage = '존재하지 않는 이메일입니다.';
                            break;
                        case 'auth/wrong-password':
                            errorMessage = '비밀번호가 일치하지 않습니다.';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = '유효하지 않은 이메일 형식입니다.';
                            break;
                        case 'auth/user-disabled':
                            errorMessage = '비활성화된 계정입니다.';
                            break;
                        default:
                            errorMessage = '로그인 중 오류가 발생했습니다: ' + error.message;
                    }
                    showMessage(errorMessage, 'error');
                });
        });
    }

    // 회원가입 폼 제출
    if (signupButton) {
        signupButton.addEventListener('click', function() {
            const name = signupName.value.trim();
            const email = signupEmail.value.trim();
            const password = signupPassword.value;
            const confirmPassword = signupConfirmPassword.value;
            
            if (!name || !email || !password || !confirmPassword) {
                showMessage('모든 필드를 입력해주세요.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('비밀번호가 일치하지 않습니다.', 'error');
                return;
            }
            
            if (password.length < 6) {
                showMessage('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
                return;
            }
            
            auth.createUserWithEmailAndPassword(email, password)
                .then(function(userCredential) {
                    // 회원가입 성공
                    const user = userCredential.user;
                    
                    // 사용자 이름 업데이트
                    user.updateProfile({
                        displayName: name
                    }).then(function() {
                        // 프로필 업데이트 성공
                    }).catch(function(error) {
                        console.error('프로필 업데이트 오류:', error);
                    });
                    
                    // 사용자 정보 저장 (Firestore)
                    if (db) {
                        db.collection('users').doc(user.uid).set({
                            name: name,
                            email: email,
                            createdAt: new Date()
                        });
                    }
                    
                    showMessage('회원가입 성공! 리디렉션 중...', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                })
                .catch(function(error) {
                    // 회원가입 실패
                    let errorMessage;
                    switch (error.code) {
                        case 'auth/email-already-in-use':
                            errorMessage = '이미 사용 중인 이메일입니다.';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = '유효하지 않은 이메일 형식입니다.';
                            break;
                        case 'auth/weak-password':
                            errorMessage = '보안이 약한 비밀번호입니다.';
                            break;
                        default:
                            errorMessage = '회원가입 중 오류가 발생했습니다: ' + error.message;
                    }
                    showMessage(errorMessage, 'error');
                });
        });
    }

    // Google 로그인
    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', function() {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider)
                .then(function(result) {
                    // Google 로그인 성공
                    showMessage('Google 로그인 성공! 리디렉션 중...', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                })
                .catch(function(error) {
                    showMessage('Google 로그인 중 오류가 발생했습니다: ' + error.message, 'error');
                });
        });
    }

    // GitHub 로그인
    if (githubLoginButton) {
        githubLoginButton.addEventListener('click', function() {
            const provider = new firebase.auth.GithubAuthProvider();
            auth.signInWithPopup(provider)
                .then(function(result) {
                    // GitHub 로그인 성공
                    showMessage('GitHub 로그인 성공! 리디렉션 중...', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                })
                .catch(function(error) {
                    showMessage('GitHub 로그인 중 오류가 발생했습니다: ' + error.message, 'error');
                });
        });
    }

    // Google 회원가입
    if (googleSignupButton) {
        googleSignupButton.addEventListener('click', function() {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider)
                .then(function(result) {
                    // Google 로그인/회원가입 성공
                    const user = result.user;
                    const isNewUser = result.additionalUserInfo.isNewUser;
                    
                    if (isNewUser && db) {
                        db.collection('users').doc(user.uid).set({
                            name: user.displayName,
                            email: user.email,
                            createdAt: new Date()
                        });
                    }
                    
                    showMessage('Google 계정으로 가입 성공! 리디렉션 중...', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                })
                .catch(function(error) {
                    showMessage('Google 계정 가입 중 오류가 발생했습니다: ' + error.message, 'error');
                });
        });
    }

    // GitHub 회원가입
    if (githubSignupButton) {
        githubSignupButton.addEventListener('click', function() {
            const provider = new firebase.auth.GithubAuthProvider();
            auth.signInWithPopup(provider)
                .then(function(result) {
                    // GitHub 로그인/회원가입 성공
                    const user = result.user;
                    const isNewUser = result.additionalUserInfo.isNewUser;
                    
                    if (isNewUser && db) {
                        db.collection('users').doc(user.uid).set({
                            name: user.displayName,
                            email: user.email,
                            createdAt: new Date()
                        });
                    }
                    
                    showMessage('GitHub 계정으로 가입 성공! 리디렉션 중...', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                })
                .catch(function(error) {
                    showMessage('GitHub 계정 가입 중 오류가 발생했습니다: ' + error.message, 'error');
                });
        });
    }

    // 비밀번호 재설정 링크 보내기
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            const email = resetEmail.value.trim();
            
            if (!email) {
                showMessage('이메일을 입력해주세요.', 'error');
                return;
            }
            
            auth.sendPasswordResetEmail(email)
                .then(function() {
                    showMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다.', 'success');
                })
                .catch(function(error) {
                    // 비밀번호 재설정 링크 전송 실패
                    let errorMessage;
                    switch (error.code) {
                        case 'auth/user-not-found':
                            errorMessage = '존재하지 않는 이메일입니다.';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = '유효하지 않은 이메일 형식입니다.';
                            break;
                        default:
                            errorMessage = '비밀번호 재설정 링크 전송 중 오류가 발생했습니다: ' + error.message;
                    }
                    showMessage(errorMessage, 'error');
                });
        });
    }

    // "로그인으로 돌아가기" 버튼
    if (backToLoginButton) {
        backToLoginButton.addEventListener('click', function() {
            resetPasswordCard.style.display = 'none';
            document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
            document.querySelector('.auth-tab[data-tab="signup"]').classList.remove('active');
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
            
            // 메시지 초기화
            authMessage.style.display = 'none';
            authMessage.textContent = '';
            authMessage.className = 'auth-message';
        });
    }

    // "비밀번호를 잊으셨나요?" 링크 추가
    const forgotPasswordLink = document.createElement('a');
    forgotPasswordLink.textContent = '비밀번호를 잊으셨나요?';
    forgotPasswordLink.href = '#';
    forgotPasswordLink.classList.add('forgot-password-link');
    forgotPasswordLink.style.display = 'block';
    forgotPasswordLink.style.marginTop = '16px';
    forgotPasswordLink.style.textAlign = 'center';
    forgotPasswordLink.style.color = 'var(--accent-color)';
    forgotPasswordLink.style.fontSize = '14px';
    
    // 로그인 폼에 링크 추가
    if (loginForm) {
        const loginFormAction = loginForm.querySelector('.form-action');
        if (loginFormAction) {
            loginFormAction.appendChild(forgotPasswordLink);
        }
        
        // 비밀번호 재설정 화면 표시
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (resetPasswordCard) {
                resetPasswordCard.style.display = 'block';
                document.querySelector('.auth-card:not(#reset-password-card)').style.display = 'none';
            }
        });
    }

    // 메시지 표시 함수
    function showMessage(message, type) {
        if (!authMessage) return;
        
        authMessage.textContent = message;
        authMessage.className = 'auth-message';
        authMessage.classList.add(type);
        authMessage.style.display = 'block';
    }
});