document.addEventListener("DOMContentLoaded", function() {
    // 네비게이션 링크 마우스오버 효과
    const navLinks = document.querySelectorAll(".nav-links a");
    
    navLinks.forEach(link => {
        link.addEventListener("mouseover", function() {
            this.style.color = "#fca311";
        });
        link.addEventListener("mouseout", function() {
            this.style.color = "white";
        });
    });
    
    // 버튼 클릭 시 로그인 페이지로 이동
    const button = document.querySelector(".btn");
    if (button) {
        button.addEventListener("click", function() {
            alert("로그인 페이지로 이동합니다.");
            window.location.href = "login.html";
        });
    }
    
    // 푸터 아이콘 호버 애니메이션
    const footerIcons = document.querySelectorAll(".footer-icons img");
    
    footerIcons.forEach(icon => {
        icon.addEventListener("mouseover", function() {
            this.style.transform = "scale(1.1)";
        });
        icon.addEventListener("mouseout", function() {
            this.style.transform = "scale(1)";
        });
    });
    
    // 모바일 메뉴 토글
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", function() {
            navMenu.classList.toggle("active");
        });
    }
});
