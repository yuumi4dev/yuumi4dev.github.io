document.addEventListener('DOMContentLoaded', function() {
    // DOM Element References
    // Navbar User Info
    const loginContainer = document.getElementById('login-container');
    const userContainer = document.getElementById('user-container');
    const displayName = document.getElementById('display-name');
    const userHandle = document.getElementById('user-handle');
    const dropdownName = document.getElementById('dropdown-name');
    const dropdownHandle = document.getElementById('dropdown-handle');
    const avatarInitial = document.querySelector('.avatar-initial');
    const logoutBtn = document.getElementById('logout-btn');
    const profileDropdownBtn = document.getElementById('profile-dropdown-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    // Auth Forms (only on auth.html)
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const mainAuthCard = document.getElementById('main-auth-card');
    const resetPasswordCard = document.getElementById('reset-password-card');
    const socialAuthCard = document.getElementById('social-auth-card');
    const authMessage = document.getElementById('auth-message');
    
    // Login Form Elements
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginButton = document.getElementById('login-button');
    const googleLoginButton = document.getElementById('google-login');
    const githubLoginButton = document.getElementById('github-login');
    
    // Signup Form Elements
    const signupName = document.getElementById('signup-name');
    const signupUsername = document.getElementById('signup-username');
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');
    const signupConfirmPassword = document.getElementById('signup-confirm-password');
    const signupButton = document.getElementById('signup-button');
    const googleSignupButton = document.getElementById('google-signup');
    const githubSignupButton = document.getElementById('github-signup');
    const usernameStatus = document.getElementById('username-status');
    
    // Reset Password Elements
    const resetEmail = document.getElementById('reset-email');
    const resetButton = document.getElementById('reset-button');
    const backToLoginButton = document.getElementById('back-to-login');
    
    // Social Auth Additional Info Elements
    const socialAuthName = document.getElementById('social-auth-name');
    const socialAuthUsername = document.getElementById('social-auth-username');
    const completeSocialAuth = document.getElementById('complete-social-auth');
    const socialUsernameStatus = document.getElementById('social-username-status');
    
    // Profile Dropdown Toggle
    if (profileDropdownBtn) {
        profileDropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (profileDropdown && profileDropdown.classList.contains('active')) {
                if (!profileDropdown.contains(e.target) && !profileDropdownBtn.contains(e.target)) {
                    profileDropdown.classList.remove('active');
                }
            }
        });
    }
    
    // Auth State Change Listener
    auth.onAuthStateChanged(async function(user) {
        if (user) {
            // User is signed in
            try {
                // Get user data from Firestore
                const userDoc = await db.collection('users').doc(user.uid).get();
                let userData = userDoc.data() || {};
                
                // If user document doesn't exist, create it with basic info
                if (!userDoc.exists) {
                    userData = {
                        email: user.email,
                        displayName: user.displayName || '',
                        username: generateUsername(user.email),
                        createdAt: new Date()
                    };
                    
                    await db.collection('users').doc(user.uid).set(userData);
                }
                
                // If user doesn't have a username yet (social auth), show complete profile form
                if (socialAuthCard && (!userData.username || !userData.displayName)) {
                    showSocialAuthCompletion(user, userData);
                    return;
                }
                
                // Update UI with user info
                updateUserUI(userData);
                
                // Store user data in localStorage for easy access
                localStorage.setItem('userData', JSON.stringify({
                    uid: user.uid,
                    email: userData.email,
                    displayName: userData.displayName,
                    username: userData.username
                }));
                
                // If on auth page, redirect to home page
                if (window.location.pathname.includes('auth.html')) {
                    showMessage('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        } else {
            // User is signed out
            if (loginContainer) loginContainer.style.display = 'block';
            if (userContainer) userContainer.style.display = 'none';
            
            // Clear user data from localStorage
            localStorage.removeItem('userData');
        }
    });
    
    // Update User UI
    function updateUserUI(userData) {
        if (loginContainer) loginContainer.style.display = 'none';
        if (userContainer) userContainer.style.display = 'flex';
        
        // Set display name and username
        if (displayName) displayName.textContent = userData.displayName || 'User';
        if (userHandle) userHandle.textContent = '@' + (userData.username || 'user');
        
        // Update dropdown info
        if (dropdownName) dropdownName.textContent = userData.displayName || 'User';
        if (dropdownHandle) dropdownHandle.textContent = '@' + (userData.username || 'user');
        
        // Set avatar initial
        if (avatarInitial) {
            const initial = userData.displayName ? userData.displayName.charAt(0).toUpperCase() : 'U';
            avatarInitial.textContent = initial;
        }
    }
    
    // Logout Functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            auth.signOut().then(function() {
                // Sign-out successful
                if (profileDropdown) profileDropdown.classList.remove('active');
                console.log('User signed out successfully');
            }).catch(function(error) {
                // An error happened
                console.error('Sign out error:', error);
            });
        });
    }
    
    // Auth Tabs Toggle (auth.html only)
    if (authTabs && authTabs.length > 0) {
        authTabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs and forms
                authTabs.forEach(t => t.classList.remove('active'));
                authForms.forEach(f => f.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding form
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId + '-form').classList.add('active');
                
                // Hide message
                if (authMessage) {
                    authMessage.style.display = 'none';
                    authMessage.className = 'auth-message';
                }
            });
        });
    }
    
    // Username Availability Check
    let usernameCheckTimeout;
    let lastCheckedUsername = '';
    
    function setupUsernameCheck(usernameInput, statusElement) {
        if (!usernameInput || !statusElement) return;
        
        usernameInput.addEventListener('input', function() {
            const username = this.value.trim().toLowerCase();
            
            // Clear previous timeout
            clearTimeout(usernameCheckTimeout);
            
            // Clear status
            statusElement.textContent = '';
            statusElement.className = 'username-status';
            
            // Validate username format
            if (username.length < 3) {
                statusElement.textContent = 'Username must be at least 3 characters';
                statusElement.classList.add('username-unavailable');
                return;
            }
            
            if (!/^[a-z0-9_]+$/.test(username)) {
                statusElement.textContent = 'Username can only contain letters, numbers, and underscores';
                statusElement.classList.add('username-unavailable');
                return;
            }
            
            // If username is same as last checked, don't check again
            if (username === lastCheckedUsername) return;
            
            // Show checking status
            statusElement.textContent = 'Checking availability...';
            statusElement.classList.add('username-checking');
            
            // Check username availability after 500ms delay
            usernameCheckTimeout = setTimeout(() => {
                checkUsernameAvailability(username, statusElement);
                lastCheckedUsername = username;
            }, 500);
        });
    }
    
    // Setup username check for both forms
    setupUsernameCheck(signupUsername, usernameStatus);
    setupUsernameCheck(socialAuthUsername, socialUsernameStatus);
    
    async function checkUsernameAvailability(username, statusElement) {
        try {
            const querySnapshot = await db.collection('users')
                .where('username', '==', username)
                .limit(1)
                .get();
            
            if (querySnapshot.empty) {
                // Username is available
                statusElement.textContent = 'Username is available';
                statusElement.className = 'username-status username-available';
            } else {
                // Username is taken
                statusElement.textContent = 'Username is already taken';
                statusElement.className = 'username-status username-unavailable';
            }
        } catch (error) {
            console.error('Error checking username:', error);
            statusElement.textContent = 'Error checking username';
            statusElement.className = 'username-status username-unavailable';
        }
    }
    
    // Login Form Submit
    if (loginButton) {
        loginButton.addEventListener('click', async function() {
            const email = loginEmail.value.trim();
            const password = loginPassword.value;
            
            // Validate inputs
            if (!email || !password) {
                showMessage('Please enter your email and password', 'error');
                return;
            }
            
            try {
                // Sign in with email and password
                await auth.signInWithEmailAndPassword(email, password);
                
                // Success is handled by auth state change listener
            } catch (error) {
                // Handle login errors
                let errorMessage;
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email address';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email format';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'This account has been disabled';
                        break;
                    default:
                        errorMessage = error.message;
                }
                showMessage(errorMessage, 'error');
            }
        });
    }
    
    // Sign Up Form Submit
    if (signupButton) {
        signupButton.addEventListener('click', async function() {
            const name = signupName.value.trim();
            const username = signupUsername.value.trim().toLowerCase();
            const email = signupEmail.value.trim();
            const password = signupPassword.value;
            const confirmPassword = signupConfirmPassword.value;
            
            // Validate inputs
            if (!name || !username || !email || !password || !confirmPassword) {
                showMessage('Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                showMessage('Password must be at least 6 characters', 'error');
                return;
            }
            
            if (username.length < 3 || !/^[a-z0-9_]+$/.test(username)) {
                showMessage('Username must be at least 3 characters and can only contain letters, numbers, and underscores', 'error');
                return;
            }
            
            // Check username availability
            try {
                const usernameSnapshot = await db.collection('users')
                    .where('username', '==', username)
                    .limit(1)
                    .get();
                
                if (!usernameSnapshot.empty) {
                    showMessage('This username is already taken', 'error');
                    return;
                }
                
                // Create user with email and password
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // Update profile with display name
                await user.updateProfile({
                    displayName: name
                });
                
                // Store additional user data in Firestore
                await db.collection('users').doc(user.uid).set({
                    displayName: name,
                    username: username,
                    email: email,
                    createdAt: new Date()
                });
                
                // Success is handled by auth state change listener
            } catch (error) {
                // Handle signup errors
                let errorMessage;
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'This email is already in use';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email format';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak';
                        break;
                    default:
                        errorMessage = error.message;
                }
                showMessage(errorMessage, 'error');
            }
        });
    }
    
    // Google Login/Signup
    function handleGoogleAuth() {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        auth.signInWithPopup(provider)
            .then(function(result) {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = result.credential;
                const token = credential.accessToken;
                const user = result.user;
                
                // If it's a new user or user doesn't have a username, handle profile completion
                if (result.additionalUserInfo.isNewUser || !user.displayName) {
                    if (socialAuthCard) {
                        showSocialAuthCompletion(user, {
                            email: user.email,
                            displayName: user.displayName || ''
                        });
                    } else {
                        // If not on auth page, redirect to auth page for profile completion
                        localStorage.setItem('pendingProfileCompletion', 'true');
                        window.location.href = 'auth.html';
                    }
                }
            }).catch(function(error) {
                // Handle Errors here
                const errorMessage = error.message;
                const errorCode = error.code;
                const email = error.email;
                const credential = error.credential;
                
                showMessage(`Google sign in error: ${errorMessage}`, 'error');
            });
    }
    
    // GitHub Login/Signup
    function handleGitHubAuth() {
        const provider = new firebase.auth.GithubAuthProvider();
        
        auth.signInWithPopup(provider)
            .then(function(result) {
                // This gives you a GitHub Access Token. You can use it to access the GitHub API.
                const credential = result.credential;
                const token = credential.accessToken;
                const user = result.user;
                
                // If it's a new user or user doesn't have a username, handle profile completion
                if (result.additionalUserInfo.isNewUser || !result.additionalUserInfo.username) {
                    if (socialAuthCard) {
                        showSocialAuthCompletion(user, {
                            email: user.email,
                            displayName: user.displayName || '',
                            // GitHub often provides a username we can suggest
                            username: result.additionalUserInfo.username || ''
                        });
                    } else {
                        // If not on auth page, redirect to auth page for profile completion
                        localStorage.setItem('pendingProfileCompletion', 'true');
                        window.location.href = 'auth.html';
                    }
                }
            }).catch(function(error) {
                // Handle Errors here
                const errorMessage = error.message;
                const errorCode = error.code;
                const email = error.email;
                const credential = error.credential;
                
                showMessage(`GitHub sign in error: ${errorMessage}`, 'error');
            });
    }
    
    // Attach Google auth handlers
    if (googleLoginButton) googleLoginButton.addEventListener('click', handleGoogleAuth);
    if (googleSignupButton) googleSignupButton.addEventListener('click', handleGoogleAuth);
    
    // Attach GitHub auth handlers
    if (githubLoginButton) githubLoginButton.addEventListener('click', handleGitHubAuth);
    if (githubSignupButton) githubSignupButton.addEventListener('click', handleGitHubAuth);
    
    // Show Social Auth Completion Form
    function showSocialAuthCompletion(user, userData) {
        if (!socialAuthCard || !mainAuthCard) return;
        
        // Hide main auth card and show social auth card
        mainAuthCard.style.display = 'none';
        resetPasswordCard.style.display = 'none';
        socialAuthCard.style.display = 'block';
        
        // Prefill with available data
        if (socialAuthName) socialAuthName.value = userData.displayName || '';
        if (socialAuthUsername) socialAuthUsername.value = userData.username || generateUsername(userData.email);
        
        // Check username availability
        if (socialAuthUsername && socialAuthUsername.value) {
            checkUsernameAvailability(socialAuthUsername.value, socialUsernameStatus);
        }
        
        // Handle form submission
        if (completeSocialAuth) {
            completeSocialAuth.addEventListener('click', async function() {
                const name = socialAuthName.value.trim();
                const username = socialAuthUsername.value.trim().toLowerCase();
                
                // Validate inputs
                if (!name || !username) {
                    showMessage('Please fill in all fields', 'error');
                    return;
                }
                
                if (username.length < 3 || !/^[a-z0-9_]+$/.test(username)) {
                    showMessage('Username must be at least 3 characters and can only contain letters, numbers, and underscores', 'error');
                    return;
                }
                
                try {
                    // Check username availability again
                    const usernameSnapshot = await db.collection('users')
                        .where('username', '==', username)
                        .limit(1)
                        .get();
                    
                    if (!usernameSnapshot.empty) {
                        showMessage('This username is already taken', 'error');
                        return;
                    }
                    
                    // Update profile with display name
                    await user.updateProfile({
                        displayName: name
                    });
                    
                    // Store user data in Firestore
                    await db.collection('users').doc(user.uid).set({
                        displayName: name,
                        username: username,
                        email: user.email,
                        createdAt: new Date(),
                        authProvider: user.providerData[0].providerId
                    }, { merge: true });
                    
                    // Show success message and redirect
                    showMessage('Profile completed successfully! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } catch (error) {
                    console.error('Error completing profile:', error);
                    showMessage('Error completing profile: ' + error.message, 'error');
                }
            });
        }
    }
    
    // Password Reset Functionality
    if (resetButton) {
        resetButton.addEventListener('click', async function() {
            const email = resetEmail.value.trim();
            
            if (!email) {
                showMessage('Please enter your email address', 'error');
                return;
            }
            
            try {
                await auth.sendPasswordResetEmail(email);
                showMessage('Password reset link sent! Check your email.', 'success');
            } catch (error) {
                let errorMessage;
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email address';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email format';
                        break;
                    default:
                        errorMessage = error.message;
                }
                showMessage(errorMessage, 'error');
            }
        });
    }
    
    // Back to Login Button
    if (backToLoginButton) {
        backToLoginButton.addEventListener('click', function() {
            resetPasswordCard.style.display = 'none';
            mainAuthCard.style.display = 'block';
            
            // Set login tab as active
            if (authTabs[0]) authTabs[0].click();
        });
    }
    
    // Add "Forgot Password" Link
    if (loginForm) {
        const forgotPasswordLink = document.createElement('a');
        forgotPasswordLink.href = '#';
        forgotPasswordLink.className = 'forgot-password-link';
        forgotPasswordLink.textContent = 'Forgot password?';
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Hide main auth card and show reset password card
            mainAuthCard.style.display = 'none';
            resetPasswordCard.style.display = 'block';
        });
        
        // Add to login form
        const formAction = loginForm.querySelector('.form-action');
        if (formAction) {
            formAction.insertAdjacentElement('afterend', forgotPasswordLink);
        }
    }
    
    // Helper Functions
    
    // Show message in auth page
    function showMessage(message, type) {
        if (!authMessage) return;
        
        authMessage.textContent = message;
        authMessage.className = 'auth-message';
        authMessage.classList.add(type);
        authMessage.style.display = 'block';
    }
    
    // Generate a username from email
    function generateUsername(email) {
        if (!email) return '';
        
        // Get the part before @ and remove non-alphanumeric chars
        let username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        
        // Add random numbers if username is too short
        if (username.length < 3) {
            username += Math.floor(Math.random() * 1000);
        }
        
        return username.toLowerCase();
    }
    
    // Check for pending profile completion
    if (socialAuthCard && localStorage.getItem('pendingProfileCompletion')) {
        localStorage.removeItem('pendingProfileCompletion');
        
        // Current user should be set by onAuthStateChanged
        const user = auth.currentUser;
        if (user) {
            showSocialAuthCompletion(user, {
                email: user.email,
                displayName: user.displayName || ''
            });
        }
    }
});