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

    // --- Watermark System ---
    const WATERMARK_STORAGE_KEY = 'cv-watermark-recipient';
    const WATERMARK_ATTR = 'data-watermark-id';

    function encodeToZeroWidth(str) {
        const ZW_CHARS = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
        return str.split('').map(ch => {
            const code = ch.charCodeAt(0);
            return code.toString(4).padStart(8, '0').split('').map(d => ZW_CHARS[parseInt(d)]).join('');
        }).join('');
    }

    function generateVisibleWatermark(text) {
        const overlay = document.querySelector('.watermark-overlay');
        if (!overlay) return;
        overlay.innerHTML = '';
        const cols = Math.ceil(window.innerWidth / 280);
        const rows = Math.ceil(window.innerHeight / 180);
        for (let r = 0; r < rows + 4; r++) {
            for (let c = 0; c < cols + 2; c++) {
                const span = document.createElement('span');
                span.className = 'watermark-text';
                span.textContent = text;
                span.style.left = (c * 280 - 80 + (r % 2) * 140) + 'px';
                span.style.top = (r * 180 - 40) + 'px';
                overlay.appendChild(span);
            }
        }
    }

    function injectSteganography(text) {
        removeSteganography();
        const timestamp = new Date().toISOString().slice(0, 10);
        const payload = 'CV:' + text + ':' + timestamp;
        const encodedPayload = encodeToZeroWidth(payload);
        const walker = document.createTreeWalker(
            document.querySelector('.page-container') || document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    if (parent.closest('.watermark-overlay, .theme-switcher, script, style')) return NodeFilter.FILTER_REJECT;
                    if (node.textContent.trim().length < 2) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        textNodes.forEach(node => {
            const marker = document.createElement('span');
            marker.className = 'watermark-zw-marker';
            marker.setAttribute(WATERMARK_ATTR, '');
            marker.textContent = encodedPayload;
            node.parentNode.insertBefore(marker, node);
        });
    }

    function removeSteganography() {
        document.querySelectorAll('[' + WATERMARK_ATTR + ']').forEach(el => el.remove());
    }

    function injectHtmlComment(text) {
        removeHtmlComment();
        const timestamp = new Date().toISOString().slice(0, 10);
        const comment = document.createComment(' WATERMARK: recipient=' + text + ' date=' + timestamp + ' ');
        document.body.insertBefore(comment, document.body.firstChild);
    }

    function removeHtmlComment() {
        const children = document.body.childNodes;
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeType === 8 && children[i].textContent.includes('WATERMARK:')) {
                children[i].remove();
                break;
            }
        }
    }

    function injectPdfWatermark(text) {
        let existing = document.querySelector('.watermark-pdf-tag');
        if (existing) existing.remove();
        const timestamp = new Date().toISOString().slice(0, 10);
        const tag = document.createElement('div');
        tag.className = 'watermark-pdf-tag';
        tag.textContent = 'ID:' + text + '|' + timestamp;
        document.body.appendChild(tag);
        const titleEl = document.querySelector('title');
        if (titleEl) {
            const base = titleEl.textContent.replace(/\s*\|\s*wm:[^|]*$/, '');
            titleEl.textContent = base + ' | wm:' + text;
        }
    }

    function removePdfWatermark() {
        const el = document.querySelector('.watermark-pdf-tag');
        if (el) el.remove();
    }

    function processHash() {
        const hashRecipient = decodeURIComponent(
            (window.location.hash.match(/wm=([^&]+)/) || [])[1] || ''
        );
        if (hashRecipient) {
            localStorage.setItem(WATERMARK_STORAGE_KEY, hashRecipient);
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        const clearFlag = window.location.hash.includes('wm=clear');
        if (clearFlag) {
            localStorage.removeItem(WATERMARK_STORAGE_KEY);
            removeWatermark();
            history.replaceState(null, '', window.location.pathname + window.location.search);
            return;
        }

        const recipient = localStorage.getItem(WATERMARK_STORAGE_KEY) || '';
        if (recipient) {
            applyWatermark(recipient);
        }
    }

    function initWatermark() {
        processHash();
        window.addEventListener('hashchange', () => {
            removeWatermark();
            processHash();
        });
    }

    function applyWatermark(recipient) {
        generateVisibleWatermark(recipient);
        injectSteganography(recipient);
        injectHtmlComment(recipient);
        injectPdfWatermark(recipient);
        const existingMeta = document.querySelector('meta[name="x-watermark"]');
        if (!existingMeta) {
            const meta = document.createElement('meta');
            meta.name = 'x-watermark';
            meta.content = recipient;
            document.head.appendChild(meta);
        } else {
            existingMeta.content = recipient;
        }
    }

    function removeWatermark() {
        const overlay = document.querySelector('.watermark-overlay');
        if (overlay) overlay.innerHTML = '';
        removeSteganography();
        removeHtmlComment();
        removePdfWatermark();
        const meta = document.querySelector('meta[name="x-watermark"]');
        if (meta) meta.remove();
    }

    window.addEventListener('resize', () => {
        const recipient = localStorage.getItem(WATERMARK_STORAGE_KEY);
        if (recipient) generateVisibleWatermark(recipient);
    });

    initWatermark();

    });
