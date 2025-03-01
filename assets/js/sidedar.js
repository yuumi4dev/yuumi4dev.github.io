document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    // Ensure elements exist before trying to manipulate them
    if (!sidebarToggleBtn || !sidebar || !mainContent) {
        console.error('Required DOM elements not found for sidebar toggle functionality');
        return;
    }
    
    console.log('Sidebar JS loaded', { sidebarToggleBtn, sidebar, mainContent });
    
    // Check for saved sidebar state
    const sidebarCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    
    // Apply initial state
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        sidebarToggleBtn.classList.add('active');
        mainContent.classList.add('expanded');
    }
    
    // Mobile view detection
    const isMobileView = () => window.innerWidth <= 768;
    
    // Toggle sidebar function for desktop
    function toggleDesktopSidebar() {
        console.log('Toggle desktop sidebar');
        sidebar.classList.toggle('collapsed');
        sidebarToggleBtn.classList.toggle('active');
        mainContent.classList.toggle('expanded');
        
        // Save state to localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebar-collapsed', isCollapsed);
    }
    
    // Toggle sidebar function for mobile
    function toggleMobileSidebar(e) {
        console.log('Toggle mobile sidebar');
        if (e) e.stopPropagation();
        sidebarToggleBtn.classList.toggle('active');
        sidebar.classList.toggle('open');
        document.body.classList.toggle('sidebar-open');
    }
    
    // Initial setup based on view size
    function setupSidebarBehavior() {
        // Remove all event listeners first
        sidebarToggleBtn.removeEventListener('click', toggleDesktopSidebar);
        sidebarToggleBtn.removeEventListener('click', toggleMobileSidebar);
        
        if (isMobileView()) {
            console.log('Setting up mobile sidebar behavior');
            // Mobile behavior
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
            
            // Add mobile toggle behavior
            sidebarToggleBtn.addEventListener('click', toggleMobileSidebar);
            
            // Force sidebar to be closed on mobile initially
            sidebar.classList.remove('open');
            sidebarToggleBtn.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        } else {
            console.log('Setting up desktop sidebar behavior');
            // Desktop behavior
            sidebar.classList.remove('open');
            document.body.classList.remove('sidebar-open');
            
            // Apply saved collapsed state if any
            if (sidebarCollapsed) {
                sidebar.classList.add('collapsed');
                sidebarToggleBtn.classList.add('active');
                mainContent.classList.add('expanded');
            }
            
            // Add desktop toggle behavior
            sidebarToggleBtn.addEventListener('click', toggleDesktopSidebar);
        }
    }
    
    // Close sidebar when clicking outside (mobile only)
    document.addEventListener('click', function(e) {
        if (isMobileView() && 
            sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            !sidebarToggleBtn.contains(e.target)) {
            
            console.log('Closing mobile sidebar on outside click');
            sidebar.classList.remove('open');
            sidebarToggleBtn.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    });
    
    // Initial setup
    setupSidebarBehavior();
    
    // Handle resize
    window.addEventListener('resize', function() {
        setupSidebarBehavior();
    });
});