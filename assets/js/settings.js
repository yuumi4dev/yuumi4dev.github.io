document.addEventListener('DOMContentLoaded', function() {
    // 설정 폼 요소
    const displayNameInput = document.getElementById('display-name');
    const usernameInput = document.getElementById('username');
    const userEmailInput = document.getElementById('user-email');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    
    // 비밀번호 변경 요소
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const changePasswordBtn = document.getElementById('change-password-btn');
    
    // 계정 삭제 버튼
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    
    // 알림 메시지
    const settingsMessage = document.getElementById('settings-message');
    
    // 현재 페이지가 설정 페이지인지 확인
    const isSettingsPage = window.location.pathname.includes('settings.html');
    
    if (!isSettingsPage) return;
    
    // Firebase 인증 상태 변경 감지
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // 사용자 정보 로드
            loadUserData(user);
            
            // 프로필 저장 버튼 이벤트 리스너
            if (saveProfileBtn) {
                saveProfileBtn.addEventListener('click', function() {
                    saveUserProfile(user);
                });
            }
            
            // 비밀번호 변경 버튼 이벤트 리스너
            if (changePasswordBtn) {
                changePasswordBtn.addEventListener('click', function() {
                    changePassword(user);
                });
            }
            
            // 계정 삭제 버튼 이벤트 리스너
            if (deleteAccountBtn) {
                deleteAccountBtn.addEventListener('click', function() {
                    confirmDeleteAccount(user);
                });
            }
        }
    });
    
    // 사용자 데이터 로드 함수
    function loadUserData(user) {
        // 이메일 표시
        if (userEmailInput) {
            userEmailInput.value = user.email;
        }
        
        // 표시 이름 설정
        if (displayNameInput && user.displayName) {
            displayNameInput.value = user.displayName;
        }
        
        // Firestore에서 추가 데이터 불러오기
        if (firebase.firestore) {
            firebase.firestore().collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists) {
                        const userData = doc.data();
                        
                        // 사용자명 설정
                        if (usernameInput && userData.username) {
                            usernameInput.value = userData.username;
                        } else if (usernameInput) {
                            // 기본값 설정 (이메일에서 추출)
                            const emailName = user.email.split('@')[0];
                            usernameInput.value = emailName.toLowerCase().replace(/[^a-z0-9_]/g, '');
                        }
                        
                        // 표시 이름 설정 (Firestore 데이터 우선)
                        if (displayNameInput && userData.displayName) {
                            displayNameInput.value = userData.displayName;
                        }
                    }
                })
                .catch(error => {
                    console.error('사용자 데이터 로드 오류:', error);
                    showMessage('사용자 정보를 불러오는 중 오류가 발생했습니다.', 'error');
                });
        }
    }
    
    // 사용자 프로필 저장 함수
    function saveUserProfile(user) {
        // 입력값 가져오기
        const displayName = displayNameInput.value.trim();
        const username = usernameInput.value.trim();
        
        // 유효성 검사
        if (!displayName) {
            showMessage('닉네임을 입력해주세요.', 'error');
            return;
        }
        
        if (!username) {
            showMessage('사용자 ID를 입력해주세요.', 'error');
            return;
        }
        
        // 사용자 ID 유효성 검사 (영문, 숫자, 밑줄만 허용)
        const usernameRegex = /^[a-z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            showMessage('사용자 ID는 영문 소문자, 숫자, 밑줄(_)만 사용 가능합니다.', 'error');
            return;
        }
        
        // 로딩 메시지 표시
        showMessage('저장 중...', 'info');
        
        // 사용자 ID 중복 확인
        if (firebase.firestore) {
            firebase.firestore().collection('usernames')
                .doc(username)
                .get()
                .then(doc => {
                    if (doc.exists && doc.data().uid !== user.uid) {
                        showMessage('이미 사용 중인 사용자 ID입니다.', 'error');
                        return;
                    }
                    
                    // Firebase Auth에 표시 이름 업데이트
                    user.updateProfile({
                        displayName: displayName
                    }).then(() => {
                        console.log('프로필 업데이트 성공');
                        
                        // Firestore에 사용자 정보 업데이트
                        if (firebase.firestore) {
                            // 기존 사용자명 가져오기
                            firebase.firestore().collection('users').doc(user.uid).get()
                                .then(doc => {
                                    const oldUsername = doc.exists && doc.data().username ? doc.data().username : null;
                                    
                                    // 새 정보로 사용자 문서 업데이트
                                    firebase.firestore().collection('users').doc(user.uid).set({
                                        displayName: displayName,
                                        username: username,
                                        updatedAt: new Date()
                                    }, { merge: true })
                                    .then(() => {
                                        // 사용자명 매핑 업데이트
                                        const batch = firebase.firestore().batch();
                                        
                                        // 새 사용자명 추가
                                        batch.set(firebase.firestore().collection('usernames').doc(username), {
                                            uid: user.uid
                                        });
                                        
                                        // 이전 사용자명 삭제 (다른 경우에만)
                                        if (oldUsername && oldUsername !== username) {
                                            batch.delete(firebase.firestore().collection('usernames').doc(oldUsername));
                                        }
                                        
                                        batch.commit()
                                            .then(() => {
                                                showMessage('프로필이 성공적으로 저장되었습니다.', 'success');
                                                
                                                // 헤더 프로필 정보 업데이트
                                                const userNameElement = document.getElementById('user-name');
                                                const userIdElement = document.getElementById('user-id');
                                                
                                                if (userNameElement) userNameElement.textContent = displayName;
                                                if (userIdElement) userIdElement.textContent = '@' + username;
                                            })
                                            .catch(error => {
                                                console.error('사용자명 매핑 업데이트 오류:', error);
                                                showMessage('사용자 ID 업데이트 중 오류가 발생했습니다.', 'error');
                                            });
                                    })
                                    .catch(error => {
                                        console.error('사용자 정보 저장 오류:', error);
                                        showMessage('사용자 정보 저장 중 오류가 발생했습니다.', 'error');
                                    });
                                })
                                .catch(error => {
                                    console.error('기존 사용자 정보 로드 오류:', error);
                                    showMessage('사용자 정보 로드 중 오류가 발생했습니다.', 'error');
                                });
                        }
                    }).catch(error => {
                        console.error('프로필 업데이트 오류:', error);
                        showMessage('프로필 업데이트 중 오류가 발생했습니다.', 'error');
                    });
                })
                .catch(error => {
                    console.error('사용자 ID 중복 확인 오류:', error);
                    showMessage('사용자 ID 확인 중 오류가 발생했습니다.', 'error');
                });
        }
    }
    
    // 비밀번호 변경 함수
    function changePassword(user) {
        // 입력값 가져오기
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // 유효성 검사
        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage('모든 필드를 입력해주세요.', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showMessage('새 비밀번호가 일치하지 않습니다.', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showMessage('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
            return;
        }
        
        // 로딩 메시지 표시
        showMessage('비밀번호 변경 중...', 'info');
        
        // 현재 사용자 재인증
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        
        user.reauthenticateWithCredential(credential)
            .then(() => {
                // 재인증 성공, 비밀번호 변경
                user.updatePassword(newPassword)
                    .then(() => {
                        // 비밀번호 변경 성공
                        showMessage('비밀번호가 성공적으로 변경되었습니다.', 'success');
                        
                        // 입력 필드 초기화
                        currentPasswordInput.value = '';
                        newPasswordInput.value = '';
                        confirmPasswordInput.value = '';
                    })
                    .catch(error => {
                        console.error('비밀번호 변경 오류:', error);
                        showMessage('비밀번호 변경 중 오류가 발생했습니다.', 'error');
                    });
            })
            .catch(error => {
                console.error('재인증 오류:', error);
                showMessage('현재 비밀번호가 일치하지 않습니다.', 'error');
            });
    }
    
    // 계정 삭제 확인 함수
    function confirmDeleteAccount(user) {
        if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.')) {
            // 사용자 비밀번호 재확인 (보안 강화)
            const password = prompt('계정 삭제를 확인하려면 비밀번호를 입력하세요:');
            
            if (password) {
                // 재인증
                const credential = firebase.auth.EmailAuthProvider.credential(
                    user.email,
                    password
                );
                
                user.reauthenticateWithCredential(credential)
                    .then(() => {
                        // Firestore 데이터 삭제
                        if (firebase.firestore) {
                            deleteUserData(user.uid)
                                .then(() => {
                                    // 사용자 계정 삭제
                                    user.delete()
                                        .then(() => {
                                            alert('계정이 성공적으로 삭제되었습니다.');
                                            window.location.href = 'index.html';
                                        })
                                        .catch(error => {
                                            console.error('계정 삭제 오류:', error);
                                            showMessage('계정 삭제 중 오류가 발생했습니다.', 'error');
                                        });
                                })
                                .catch(error => {
                                    console.error('사용자 데이터 삭제 오류:', error);
                                    showMessage('사용자 데이터 삭제 중 오류가 발생했습니다.', 'error');
                                });
                        } else {
                            // Firestore가 없는 경우 바로 계정 삭제
                            user.delete()
                                .then(() => {
                                    alert('계정이 성공적으로 삭제되었습니다.');
                                    window.location.href = 'index.html';
                                })
                                .catch(error => {
                                    console.error('계정 삭제 오류:', error);
                                    showMessage('계정 삭제 중 오류가 발생했습니다.', 'error');
                                });
                        }
                    })
                    .catch(error => {
                        console.error('재인증 오류:', error);
                        showMessage('비밀번호가 일치하지 않습니다.', 'error');
                    });
            }
        }
    }
    
    // 사용자 데이터 삭제 함수
    function deleteUserData(uid) {
        return new Promise((resolve, reject) => {
            if (!firebase.firestore) return resolve();
            
            // 사용자 문서 삭제 전에 사용자명 정보 가져오기
            firebase.firestore().collection('users').doc(uid).get()
                .then(doc => {
                    if (doc.exists && doc.data().username) {
                        const username = doc.data().username;
                        
                        // 트랜잭션으로 여러 컬렉션의 데이터 삭제
                        const batch = firebase.firestore().batch();
                        
                        // 사용자 문서 삭제
                        batch.delete(firebase.firestore().collection('users').doc(uid));
                        
                        // 사용자명 매핑 삭제
                        batch.delete(firebase.firestore().collection('usernames').doc(username));
                        
                        // 추후 다른 사용자 관련 데이터 삭제 추가
                        
                        batch.commit()
                            .then(() => {
                                resolve();
                            })
                            .catch(error => {
                                reject(error);
                            });
                    } else {
                        // 사용자명 정보가 없는 경우 사용자 문서만 삭제
                        firebase.firestore().collection('users').doc(uid).delete()
                            .then(() => {
                                resolve();
                            })
                            .catch(error => {
                                reject(error);
                            });
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
    
    // 알림 메시지 표시 함수
    function showMessage(message, type) {
        if (!settingsMessage) return;
        
        // 클래스 초기화
        settingsMessage.className = 'settings-message';
        
        // 타입에 따라 클래스 추가
        if (type === 'success') {
            settingsMessage.classList.add('success');
        } else if (type === 'error') {
            settingsMessage.classList.add('error');
        }
        
        // 메시지 설정
        settingsMessage.textContent = message;
        
        // 메시지 표시
        settingsMessage.style.display = 'block';
        
        // 성공 메시지는 자동으로 사라지도록 설정
        if (type === 'success') {
            setTimeout(() => {
                settingsMessage.style.display = 'none';
            }, 5000);
        }
    }
});