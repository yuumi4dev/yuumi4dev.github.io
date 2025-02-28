document.addEventListener('DOMContentLoaded', function() {
    // 필터 버튼
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    // 모달 요소
    const modal = document.getElementById('portfolio-modal');
    const modalContent = modal ? modal.querySelector('.modal-content') : null;
    const modalBody = modal ? modal.querySelector('.modal-body') : null;
    const modalClose = modal ? modal.querySelector('.modal-close') : null;
    
    // 포트폴리오 상세보기 버튼
    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
    
    // 필터 기능
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // active 클래스 토글
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                
                // 필터링
                portfolioItems.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = 'block';
                    } else {
                        const category = item.getAttribute('data-category');
                        if (category === filter) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    }
                });
            });
        });
    }
    
    // 모달 열기
    if (viewDetailsButtons.length > 0) {
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const projectId = this.getAttribute('data-id');
                openProjectModal(projectId);
            });
        });
    }
    
    // 모달 닫기
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // 모달 외부 클릭시 닫기
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
            closeModal();
        }
    });
    
    // 모달 열기 함수
    function openProjectModal(projectId) {
        if (!modal || !modalBody) return;
        
        // 로딩 상태 표시
        modalBody.innerHTML = `
            <div class="modal-loading">
                <div class="spinner"></div>
            </div>
        `;
        
        // 모달 열기
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // 스크롤 방지
        
        // 프로젝트 데이터 로드 (여기서는 하드코딩된 데이터를 사용하지만, 실제로는 Firestore 등에서 가져올 수 있음)
        loadProjectData(projectId)
            .then(projectData => {
                if (projectData) {
                    renderProjectModal(projectData);
                } else {
                    modalBody.innerHTML = `
                        <div class="error-message">
                            <p>프로젝트 정보를 불러올 수 없습니다.</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error loading project data:', error);
                modalBody.innerHTML = `
                    <div class="error-message">
                        <p>오류가 발생했습니다: ${error.message}</p>
                    </div>
                `;
            });
    }
    
    // 모달 닫기 함수
    function closeModal() {
        if (!modal) return;
        
        modal.classList.remove('open');
        document.body.style.overflow = ''; // 스크롤 다시 활성화
    }
    
    // 프로젝트 데이터 불러오기 (예시 데이터)
    function loadProjectData(projectId) {
        // 실제 구현에서는 Firestore 등에서 데이터를 불러올 수 있음
        return new Promise((resolve) => {
            setTimeout(() => {
                // 예시 데이터 (실제 구현시 대체)
                const projectsData = {
                    'project1': {
                        title: '기업 반응형 웹사이트',
                        category: '웹 개발',
                        client: 'ABC 기업',
                        date: '2023년 5월',
                        description: `
                            <p>이 프로젝트는 고객사의 기업 웹사이트를 현대적으로 리디자인하고, 모든 디바이스에서 최적의 사용자 경험을 제공하는 반응형 웹사이트로 개발하는 것이 목표였습니다.</p>
                            <p>HTML5, CSS3, JavaScript를 기반으로 개발하였으며, 특히 모바일 사용자를 위한 최적화와 웹 접근성을 고려하여 설계했습니다. SEO 최적화와 빠른 로딩 속도를 위해 최신 웹 기술을 적용했습니다.</p>
                        `,
                        challenge: '다양한 브라우저와 디바이스에서 일관된 사용자 경험을 제공하는 것이 가장 큰 도전이었습니다. 또한 기존 웹사이트의 콘텐츠를 유지하면서 새로운 디자인을 적용하는 과정에서 많은 고민이 필요했습니다.',
                        solution: '모바일 퍼스트 접근 방식을 채택하여 디자인을 시작했으며, 점진적 향상 기법을 적용하여 모든 브라우저에서 기본 기능이 작동하도록 했습니다. 또한 컴포넌트 기반의 개발 방식을 사용하여 재사용성과 유지보수성을 높였습니다.',
                        technologies: ['HTML5', 'CSS3', 'JavaScript', 'SASS', 'Webpack', 'Responsive Design'],
                        liveUrl: '#',
                        codeUrl: '#'
                    },
                    'project2': {
                        title: '헬스케어 모바일 앱',
                        category: '모바일 앱',
                        client: '헬스케어 스타트업',
                        date: '2023년 3월',
                        description: `
                            <p>이 모바일 앱은 사용자들이 일상적인 건강 활동을 추적하고 관리할 수 있도록 도와주는 헬스케어 앱입니다. 운동 추적, 영양 관리, 수면 모니터링 등의 기능을 제공합니다.</p>
                            <p>React Native를 사용하여 iOS와 Android 모두에서 작동하는 크로스 플랫폼 앱으로 개발했으며, 사용자 경험을 최우선으로 고려하여 직관적인 인터페이스를 구현했습니다.</p>
                        `,
                        challenge: '다양한 건강 데이터를 효과적으로 시각화하고, 사용자가 쉽게 이해할 수 있는 형태로 제공하는 것이 중요한 과제였습니다. 또한 개인 건강 정보의 보안과 프라이버시 보호도 중요한 고려사항이었습니다.',
                        solution: '데이터 시각화를 위해 차트 라이브러리를 활용했으며, 사용자 테스트를 통해 UI/UX를 지속적으로 개선했습니다. 데이터 암호화와 안전한 저장소를 사용하여 사용자 정보를 보호했습니다.',
                        technologies: ['React Native', 'JavaScript', 'Redux', 'Firebase', 'Health APIs', 'Chart.js'],
                        liveUrl: '#',
                        codeUrl: '#'
                    },
                    'project3': {
                        title: '디자인 시스템',
                        category: 'UI/UX 디자인',
                        client: '소프트웨어 회사',
                        date: '2023년 1월',
                        description: `
                            <p>이 프로젝트는 클라이언트의 다양한 제품에서 일관된 사용자 경험을 제공하기 위한 디자인 시스템을 구축하는 것이었습니다. 핵심 UI 컴포넌트, 디자인 가이드라인, 스타일 가이드 등을 포함합니다.</p>
                            <p>Figma를 사용하여 디자인 파일을 작성했으며, 컴포넌트 라이브러리를 React로 구현하여 개발자들이 쉽게 사용할 수 있도록 했습니다.</p>
                        `,
                        challenge: '여러 제품과 플랫폼에서 일관되게 작동하면서도 각 제품의 특성을 반영할 수 있는 유연한 디자인 시스템을 만드는 것이 도전적이었습니다.',
                        solution: '계층적 디자인 토큰 시스템을 구축하여 기본 스타일을 정의하고, 각 제품별로 커스터마이징할 수 있는 구조를 만들었습니다. 문서화를 철저히 하여 디자이너와 개발자 모두가 쉽게 이해하고 활용할 수 있도록 했습니다.',
                        technologies: ['Figma', 'React', 'Storybook', 'Styled Components', 'Design Tokens'],
                        liveUrl: '#',
                        codeUrl: '#'
                    },
                    'project4': {
                        title: '온라인 쇼핑몰',
                        category: '웹 개발',
                        client: '패션 브랜드',
                        date: '2022년 11월',
                        description: `
                            <p>이 프로젝트는 패션 브랜드를 위한 풀스택 이커머스 웹사이트를 개발하는 것이었습니다. 상품 진열, 장바구니, 결제, 회원 관리 등 쇼핑몰의 핵심 기능을 모두 구현했습니다.</p>
                            <p>프론트엔드는 React와 Redux를 사용하여 구현했으며, 백엔드는 Node.js와 Express를 사용했습니다. 데이터베이스는 MongoDB를 활용했습니다.</p>
                        `,
                        challenge: '결제 프로세스의 안정성과 보안성을 확보하는 것이 가장 중요한 과제였습니다. 또한 대량의 상품 데이터를 효율적으로 관리하고 빠르게 검색할 수 있는 시스템이 필요했습니다.',
                        solution: '안전한 결제를 위해 검증된 결제 게이트웨이를 연동했으며, 데이터베이스 인덱싱과 캐싱 전략을 통해 검색 성능을 최적화했습니다. 관리자 대시보드를 개발하여 상품과 주문 관리를 용이하게 했습니다.',
                        technologies: ['React', 'Redux', 'Node.js', 'Express', 'MongoDB', 'Payment Gateway APIs'],
                        liveUrl: '#',
                        codeUrl: '#'
                    },
                    'project5': {
                        title: '프로덕티비티 앱',
                        category: '모바일 앱',
                        client: '자체 프로젝트',
                        date: '2022년 9월',
                        description: `
                            <p>이 앱은 사용자의 일정 관리, 할 일 목록, 습관 추적 등을 지원하는 종합적인 생산성 도구입니다. 사용자가 자신의 일상을 효율적으로 계획하고 목표를 달성할 수 있도록 돕습니다.</p>
                            <p>Flutter를 사용하여 개발했으며, 구글 캘린더, 투두리스트 등의 다른 앱과 연동할 수 있는 기능도 구현했습니다.</p>
                        `,
                        challenge: '다양한 생산성 기능을 하나의 앱에 통합하면서도 사용하기 쉽고 직관적인 인터페이스를 유지하는 것이 도전적이었습니다. 또한 여러 외부 서비스와의 연동을 안정적으로 구현하는 것도 중요했습니다.',
                        solution: '탭 기반의 구조와 명확한 카테고리 분류를 통해 앱의 복잡성을 관리했습니다. 사용자 피드백을 지속적으로 수집하여 UI/UX를 개선했으며, 외부 API 연동을 위한 견고한 아키텍처를 설계했습니다.',
                        technologies: ['Flutter', 'Dart', 'Firebase', 'Calendar APIs', 'Local Notifications'],
                        liveUrl: '#',
                        codeUrl: '#'
                    },
                    'project6': {
                        title: '데이터 대시보드',
                        category: 'UI/UX 디자인',
                        client: '데이터 분석 회사',
                        date: '2022년 7월',
                        description: `
                            <p>이 프로젝트는 데이터 분석 회사를 위한 인터랙티브 대시보드를 디자인하고 프로토타이핑하는 것이었습니다. 복잡한 데이터를 직관적으로 이해할 수 있는 시각화와 사용자 인터페이스를 제공합니다.</p>
                            <p>Figma로 디자인을 진행했으며, 인터랙션 디자인과 프로토타이핑에 중점을 두었습니다. 또한 데이터 시각화 라이브러리를 활용하여 실제 데이터로 테스트했습니다.</p>
                        `,
                        challenge: '다양한 종류의 데이터를 효과적으로 시각화하고, 사용자가 복잡한 정보를 쉽게 파악할 수 있도록 하는 것이 핵심 과제였습니다. 또한 대시보드의 성능 최적화도 중요한 고려사항이었습니다.',
                        solution: '사용자 리서치를 통해 가장 중요한 데이터 포인트를 식별하고, 정보 계층을 명확히 설계했습니다. 다양한 차트와 그래프 유형을 적절히 활용하여 데이터의 특성에 맞는 시각화 방법을 선택했습니다.',
                        technologies: ['Figma', 'D3.js', 'SVG', 'Chart.js', 'Data Visualization', 'UX Research'],
                        liveUrl: '#',
                        codeUrl: '#'
                    }
                };
                
                resolve(projectsData[projectId] || null);
            }, 500); // 로딩 효과를 위한 지연
        });
    }
    
    // 프로젝트 모달 렌더링
    function renderProjectModal(projectData) {
        if (!modalBody) return;
        
        modalBody.innerHTML = `
            <div class="project-header">
                <h2 class="project-title">${projectData.title}</h2>
                <div class="project-meta">
                    <span class="project-category">${projectData.category}</span>
                    <span class="project-date">${projectData.date}</span>
                </div>
            </div>
            
            <div class="project-gallery">
                <div class="gallery-main">
                    <span>${getEmojiForCategory(projectData.category)}</span>
                </div>
                <div class="gallery-thumbs">
                    <div class="gallery-thumb active">
                        <span>${getEmojiForCategory(projectData.category)}</span>
                    </div>
                    <div class="gallery-thumb">
                        <span>📊</span>
                    </div>
                    <div class="gallery-thumb">
                        <span>🔍</span>
                    </div>
                </div>
            </div>
            
            <div class="project-description">
                <h3 class="project-section-title">프로젝트 개요</h3>
                <div class="project-text">
                    ${projectData.description}
                </div>
            </div>
            
            <div class="project-details">
                <div class="detail-column">
                    <h3 class="project-section-title">도전 과제</h3>
                    <div class="project-text">
                        <p>${projectData.challenge}</p>
                    </div>
                </div>
                
                <div class="detail-column">
                    <h3 class="project-section-title">해결 방법</h3>
                    <div class="project-text">
                        <p>${projectData.solution}</p>
                    </div>
                </div>
            </div>
            
            <div class="project-info">
                <h3 class="project-section-title">프로젝트 정보</h3>
                <div class="detail-item">
                    <div class="detail-label">클라이언트</div>
                    <div class="detail-value">${projectData.client}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">완료 일자</div>
                    <div class="detail-value">${projectData.date}</div>
                </div>
            </div>
            
            <div class="project-technologies">
                <h3 class="project-section-title">사용 기술</h3>
                <div class="technologies-list">
                    ${projectData.technologies.map(tech => `<span class="technology-tag">${tech}</span>`).join('')}
                </div>
            </div>
            
            <div class="project-cta">
                <a href="${projectData.liveUrl}" target="_blank" class="project-link primary">라이브 데모</a>
                <a href="${projectData.codeUrl}" target="_blank" class="project-link secondary">코드 보기</a>
            </div>
        `;
        
        // 갤러리 썸네일 클릭 이벤트
        const galleryThumbs = modalBody.querySelectorAll('.gallery-thumb');
        const galleryMain = modalBody.querySelector('.gallery-main');
        
        galleryThumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', function() {
                // active 클래스 토글
                galleryThumbs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // 메인 이미지 업데이트 (여기서는 예시로 이모지만 변경)
                const emoji = this.querySelector('span').textContent;
                galleryMain.querySelector('span').textContent = emoji;
            });
        });
    }
    
    // 카테고리에 따른 이모지 반환
    function getEmojiForCategory(category) {
        switch (category) {
            case '웹 개발':
                return '🌐';
            case '모바일 앱':
                return '📱';
            case 'UI/UX 디자인':
                return '🎨';
            default:
                return '💼';
        }
    }
    
    // Firestore를 사용하여 포트폴리오 아이템 불러오기 (실제 구현시 활성화)
    function loadPortfolioItems() {
        if (!db) return;
        
        const portfolioGrid = document.querySelector('.portfolio-grid');
        if (!portfolioGrid) return;
        
        db.collection('portfolio')
            .orderBy('order', 'asc')
            .get()
            .then(querySnapshot => {
                // 기존 아이템 클리어
                portfolioGrid.innerHTML = '';
                
                querySnapshot.forEach(doc => {
                    const itemData = doc.data();
                    const itemElement = createPortfolioItem(doc.id, itemData);
                    portfolioGrid.appendChild(itemElement);
                });
                
                // 이벤트 리스너 재할당
                attachEventListeners();
            })
            .catch(error => {
                console.error('Error loading portfolio items:', error);
            });
    }
    
    // 포트폴리오 아이템 생성 (Firestore 사용시 활용)
    function createPortfolioItem(id, data) {
        const div = document.createElement('div');
        div.className = 'portfolio-item';
        div.setAttribute('data-category', data.category);
        
        div.innerHTML = `
            <div class="portfolio-image">
                <div class="image-placeholder">
                    <span>${data.emoji || getEmojiForCategory(data.category)}</span>
                </div>
                <div class="portfolio-overlay">
                    <div class="overlay-content">
                        <h3 class="overlay-title">${data.title}</h3>
                        <p class="overlay-category">${data.category}</p>
                        <button class="view-details-btn" data-id="${id}">상세 보기</button>
                    </div>
                </div>
            </div>
            <div class="portfolio-info">
                <h3 class="portfolio-title">${data.title}</h3>
                <p class="portfolio-desc">${data.description}</p>
            </div>
        `;
        
        return div;
    }
    
    // 이벤트 리스너 재할당 (Firestore 사용시 활용)
    function attachEventListeners() {
        // 상세보기 버튼 이벤트
        const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const projectId = this.getAttribute('data-id');
                openProjectModal(projectId);
            });
        });
    }
    
    // 초기 로드 시 Firestore에서 포트폴리오 아이템 불러오기 (실제 구현시 활성화)
    // loadPortfolioItems();
});