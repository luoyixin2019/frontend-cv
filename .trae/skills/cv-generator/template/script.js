document.addEventListener('DOMContentLoaded', () => {
    
    // --- Theme Switcher Logic ---
    const themeBtns = document.querySelectorAll('.theme-btn');
    const htmlElement = document.documentElement;

    // Load saved theme or default to bold-signal
    const savedTheme = localStorage.getItem('cv-theme') || 'bold-signal';
    setTheme(savedTheme);

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTheme = btn.getAttribute('data-target');
            setTheme(targetTheme);
        });
    });

    function setTheme(themeName) {
        // Update HTML attribute
        htmlElement.setAttribute('data-theme', themeName);
        
        // Save to local storage
        localStorage.setItem('cv-theme', themeName);

        // Update active button state
        themeBtns.forEach(btn => {
            if(btn.getAttribute('data-target') === themeName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // --- Layout Switcher Logic ---
    const layoutBtns = document.querySelectorAll('.layout-btn');
    const savedLayout = localStorage.getItem('cv-layout') || 'double';
    setLayout(savedLayout);

    layoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetLayout = btn.getAttribute('data-layout');
            setLayout(targetLayout);
        });
    });

    function setLayout(layoutName) {
        htmlElement.setAttribute('data-layout', layoutName);
        localStorage.setItem('cv-layout', layoutName);
        layoutBtns.forEach(btn => {
            if(btn.getAttribute('data-layout') === layoutName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }


    // --- Intersection Observer for Scroll Animations ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class to trigger CSS transition
                entry.target.classList.add('visible');
                
                // If it's a section, animate its child elements with stagger
                const childReveals = entry.target.querySelectorAll('.reveal');
                childReveals.forEach((child, index) => {
                    // Slight delay for each child to create a staggered effect
                    setTimeout(() => {
                        child.classList.add('visible');
                    }, index * 100); 
                });

                // Optional: Stop observing once revealed (run once)
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with the 'reveal' class
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // Trigger animation for the header immediately on load
    setTimeout(() => {
        document.querySelector('.header').classList.add('visible');
    }, 100);

    });
