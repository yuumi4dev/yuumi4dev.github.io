// Firebase 인증 관련 자바스크립트 파일

document.addEventListener('DOMContentLoaded', function() {
    // 언어 감지
    const currentLang = getCurrentLanguage();
    
    // 탭 전환 기능
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // 활성화된 탭 스타일 변경
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 해당 폼 표시
            authForms.forEach(form => {
                if (form.id === `${tabName}-form`) {
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                }
            });
        });
    });
    
    // 로그인 처리
    const loginButtons = document.querySelectorAll('.login-button-js');
    if (loginButtons.length > 0) {
        loginButtons.forEach(button => {
            button.addEventListener('click', function() {
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                if (!email || !password) {
                    showAuthMessage('error', getLocalizedString('이메일과 비밀번호를 입력하세요', 'Please enter email and password', 'Por favor ingrese correo electrónico y contraseña'));
                    return;
                }
                
                showAuthMessage('loading', getLocalizedString('로그인 중...', 'Logging in...', 'Iniciando sesión...'));
                
                // Firebase 로그인 처리
                firebase.auth().signInWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        // 로그인 성공
                        showAuthMessage('success', getLocalizedString('로그인 성공!', 'Login successful!', '¡Inicio de sesión exitoso!'));
                        window.location.href = 'index.html'; // 메인 페이지로 이동
                    })
                    .catch((error) => {
                        // 오류 처리
                        handleAuthError(error);
                    });
            });
        });
    }
    
    // 회원가입 처리
    const signupButtons = document.querySelectorAll('.signup-button-js');
    if (signupButtons.length > 0) {
        signupButtons.forEach(button => {
            button.addEventListener('click', function() {
                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                const username = document.getElementById('signup-username').value;
                const password = document.getElementById('signup-password').value;
                const confirmPassword = document.getElementById('signup-confirm-password').value;
                
                // 입력 검증
                if (!name || !email || !username || !password || !confirmPassword) {
                    showAuthMessage('error', getLocalizedString('모든 필드를 입력하세요', 'Please fill in all fields', 'Por favor complete todos los campos'));
                    return;
                }
                
                // 사용자명 검증 (영문, 숫자, 밑줄만 허용)
                const usernameRegex = /^[a-zA-Z0-9_]+$/;
                if (!usernameRegex.test(username)) {
                    showAuthMessage('error', getLocalizedString('사용자 ID는 영문, 숫자, 밑줄(_)만 사용 가능합니다', 'Username can only contain letters, numbers, and underscores (_)', 'El nombre de usuario solo puede contener letras, números y guiones bajos (_)'));
                    return;
                }
                
                // 비밀번호 일치 확인
                if (password !== confirmPassword) {
                    showAuthMessage('error', getLocalizedString('비밀번호가 일치하지 않습니다', 'Passwords do not match', 'Las contraseñas no coinciden'));
                    return;
                }
                
                // 비밀번호 길이 확인
                if (password.length < 6) {
                    showAuthMessage('error', getLocalizedString('비밀번호는 최소 6자 이상이어야 합니다', 'Password must be at least 6 characters', 'La contraseña debe tener al menos 6 caracteres'));
                    return;
                }
                
                showAuthMessage('loading', getLocalizedString('계정 생성 중...', 'Creating account...', 'Creando cuenta...'));
                
                // Firebase 회원가입 처리
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        
                        // 사용자 프로필 설정
                        return user.updateProfile({
                            displayName: name
                        }).then(() => {
                            // Firestore에 사용자 정보 저장
                            return db.collection('users').doc(user.uid).set({
                                name: name,
                                email: email,
                                username: username,
                                createdAt: new Date()
                            });
                        });
                    })
                    .then(() => {
                        // 회원가입 성공
                        showAuthMessage('success', getLocalizedString('회원가입 성공!', 'Sign up successful!', '¡Registro exitoso!'));
                        setTimeout(() => {
                            window.location.href = 'index.html'; // 메인 페이지로 이동
                        }, 1500);
                    })
                    .catch((error) => {
                        // 오류 처리
                        handleAuthError(error);
                    });
            });
        });
    }
    
    // 소셜 로그인 (Google)
    const googleLoginBtn = document.getElementById('google-login');
    const googleSignupBtn = document.getElementById('google-signup');
    
    function handleGoogleAuth() {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        showAuthMessage('loading', getLocalizedString('Google 계정으로 로그인 중...', 'Signing in with Google...', 'Iniciando sesión con Google...'));
        
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                
                // 사용자 정보 Firestore에 저장 또는 업데이트
                return db.collection('users').doc(user.uid).set({
                    name: user.displayName,
                    email: user.email,
                    profileImage: user.photoURL,
                    lastLogin: new Date()
                }, { merge: true });
            })
            .then(() => {
                showAuthMessage('success', getLocalizedString('로그인 성공!', 'Login successful!', '¡Inicio de sesión exitoso!'));
                setTimeout(() => {
                    window.location.href = 'index.html'; // 메인 페이지로 이동
                }, 1500);
            })
            .catch((error) => {
                handleAuthError(error);
            });
    }
    
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleAuth);
    }
    
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', handleGoogleAuth);
    }
    
    // 소셜 로그인 (GitHub)
    const githubLoginBtn = document.getElementById('github-login');
    const githubSignupBtn = document.getElementById('github-signup');
    
    function handleGithubAuth() {
        const provider = new firebase.auth.GithubAuthProvider();
        
        showAuthMessage('loading', getLocalizedString('GitHub 계정으로 로그인 중...', 'Signing in with GitHub...', 'Iniciando sesión con GitHub...'));
        
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                
                // 사용자 정보 Firestore에 저장 또는 업데이트
                return db.collection('users').doc(user.uid).set({
                    name: user.displayName,
                    email: user.email,
                    profileImage: user.photoURL,
                    lastLogin: new Date()
                }, { merge: true });
            })
            .then(() => {
                showAuthMessage('success', getLocalizedString('로그인 성공!', 'Login successful!', '¡Inicio de sesión exitoso!'));
                setTimeout(() => {
                    window.location.href = 'index.html'; // 메인 페이지로 이동
                }, 1500);
            })
            .catch((error) => {
                handleAuthError(error);
            });
    }
    
    if (githubLoginBtn) {
        githubLoginBtn.addEventListener('click', handleGithubAuth);
    }
    
    if (githubSignupBtn) {
        githubSignupBtn.addEventListener('click', handleGithubAuth);
    }
    
    // 비밀번호 재설정
    const resetButtons = document.querySelectorAll('.reset-button-js');
    const backToLoginBtns = document.querySelectorAll('.back-to-login-btn');
    
    // 비밀번호 재설정 링크 클릭 시 처리
    document.querySelectorAll('.reset-password-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 로그인 폼 숨기고 비밀번호 재설정 폼 표시
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('reset-password-card').style.display = 'block';
        });
    });
    
    // 비밀번호 재설정 처리
    if (resetButtons.length > 0) {
        resetButtons.forEach(button => {
            button.addEventListener('click', function() {
                const email = document.getElementById('reset-email').value;
                
                if (!email) {
                    showAuthMessage('error', getLocalizedString('이메일을 입력하세요', 'Please enter your email', 'Por favor ingrese su correo electrónico'));
                    return;
                }
                
                showAuthMessage('loading', getLocalizedString('비밀번호 재설정 링크 전송 중...', 'Sending password reset link...', 'Enviando enlace para restablecer contraseña...'));
                
                // Firebase 비밀번호 재설정 메일 전송
                firebase.auth().sendPasswordResetEmail(email)
                    .then(() => {
                        showAuthMessage('success', getLocalizedString('비밀번호 재설정 링크가 이메일로 전송되었습니다', 'Password reset link has been sent to your email', 'Se ha enviado un enlace para restablecer la contraseña a su correo electrónico'));
                    })
                    .catch((error) => {
                        handleAuthError(error);
                    });
            });
        });
    }
    
    // 로그인 폼으로 돌아가기
    if (backToLoginBtns.length > 0) {
        backToLoginBtns.forEach(button => {
            button.addEventListener('click', function() {
                document.getElementById('reset-password-card').style.display = 'none';
                document.getElementById('login-form').style.display = 'block';
            });
        });
    }
    
    // 로그아웃 처리
    const logoutButtons = document.querySelectorAll('.logout-btn');
    if (logoutButtons.length > 0) {
        logoutButtons.forEach(button => {
            button.addEventListener('click', function() {
                firebase.auth().signOut()
                    .then(() => {
                        // 로그아웃 성공
                        window.location.href = 'index.html'; // 메인 페이지로 이동
                    })
                    .catch((error) => {
                        console.error('Logout error:', error);
                    });
            });
        });
    }
    
    // 인증 상태 변경 감지
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // 로그인 상태
            document.getElementById('user-logged-in').style.display = 'block';
            document.getElementById('user-logged-out').style.display = 'none';
            
            // 사용자 정보 표시
            document.getElementById('user-name').textContent = user.displayName || '사용자';
            document.getElementById('profile-initial').textContent = (user.displayName || '사용자').charAt(0).toUpperCase();
            
            // Firestore에서 사용자 데이터 가져오기
            db.collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        document.getElementById('user-id').textContent = userData.username ? `@${userData.username}` : '';
                    }
                })
                .catch((error) => {
                    console.error('Error getting user data:', error);
                });
        } else {
            // 로그아웃 상태
            document.getElementById('user-logged-in').style.display = 'none';
            document.getElementById('user-logged-out').style.display = 'block';
        }
    });
    
    // 알림 메시지 표시 함수
    function showAuthMessage(type, message) {
        const messageElement = document.getElementById('auth-message');
        if (!messageElement) return;
        
        messageElement.className = 'auth-message';
        messageElement.classList.add(`message-${type}`);
        
        if (type === 'loading') {
            messageElement.innerHTML = `<div class="spinner"></div> ${message}`;
        } else {
            messageElement.textContent = message;
        }
        
        messageElement.style.display = 'block';
        
        // 성공이나 에러 메시지는 일정 시간 후 숨김
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        }
    }
    
    // 인증 오류 처리 함수
    function handleAuthError(error) {
        console.error('Auth error:', error);
        
        const errorMap = {
            'auth/user-not-found': getLocalizedString('등록되지 않은 이메일입니다', 'Email not registered', 'Correo electrónico no registrado'),
            'auth/wrong-password': getLocalizedString('비밀번호가 올바르지 않습니다', 'Incorrect password', 'Contraseña incorrecta'),
            'auth/email-already-in-use': getLocalizedString('이미 사용 중인 이메일입니다', 'Email already in use', 'Correo electrónico ya en uso'),
            'auth/weak-password': getLocalizedString('비밀번호가 너무 약합니다', 'Password is too weak', 'La contraseña es demasiado débil'),
            'auth/invalid-email': getLocalizedString('유효하지 않은 이메일 형식입니다', 'Invalid email format', 'Formato de correo electrónico inválido'),
            'auth/operation-not-allowed': getLocalizedString('이 로그인 방식은 현재 사용할 수 없습니다', 'This login method is currently not allowed', 'Este método de inicio de sesión no está permitido actualmente'),
            'auth/account-exists-with-different-credential': getLocalizedString('이미 다른 방식으로 가입된 이메일입니다', 'This email is already registered with a different login method', 'Este correo electrónico ya está registrado con un método de inicio de sesión diferente')
        };
        
        const errorMessage = errorMap[error.code] || getLocalizedString('인증 오류가 발생했습니다', 'An authentication error occurred', 'Se produjo un error de autenticación');
        
        showAuthMessage('error', errorMessage);
    }
    
    // 언어별 텍스트 반환 함수
    function getLocalizedString(koText, enText, esText) {
        const lang = getCurrentLanguage();
        
        if (lang === 'ko') return koText;
        if (lang === 'es') return esText;
        return enText; // 기본값은 영어
    }
    
    // 현재 언어 가져오기
    function getCurrentLanguage() {
        return document.body.getAttribute('data-language') || 'en';
    }
});