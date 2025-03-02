document.addEventListener('DOMContentLoaded', function() {
    // 현재 언어 가져오기
    function getCurrentLanguage() {
        return document.body.getAttribute('data-language') || 'en';
    }

    // 언어 변경 감지 및 UI 업데이트
    function updateLanguageUI() {
        const currentLang = getCurrentLanguage();
        
        // 검색창 placeholder 업데이트
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const placeholders = {
                'ko': '검색...',
                'en': 'Search...',
                'es': 'Buscar...'
            };
            searchInput.setAttribute('placeholder', placeholders[currentLang] || placeholders['en']);
        }
        
        // 속성에 언어 데이터가 있는 요소들 업데이트
        document.querySelectorAll('[data-lang-attr]').forEach(elem => {
            const attr = elem.getAttribute('data-lang-attr');
            const value = elem.getAttribute(`data-lang-${currentLang}-${attr}`) || 
                        elem.getAttribute(`data-lang-en-${attr}`); // 기본값으로 영어 사용
            if (value) {
                elem.setAttribute(attr, value);
            }
        });
    }

    // 언어 변경 감지 이벤트 리스너 추가
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-language') {
                updateLanguageUI();
            }
        });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // 초기 언어 설정에 따른 UI 업데이트
    updateLanguageUI();

    // 카테고리 필터링
    const categoryLinks = document.querySelectorAll('.category-item a');
    if (categoryLinks.length > 0) {
        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 모든 카테고리에서 active 클래스 제거
                categoryLinks.forEach(item => {
                    item.parentElement.classList.remove('active');
                });
                
                // 클릭한 카테고리에 active 클래스 추가
                this.parentElement.classList.add('active');
                
                // 선택한 카테고리로 게시물 필터링
                const category = this.getAttribute('data-category');
                console.log('Selected category:', category);
                
                // 게시물 필터링 함수 호출
                filterPosts(category);
            });
        });
    }
    
    // 태그 필터링
    const tagLinks = document.querySelectorAll('.tag');
    if (tagLinks.length > 0) {
        tagLinks.forEach(tag => {
            tag.addEventListener('click', function(e) {
                if (this.getAttribute('data-tag')) {
                    e.preventDefault();
                    
                    // 선택한 태그로 게시물 필터링
                    const tagName = this.getAttribute('data-tag');
                    console.log('Selected tag:', tagName);
                    
                    // 태그로 게시물 필터링 함수 호출
                    filterPostsByTag(tagName);
                }
            });
        });
    }
    
    // 검색 기능
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                console.log('Searching for:', searchTerm);
                // 검색 기능 함수 호출
                searchPosts(searchTerm);
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    console.log('Searching for:', searchTerm);
                    // 검색 기능 함수 호출
                    searchPosts(searchTerm);
                }
            }
        })
    }
  });