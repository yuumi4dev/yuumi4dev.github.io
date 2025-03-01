/**
 * 디버깅 도구 - HTML 파일의 끝부분에 추가하여 사용
 * <script src="assets/js/debug.js"></script>
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('디버깅 도구가 로드되었습니다');
    
    // DOM 요소 확인
    const elements = {
        'sidebar': document.getElementById('sidebar'),
        'sidebar-toggle': document.getElementById('sidebar-toggle'),
        'main-content': document.getElementById('main-content'),
        'profile-dropdown-btn': document.getElementById('profile-dropdown-btn'),
        'profile-dropdown': document.getElementById('profile-dropdown')
    };
    
    console.table(Object.entries(elements).map(([key, el]) => ({
        'Element': key,
        'Found': el ? '✅' : '❌',
        'ID': el?.id || 'N/A',
        'Classes': el?.className || 'N/A'
    })));
    
    // 이벤트 핸들러 확인
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        console.log('사이드바 토글 버튼 이벤트 추가');
        const originalClick = sidebarToggle.onclick;
        
        sidebarToggle.addEventListener('click', function() {
            console.log('사이드바 토글 버튼이 클릭되었습니다');
            console.log('사이드바 상태:', {
                'sidebar 클래스': document.getElementById('sidebar')?.className,
                '토글 버튼 클래스': this.className,
                'main-content 클래스': document.getElementById('main-content')?.className
            });
        }, true);
    }
    
    // CSS 변수 확인
    const computedStyle = getComputedStyle(document.documentElement);
    const cssVariables = {
        '--sidebar-width': computedStyle.getPropertyValue('--sidebar-width'),
        '--sidebar-collapsed-width': computedStyle.getPropertyValue('--sidebar-collapsed-width'),
        '--navbar-height': computedStyle.getPropertyValue('--navbar-height')
    };
    
    console.log('CSS 변수:', cssVariables);
    
    // 수동 제어 도구 추가
    const addDebugControls = () => {
        if (document.getElementById('debug-controls')) return;
        
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'debug-controls';
        controlsDiv.style.position = 'fixed';
        controlsDiv.style.bottom = '20px';
        controlsDiv.style.right = '20px';
        controlsDiv.style.background = 'rgba(0,0,0,0.8)';
        controlsDiv.style.padding = '10px';
        controlsDiv.style.borderRadius = '8px';
        controlsDiv.style.zIndex = '9999';
        controlsDiv.style.color = 'white';
        controlsDiv.style.fontFamily = 'monospace';
        controlsDiv.style.fontSize = '12px';
        
        controlsDiv.innerHTML = `
            <div style="margin-bottom:8px;font-weight:bold;">디버깅 도구</div>
            <button id="debug-toggle-sidebar">사이드바 토글</button>
            <button id="debug-reset-sidebar">사이드바 초기화</button>
            <button id="debug-close-controls" style="margin-left:10px;color:red;">닫기</button>
        `;
        
        document.body.appendChild(controlsDiv);
        
        document.getElementById('debug-toggle-sidebar').addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('main-content');
            const toggleBtn = document.getElementById('sidebar-toggle');
            
            if (window.innerWidth <= 768) {
                // 모바일 뷰
                sidebar.classList.toggle('open');
                toggleBtn.classList.toggle('active');
                document.body.classList.toggle('sidebar-open');
            } else {
                // 데스크탑 뷰
                sidebar.classList.toggle('collapsed');
                toggleBtn.classList.toggle('active');
                mainContent.classList.toggle('expanded');
            }
            
            console.log('수동 토글:', {
                'sidebar 클래스': sidebar.className,
                '토글 버튼 클래스': toggleBtn.className,
                'main-content 클래스': mainContent.className
            });
        });
        
        document.getElementById('debug-reset-sidebar').addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('main-content');
            const toggleBtn = document.getElementById('sidebar-toggle');
            
            sidebar.className = 'sidebar';
            toggleBtn.className = 'sidebar-toggle-btn';
            mainContent.className = 'main-content';
            document.body.classList.remove('sidebar-open');
            
            localStorage.removeItem('sidebar-collapsed');
            
            console.log('사이드바 초기화 완료');
            location.reload();
        });
        
        document.getElementById('debug-close-controls').addEventListener('click', function() {
            document.body.removeChild(controlsDiv);
        });
    };
    
    // D 키를 누르면 디버깅 도구 표시
    document.addEventListener('keydown', function(e) {
        if (e.key === 'd' && e.ctrlKey && e.shiftKey) {
            addDebugControls();
        }
    });
});