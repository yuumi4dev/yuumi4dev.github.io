document.addEventListener('DOMContentLoaded', function() {
    // 비밀번호 표시/숨기기 토글
    const togglePassword = document.querySelectorAll('.toggle-password');
    
    togglePassword.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
    
    // 로그인 폼 제출
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            if (!email || !password) {
                showAlert('이메일과 비밀번호를 입력해주세요.', 'error');
                return;
            }
            
            // 여기서 실제 로그인 검증을 수행해야 합니다
            // 데모 목적으로 로컬 스토리지에 저장된 사용자와 비교
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const foundUser = users.find(user => user.email === email && user.password === password);
            
            if (foundUser) {
                if (remember) {
                    localStorage.setItem('currentUser', JSON.stringify({ 
                        email: foundUser.email,
                        name: foundUser.name
                    }));
                } else {
                    sessionStorage.setItem('currentUser', JSON.stringify({ 
                        email: foundUser.email,
                        name: foundUser.name
                    }));
                }
                
                showAlert('로그인 성공! 리다이렉트 중...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showAlert('이메일 또는 비밀번호가 올바르지 않습니다.', 'error');
            }
        });
    }
    
    // 회원가입 폼 제출
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        // 비밀번호 강도 검사
        const passwordInput = document.getElementById('signup-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', checkPasswordStrength);
        }
        
        // 회원가입 버튼 이벤트
        signupBtn.addEventListener('click', function() {
            const name = document.getElementById('fullname').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;
            
            // 유효성 검사
            if (!name || !email || !password || !confirmPassword) {
                showAlert('모든 필드를 입력해주세요.', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showAlert('유효한 이메일 주소를 입력해주세요.', 'error');
                return;
            }
            
            if (password.length < 8) {
                showAlert('비밀번호는 8자 이상이어야 합니다.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showAlert('비밀번호가 일치하지 않습니다.', 'error');
                return;
            }
            
            if (!terms) {
                showAlert('이용약관에 동의해주세요.', 'error');
                return;
            }
            
            // 기존 사용자 확인
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.some(user => user.email === email)) {
                showAlert('이미 가입된 이메일입니다.', 'error');
                return;
            }
            
            // 새 사용자 추가
            users.push({
                name: name,
                email: email,
                password: password // 실제로는 암호화해야 함
            });
            
            localStorage.setItem('users', JSON.stringify(users));
            
            showAlert('회원가입 성공! 로그인 페이지로 이동합니다.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }
    
    // 소셜 로그인 버튼
    const socialBtns = document.querySelectorAll('.btn-social');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 실제 구현에서는 OAuth 프로세스를 시작해야 합니다
            showAlert('소셜 로그인 기능은 실제 구현이 필요합니다.', 'info');
        });
    });
    
    // 비밀번호 강도 검사 함수
    function checkPasswordStrength() {
        const password = document.getElementById('signup-password').value;
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        let strength = 0;
        
        if (password.length >= 8) strength += 1;
        if (password.match(/[a-z]+/)) strength += 1;
        if (password.match(/[A-Z]+/)) strength += 1;
        if (password.match(/[0-9]+/)) strength += 1;
        if (password.match(/[^a-zA-Z0-9]+/)) strength += 1;
        
        switch (strength) {
            case 0:
            case 1:
                strengthBar.style.width = '20%';
                strengthBar.style.backgroundColor = '#ff5a5a';
                strengthText.textContent = '비밀번호 강도: 매우 약함';
                strengthText.style.color = '#ff5a5a';
                break;
            case 2:
                strengthBar.style.width = '40%';
                strengthBar.style.backgroundColor = '#ffb946';
                strengthText.textContent = '비밀번호 강도: 약함';
                strengthText.style.color = '#ffb946';
                break;
            case 3:
                strengthBar.style.width = '60%';
                strengthBar.style.backgroundColor = '#fdcc0d';
                strengthText.textContent = '비밀번호 강도: 중간';
                strengthText.style.color = '#fdcc0d';
                break;
            case 4:
                strengthBar.style.width = '80%';
                strengthBar.style.backgroundColor = '#46c93a';
                strengthText.textContent = '비밀번호 강도: 강함';
                strengthText.style.color = '#46c93a';
                break;
            case 5:
                strengthBar.style.width = '100%';
                strengthBar.style.backgroundColor = '#12b886';
                strengthText.textContent = '비밀번호 강도: 매우 강함';
                strengthText.style.color = '#12b886';
                break;
        }
    }
    
    // 이메일 유효성 검사
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    
    // 알림 표시
    function showAlert(message, type) {
        // 기존 알림 제거
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // 새 알림 생성
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // 스타일 추가
        alert.style.position = 'fixed';
        alert.style.top = '20px';
        alert.style.left = '50%';
        alert.style.transform = 'translateX(-50%)';
        alert.style.padding = '12px 24px';
        alert.style.borderRadius = '8px';
        alert.style.zIndex = '1000';
        alert.style.fontFamily = 'var(--font-sans)';
        alert.style.fontSize = '14px';
        
        // 타입별 스타일
        if (type === 'error') {
            alert.style.backgroundColor = '#fff0f0';
            alert.style.color = '#e74c3c';
            alert.style.border = '1px solid #ffcccc';
        } else if (type === 'success') {
            alert.style.backgroundColor = '#f0fff4';
            alert.style.color = '#2ecc71';
            alert.style.border = '1px solid #ccffdc';
        } else {
            alert.style.backgroundColor = '#f0f8ff';
            alert.style.color = '#3498db';
            alert.style.border = '1px solid #cce5ff';
        }
        
        document.body.appendChild(alert);
        
        // 3초 후 알림 제거
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                alert.remove();
            }, 500);
        }, 3000);
    }
});