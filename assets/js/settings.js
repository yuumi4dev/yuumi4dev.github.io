document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = auth.currentUser;
    
    // Settings page elements
    const settingsNavItems = document.querySelectorAll('.settings-nav-item');
    const settingsSections = document.querySelectorAll('.settings-section');
    const settingsMessage = document.getElementById('settings-message');
    
    // Profile settings elements
    const displayNameInput = document.getElementById('display-name-input');
    const bioInput = document.getElementById('bio-input');
    const websiteInput = document.getElementById('website-input');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const avatarInitial = document.getElementById('avatar-initial');
    const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
    const removeAvatarBtn = document.getElementById('remove-avatar-btn');
    const avatarUpload = document.getElementById('avatar-upload');
    
    // Account settings elements
    const usernameInput = document.getElementById('username-input');
    const emailInput = document.getElementById('email-input');
    const saveAccountBtn = document.getElementById('save-account-btn');
    const settingsUsernameStatus = document.getElementById('settings-username-status');
    
    // Security settings elements
    const currentPassword = document.getElementById('current-password');
    const newPassword = document.getElementById('new-password');
    const confirmNewPassword = document.getElementById('confirm-new-password');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const passwordChangeForm = document.getElementById('password-change-form');
    const socialAuthPasswordMessage = document.getElementById('social-auth-password-message');
    
    // Notification settings elements
    const commentNotifications = document.getElementById('comment-notifications');
    const updateNotifications = document.getElementById('update-notifications');
    const saveNotificationsBtn = document.getElementById('save-notifications-btn');
    
    // Initialize user data
    let userData = {};
    
    // Check auth state and redirect if not logged in
    auth.onAuthStateChanged(async function(user) {
        if (user) {
            // User is logged in, fetch user data
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                userData = userDoc.data() || {};
                
                // Display user data in form fields
                populateUserData(userData);
                
                // Show/hide password change form based on auth provider
                handlePasswordChangeForm(user);
            } catch (error) {
                console.error('Error fetching user data:', error);
                showMessage('Error loading user data', 'error');
            }
        } else {
            // User is not logged in, redirect to login page
            window.location.href = 'auth.html';
        }
    });
    
    // Settings navigation
    if (settingsNavItems.length > 0) {
        settingsNavItems.forEach(function(item) {
            item.addEventListener('click', function() {
                // Remove active class from all items
                settingsNavItems.forEach(function(navItem) {
                    navItem.classList.remove('active');
                });
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // Show corresponding section
                const sectionId = this.getAttribute('data-settings');
                settingsSections.forEach(function(section) {
                    section.classList.remove('active');
                    if (section.id === sectionId + '-settings') {
                        section.classList.add('active');
                    }
                });
                
                // Hide message
                if (settingsMessage) {
                    settingsMessage.style.display = 'none';
                }
            });
        });
    }
    
    // Populate form fields with user data
    function populateUserData(data) {
        // Profile settings
        if (displayNameInput) displayNameInput.value = data.displayName || '';
        if (bioInput) bioInput.value = data.bio || '';
        if (websiteInput) websiteInput.value = data.website || '';
        if (avatarInitial && data.displayName) {
            avatarInitial.textContent = data.displayName.charAt(0).toUpperCase();
        }
        
        // Account settings
        if (usernameInput) usernameInput.value = data.username || '';
        if (emailInput) emailInput.value = data.email || '';
        
        // Notification settings
        if (commentNotifications) commentNotifications.checked = data.notifications?.comments !== false;
        if (updateNotifications) updateNotifications.checked = data.notifications?.updates !== false;
    }
    
    // Handle password change form based on auth provider
    function handlePasswordChangeForm(user) {
        if (!passwordChangeForm || !socialAuthPasswordMessage) return;
        
        // Check if user signed in with email/password
        const emailProvider = user.providerData.find(provider => provider.providerId === 'password');
        
        if (emailProvider) {
            // User has email/password auth, show password change form
            passwordChangeForm.style.display = 'block';
            socialAuthPasswordMessage.style.display = 'none';
        } else {
            // User signed in with social auth, show message
            passwordChangeForm.style.display = 'none';
            socialAuthPasswordMessage.style.display = 'block';
        }
    }
    
    // Username availability check
    let usernameCheckTimeout;
    let lastCheckedUsername = '';
    
    if (usernameInput && settingsUsernameStatus) {
        usernameInput.addEventListener('input', function() {
            const username = this.value.trim().toLowerCase();
            
            // Clear previous timeout
            clearTimeout(usernameCheckTimeout);
            
            // Clear status
            settingsUsernameStatus.textContent = '';
            settingsUsernameStatus.className = 'username-status';
            
            // If username is the same as current username, it's available
            if (username === userData.username) {
                return;
            }
            
            // Validate username format
            if (username.length < 3) {
                settingsUsernameStatus.textContent = 'Username must be at least 3 characters';
                settingsUsernameStatus.classList.add('username-unavailable');
                return;
            }
            
            if (!/^[a-z0-9_]+$/.test(username)) {
                settingsUsernameStatus.textContent = 'Username can only contain letters, numbers, and underscores';
                settingsUsernameStatus.classList.add('username-unavailable');
                return;
            }
            
            // If username is same as last checked, don't check again
            if (username === lastCheckedUsername) return;
            
            // Show checking status
            settingsUsernameStatus.textContent = 'Checking availability...';
            settingsUsernameStatus.classList.add('username-checking');
            
            // Check username availability after 500ms delay
            usernameCheckTimeout = setTimeout(() => {
                checkUsernameAvailability(username);
                lastCheckedUsername = username;
            }, 500);
        });
    }
    
    // Check username availability
    async function checkUsernameAvailability(username) {
        try {
            const querySnapshot = await db.collection('users')
                .where('username', '==', username)
                .limit(1)
                .get();
            
            if (querySnapshot.empty) {
                // Username is available
                settingsUsernameStatus.textContent = 'Username is available';
                settingsUsernameStatus.className = 'username-status username-available';
            } else {
                // Username is taken
                settingsUsernameStatus.textContent = 'Username is already taken';
                settingsUsernameStatus.className = 'username-status username-unavailable';
            }
        } catch (error) {
            console.error('Error checking username:', error);
            settingsUsernameStatus.textContent = 'Error checking username';
            settingsUsernameStatus.className = 'username-status username-unavailable';
        }
    }
    
    // Save profile settings
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async function() {
            const name = displayNameInput.value.trim();
            const bio = bioInput.value.trim();
            const website = websiteInput.value.trim();
            
            if (!name) {
                showMessage('Display name is required', 'error');
                return;
            }
            
            // Validate website URL if provided
            if (website && !isValidUrl(website)) {
                showMessage('Please enter a valid website URL', 'error');
                return;
            }
            
            try {
                // Get current user
                const user = auth.currentUser;
                if (!user) throw new Error('User not logged in');
                
                // Update Firebase Auth display name
                await user.updateProfile({
                    displayName: name
                });
                
                // Update Firestore user document
                await db.collection('users').doc(user.uid).update({
                    displayName: name,
                    bio: bio,
                    website: website,
                    updatedAt: new Date()
                });
                
                // Update user data object
                userData.displayName = name;
                userData.bio = bio;
                userData.website = website;
                
                // Update avatar initial
                if (avatarInitial) {
                    avatarInitial.textContent = name.charAt(0).toUpperCase();
                }
                
                // Update localStorage data
                updateLocalStorageUserData(user.uid, {
                    displayName: name,
                    username: userData.username
                });
                
                // Show success message
                showMessage('Profile updated successfully', 'success');
            } catch (error) {
                console.error('Error updating profile:', error);
                showMessage('Error updating profile: ' + error.message, 'error');
            }
        });
    }
    
    // Save account settings
    if (saveAccountBtn) {
        saveAccountBtn.addEventListener('click', async function() {
            const username = usernameInput.value.trim().toLowerCase();
            
            if (!username) {
                showMessage('Username is required', 'error');
                return;
            }
            
            if (username.length < 3 || !/^[a-z0-9_]+$/.test(username)) {
                showMessage('Username must be at least 3 characters and can only contain letters, numbers, and underscores', 'error');
                return;
            }
            
            // If username hasn't changed, skip username check
            if (username === userData.username) {
                showMessage('No changes to save', 'info');
                return;
            }
            
            try {
                // Check username availability
                const usernameSnapshot = await db.collection('users')
                    .where('username', '==', username)
                    .limit(1)
                    .get();
                
                if (!usernameSnapshot.empty) {
                    showMessage('This username is already taken', 'error');
                    return;
                }
                
                // Get current user
                const user = auth.currentUser;
                if (!user) throw new Error('User not logged in');
                
                // Update Firestore user document
                await db.collection('users').doc(user.uid).update({
                    username: username,
                    updatedAt: new Date()
                });
                
                // Update user data object
                userData.username = username;
                
                // Update localStorage data
                updateLocalStorageUserData(user.uid, {
                    displayName: userData.displayName,
                    username: username
                });
                
                // Show success message
                showMessage('Username updated successfully', 'success');
            } catch (error) {
                console.error('Error updating account:', error);
                showMessage('Error updating account: ' + error.message, 'error');
            }
        });
    }
    
    // Change password
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', async function() {
            const currentPwd = currentPassword.value;
            const newPwd = newPassword.value;
            const confirmPwd = confirmNewPassword.value;
            
            // Validate inputs
            if (!currentPwd || !newPwd || !confirmPwd) {
                showMessage('Please fill in all password fields', 'error');
                return;
            }
            
            if (newPwd !== confirmPwd) {
                showMessage('New passwords do not match', 'error');
                return;
            }
            
            if (newPwd.length < 6) {
                showMessage('New password must be at least 6 characters', 'error');
                return;
            }
            
            try {
                // Get current user
                const user = auth.currentUser;
                if (!user) throw new Error('User not logged in');
                
                // Get user's email
                const email = user.email;
                
                // Re-authenticate user
                const credential = firebase.auth.EmailAuthProvider.credential(email, currentPwd);
                await user.reauthenticateWithCredential(credential);
                
                // Update password
                await user.updatePassword(newPwd);
                
                // Clear password fields
                currentPassword.value = '';
                newPassword.value = '';
                confirmNewPassword.value = '';
                
                // Show success message
                showMessage('Password updated successfully', 'success');
            } catch (error) {
                console.error('Error updating password:', error);
                
                // Handle specific errors
                let errorMessage;
                switch (error.code) {
                    case 'auth/wrong-password':
                        errorMessage = 'Current password is incorrect';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'New password is too weak';
                        break;
                    default:
                        errorMessage = error.message;
                }
                
                showMessage('Error updating password: ' + errorMessage, 'error');
            }
        });
    }
    
    // Save notification settings
    if (saveNotificationsBtn) {
        saveNotificationsBtn.addEventListener('click', async function() {
            try {
                // Get current user
                const user = auth.currentUser;
                if (!user) throw new Error('User not logged in');
                
                // Get notification preferences
                const commentsEnabled = commentNotifications.checked;
                const updatesEnabled = updateNotifications.checked;
                
                // Update Firestore user document
                await db.collection('users').doc(user.uid).update({
                    'notifications.comments': commentsEnabled,
                    'notifications.updates': updatesEnabled,
                    updatedAt: new Date()
                });
                
                // Update user data object
                if (!userData.notifications) userData.notifications = {};
                userData.notifications.comments = commentsEnabled;
                userData.notifications.updates = updatesEnabled;
                
                // Show success message
                showMessage('Notification preferences saved', 'success');
            } catch (error) {
                console.error('Error saving notification preferences:', error);
                showMessage('Error saving preferences: ' + error.message, 'error');
            }
        });
    }
    
    // Handle avatar upload
    if (uploadAvatarBtn && avatarUpload) {
        uploadAvatarBtn.addEventListener('click', function() {
            avatarUpload.click();
        });
        
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Here you would typically upload the file to Firebase Storage
                // and save the URL to the user's profile
                // For now, we'll just show a message
                showMessage('Avatar upload will be implemented soon', 'info');
            }
        });
    }
    
    // Handle avatar removal
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', function() {
            // Here you would typically remove the user's avatar from Firebase Storage
            // and remove the URL from the user's profile
            // For now, we'll just show a message
            showMessage('Avatar removal will be implemented soon', 'info');
        });
    }
    
    // Helper Functions
    
    // Show message
    function showMessage(message, type) {
        if (!settingsMessage) return;
        
        settingsMessage.textContent = message;
        settingsMessage.className = 'settings-message';
        settingsMessage.classList.add(type);
        settingsMessage.style.display = 'block';
        
        // Scroll to message
        settingsMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Hide message after 5 seconds
        setTimeout(() => {
            settingsMessage.style.display = 'none';
        }, 5000);
    }
    
    // Update localStorage user data
    function updateLocalStorageUserData(uid, updates) {
        const localData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedData = { ...localData, ...updates };
        localStorage.setItem('userData', JSON.stringify(updatedData));
        
        // Update navbar display
        const displayNameEl = document.getElementById('display-name');
        const userHandleEl = document.getElementById('user-handle');
        const dropdownNameEl = document.getElementById('dropdown-name');
        const dropdownHandleEl = document.getElementById('dropdown-handle');
        
        if (displayNameEl && updates.displayName) {
            displayNameEl.textContent = updates.displayName;
        }
        
        if (userHandleEl && updates.username) {
            userHandleEl.textContent = '@' + updates.username;
        }
        
        if (dropdownNameEl && updates.displayName) {
            dropdownNameEl.textContent = updates.displayName;
        }
        
        if (dropdownHandleEl && updates.username) {
            dropdownHandleEl.textContent = '@' + updates.username;
        }
    }
    
    // Validate URL
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
});