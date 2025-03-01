document.addEventListener('DOMContentLoaded', function() {
    // 요소 참조
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    // 로컬 스토리지에서 사이드바 상태 가져오기
    const sidebarState = localStorage.getItem('sidebarState');
    
    // 초기 사이드바 상태 설정
    if (sidebarState === 'collapsed') {
        sidebar.classList.add('collapsed');
    } else {
        sidebar.classList.remove('collapsed');
    }
    
    // 모바일 화면에서는 항상 사이드바 숨기기
    function checkMobileView() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('collapsed');
            sidebar.classList.remove('expanded');
            
            // 모바일에서는 토글 버튼 클릭 시 expanded 클래스를 추가/제거
            sidebarToggleBtn.onclick = function() {
                sidebar.classList.toggle('expanded');
            };
            
            // 모바일에서 바깥 영역 클릭 시 사이드바 닫기
            document.addEventListener('click', function(event) {
                if (sidebar.classList.contains('expanded') && 
                    !sidebar.contains(event.target) && 
                    !sidebarToggleBtn.contains(event.target)) {
                    sidebar.classList.remove('expanded');
                }
            });
        } else {
            // 데스크톱에서는 토글 버튼 클릭 시 collapsed 클래스를 추가/제거
            sidebarToggleBtn.onclick = function() {
                sidebar.classList.toggle('collapsed');
                
                // 로컬 스토리지에 상태 저장
                if (sidebar.classList.contains('collapsed')) {
                    localStorage.setItem('sidebarState', 'collapsed');
                } else {
                    localStorage.setItem('sidebarState', 'expanded');
                }
            };
        }
    }
    
    // 초기 로드 및 화면 크기 변경 시 체크
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    // 사이드바 메뉴 아이템 호버 시 툴팁 표시 (접힌 상태에서)
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    
    menuItems.forEach(item => {
        const menuText = item.querySelector('.menu-text[data-lang="ko"]').textContent;
        
        item.addEventListener('mouseenter', function() {
            if (sidebar.classList.contains('collapsed') && window.innerWidth > 768) {
                const tooltip = document.createElement('div');
                tooltip.className = 'sidebar-tooltip';
                tooltip.textContent = menuText;
                
                // 툴팁 위치 설정
                const rect = item.getBoundingClientRect();
                tooltip.style.top = rect.top + 'px';
                tooltip.style.left = rect.right + 10 + 'px';
                
                document.body.appendChild(tooltip);
                item.dataset.tooltip = true;
            }
        });
        
        item.addEventListener('mouseleave', function() {
            if (item.dataset.tooltip) {
                const tooltips = document.querySelectorAll('.sidebar-tooltip');
                tooltips.forEach(tip => tip.remove());
                delete item.dataset.tooltip;
            }
        });
    });
    
    // 툴팁 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
        .sidebar-tooltip {
            position: fixed;
            background-color: var(--card-bg);
            color: var(--text-primary);
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            pointer-events: none;
            border: 1px solid var(--border-color);
        }
    `;
    document.head.appendChild(style);
});