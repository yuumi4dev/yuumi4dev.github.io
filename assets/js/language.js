// 언어 설정 관련 JavaScript

// 언어 설정 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 저장된 언어 설정 불러오기
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ko';
    setLanguage(savedLanguage);
    
    // 언어 모달 열기 (첫 방문시)
    const isFirstVisit = localStorage.getItem('visited') !== 'true';
    if (isFirstVisit) {
        showLanguageModal();
        localStorage.setItem('visited', 'true');
    }
    
    // 현재 언어 표시 업데이트
    updateCurrentLanguageDisplay(savedLanguage);
    
    // 언어 전환 버튼 클릭 이벤트
    const languageSwitchBtn = document.getElementById('change-language');
    if (languageSwitchBtn) {
        languageSwitchBtn.addEventListener('click', function() {
            toggleLanguageDropdown();
        });
    }
    
    // 언어 드롭다운 항목 클릭 이벤트
    const languageDropdownItems = document.querySelectorAll('#language-dropdown li');
    languageDropdownItems.forEach(function(item) {
        item.addEventListener('click', function() {
            const language = this.getAttribute('data-lang');
            setLanguage(language);
            updateCurrentLanguageDisplay(language);
            toggleLanguageDropdown();
        });
    });
    
    // 언어 모달 옵션 클릭 이벤트
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(function(option) {
        option.addEventListener('click', function() {
            const language = this.getAttribute('data-lang');
            setLanguage(language);
            updateCurrentLanguageDisplay(language);
            hideLanguageModal();
        });
    });
    
    // 문서 클릭 시 언어 드롭다운 닫기
    document.addEventListener('click', function(event) {
        const languageDropdown = document.getElementById('language-dropdown');
        const languageSwitchBtn = document.getElementById('change-language');
        
        if (languageDropdown && languageSwitchBtn) {
            if (!languageSwitchBtn.contains(event.target) && !languageDropdown.contains(event.target)) {
                languageDropdown.classList.remove('show');
            }
        }
    });
});

// 언어 설정 변경 함수
function setLanguage(language) {
    document.body.setAttribute('data-language', language);
    localStorage.setItem('selectedLanguage', language);
    
    // 언어별 아이콘 매핑
    const languageIcons = {
        'ko': '🇰🇷',
        'en': '🇺🇸',
        'es': '🇪🇸'
    };
    
    // 현재 언어 아이콘 업데이트
    const currentLanguageIcon = document.getElementById('current-language-icon');
    if (currentLanguageIcon) {
        currentLanguageIcon.textContent = languageIcons[language] || '🌐';
    }
}

// 현재 언어 표시 업데이트
function updateCurrentLanguageDisplay(language) {
    // 언어별 표시 텍스트
    const languageTexts = {
        'ko': '한국어',
        'en': 'English',
        'es': 'Español'
    };
    
    // 언어 옵션 활성화 상태 업데이트
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(function(option) {
        const optionLang = option.getAttribute('data-lang');
        if (optionLang === language) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// 언어 드롭다운 토글
function toggleLanguageDropdown() {
    const dropdown = document.getElementById('language-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// 언어 모달 표시
function showLanguageModal() {
    const modal = document.getElementById('language-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

// 언어 모달 숨기기
function hideLanguageModal() {
    const modal = document.getElementById('language-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}