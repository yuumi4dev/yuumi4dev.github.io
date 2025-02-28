document.addEventListener('DOMContentLoaded', function() {
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
                
                // 선택한 카테고리로 게시물 필터링 (여기서는 예시로 콘솔에 로깅)
                const category = this.getAttribute('data-category');
                console.log('Selected category:', category);
                
                // 실제 구현에서는 게시물을 필터링하는 로직 추가
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
                    
                    // 선택한 태그로 게시물 필터링 (여기서는 예시로 콘솔에 로깅)
                    const tagName = this.getAttribute('data-tag');
                    console.log('Selected tag:', tagName);
                    
                    // 실제 구현에서는 태그로 게시물을 필터링하는 로직 추가
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
                // 실제 구현에서는 검색 기능 로직 추가
                searchPosts(searchTerm);
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    console.log('Searching for:', searchTerm);
                    // 실제 구현에서는 검색 기능 로직 추가
                    searchPosts(searchTerm);
                }
            }
        });
    }
    
    // 페이지네이션
    const paginationLinks = document.querySelectorAll('.pagination-number');
    if (paginationLinks.length > 0) {
        paginationLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 모든 페이지 링크에서 active 클래스 제거
                paginationLinks.forEach(item => {
                    item.classList.remove('active');
                });
                
                // 클릭한 페이지 링크에 active 클래스 추가
                this.classList.add('active');
                
                // 선택한 페이지 번호 (여기서는 예시로 콘솔에 로깅)
                const pageNumber = this.textContent;
                console.log('Selected page:', pageNumber);
                
                // 실제 구현에서는 페이지 변경 로직 추가
                changePage(pageNumber);
            });
        });
    }
    
    // 댓글 기능 (블로그 포스트 페이지에서만 사용)
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const commentText = this.querySelector('textarea').value.trim();
            if (commentText) {
                console.log('New comment:', commentText);
                // 실제 구현에서는 댓글 저장 및 표시 로직 추가
                submitComment(commentText);
            }
        });
    }
    
    // Firestore에서 블로그 포스트 불러오기 (실제 구현시 사용)
    function loadPostsFromFirestore() {
        if (!db) return;
        
        db.collection('posts')
            .orderBy('date', 'desc')
            .limit(10)
            .get()
            .then(querySnapshot => {
                const postsContainer = document.querySelector('.posts-container');
                if (!postsContainer) return;
                
                // 컨테이너 비우기
                postsContainer.innerHTML = '';
                
                querySnapshot.forEach(doc => {
                    const postData = doc.data();
                    const postElement = createPostElement(doc.id, postData);
                    postsContainer.appendChild(postElement);
                });
            })
            .catch(error => {
                console.error('Error loading posts:', error);
            });
    }
    
    // 포스트 요소 생성 함수 (실제 구현시 사용)
    function createPostElement(id, data) {
        const article = document.createElement('article');
        article.className = 'post-card';
        
        // HTML 생성
        article.innerHTML = `
            <a href="blog-post.html?id=${id}" class="post-link">
                <div class="post-image">
                    <div class="image-placeholder">
                        <span>${data.emoji || '📄'}</span>
                    </div>
                </div>
                <div class="post-content">
                    <div class="post-meta">
                        <span class="post-category">${data.category || '일반'}</span>
                        <span class="post-date">${formatDate(data.date)}</span>
                    </div>
                    <h2 class="post-title">${data.title}</h2>
                    <p class="post-excerpt">${data.excerpt || data.content.substring(0, 150) + '...'}</p>
                    <div class="post-tags">
                        ${data.tags ? data.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
            </a>
        `;
        
        return article;
    }
    
    // 날짜 포맷 함수
    function formatDate(date) {
        if (!date) return '';
        
        if (typeof date === 'string') {
            date = new Date(date);
        } else if (date.toDate) {
            // Firestore 타임스탬프 처리
            date = date.toDate();
        }
        
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
    
    // 카테고리로 게시물 필터링 (실제 구현시 수정 필요)
    function filterPosts(category) {
        const postCards = document.querySelectorAll('.post-card');
        
        if (category === 'all') {
            // 모든 게시물 표시
            postCards.forEach(card => {
                card.style.display = 'block';
            });
        } else {
            // 선택한 카테고리에 해당하는 게시물만 표시
            postCards.forEach(card => {
                const postCategory = card.querySelector('.post-category').textContent.toLowerCase();
                if (postCategory === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }
    
    // 태그로 게시물 필터링 (실제 구현시 수정 필요)
    function filterPostsByTag(tag) {
        const postCards = document.querySelectorAll('.post-card');
        
        postCards.forEach(card => {
            const postTags = card.querySelectorAll('.post-tags .tag');
            let hasTag = false;
            
            postTags.forEach(postTag => {
                if (postTag.textContent.toLowerCase() === tag.toLowerCase()) {
                    hasTag = true;
                }
            });
            
            if (hasTag) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // 검색 기능 (실제 구현시 수정 필요)
    function searchPosts(term) {
        const postCards = document.querySelectorAll('.post-card');
        const searchTerm = term.toLowerCase();
        
        postCards.forEach(card => {
            const title = card.querySelector('.post-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.post-excerpt').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // 페이지 변경 (실제 구현시 수정 필요)
    function changePage(page) {
        // 여기서는 예시로 컨솔에 로깅만 하지만 실제로는 페이지에 맞는 게시물 로드 필요
        console.log(`Loading page ${page}`);
        
        // Firestore 사용 시 아래와 같이 구현 가능
        // const postsPerPage = 5;
        // db.collection('posts')
        //     .orderBy('date', 'desc')
        //     .limit(postsPerPage)
        //     .offset((page - 1) * postsPerPage)
        //     .get()
        //     .then(querySnapshot => {
        //         // 포스트 표시 로직
        //     });
    }
    
    // 댓글 제출 (실제 구현시 수정 필요)
    function submitComment(text) {
        // 현재 사용자 확인
        const user = auth.currentUser;
        if (!user) {
            alert('댓글을 작성하려면 로그인이 필요합니다.');
            return;
        }
        
        // 현재 포스트 ID 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        if (!postId) return;
        
        // Firestore에 댓글 저장
        if (db) {
            db.collection('posts').doc(postId).collection('comments').add({
                author: user.displayName || user.email,
                authorId: user.uid,
                content: text,
                date: new Date()
            })
            .then(() => {
                // 댓글 폼 초기화
                document.querySelector('.comment-form textarea').value = '';
                
                // 댓글 목록 새로고침
                loadComments(postId);
            })
            .catch(error => {
                console.error('Error adding comment:', error);
                alert('댓글 저장 중 오류가 발생했습니다.');
            });
        }
    }
    
    // 댓글 불러오기 (실제 구현시 사용)
    function loadComments(postId) {
        if (!db || !postId) return;
        
        const commentsContainer = document.querySelector('.comments-list');
        if (!commentsContainer) return;
        
        db.collection('posts').doc(postId).collection('comments')
            .orderBy('date', 'desc')
            .get()
            .then(querySnapshot => {
                // 컨테이너 비우기
                commentsContainer.innerHTML = '';
                
                if (querySnapshot.empty) {
                    commentsContainer.innerHTML = '<p class="no-comments">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>';
                    return;
                }
                
                querySnapshot.forEach(doc => {
                    const commentData = doc.data();
                    const commentElement = createCommentElement(commentData);
                    commentsContainer.appendChild(commentElement);
                });
            })
            .catch(error => {
                console.error('Error loading comments:', error);
            });
    }
    
    // 댓글 요소 생성 함수 (실제 구현시 사용)
    function createCommentElement(data) {
        const div = document.createElement('div');
        div.className = 'comment-item';
        
        // HTML 생성
        div.innerHTML = `
            <div class="comment-header">
                <div class="comment-author">${data.author}</div>
                <div class="comment-date">${formatDate(data.date)}</div>
            </div>
            <div class="comment-content">${data.content}</div>
        `;
        
        return div;
    }
    
    // 블로그 포스트 상세 페이지인 경우 포스트 데이터 로드
    const isPostPage = window.location.pathname.includes('blog-post');
    if (isPostPage && db) {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        if (postId) {
            db.collection('posts').doc(postId).get()
                .then(doc => {
                    if (doc.exists) {
                        displayPostData(doc.id, doc.data());
                        loadComments(postId);
                    } else {
                        console.error('Post not found');
                        // 포스트가 없을 경우 에러 메시지 표시 또는 리디렉션
                    }
                })
                .catch(error => {
                    console.error('Error loading post:', error);
                });
        }
    }
    
    // 포스트 데이터 표시 함수 (실제 구현시 사용)
    function displayPostData(id, data) {
        // 타이틀 업데이트
        document.title = `${data.title} | 블로그`;
        
        // 포스트 헤더 업데이트
        const postTitle = document.querySelector('.post-title');
        if (postTitle) postTitle.textContent = data.title;
        
        const postCategory = document.querySelector('.post-category');
        if (postCategory) postCategory.textContent = data.category || '일반';
        
        const postDate = document.querySelector('.post-date');
        if (postDate) postDate.textContent = formatDate(data.date);
        
        // 포스트 내용 업데이트
        const postBody = document.querySelector('.post-body');
        if (postBody) {
            // 마크다운 렌더링 라이브러리가 있다면 사용
            // 여기서는 간단히 HTML로 변환
            postBody.innerHTML = convertToHtml(data.content);
        }
        
        // 태그 업데이트
        const tagsContainer = document.querySelector('.post-tags-container');
        if (tagsContainer && data.tags) {
            tagsContainer.innerHTML = '';
            data.tags.forEach(tag => {
                const tagElement = document.createElement('a');
                tagElement.href = `blog.html?tag=${tag}`;
                tagElement.className = 'tag';
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        }
    }
    
    // 텍스트를 HTML로 변환 (간단한 예시)
    function convertToHtml(text) {
        if (!text) return '';
        
        // 줄바꿈을 <p> 태그로 변환 (매우 기본적인 변환)
        return text.split('\n\n')
            .map(paragraph => `<p>${paragraph}</p>`)
            .join('');
    }
    
    // 초기 로드
    // loadPostsFromFirestore(); // 실제 구현에서 주석 제거
});