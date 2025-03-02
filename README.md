# yuumi4dev.github.io

# 포트폴리오 사이트

GitHub Pages와 Firebase를 활용한 포트폴리오 & 블로그 웹사이트입니다.

## 기능

- 🏠 **홈페이지**: 자기소개 및 주요 프로젝트 하이라이트
- 📝 **블로그**: 카테고리, 태그 및 검색 기능을 갖춘 블로그
- 🎨 **포트폴리오**: 필터링 가능한 포트폴리오 프로젝트 갤러리
- 💻 **프로젝트**: 상세한 프로젝트 소개 페이지
- 🔐 **인증 시스템**: Firebase를 활용한 로그인/회원가입 기능
- 🌓 **다크 모드**: 라이트/다크 테마 지원
- 📱 **반응형 디자인**: 모든 디바이스에서 최적화된 레이아웃

## 기술 스택

- **프론트엔드**: HTML5, CSS3, JavaScript (바닐라)
- **인증 및 데이터베이스**: Firebase Authentication, Firestore
- **폰트**: SD산돌고딕 (Apple SD Gothic)
- **호스팅**: GitHub Pages
- **버전 관리**: Git/GitHub

## 설치 및 실행 방법

1. 저장소 복제
   ```bash
   git clone <저장소-URL>
   cd portfolio-site
   ```

2. 로컬에서 실행
   - 로컬 서버를 사용하거나 (예: Live Server VS Code 확장) 또는 `index.html` 파일을 직접 브라우저에서 열기

3. Firebase 설정
   - Firebase 콘솔(https://console.firebase.google.com/)에서 새 프로젝트 생성
   - 웹 앱 추가 및 Firebase 구성 정보 받기
   - `assets/js/firebase-init.js` 파일에 구성 정보 추가

4. GitHub Pages 배포
   - 저장소 설정 > Pages에서 GitHub Pages 활성화
   - main 브랜치 또는 gh-pages 브랜치를 배포 소스로 설정

## 프로젝트 구조

```
portfolio-site/
│
├── index.html              # 메인 페이지 (홈)
├── blog.html               # 블로그 목록 페이지
├── blog-post.html          # 블로그 상세 페이지 템플릿
├── portfolio.html          # 포트폴리오 페이지
├── projects.html           # 프로젝트 상세 페이지
├── auth.html               # 로그인/회원가입 페이지
│
├── assets/
│   ├── css/                # 스타일시트
│   ├── js/                 # 자바스크립트 파일
│   ├── fonts/              # SD산돌고딕 폰트 파일
│   └── images/             # 이미지 파일
│
└── .github/
    └── workflows/          # GitHub Actions 워크플로우
```

## Firebase 인증 설정

1. Firebase 콘솔에서 Authentication 섹션 열기
2. 이메일/비밀번호 로그인 방식 활성화
3. Google, GitHub 소셜 로그인 설정 (선택 사항)
4. GitHub OAuth 앱 설정 및 Firebase 콘솔에 클라이언트 ID와 비밀키 추가

## 커스터마이징

- **콘텐츠 수정**: HTML 파일에서 텍스트 및 이미지 변경
- **스타일 변경**: `assets/css/` 디렉토리의 CSS 파일 수정
- **데이터 연동**: Firebase Firestore를 사용하여 블로그 포스트 및 포트폴리오 데이터 관리
- **테마 변경**: `assets/css/main.css`의 CSS 변수를 수정하여 색상 테마 변경

## 폰트 사용법

이 프로젝트는 SD산돌고딕 폰트를 사용합니다. 폰트 파일은 라이선스 문제로 저장소에 포함되지 않습니다. 다음 방법으로 폰트를 추가할 수 있습니다:

1. Apple SD Gothic Neo 폰트 파일 준비
2. `assets/fonts/SDGothic/` 디렉토리에 폰트 파일 저장
3. 또는 `main.css` 파일의 @font-face 규칙을 수정하여 다른 폰트를 사용

## 라이선스

이 프로젝트는 MIT 라이선스에 따라 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.
