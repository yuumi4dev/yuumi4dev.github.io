document.addEventListener('DOMContentLoaded', function() {
    // 비밀번호 표시/숨기기 토글
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // 아이콘 변경
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    });
    
    // 비밀번호 강도 체크 (회원가입 페이지)
    const passwordInput = document.getElementById('password');
    const strengthMeter = document.querySelector('.strength-meter-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (passwordInput && strengthMeter && strengthText) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 'weak';
            let text = '취약함';
            
            if (password.length >= 8) {
                if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(password)) {
                    strength = 'strong';
                    text = '강함';
                } else if (/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
                    strength = 'medium';
                    text = '보통';
                }
            }
            
            strengthMeter.setAttribute('data-strength', strength);
            strengthText.textContent = text;
        });
    }
    
    // 비밀번호 확인 일치 체크
    const confirmPasswordInput = document.getElementById('confirm-password');
    if (passwordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value !== passwordInput.value) {
                this.setCustomValidity('비밀번호가 일치하지 않습니다.');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    // 로그인 폼 제출 처리
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('#email').value;
            const password = this.querySelector('#password').value;
            const remember = this.querySelector('#remember').checked;
            
            // 로그인 처리 (예시)
            console.log('로그인 시도:', { email, password, remember });
            
            // 로컬 스토리지에 사용자 정보 저장 (데모용)
            if (remember) {
                localStorage.setItem('user_email', email);
            }
            
            // 사용자 인증 성공 시뮬레이션 (실제로는 서버 응답 필요)
            simulateLogin(email);
        });
    }
    
    // 회원가입 폼 제출 처리
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('#name').value;
            const email = this.querySelector('#email').value;
            const password = this.querySelector('#password').value;
            
            // 회원가입 처리 (예시)
            console.log('회원가입 시도:', { name, email });
            
            // 로컬 스토리지에 사용자 정보 저장 (데모용)
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            users.push({ name, email, password: hashPassword(password) });
            localStorage.setItem('users', JSON.stringify(users));
            
            // 회원가입 성공 후 로그인 페이지로 리디렉션
            setTimeout(() => {
                showMessage('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.', 'success');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }, 500);
        });
    }
    
    // 자동 로그인 체크 (데모용)
    function checkAutoLogin() {
        const user = JSON.parse(localStorage.getItem('current_user'));
        if (user) {
            const urlParams = new URLSearchParams(window.location.search);
            const logout = urlParams.get('logout');
            
            if (logout === 'true') {
                // 로그아웃 요청 시 사용자 정보 삭제
                localStorage.removeItem('current_user');
            } else if (window.location.pathname.includes('login.html') || 
                       window.location.pathname.includes('register.html')) {
                // 이미 로그인한 상태에서 로그인/회원가입 페이지 방문 시 메인 페이지로 리디렉션
                window.location.href = 'index.html';
            }
        } else if (!window.location.pathname.includes('login.html') && 
                  !window.location.pathname.includes('register.html')) {
            // 로그인하지 않은 상태에서 보호된 페이지 접근 시 로그인 페이지로 리디렉션
            // 실제 구현에서는 더 세밀한 권한 체크 필요
            window.location.href = 'login.html';
        }
    }
    
    // 페이지 로드 시 자동 로그인 체크 (데모용)
    // checkAutoLogin();
    
    // 로그인 시뮬레이션 (데모용)
    function simulateLogin(email) {
        // 실제로는 서버에서 사용자 정보를 검증하고 응답을 받아야 함
        // 이 예시에서는 로컬 스토리지에 저장된 정보로 시뮬레이션
        
        // 로그인 성공 처리
        const userData = {
            email: email,
            name: email.split('@')[0], // 예시로 이메일 아이디를 이름으로 사용
            avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${email}`
        };
        
        localStorage.setItem('current_user', JSON.stringify(userData));
        
        // 로그인 성공 메시지 표시
        showMessage('로그인에 성공했습니다.', 'success');
        
        // 메인 페이지로 리디렉션
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
    
    // 알림 메시지 표시
    function showMessage(message, type = 'info') {
        // 기존 메시지 제거
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 새 메시지 생성
        const toast = document.createElement('div');
        toast.className = `message-toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 애니메이션 적용
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // 2초 후 사라짐
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 2000);
    }
    
    // 간단한 패스워드 해싱 (데모용 - 실제론 bcrypt 등 사용)
    function hashPassword(password) {
        // 실제로는 보안을 위해 서버에서 처리해야 함
        // 이 예시는 단순히 데모용으로 안전하지 않은 방식임
        return btoa(password);
    }
});

// 토스트 메시지 스타일 추가
const style = document.createElement('style');
style.textContent = `
    .message-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: white;
        color: #333;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 0.3s, transform 0.3s;
        font-family: var(--font-sans);
        font-size: 0.95rem;
    }
    
    .message-toast.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .message-toast.success {
        background-color: #E3F9E5;
        border-left: 4px solid #34C759;
    }
    
    .message-toast.error {
        background-color: #FFE5E5;
        border-left: 4px solid #FF3B30;
    }
    
    .message-toast.info {
        background-color: #E6F3FF;
        border-left: 4px solid #0066FF;
    }
`;
document.head.appendChild(style);