document.addEventListener('DOMContentLoaded', function() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    // 로컬 스토리지에서 테마 설정 가져오기
    const savedTheme = localStorage.getItem('theme');
    
    // 시스템 테마 감지
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 초기 테마 설정
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme);
    } else {
        // 시스템 테마에 따라 초기 테마 설정
        const initialTheme = prefersDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', initialTheme);
        localStorage.setItem('theme', initialTheme);
        updateThemeButton(initialTheme);
    }
    
    // 테마 전환 버튼 클릭 이벤트
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // 테마 변경
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // 로컬 스토리지에 테마 설정 저장
            localStorage.setItem('theme', newTheme);
            
            // 버튼 아이콘 업데이트
            updateThemeButton(newTheme);
        });
    }
    
    // 테마 버튼 아이콘 업데이트 함수
    function updateThemeButton(theme) {
        if (!themeToggleBtn) return;
        
        themeToggleBtn.textContent = theme === 'dark' ? '☀️ 라이트 모드' : '🌙 다크 모드';
        themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');
    }
});