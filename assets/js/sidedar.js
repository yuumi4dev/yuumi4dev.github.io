document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    // Check for saved sidebar state
    const sidebarCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    
    // Apply initial state
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        sidebarToggleBtn.classList.add('active');
        mainContent.classList.add('expanded');
    }
    
    // Toggle sidebar when button is clicked
    sidebarToggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        this.classList.toggle('active');
        mainContent.classList.toggle('expanded');
        
        // Save state to localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebar-collapsed', isCollapsed);
    });
    
    // Handle sidebar on mobile
    function handleMobileView() {
        if (window.innerWidth <= 768) {
            // Mobile: change to open/close behavior instead of collapse
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
            
            if (sidebarToggleBtn.classList.contains('active')) {
                sidebar.classList.add('open');
            }
            
            // Change toggle behavior
            sidebarToggleBtn.onclick = function(e) {
                e.stopPropagation();
                this.classList.toggle('active');
                sidebar.classList.toggle('open');
            };
            
            // Close sidebar when clicking outside
            document.addEventListener('click', function(e) {
                if (!sidebar.contains(e.target) && !sidebarToggleBtn.contains(e.target)) {
                    sidebar.classList.remove('open');
                    sidebarToggleBtn.classList.remove('active');
                }
            });
        } else {
            // Desktop: revert to collapse behavior
            if (sidebarToggleBtn.classList.contains('active')) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
            }
            
            // Restore original toggle behavior
            sidebarToggleBtn.onclick = function() {
                sidebar.classList.toggle('collapsed');
                this.classList.toggle('active');
                mainContent.classList.toggle('expanded');
                
                // Save state to localStorage
                const isCollapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('sidebar-collapsed', isCollapsed);
            };
        }
    }
    
    // Initial call
    handleMobileView();
    
    // Handle resize
    window.addEventListener('resize', handleMobileView);
});