document.addEventListener('DOMContentLoaded', function() {
    // Profile dropdown functionality
    const profileDropdownBtn = document.getElementById('profile-dropdown-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    // Initialize user info from localStorage if available
    initializeUserInfoFromLocalStorage();
    
    // Dropdown toggle
    if (profileDropdownBtn && profileDropdown) {
        profileDropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (profileDropdown.classList.contains('active') && 
                !profileDropdown.contains(e.target) && 
                !profileDropdownBtn.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }
    
    // Public profile page functionality (if on profile.html)
    if (window.location.pathname.includes('profile.html')) {
        // Get user ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');
        
        if (userId) {
            // Load public profile data
            loadPublicProfileData(userId);
        } else {
            // Check if user is logged in
            const currentUser = auth.currentUser;
            if (currentUser) {
                // Load current user's profile
                loadPublicProfileData(currentUser.uid);
            } else {
                // Redirect to login page
                window.location.href = 'auth.html';
            }
        }
    }
    
    // Initialize user info from localStorage
    function initializeUserInfoFromLocalStorage() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (userData.displayName && userData.username) {
            updateUserUI(userData);
        }
    }
    
    // Update user UI elements
    function updateUserUI(userData) {
        const displayName = document.getElementById('display-name');
        const userHandle = document.getElementById('user-handle');
        const dropdownName = document.getElementById('dropdown-name');
        const dropdownHandle = document.getElementById('dropdown-handle');
        const avatarInitials = document.querySelectorAll('.avatar-initial');
        
        if (displayName) displayName.textContent = userData.displayName;
        if (userHandle) userHandle.textContent = '@' + userData.username;
        if (dropdownName) dropdownName.textContent = userData.displayName;
        if (dropdownHandle) dropdownHandle.textContent = '@' + userData.username;
        
        // Update avatar initials
        if (avatarInitials.length > 0) {
            const initial = userData.displayName.charAt(0).toUpperCase();
            avatarInitials.forEach(el => {
                el.textContent = initial;
            });
        }
    }
    
    // Load public profile data (for profile.html)
    async function loadPublicProfileData(userId) {
        try {
            // Get user document
            const userDoc = await db.collection('users').doc(userId).get();
            
            if (!userDoc.exists) {
                // User not found
                showProfileError('User not found');
                return;
            }
            
            const userData = userDoc.data();
            
            // Update profile page with user data
            updateProfilePage(userData);
            
            // Load user posts
            loadUserPosts(userId);
            
            // Check if viewing own profile
            const currentUser = auth.currentUser;
            if (currentUser && currentUser.uid === userId) {
                // Show edit button
                const editProfileBtn = document.getElementById('edit-profile-btn');
                if (editProfileBtn) editProfileBtn.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
            showProfileError('Error loading profile data');
        }
    }
    
    // Update profile page with user data
    function updateProfilePage(userData) {
        const profileName = document.getElementById('profile-name');
        const profileUsername = document.getElementById('profile-username');
        const profileBio = document.getElementById('profile-bio');
        const profileAvatar = document.getElementById('profile-avatar');
        const profileWebsite = document.getElementById('profile-website');
        const profileJoinDate = document.getElementById('profile-join-date');
        
        if (profileName) profileName.textContent = userData.displayName;
        if (profileUsername) profileUsername.textContent = '@' + userData.username;
        
        if (profileBio) {
            if (userData.bio) {
                profileBio.textContent = userData.bio;
                profileBio.style.display = 'block';
            } else {
                profileBio.style.display = 'none';
            }
        }
        
        if (profileAvatar) {
            const initial = userData.displayName.charAt(0).toUpperCase();
            // If user has avatar image, use it, otherwise show initial
            if (userData.avatarUrl) {
                // Implementation would go here when avatar upload is implemented
            } else {
                const initialElement = profileAvatar.querySelector('.avatar-initial');
                if (initialElement) initialElement.textContent = initial;
            }
        }
        
        if (profileWebsite) {
            if (userData.website) {
                profileWebsite.href = ensureHttps(userData.website);
                profileWebsite.textContent = userData.website.replace(/^https?:\/\//, '');
                profileWebsite.parentElement.style.display = 'flex';
            } else {
                profileWebsite.parentElement.style.display = 'none';
            }
        }
        
        if (profileJoinDate && userData.createdAt) {
            const joinDate = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
            profileJoinDate.textContent = 'Joined ' + formatDate(joinDate);
        }
    }
    
    // Load user posts (for profile.html)
    async function loadUserPosts(userId) {
        const postsContainer = document.getElementById('user-posts');
        if (!postsContainer) return;
        
        try {
            // Get user posts from Firestore
            const postsSnapshot = await db.collection('posts')
                .where('authorId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            if (postsSnapshot.empty) {
                // No posts found
                postsContainer.innerHTML = '<div class="no-posts-message">No posts yet</div>';
                return;
            }
            
            // Clear loading skeleton
            postsContainer.innerHTML = '';
            
            // Add posts to container
            postsSnapshot.forEach(doc => {
                const postData = doc.data();
                const postElement = createPostElement(doc.id, postData);
                postsContainer.appendChild(postElement);
            });
        } catch (error) {
            console.error('Error loading user posts:', error);
            postsContainer.innerHTML = '<div class="error-message">Error loading posts</div>';
        }
    }
    
    // Create post element
    function createPostElement(id, data) {
        const postDate = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date();
        
        const postElement = document.createElement('div');
        postElement.className = 'post-item';
        
        postElement.innerHTML = `
            <div class="post-date">${formatDate(postDate)}</div>
            <h3 class="post-title">${data.title}</h3>
            <p class="post-excerpt">${data.excerpt || truncateText(data.content, 150)}</p>
            <div class="post-footer">
                <a href="blog-post.html?id=${id}" class="post-read-more">Read more →</a>
            </div>
        `;
        
        return postElement;
    }
    
    // Show profile error
    function showProfileError(message) {
        const profileContainer = document.querySelector('.profile-container');
        if (!profileContainer) return;
        
        profileContainer.innerHTML = `
            <div class="profile-error">
                <div class="error-message">${message}</div>
                <a href="index.html" class="btn-link">Go to Home</a>
            </div>
        `;
    }
    
    // Helper Functions
    
    // Format date
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Truncate text
    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // Ensure URL has https://
    function ensureHttps(url) {
        if (!url) return '';
        if (!/^https?:\/\//i.test(url)) {
            return 'https://' + url;
        }
        return url;
    }
});