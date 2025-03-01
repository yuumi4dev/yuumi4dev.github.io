document.addEventListener('DOMContentLoaded', function() {
    // 요소 참조
    const userLoggedInContainer = document.getElementById('user-logged-in');
    const userLoggedOutContainer = document.getElementById('user-logged-out');
    const profileButton = document.getElementById('profile-button');
    const profileDropdown = document.getElementById('profile-dropdown');
    const userName = document.getElementById('user-name');
    const userId = document.getElementById('user-id');
    const profileInitial = document.getElementById('profile-initial');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Firebase 인증 상태 변경 감지
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // 로그인 상태
            if (userLoggedInContainer) userLoggedInContainer.style.display = 'block';
            if (userLoggedOutContainer) userLoggedOutContainer.style.display = 'none';
            
            // 사용자 정보 표시
            updateUserProfile(user);
            
            // Firestore에서 추가 정보 가져오기
            if (firebase.firestore) {
                firebase.firestore().collection('users').doc(user.uid).get()
                    .then(doc => {
                        if (doc.exists) {
                            const userData = doc.data();
                            
                            // 사용자 ID (@username) 업데이트
                            if (userData.username && userId) {
                                userId.textContent = '@' + userData.username;
                            }
                            
                            // 사용자 이름 업데이트 (Firestore 데이터 우선)
                            if (userData.displayName && userName) {
                                userName.textContent = userData.displayName;
                            }
                            
                            // 초기 문자 업데이트
                            if (profileInitial && userData.displayName) {
                                profileInitial.textContent = userData.displayName.charAt(0).toUpperCase();
                            }
                        }
                    })
                    .catch(error => {
                        console.error('사용자 정보 가져오기 오류:', error);
                    });
            }
        } else {
            // 로그아웃 상태
            if (userLoggedInContainer) userLoggedInContainer.style.display = 'none';
            if (userLoggedOutContainer) userLoggedOutContainer.style.display = 'block';
        }
    });
    
    // 프로필 드롭다운 토글
    if (profileButton) {
        profileButton.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
    }
    
    // 문서 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        if (profileDropdown && profileDropdown.classList.contains('show') &&
            !profileButton.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });
    
    // 로그아웃 버튼 이벤트 리스너
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            firebase.auth().signOut()
                .then(() => {
                    console.log('로그아웃 성공');
                    
                    // 로컬 스토리지에서 사용자 정보 삭제
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('lastLogin');
                    
                    // 홈페이지로 리디렉션 (선택 사항)
                    if (!window.location.pathname.includes('index.html')) {
                        window.location.href = 'index.html';
                    }
                })
                .catch(error => {
                    console.error('로그아웃 오류:', error);
                });
        });
    }
    
    // 사용자 프로필 정보 업데이트 함수
    function updateUserProfile(user) {
        // 사용자 이름 표시
        if (userName) {
            if (user.displayName) {
                userName.textContent = user.displayName;
            } else {
                // 이름이 없으면 이메일의 앞부분 사용
                const emailName = user.email.split('@')[0];
                userName.textContent = emailName;
            }
        }
        
        // 사용자 ID 표시 (기본값)
        if (userId) {
            const emailName = user.email.split('@')[0];
            userId.textContent = '@' + emailName.toLowerCase().replace(/[^a-z0-9_]/g, '');
        }
        
        // 프로필 이니셜 설정
        if (profileInitial) {
            if (user.displayName) {
                profileInitial.textContent = user.displayName.charAt(0).toUpperCase();
            } else {
                profileInitial.textContent = user.email.charAt(0).toUpperCase();
            }
        }
    }
    
    // 로그인 상태에 따라 현재 페이지 검사 (설정 페이지 접근 제한)
    if (window.location.pathname.includes('settings.html')) {
        const settingsLoading = document.getElementById('settings-loading');
        const settingsForm = document.getElementById('settings-form');
        const loginRequiredMessage = document.getElementById('login-required-message');
        
        setTimeout(() => {
            if (firebase.auth().currentUser) {
                // 로그인 상태 - 설정 폼 표시
                if (settingsLoading) settingsLoading.style.display = 'none';
                if (settingsForm) settingsForm.style.display = 'block';
                if (loginRequiredMessage) loginRequiredMessage.style.display = 'none';
            } else {
                // 비로그인 상태 - 로그인 필요 메시지 표시
                if (settingsLoading) settingsLoading.style.display = 'none';
                if (settingsForm) settingsForm.style.display = 'none';
                if (loginRequiredMessage) loginRequiredMessage.style.display = 'flex';
            }
        }, 1000); // 잠시 로딩 표시 후 상태 확인
    }
});