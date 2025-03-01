document.addEventListener('DOMContentLoaded', function() {
    // 언어 선택 모달 요소
    const languageModal = document.getElementById('language-modal');
    
    // 언어 선택 버튼들
    const languageOptions = document.querySelectorAll('.language-option');
    
    // 언어 전환 버튼
    const changeLanguageBtn = document.getElementById('change-language');
    
    // 언어 드롭다운
    const languageDropdown = document.getElementById('language-dropdown');
    
    // 현재 언어 아이콘
    const currentLanguageIcon = document.getElementById('current-language-icon');
    
    // 사용자 선호 언어 가져오기 (로컬 스토리지)
    const savedLanguage = localStorage.getItem('preferredLanguage');
    
    // 언어별 아이콘 매핑
    const languageIcons = {
        'ko': '🇰🇷',
        'en': '🇺🇸',
        'es': '🇪🇸'
    };
    
    // 언어별 이름 매핑
    const languageNames = {
        'ko': '한국어',
        'en': 'English',
        'es': 'Español'
    };
    
    // 언어가 저장되어 있지 않으면 모달 표시
    if (!savedLanguage) {
        languageModal.style.display = 'flex';
    } else {
        // 저장된 언어 설정 적용
        applyLanguage(savedLanguage);
    }
    
    // 언어 선택 버튼 이벤트 리스너
    languageOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedLanguage = this.getAttribute('data-lang');
            applyLanguage(selectedLanguage);
            saveLanguagePreference(selectedLanguage);
            languageModal.style.display = 'none';
        });
    });
    
    // 언어 전환 버튼 이벤트 리스너
    if (changeLanguageBtn) {
        changeLanguageBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            languageDropdown.classList.toggle('show');
        });
    }
    
    // 언어 드롭다운 항목 이벤트 리스너
    if (languageDropdown) {
        const languageItems = languageDropdown.querySelectorAll('li');
        languageItems.forEach(item => {
            item.addEventListener('click', function() {
                const selectedLanguage = this.getAttribute('data-lang');
                applyLanguage(selectedLanguage);
                saveLanguagePreference(selectedLanguage);
                languageDropdown.classList.remove('show');
            });
        });
    }
    
    // 문서 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        if (languageDropdown && languageDropdown.classList.contains('show') &&
            !changeLanguageBtn.contains(e.target) && !languageDropdown.contains(e.target)) {
            languageDropdown.classList.remove('show');
        }
    });
    
    // 선택한 언어를 적용하는 함수
    function applyLanguage(language) {
        // HTML lang 속성 변경
        document.documentElement.lang = language;
        
        // 현재 언어 아이콘 업데이트
        if (currentLanguageIcon) {
            currentLanguageIcon.textContent = languageIcons[language];
        }
        
        // 문서 제목 업데이트 (페이지 타이틀)
        const titleElements = document.querySelectorAll(`title[data-lang="${language}"]`);
        if (titleElements.length > 0) {
            document.title = titleElements[0].textContent;
        }
        
        // Firebase 사용자가 로그인되어 있으면 언어 설정 업데이트
        const user = firebase.auth().currentUser;
        if (user && firebase.firestore) {
            firebase.firestore().collection('users').doc(user.uid).update({
                preferredLanguage: language,
                lastUpdated: new Date()
            }).catch(error => {
                console.error('언어 설정 저장 오류:', error);
            });
        }
    }
    
    // 선택한 언어를 로컬 스토리지에 저장하는 함수
    function saveLanguagePreference(language) {
        localStorage.setItem('preferredLanguage', language);
    }
    
    // 새로운 사용자가 로그인할 때 언어 설정 로드
    firebase.auth().onAuthStateChanged(function(user) {
        if (user && firebase.firestore) {
            firebase.firestore().collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists && doc.data().preferredLanguage) {
                        const userLanguage = doc.data().preferredLanguage;
                        
                        // 로컬 저장소와 다른 경우만 업데이트
                        const currentLanguage = localStorage.getItem('preferredLanguage');
                        if (currentLanguage !== userLanguage) {
                            applyLanguage(userLanguage);
                            saveLanguagePreference(userLanguage);
                        }
                    }
                })
                .catch(error => {
                    console.error('사용자 언어 설정 로드 오류:', error);
                });
        }
    });
});