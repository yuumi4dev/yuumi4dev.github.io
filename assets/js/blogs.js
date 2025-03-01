document.addEventListener('DOMContentLoaded', function() {
    // Blog page elements
    const postsContainer = document.querySelector('.posts-container');
    const latestPostsContainer = document.getElementById('latest-posts-container');
    const categoryLinks = document.querySelectorAll('.category-item a');
    const tagLinks = document.querySelectorAll('.tag');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const paginationNumbers = document.querySelectorAll('.pagination-number');
    const prevButton = document.querySelector('.pagination-btn:first-child');
    const nextButton = document.querySelector('.pagination-btn:last-child');
    
    // Blog post page elements
    const commentForm = document.querySelector('.comment-form');
    
    // State
    let currentPage = 1;
    let totalPages = 1;
    let currentCategory = 'all';
    let currentTag = null;
    let currentSearch = null;
    const postsPerPage = 6;
    
    // Load blog posts based on page location
    if (window.location.pathname.includes('blog.html')) {
        // Blog index page
        loadBlogPosts();
        setupCategoryFilters();
        setupTagFilters();
        setupSearch();
        setupPagination();
    } else if (window.location.pathname.includes('blog-post.html')) {
        // Blog post detail page
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        if (postId) {
            loadBlogPost(postId);
            setupCommentForm();
        }
    } else if (latestPostsContainer) {
        // Home page latest posts
        loadLatestPosts();
    }
    
    // Load blog posts with optional filters
    async function loadBlogPosts() {
        if (!postsContainer) return;
        
        try {
            // Show loading state
            postsContainer.innerHTML = `
                <div class="loading-posts">
                    <div class="post-card skeleton">
                        <div class="post-image skeleton"></div>
                        <div class="post-content">
                            <div class="post-meta skeleton-text"></div>
                            <div class="post-title skeleton-text"></div>
                            <div class="post-excerpt skeleton-text"></div>
                            <div class="post-excerpt skeleton-text"></div>
                        </div>
                    </div>
                    <div class="post-card skeleton">
                        <div class="post-image skeleton"></div>
                        <div class="post-content">
                            <div class="post-meta skeleton-text"></div>
                            <div class="post-title skeleton-text"></div>
                            <div class="post-excerpt skeleton-text"></div>
                            <div class="post-excerpt skeleton-text"></div>
                        </div>
                    </div>
                </div>
            `;
            
            // Create query
            let query = db.collection('posts').orderBy('createdAt', 'desc');
            
            // Apply category filter
            if (currentCategory && currentCategory !== 'all') {
                query = query.where('category', '==', currentCategory);
            }
            
            // Apply tag filter
            if (currentTag) {
                query = query.where('tags', 'array-contains', currentTag);
            }
            
            // Get total posts count for pagination
            const totalSnapshot = await query.get();
            const totalPosts = totalSnapshot.size;
            totalPages = Math.ceil(totalPosts / postsPerPage);
            
            // Get posts for current page
            const snapshot = await query
                .limit(postsPerPage)
                .offset((currentPage - 1) * postsPerPage)
                .get();
            
            // Clear container
            postsContainer.innerHTML = '';
            
            if (snapshot.empty) {
                postsContainer.innerHTML = '<div class="no-posts-message">No posts found</div>';
                return;
            }
            
            // Create post elements
            snapshot.forEach(doc => {
                const postData = doc.data();
                const postElement = createPostCard(doc.id, postData);
                postsContainer.appendChild(postElement);
            });
            
            // Update pagination
            updatePagination(totalPages);
            
        } catch (error) {
            console.error('Error loading blog posts:', error);
            postsContainer.innerHTML = '<div class="error-message">Error loading posts</div>';
        }
    }
    
    // Search posts
    async function searchPosts(searchTerm) {
        if (!searchTerm) {
            currentSearch = null;
            currentCategory = 'all';
            currentTag = null;
            currentPage = 1;
            loadBlogPosts();
            return;
        }
        
        currentSearch = searchTerm;
        
        // For now, we'll use a simple client-side search
        // In a production app, you would use Algolia, ElasticSearch, or Firebase Extensions
        try {
            // Show loading state
            postsContainer.innerHTML = `
                <div class="loading-posts">
                    <div class="post-card skeleton">
                        <div class="post-image skeleton"></div>
                        <div class="post-content">
                            <div class="post-meta skeleton-text"></div>
                            <div class="post-title skeleton-text"></div>
                            <div class="post-excerpt skeleton-text"></div>
                            <div class="post-excerpt skeleton-text"></div>
                        </div>
                    </div>
                </div>
            `;
            
            // Get all posts
            const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
            
            // Filter posts client-side
            const searchResults = [];
            
            snapshot.forEach(doc => {
                const postData = doc.data();
                const title = postData.title?.toLowerCase() || '';
                const content = postData.content?.toLowerCase() || '';
                const excerpt = postData.excerpt?.toLowerCase() || '';
                const category = postData.category?.toLowerCase() || '';
                const tags = postData.tags?.map(tag => tag.toLowerCase()) || [];
                
                if (
                    title.includes(searchTerm.toLowerCase()) ||
                    content.includes(searchTerm.toLowerCase()) ||
                    excerpt.includes(searchTerm.toLowerCase()) ||
                    category.includes(searchTerm.toLowerCase()) ||
                    tags.some(tag => tag.includes(searchTerm.toLowerCase()))
                ) {
                    searchResults.push({
                        id: doc.id,
                        ...postData
                    });
                }
            });
            
            // Clear container
            postsContainer.innerHTML = '';
            
            if (searchResults.length === 0) {
                postsContainer.innerHTML = `
                    <div class="no-posts-message">
                        No posts found for "${searchTerm}"
                        <button class="clear-search-btn">Clear search</button>
                    </div>
                `;
                
                // Add event listener to clear search button
                const clearSearchBtn = postsContainer.querySelector('.clear-search-btn');
                if (clearSearchBtn) {
                    clearSearchBtn.addEventListener('click', function() {
                        if (searchInput) searchInput.value = '';
                        currentSearch = null;
                        currentCategory = 'all';
                        currentTag = null;
                        currentPage = 1;
                        loadBlogPosts();
                    });
                }
                
                return;
            }
            
            // Calculate total pages
            totalPages = Math.ceil(searchResults.length / postsPerPage);
            
            // Get posts for current page
            const paginatedResults = searchResults.slice(
                (currentPage - 1) * postsPerPage,
                currentPage * postsPerPage
            );
            
            // Create post elements
            paginatedResults.forEach(post => {
                const postElement = createPostCard(post.id, post);
                postsContainer.appendChild(postElement);
            });
            
            // Update pagination
            updatePagination(totalPages);
            
        } catch (error) {
            console.error('Error searching posts:', error);
            postsContainer.innerHTML = '<div class="error-message">Error searching posts</div>';
        }
    }
    
    // Load latest posts for home page
    async function loadLatestPosts() {
        if (!latestPostsContainer) return;
        
        try {
            const snapshot = await db.collection('posts')
                .orderBy('createdAt', 'desc')
                .limit(3)
                .get();
            
            // Clear container
            latestPostsContainer.innerHTML = '';
            
            if (snapshot.empty) {
                latestPostsContainer.innerHTML = '<div class="no-posts-message">No posts yet</div>';
                return;
            }
            
            // Create post elements
            snapshot.forEach(doc => {
                const postData = doc.data();
                const postElement = createLatestPostItem(doc.id, postData);
                latestPostsContainer.appendChild(postElement);
            });
        } catch (error) {
            console.error('Error loading latest posts:', error);
            latestPostsContainer.innerHTML = '<div class="error-message">Error loading posts</div>';
        }
    }
    
    // Load individual blog post
    async function loadBlogPost(postId) {
        const postTitleElement = document.querySelector('.post-title');
        const postContentElement = document.querySelector('.post-content');
        const postMetaElement = document.querySelector('.post-meta');
        const postTagsContainer = document.querySelector('.post-tags-container');
        
        if (!postTitleElement || !postContentElement) return;
        
        try {
            const doc = await db.collection('posts').doc(postId).get();
            
            if (!doc.exists) {
                showPostError('Post not found');
                return;
            }
            
            const postData = doc.data();
            
            // Update page title
            document.title = `${postData.title} | Blog`;
            
            // Update post elements
            postTitleElement.textContent = postData.title;
            
            // Format and render content (implement markdown parsing here if needed)
            postContentElement.innerHTML = formatContent(postData.content);
            
            // Update meta information
            if (postMetaElement) {
                const postDate = postData.createdAt ? 
                    (postData.createdAt.toDate ? postData.createdAt.toDate() : new Date(postData.createdAt)) : 
                    new Date();
                
                postMetaElement.innerHTML = `
                    <span class="post-category">${postData.category || 'Uncategorized'}</span>
                    <span class="post-date">${formatDate(postDate)}</span>
                `;
            }
            
            // Update tags
            if (postTagsContainer && postData.tags && postData.tags.length > 0) {
                postTagsContainer.innerHTML = '';
                postData.tags.forEach(tag => {
                    const tagElement = document.createElement('a');
                    tagElement.href = `blog.html?tag=${encodeURIComponent(tag)}`;
                    tagElement.className = 'tag';
                    tagElement.textContent = tag;
                    postTagsContainer.appendChild(tagElement);
                });
            }
            
            // Load comments
            loadComments(postId);
            
            // Update post author info
            if (postData.authorId) {
                loadAuthorInfo(postData.authorId);
            }
        } catch (error) {
            console.error('Error loading blog post:', error);
            showPostError('Error loading post');
        }
    }
    
    // Load comments for a post
    async function loadComments(postId) {
        const commentsContainer = document.querySelector('.comments-list');
        if (!commentsContainer) return;
        
        try {
            const snapshot = await db.collection('posts')
                .doc(postId)
                .collection('comments')
                .orderBy('createdAt', 'desc')
                .get();
            
            // Clear container
            commentsContainer.innerHTML = '';
            
            if (snapshot.empty) {
                commentsContainer.innerHTML = '<div class="no-comments-message">No comments yet. Be the first to comment!</div>';
                return;
            }
            
            // Create comment elements
            snapshot.forEach(doc => {
                const commentData = doc.data();
                const commentElement = createCommentElement(commentData);
                commentsContainer.appendChild(commentElement);
            });
            
            // Update comment count
            const commentCount = document.querySelector('.comment-count');
            if (commentCount) {
                commentCount.textContent = `${snapshot.size} comment${snapshot.size !== 1 ? 's' : ''}`;
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            commentsContainer.innerHTML = '<div class="error-message">Error loading comments</div>';
        }
    }
    
    // Load author information
    async function loadAuthorInfo(authorId) {
        const authorContainer = document.querySelector('.post-author');
        if (!authorContainer) return;
        
        try {
            const doc = await db.collection('users').doc(authorId).get();
            
            if (!doc.exists) {
                // Author not found, hide author section
                authorContainer.style.display = 'none';
                return;
            }
            
            const authorData = doc.data();
            
            // Update author elements
            authorContainer.innerHTML = `
                <div class="author-avatar">
                    <div class="avatar">
                        <span class="avatar-initial">${authorData.displayName.charAt(0).toUpperCase()}</span>
                    </div>
                </div>
                <div class="author-info">
                    <h3 class="author-name">${authorData.displayName}</h3>
                    <a href="profile.html?id=${authorId}" class="author-profile-link">View Profile</a>
                </div>
            `;
            
            // Show author section
            authorContainer.style.display = 'flex';
        } catch (error) {
            console.error('Error loading author info:', error);
            // Hide author section on error
            authorContainer.style.display = 'none';
        }
    }
    
    // Setup category filters
    function setupCategoryFilters() {
        if (!categoryLinks.length) return;
        
        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Update active state
                categoryLinks.forEach(item => {
                    item.parentElement.classList.remove('active');
                });
                this.parentElement.classList.add('active');
                
                // Get category value
                currentCategory = this.getAttribute('data-category');
                
                // Reset other filters
                currentTag = null;
                currentSearch = null;
                currentPage = 1;
                
                // Clear search input
                if (searchInput) searchInput.value = '';
                
                // Load posts with filter
                loadBlogPosts();
            });
        });
        
        // Check for URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        if (categoryParam) {
            // Find and click the matching category link
            const categoryLink = Array.from(categoryLinks).find(
                link => link.getAttribute('data-category') === categoryParam
            );
            
            if (categoryLink) categoryLink.click();
        }
    }
    
    // Setup tag filters
    function setupTagFilters() {
        if (!tagLinks.length) return;
        
        tagLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get tag value
                currentTag = this.getAttribute('data-tag') || this.textContent.trim();
                
                // Reset other filters
                currentCategory = 'all';
                currentSearch = null;
                currentPage = 1;
                
                // Reset active category
                categoryLinks.forEach(item => {
                    if (item.getAttribute('data-category') === 'all') {
                        item.parentElement.classList.add('active');
                    } else {
                        item.parentElement.classList.remove('active');
                    }
                });
                
                // Clear search input
                if (searchInput) searchInput.value = '';
                
                // Load posts with filter
                loadBlogPosts();
            });
        });
        
        // Check for URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const tagParam = urlParams.get('tag');
        
        if (tagParam) {
            // Set tag filter directly
            currentTag = tagParam;
            currentCategory = 'all';
            currentPage = 1;
            
            // Reset active category
            categoryLinks.forEach(item => {
                if (item.getAttribute('data-category') === 'all') {
                    item.parentElement.classList.add('active');
                } else {
                    item.parentElement.classList.remove('active');
                }
            });
            
            // Load posts with filter
            loadBlogPosts();
        }
    }
    
    // Setup search functionality
    function setupSearch() {
        if (!searchInput || !searchButton) return;
        
        // Search button click
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim();
            if (!searchTerm) return;
            
            // Reset filters
            currentCategory = 'all';
            currentTag = null;
            currentPage = 1;
            
            // Reset active category
            categoryLinks.forEach(item => {
                if (item.getAttribute('data-category') === 'all') {
                    item.parentElement.classList.add('active');
                } else {
                    item.parentElement.classList.remove('active');
                }
            });
            
            // Run search
            searchPosts(searchTerm);
        });
        
        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }
    
    // Setup pagination
    function setupPagination() {
        if (!paginationNumbers.length) return;
        
        // Pagination number click
        paginationNumbers.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get page number
                currentPage = parseInt(this.textContent);
                
                // Load posts for page
                if (currentSearch) {
                    searchPosts(currentSearch);
                } else {
                    loadBlogPosts();
                }
                
                // Scroll to top of posts
                if (postsContainer) {
                    postsContainer.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Previous page button
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    
                    // Load posts for page
                    if (currentSearch) {
                        searchPosts(currentSearch);
                    } else {
                        loadBlogPosts();
                    }
                    
                    // Scroll to top of posts
                    if (postsContainer) {
                        postsContainer.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        }
        
        // Next page button
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                if (currentPage < totalPages) {
                    currentPage++;
                    
                    // Load posts for page
                    if (currentSearch) {
                        searchPosts(currentSearch);
                    } else {
                        loadBlogPosts();
                    }
                    
                    // Scroll to top of posts
                    if (postsContainer) {
                        postsContainer.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        }
    }
    
    // Update pagination UI
    function updatePagination(totalPages) {
        // Update pagination numbers
        if (paginationNumbers.length) {
            const paginationContainer = paginationNumbers[0].parentElement;
            
            if (paginationContainer) {
                // Generate pagination numbers
                let paginationHTML = '';
                
                // Simplified pagination: show max 5 pages with current page in the middle
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, startPage + 4);
                
                if (endPage - startPage < 4) {
                    startPage = Math.max(1, endPage - 4);
                }
                
                for (let i = startPage; i <= endPage; i++) {
                    paginationHTML += `<a href="#" class="pagination-number${i === currentPage ? ' active' : ''}">${i}</a>`;
                }
                
                paginationContainer.innerHTML = paginationHTML;
                
                // Add event listeners to new pagination numbers
                const newPaginationNumbers = document.querySelectorAll('.pagination-number');
                newPaginationNumbers.forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        // Get page number
                        currentPage = parseInt(this.textContent);
                        
                        // Load posts for page
                        if (currentSearch) {
                            searchPosts(currentSearch);
                        } else {
                            loadBlogPosts();
                        }
                        
                        // Scroll to top of posts
                        if (postsContainer) {
                            postsContainer.scrollIntoView({ behavior: 'smooth' });
                        }
                    });
                });
            }
        }
        
        // Update prev/next buttons
        if (prevButton) {
            prevButton.disabled = currentPage <= 1;
        }
        
        if (nextButton) {
            nextButton.disabled = currentPage >= totalPages;
        }
    }
    
    // Setup comment form
    function setupCommentForm() {
        if (!commentForm) return;
        
        commentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const commentTextarea = this.querySelector('textarea');
            const commentText = commentTextarea.value.trim();
            
            if (!commentText) return;
            
            // Check if user is logged in
            const user = auth.currentUser;
            if (!user) {
                alert('Please sign in to comment');
                return;
            }
            
            // Get post ID
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            
            if (!postId) return;
            
            try {
                // Get user data
                const userDoc = await db.collection('users').doc(user.uid).get();
                const userData = userDoc.data() || {};
                
                // Add comment
                await db.collection('posts').doc(postId).collection('comments').add({
                    authorId: user.uid,
                    authorName: userData.displayName || user.displayName || 'Anonymous',
                    authorUsername: userData.username || '',
                    content: commentText,
                    createdAt: new Date()
                });
                
                // Clear form
                commentTextarea.value = '';
                
                // Reload comments
                loadComments(postId);
                
            } catch (error) {
                console.error('Error adding comment:', error);
                alert('Error adding comment. Please try again.');
            }
        });
    }
    
    // Helper Functions
    
    // Create post card element
    function createPostCard(id, data) {
        const postDate = data.createdAt ? 
            (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : 
            new Date();
        
        const article = document.createElement('article');
        article.className = 'post-card';
        
        // Generate tags HTML
        let tagsHTML = '';
        if (data.tags && data.tags.length > 0) {
            tagsHTML = `
                <div class="post-tags">
                    ${data.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            `;
        }
        
        article.innerHTML = `
            <a href="blog-post.html?id=${id}" class="post-link">
                <div class="post-image">
                    <div class="image-placeholder">
                        <span>${data.emoji || '📄'}</span>
                    </div>
                </div>
                <div class="post-content">
                    <div class="post-meta">
                        <span class="post-category">${data.category || 'Uncategorized'}</span>
                        <span class="post-date">${formatDate(postDate)}</span>
                    </div>
                    <h2 class="post-title">${data.title}</h2>
                    <p class="post-excerpt">
                        ${data.excerpt || truncateText(data.content, 150)}
                    </p>
                    ${tagsHTML}
                </div>
            </a>
        `;
        
        return article;
    }
    
    // Create latest post item (for homepage)
    function createLatestPostItem(id, data) {
        const postDate = data.createdAt ? 
            (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : 
            new Date();
        
        const div = document.createElement('div');
        div.className = 'post-item';
        
        div.innerHTML = `
            <div class="post-date">${formatDate(postDate)}</div>
            <h3 class="post-title">
                <a href="blog-post.html?id=${id}">${data.title}</a>
            </h3>
            <p class="post-excerpt">${data.excerpt || truncateText(data.content, 100)}</p>
        `;
        
        return div;
    }
    
    // Create comment element
    function createCommentElement(data) {
        const commentDate = data.createdAt ? 
            (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : 
            new Date();
        
        const div = document.createElement('div');
        div.className = 'comment-item';
        
        div.innerHTML = `
            <div class="comment-header">
                <div class="comment-author-avatar">
                    <div class="avatar small">
                        <span class="avatar-initial">${data.authorName.charAt(0).toUpperCase()}</span>
                    </div>
                </div>
                <div class="comment-meta">
                    <div class="comment-author">
                        ${data.authorName}
                        ${data.authorUsername ? `<span class="comment-author-username">@${data.authorUsername}</span>` : ''}
                    </div>
                    <div class="comment-date">${formatRelativeDate(commentDate)}</div>
                </div>
            </div>
            <div class="comment-content">${formatCommentText(data.content)}</div>
        `;
        
        return div;
    }
    
    // Show error on post page
    function showPostError(message) {
        const contentContainer = document.querySelector('.blog-post-content');
        if (!contentContainer) return;
        
        contentContainer.innerHTML = `
            <div class="post-error">
                <div class="error-message">${message}</div>
                <a href="blog.html" class="btn-link">Back to Blog</a>
            </div>
        `;
    }
    
    // Format date
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Format relative date
    function formatRelativeDate(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffSeconds < 60) {
            return 'just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            return formatDate(date);
        }
    }
    
    // Truncate text
    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // Format blog post content (simple version)
    function formatContent(content) {
        if (!content) return '';
        
        // Convert line breaks to paragraphs
        return content
            .split('\n\n')
            .filter(paragraph => paragraph.trim() !== '')
            .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
            .join('');
    }
    
    // Format comment text
    function formatCommentText(text) {
        if (!text) return '';
        
        // Convert line breaks to <br>
        return text.replace(/\n/g, '<br>');
    }
});