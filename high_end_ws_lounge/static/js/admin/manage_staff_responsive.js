document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('manageStaffMenuToggle');
    const menuBackdrop = document.getElementById('manageStaffSidebarBackdrop');
    const sidebar = document.querySelector('.sidebar');

    if (!menuButton || !menuBackdrop || !sidebar) return;

    sidebar.id = 'manageStaffSidebar';
    const menuIcon = menuButton.querySelector('i');

    function setMenuOpen(isOpen) {
        sidebar.classList.toggle('manage-staff-drawer-open', isOpen);
        menuBackdrop.classList.toggle('is-visible', isOpen);
        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        document.body.classList.toggle('manage-staff-menu-open', isOpen);

        if (menuIcon) {
            menuIcon.classList.toggle('fa-bars', !isOpen);
            menuIcon.classList.toggle('fa-xmark', isOpen);
        }
    }

    menuButton.addEventListener('click', function() {
        setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
    });
    menuBackdrop.addEventListener('click', function() {
        setMenuOpen(false);
    });
    sidebar.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
            setMenuOpen(false);
        });
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
            setMenuOpen(false);
            menuButton.focus();
        }
    });
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) setMenuOpen(false);
    });
});
