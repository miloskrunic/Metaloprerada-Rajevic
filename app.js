// ===== SPA ROUTER =====
class Router {
    constructor() {
        this.routes = {
            '/': 'home',
            '/index.html': 'home',
            '/test1': 'test1',
            '/test2': 'test2',
            '/test3': 'test3'
        };

        this.currentPage = 'home';
        this.init();
    }

    init() {
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', event => {
                event.preventDefault();
                const page = link.dataset.page;
                const path = link.getAttribute('href');
                this.navigate(path, page);
            });
        });

        window.addEventListener('popstate', event => {
            const path = event.state?.path || window.location.pathname || '/';
            const page = this.routes[path] || 'home';
            this.showPage(page);
        });

        const initialPath = this.normalizePath(window.location.pathname);
        const initialPage = this.routes[initialPath] || 'home';
        this.showPage(initialPage);
        this.replaceHistory(initialPath);
    }

    normalizePath(path) {
        if (!path || path === '/' || path.endsWith('/index.html')) {
            return '/';
        }

        return this.routes[path] ? path : '/';
    }

    navigate(path, page) {
        if (!page || !this.routes[path]) {
            return;
        }

        if (this.currentPage !== page) {
            this.pushHistory(path);
            this.showPage(page);
            return;
        }

        this.pushHistory(path);
    }

    showPage(page) {
        document.querySelectorAll('.page').forEach(section => {
            section.classList.remove('active');
        });

        const newPage = document.getElementById(`page-${page}`);
        if (!newPage) {
            return;
        }

        newPage.classList.add('active');
        this.currentPage = page;
        window.scrollTo({ top: 0, behavior: 'auto' });
        this.updateActiveLinks(page);
    }

    updateActiveLinks(page) {
        document.querySelectorAll('[data-page]').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });
    }

    pushHistory(path) {
        if (window.location.pathname === path) {
            return;
        }

        try {
            window.history.pushState({ path }, '', path);
        } catch (error) {
            console.warn('History API nije dostupan za ovu putanju.', error);
        }
    }

    replaceHistory(path) {
        try {
            window.history.replaceState({ path }, '', path);
        } catch (error) {
            console.warn('History API nije dostupan za ovu putanju.', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const router = new Router();
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    window.scrollTo({ top: window.scrollY, left: 0, behavior: 'auto' });

    const closeMobileMenu = () => {
        if (!hamburger || !mobileMenu) {
            return;
        }

        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Otvori meni');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-open');
    };

    const openMobileMenu = () => {
        if (!hamburger || !mobileMenu) {
            return;
        }

        hamburger.classList.add('active');
        mobileMenu.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Zatvori meni');
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.classList.add('menu-open');
    };

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.contains('active');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        document.querySelectorAll('.mobile-nav a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeMobileMenu();
            }
        });
    }

    initScrollButtons(router, closeMobileMenu);
    initGallery();
    initRevealAnimations();
});

function initScrollButtons(router, closeMobileMenu) {
    document.querySelectorAll('[data-scroll-target]').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.scrollTarget;

            if (router.currentPage !== 'home') {
                router.navigate('/', 'home');
            }

            closeMobileMenu();

            window.requestAnimationFrame(() => {
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    });
}

function initGallery() {
    const galleryTrack = document.querySelector('.gallery-track');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.gallery-btn.prev');
    const nextBtn = document.querySelector('.gallery-btn.next');

    if (!galleryTrack || !prevBtn || !nextBtn || galleryItems.length === 0) {
        return;
    }

    let currentIndex = 0;

    const updateGallery = () => {
        const gap = parseFloat(window.getComputedStyle(galleryTrack).columnGap) || 24;
        const itemWidth = galleryItems[0].offsetWidth + gap;
        galleryTrack.scrollTo({
            left: currentIndex * itemWidth,
            behavior: 'smooth'
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    };

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        updateGallery();
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        updateGallery();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            currentIndex = Number(dot.dataset.index);
            updateGallery();
        });
    });

    let resizeFrame = null;
    window.addEventListener('resize', () => {
        if (resizeFrame) {
            window.cancelAnimationFrame(resizeFrame);
        }

        resizeFrame = window.requestAnimationFrame(() => {
            updateGallery();
            resizeFrame = null;
        });
    });
}

function initRevealAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .gallery-item, .service-item, .test-card');

    if (!('IntersectionObserver' in window)) {
        animatedElements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'none';
        });
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}
