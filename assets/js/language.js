// 언어 설정 관련 JavaScript

// 쿠키 가져오기 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// 언어 설정 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 쿠키 또는 localStorage에서 언어 설정 불러오기 (쿠키 우선)
    const cookieLanguage = getCookie('selectedLanguage');
    const storageLanguage = localStorage.getItem('selectedLanguage');
    const savedLanguage = cookieLanguage || storageLanguage || null;
    
    // 언어가 저장되어 있다면 적용, 아니면 모달 표시
    if (savedLanguage) {
        setLanguage(savedLanguage);
    } else {
        showLanguageModal();
        // 기본 언어 설정 (모달이 표시된 상태에서도 기본 언어는 보여야 함)
        setLanguage('ko'); 
    }
    
    // 현재 언어 표시 업데이트
    updateCurrentLanguageDisplay(savedLanguage || 'ko');
    updateTopLanguageButtons(savedLanguage || 'ko');
    
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
            updateTopLanguageButtons(language);
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
            updateTopLanguageButtons(language);
            hideLanguageModal();
        });
    });
    
    // 상단 언어 버튼 클릭 이벤트는 HTML에 직접 onclick 속성으로 설정
    
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
    
    // 쿠키에도 저장 (다른 페이지에서 일관성 유지)
    document.cookie = `selectedLanguage=${language}; path=/; max-age=31536000; SameSite=Lax`; // 1년 유효
    
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

// 상단 언어 버튼 활성화 상태 업데이트
function updateTopLanguageButtons(language) {
    const topLanguageButtons = document.querySelectorAll('.top-language-btn');
    topLanguageButtons.forEach(function(button) {
        const buttonLang = button.getAttribute('data-lang');
        if (buttonLang === language) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
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