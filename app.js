// ===== SPA ROUTER =====
class Router {
    constructor() {
        this.githubPagesBasePath = '/Metaloprerada-Rajevic';
        this.basePath = this.getBasePath();
        this.routes = {
            '/': 'home',
            '/index.html': 'home',
            '/radovi': 'radovi',
            '/resenja': 'resenja',
            '/kontakt': 'kontakt'
        };
        this.legacyRoutes = {
            '/test1': '/radovi',
            '/test2': '/resenja',
            '/test3': '/kontakt'
        };

        this.currentPage = 'home';
        this.init();
    }

    init() {
        document.querySelectorAll('[data-page]').forEach(link => {
            const routePath = this.normalizePath(link.getAttribute('href'));
            link.setAttribute('href', this.getPublicPath(routePath));

            link.addEventListener('click', event => {
                event.preventDefault();
                const path = link.getAttribute('href');
                this.navigate(path);
            });
        });

        window.addEventListener('popstate', event => {
            const path = this.normalizePath(event.state?.path || window.location.pathname || '/');
            const page = this.routes[path] || 'home';
            this.showPage(page);
        });

        const fallbackPath = this.consumeFallbackRedirect();
        const initialPath = this.normalizePath(fallbackPath || window.location.pathname);
        const initialPage = this.routes[initialPath] || 'home';
        this.showPage(initialPage);
        this.replaceHistory(initialPath);
    }

    getBasePath() {
        if (window.location.hostname.endsWith('github.io')) {
            return this.githubPagesBasePath;
        }

        return '';
    }

    consumeFallbackRedirect() {
        try {
            const redirectUrl = window.sessionStorage.getItem('spaRedirect');

            if (!redirectUrl) {
                return null;
            }

            window.sessionStorage.removeItem('spaRedirect');
            const parsedUrl = new URL(redirectUrl);

            if (parsedUrl.origin !== window.location.origin) {
                return null;
            }

            return parsedUrl.pathname;
        } catch (error) {
            console.warn('SPA fallback redirect nije dostupan.', error);
            return null;
        }
    }

    stripBasePath(path) {
        if (!path) {
            return '/';
        }

        let routePath = path;

        if (this.basePath && routePath === this.basePath) {
            return '/';
        }

        if (this.basePath && routePath.startsWith(`${this.basePath}/`)) {
            routePath = routePath.slice(this.basePath.length);
        }

        if (!routePath.startsWith('/')) {
            routePath = `/${routePath}`;
        }

        return routePath;
    }

    normalizePath(path) {
        let routePath = this.stripBasePath(path).replace(/\/+$/, '') || '/';

        if (routePath === '/index.html' || routePath.endsWith('/index.html')) {
            routePath = '/';
        }

        if (this.legacyRoutes[routePath]) {
            return this.legacyRoutes[routePath];
        }

        return this.routes[routePath] ? routePath : '/';
    }

    navigate(path) {
        const routePath = this.normalizePath(path);
        const routePage = this.routes[routePath];

        if (!routePage) {
            this.replaceHistory('/');
            this.showPage('home');
            return;
        }

        if (this.currentPage !== routePage) {
            this.pushHistory(routePath);
            this.showPage(routePage);
            return;
        }

        this.pushHistory(routePath);
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

    getPublicPath(path) {
        if (!this.basePath) {
            return path;
        }

        return path === '/' ? `${this.basePath}/` : `${this.basePath}${path}`;
    }

    pushHistory(path) {
        const publicPath = this.getPublicPath(path);

        if (window.location.pathname === publicPath) {
            return;
        }

        try {
            window.history.pushState({ path }, '', publicPath);
        } catch (error) {
            console.warn('History API nije dostupan za ovu putanju.', error);
        }
    }

    replaceHistory(path) {
        const publicPath = this.getPublicPath(path);

        try {
            window.history.replaceState({ path }, '', publicPath);
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
    initRevealAnimations();
});

function initScrollButtons(router, closeMobileMenu) {
    document.querySelectorAll('[data-scroll-target]').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.scrollTarget;

            if (router.currentPage !== 'home') {
                router.navigate('/');
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

function initRevealAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .service-item, .test-card');

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
