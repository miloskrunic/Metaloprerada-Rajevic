// Gallery Carousel
let currentIndex = 0;

const galleryTrack = document.querySelector('.gallery-track');
const galleryItems = document.querySelectorAll('.gallery-item');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.gallery-btn.prev');
const nextBtn = document.querySelector('.gallery-btn.next');

if (galleryItems.length > 0) {
    // Next slide
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        updateGallery();
    });

    // Previous slide
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        updateGallery();
    });

    // Dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            currentIndex = parseInt(e.target.dataset.index);
            updateGallery();
        });
    });

    function updateGallery() {
        // Scroll to current item
        const itemWidth = galleryItems[0].offsetWidth + 24; // 24px = gap
        galleryTrack.scrollLeft = currentIndex * itemWidth;

        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
}

// Smooth scroll za sve linkove sa #
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// CTA dugme - scroll to services
const ctaButtons = document.querySelectorAll('.hero-buttons .btn-primary, .cta-header');
ctaButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const servicesSection = document.querySelector('#services');
        if (servicesSection) {
            servicesSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// "Saznaj više" dugme
const learnMoreBtn = document.querySelector('.about .btn-primary');
if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', () => {
        const servicesSection = document.querySelector('#services');
        servicesSection.scrollIntoView({ behavior: 'smooth' });
    });
}

// Animacija sekcija pri scroll-u
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Dodaj animaciju sekcijama
document.querySelectorAll('.feature-card, .service-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

console.log('✓ Script učitan uspješno!');
