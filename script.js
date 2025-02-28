document.addEventListener('DOMContentLoaded', function() {
    // 다크 모드 토글 기능
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    
    // 저장된 테마 설정 불러오기
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', function() {
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
    
    // 메뉴 클릭 이벤트
    const menuItems = document.querySelectorAll('.menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // 현재 활성화된 메뉴 항목에서 active 클래스 제거
            document.querySelector('.menu li.active').classList.remove('active');
            // 클릭된 메뉴 항목에 active 클래스 추가
            this.classList.add('active');
            
            // 여기에 페이지 전환 로직을 추가할 수 있습니다
            // 지금은 간단한 알림만 추가합니다
            const pageName = this.textContent.trim();
            console.log(`${pageName} 페이지로 이동합니다.`);
            
            // 미리 페이지 전환 효과를 주기 위한 코드
            const pageTitle = document.querySelector('.page-title h1');
            if (pageTitle) {
                pageTitle.textContent = pageName;
            }
        });
    });
    
    // 검색 기능
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim().toLowerCase();
            if (searchTerm) {
                alert(`"${searchTerm}" 검색 결과를 표시합니다.`);
                // 여기에 실제 검색 기능을 구현할 수 있습니다
            }
        }
    });
    
    // 블로그 카드 클릭 이벤트
    const blogCards = document.querySelectorAll('.card');
    blogCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            console.log(`"${title}" 포스트로 이동합니다.`);
            // 여기에 포스트 페이지로 이동하는 로직을 추가할 수 있습니다
        });
    });
    
    // To-Do 리스트 토글 기능
    const todoItems = document.querySelectorAll('.todo-list li');
    todoItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('checked');
        });
    });
    
    // 새 To-Do 항목 추가 기능 (향후 구현 가능)
    
    // 간단한 애니메이션 효과
    setTimeout(() => {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 300);
    
    // GitHub Pages에서 SPA(Single Page Application)처럼 작동하기 위한 라우팅 시뮬레이션
    // 실제로는 각 페이지별로 HTML 파일을 만들거나 더 복잡한 라우팅 시스템을 구현해야 합니다
    function createPageContent(pageName) {
        const content = document.querySelector('.content');
        
        // 기존 콘텐츠를 지우고 새 콘텐츠를 생성하는 로직
        // 여기서는 간단한 예시만 제공합니다
        
        content.innerHTML = `
            <div class="page-title">
                <h1>${pageName}</h1>
                <p class="date">마지막 수정: ${new Date().toLocaleDateString('ko-KR', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
            </div>
            <div class="cards-container">
                <div class="note">
                    <p>${pageName} 페이지 내용이 여기에 표시됩니다.</p>
                </div>
            </div>
        `;
    }
    
    // URL 파라미터를 기반으로 페이지 로드 (향후 구현 가능)
    
    // 추가 기능은 향후 확장 가능
});