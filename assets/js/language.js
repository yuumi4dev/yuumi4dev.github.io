// 언어 관련 전역 설정
const LANGUAGES = {
    'ko': {
        name: '한국어',
        flag: '🇰🇷'
    },
    'en': {
        name: 'English',
        flag: '🇺🇸'
    },
    'es': {
        name: 'Español',
        flag: '🇪🇸'
    }
};

// 언어 설정 가져오기 (로컬 스토리지 사용)
function getLanguageFromStorage() {
    return localStorage.getItem('preferred-language') || 'en';
}

// 현재 언어 가져오기
function getCurrentLanguage() {
    return document.body.getAttribute('data-language') || getLanguageFromStorage();
}

// 언어 설정하기
function setLanguage(lang) {
    if (!LANGUAGES[lang]) {
        console.error('지원하지 않는 언어:', lang);
        return;
    }
    
    // 로컬 스토리지에 저장
    localStorage.setItem('preferred-language', lang);
    
    // 문서 본문에 언어 속성 설정
    document.body.setAttribute('data-language', lang);
    document.documentElement.setAttribute('lang', lang);
    
    // 문서 타이틀 업데이트
    updateDocumentTitle(lang);
    
    // 언어 선택자 UI 업데이트
    updateLanguageUI(lang);
    
    // 언어 모달 숨기기
    hideLanguageModal();
}

// 문서 타이틀 업데이트
function updateDocumentTitle(lang) {
    const titleElements = document.querySelectorAll(`title[data-lang="${lang}"]`);
    if (titleElements.length > 0) {
        document.title = titleElements[0].textContent;
    }
}

// 언어 선택자 UI 업데이트
function updateLanguageUI(lang) {
    // 현재 언어 아이콘 및 텍스트 업데이트
    const currentLangIcon = document.getElementById('current-language-icon');
    if (currentLangIcon) {
        currentLangIcon.textContent = LANGUAGES[lang].flag;
    }
    
    // 언어 버튼 활성화 상태 업데이트
    document.querySelectorAll('.top-language-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 언어 옵션 활성화 상태 업데이트
    document.querySelectorAll('.language-option').forEach(option => {
        if (option.getAttribute('data-lang') === lang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // 언어별 콘텐츠 표시/숨기기
    document.querySelectorAll('[data-lang]').forEach(element => {
        if (element.tagName === 'TITLE') return; // 타이틀 태그는 제외
        
        if (element.getAttribute('data-lang') === lang) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    });
}

// 언어 모달 표시
function showLanguageModal() {
    const modal = document.getElementById('language-modal');
    if (modal) {
        modal.classList.add('open');
    }
}

// 언어 모달 숨기기
function hideLanguageModal() {
    const modal = document.getElementById('language-modal');
    if (modal) {
        modal.classList.remove('open');
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 저장된 언어 설정 적용
    const savedLang = getLanguageFromStorage();
    setLanguage(savedLang);
    
    // 언어 변경 버튼 이벤트 리스너
    document.querySelectorAll('.top-language-btn').forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
    
    // 사이드바 언어 변경 버튼 이벤트
    const changeLangBtn = document.getElementById('change-language');
    if (changeLangBtn) {
        changeLangBtn.addEventListener('click', showLanguageModal);
    }
    
    // 언어 옵션 선택 이벤트
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
    
    // 모달 닫기 버튼 이벤트
    const closeBtn = document.querySelector('.language-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideLanguageModal);
    }
    
    // 모달 외부 클릭 시 닫기
    const modal = document.getElementById('language-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideLanguageModal();
            }
        });
    }
});