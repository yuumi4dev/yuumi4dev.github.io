document.addEventListener('DOMContentLoaded', function() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    // Check if theme preference exists in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Check for system preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme based on preference
    if (savedTheme) {
        // Use saved preference
        setTheme(savedTheme);
    } else {
        // Use system preference
        const initialTheme = prefersDarkMode ? 'dark' : 'light';
        setTheme(initialTheme);
        localStorage.setItem('theme', initialTheme);
    }
    
    // Handle theme toggle button click
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Set new theme
            setTheme(newTheme);
            
            // Save preference
            localStorage.setItem('theme', newTheme);
        });
    }
    
    // Set theme and update button
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeButton(theme);
    }
    
    // Update theme toggle button appearance
    function updateThemeButton(theme) {
        if (!themeToggleBtn) return;
        
        // Update button icon
        themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        // Only change theme if user hasn't set a preference
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            setTheme(newTheme);
        }
    });
});