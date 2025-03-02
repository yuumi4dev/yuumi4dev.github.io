// portfolio.js - 포트폴리오 관련 기능

document.addEventListener('DOMContentLoaded', function() {
    // 현재 언어 가져오기
    function getCurrentLanguage() {
        return document.body.getAttribute('data-language') || 'en';
    }

    // 언어 변경 감지 및 UI 업데이트
    function updateLanguageUI() {
        const currentLang = getCurrentLanguage();
        
        // 카테고리 필터 버튼 업데이트
        document.querySelectorAll('.filter-btn').forEach(button => {
            const filter = button.getAttribute('data-filter');
            if (button.classList.contains('active')) {
                // 현재 활성화된 필터를 다시 적용
                filterPortfolioItems(filter);
            }
        });
        
        // 열려있는 모달이 있으면 업데이트
        const openModal = document.querySelector('.portfolio-modal.open');
        if (openModal) {
            const projectId = document.querySelector('.view-details-btn')?.getAttribute('data-id');
            if (projectId) {
                // 모달 내용 새로고침
                loadProjectData(projectId)
                    .then(projectData => {
                        if (projectData) {
                            renderProjectModal(projectData, currentLang);
                        }
                    })
                    .catch(error => {
                        console.error('Error updating modal:', error);
                    });
            }
        }
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
                filterPortfolioItems(filter);
            });
        });
    }
    
    // 포트폴리오 아이템 필터링 함수
    function filterPortfolioItems(filter) {
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
        
        const currentLang = getCurrentLanguage();
        
        // 로딩 상태 표시
        const loadingMessages = {
            'ko': '<div class="modal-loading"><div class="spinner"></div><p>로딩 중...</p></div>',
            'en': '<div class="modal-loading"><div class="spinner"></div><p>Loading...</p></div>',
            'es': '<div class="modal-loading"><div class="spinner"></div><p>Cargando...</p></div>'
        };
        
        modalBody.innerHTML = loadingMessages[currentLang] || loadingMessages['en'];
        
        // 모달 열기
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // 스크롤 방지
        
        // 프로젝트 데이터 로드
        loadProjectData(projectId)
            .then(projectData => {
                if (projectData) {
                    renderProjectModal(projectData, currentLang);
                } else {
                    const errorMessages = {
                        'ko': '<div class="error-message"><p>프로젝트 정보를 불러올 수 없습니다.</p></div>',
                        'en': '<div class="error-message"><p>Unable to load project information.</p></div>',
                        'es': '<div class="error-message"><p>No se puede cargar la información del proyecto.</p></div>'
                    };
                    modalBody.innerHTML = errorMessages[currentLang] || errorMessages['en'];
                }
            })
            .catch(error => {
                console.error('Error loading project data:', error);
                const errorMessages = {
                    'ko': `<div class="error-message"><p>오류가 발생했습니다: ${error.message}</p></div>`,
                    'en': `<div class="error-message"><p>An error occurred: ${error.message}</p></div>`,
                    'es': `<div class="error-message"><p>Se produjo un error: ${error.message}</p></div>`
                };
                modalBody.innerHTML = errorMessages[currentLang] || errorMessages['en'];
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
                        ko: {
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
                            technologies: ['HTML5', 'CSS3', 'JavaScript', 'SASS', 'Webpack', '반응형 디자인'],
                            liveUrl: '#',
                            codeUrl: '#'
                        },
                        en: {
                            title: 'Corporate Responsive Website',
                            category: 'Web Development',
                            client: 'ABC Corporation',
                            date: 'May 2023',
                            description: `
                                <p>This project aimed to modernly redesign the client's corporate website and develop it as a responsive website that provides the optimal user experience on all devices.</p>
                                <p>Developed based on HTML5, CSS3, and JavaScript, it was designed with particular attention to mobile user optimization and web accessibility. The latest web technologies were applied for SEO optimization and fast loading speed.</p>
                            `,
                            challenge: 'The biggest challenge was providing a consistent user experience across various browsers and devices. Also, much thought was needed in the process of applying a new design while maintaining the content of the existing website.',
                            solution: 'We adopted a mobile-first approach to start the design and applied progressive enhancement techniques to ensure basic functionality works in all browsers. We also used a component-based development approach to enhance reusability and maintainability.',
                            technologies: ['HTML5', 'CSS3', 'JavaScript', 'SASS', 'Webpack', 'Responsive Design'],
                            liveUrl: '#',
                            codeUrl: '#'
                        },
                        es: {
                            title: 'Sitio Web Corporativo Responsivo',
                            category: 'Desarrollo Web',
                            client: 'Corporación ABC',
                            date: 'Mayo 2023',
                            description: `
                                <p>Este proyecto tenía como objetivo rediseñar de manera moderna el sitio web corporativo del cliente y desarrollarlo como un sitio web responsivo que brinde la experiencia de usuario óptima en todos los dispositivos.</p>
                                <p>Desarrollado con HTML5, CSS3 y JavaScript, fue diseñado con especial atención a la optimización para usuarios móviles y la accesibilidad web. Se aplicaron las últimas tecnologías web para la optimización SEO y la velocidad de carga rápida.</p>
                            `,
                            challenge: 'El mayor desafío fue proporcionar una experiencia de usuario consistente en varios navegadores y dispositivos. Además, se necesitó mucha reflexión en el proceso de aplicar un nuevo diseño mientras se mantenía el contenido del sitio web existente.',
                            solution: 'Adoptamos un enfoque mobile-first para iniciar el diseño y aplicamos técnicas de mejora progresiva para garantizar que la funcionalidad básica funcione en todos los navegadores. También utilizamos un enfoque de desarrollo basado en componentes para mejorar la reutilización y la mantenibilidad.',
                            technologies: ['HTML5', 'CSS3', 'JavaScript', 'SASS', 'Webpack', 'Diseño Responsivo'],
                            liveUrl: '#',
                            codeUrl: '#'
                        }
                    },
                    // 다른 프로젝트 데이터 생략...
                };
                
                resolve(projectsData[projectId] || null);
            }, 500); // 로딩 효과를 위한 지연
        });
    }
    
    // 프로젝트 모달 렌더링
    function renderProjectModal(projectData, lang) {
        if (!modalBody) return;
        
        // 현재 언어에 맞는 데이터 사용
        const data = projectData[lang] || projectData['en'] || projectData;
        
        modalBody.innerHTML = `
            <div class="project-header">
                <h2 class="project-title">${data.title}</h2>
                <div class="project-meta">
                    <span class="project-category">${data.category}</span>
                    <span class="project-date">${data.date}</span>
                </div>
            </div>
            
            <div class="project-gallery">
                <div class="gallery-main">
                    <span>${getEmojiForCategory(data.category)}</span>
                </div>
                <div class="gallery-thumbs">
                    <div class="gallery-thumb active">
                        <span>${getEmojiForCategory(data.category)}</span>
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
                <h3 class="project-section-title">${
                    lang === 'ko' ? '프로젝트 개요' : 
                    lang === 'es' ? 'Descripción del Proyecto' : 
                    'Project Overview'
                }</h3>
                <div class="project-text">
                    ${data.description}
                </div>
            </div>
            
            <div class="project-details">
                <div class="detail-column">
                    <h3 class="project-section-title">${
                        lang === 'ko' ? '도전 과제' : 
                        lang === 'es' ? 'Desafíos' : 
                        'Challenges'
                    }</h3>
                    <div class="project-text">
                        <p>${data.challenge}</p>
                    </div>
                </div>
                
                <div class="detail-column">
                    <h3 class="project-section-title">${
                        lang === 'ko' ? '해결 방법' : 
                        lang === 'es' ? 'Soluciones' : 
                        'Solutions'
                    }</h3>
                    <div class="project-text">
                        <p>${data.solution}</p>
                    </div>
                </div>
            </div>
            
            <div class="project-info">
                <h3 class="project-section-title">${
                    lang === 'ko' ? '프로젝트 정보' : 
                    lang === 'es' ? 'Información del Proyecto' : 
                    'Project Information'
                }</h3>
                <div class="detail-item">
                    <div class="detail-label">${
                        lang === 'ko' ? '클라이언트' : 
                        lang === 'es' ? 'Cliente' : 
                        'Client'
                    }</div>
                    <div class="detail-value">${data.client}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">${
                        lang === 'ko' ? '완료 일자' : 
                        lang === 'es' ? 'Fecha de Finalización' : 
                        'Completion Date'
                    }</div>
                    <div class="detail-value">${data.date}</div>
                </div>
            </div>
            
            <div class="project-technologies">
                <h3 class="project-section-title">${
                    lang === 'ko' ? '사용 기술' : 
                    lang === 'es' ? 'Tecnologías Utilizadas' : 
                    'Technologies Used'
                }</h3>
                <div class="technologies-list">
                    ${data.technologies.map(tech => `<span class="technology-tag">${tech}</span>`).join('')}
                </div>
            </div>
            
            <div class="project-cta">
                <a href="${data.liveUrl}" target="_blank" class="project-link primary">${
                    lang === 'ko' ? '라이브 데모' : 
                    lang === 'es' ? 'Demo en Vivo' : 
                    'Live Demo'
                }</a>
                <a href="${data.codeUrl}" target="_blank" class="project-link secondary">${
                    lang === 'ko' ? '코드 보기' : 
                    lang === 'es' ? 'Ver Código' : 
                    'View Code'
                }</a>
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
        const langCategory = category.toLowerCase();
        
        if (langCategory.includes('web') || langCategory.includes('웹')) {
            return '🌐';
        } else if (langCategory.includes('mobile') || langCategory.includes('모바일')) {
            return '📱';
        } else if (langCategory.includes('design') || langCategory.includes('디자인')) {
            return '🎨';
        } else {
            return '💼';
        }
    }
    
    // Firestore를 사용하여 포트폴리오 아이템 불러오기 (실제 구현시 활성화)
    function loadPortfolioItems() {
        if (!db) return;
        
        const currentLang = getCurrentLanguage();
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
                    // 현재 언어에 맞는 데이터 사용
                    const localizedData = itemData[currentLang] || itemData['en'] || itemData;
                    const itemElement = createPortfolioItem(doc.id, localizedData, currentLang);
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
    function createPortfolioItem(id, data, lang) {
        const div = document.createElement('div');
        div.className = 'portfolio-item';
        div.setAttribute('data-category', data.category.toLowerCase());
        
        // 언어별 버튼 텍스트
        const viewDetailsText = {
            'ko': '상세 보기',
            'en': 'View Details',
            'es': 'Ver Detalles'
        };
        
        div.innerHTML = `
            <div class="portfolio-image">
                <div class="image-placeholder">
                    <span>${data.emoji || getEmojiForCategory(data.category)}</span>
                </div>
                <div class="portfolio-overlay">
                    <div class="overlay-content">
                        <h3 class="overlay-title">${data.title}</h3>
                        <p class="overlay-category">${data.category}</p>
                        <button class="view-details-btn" data-id="${id}">${viewDetailsText[lang] || viewDetailsText['en']}</button>
                    </div>
                </div>
            </div>
            <div class="portfolio-info">
                <h3 class="portfolio-title">${data.title}</h3>
                <p class="portfolio-desc">${data.shortDescription || data.description.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}</p>
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
        
        // 필터 버튼 이벤트
        const filterButtons = document.querySelectorAll('.filter-btn');
        if (filterButtons.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // active 클래스 토글
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    const filter = this.getAttribute('data-filter');
                    filterPortfolioItems(filter);
                });
            });
        }
    }
    
    // 초기 로드 시 Firestore에서 포트폴리오 아이템 불러오기 (실제 구현시 활성화)
    // loadPortfolioItems();
});