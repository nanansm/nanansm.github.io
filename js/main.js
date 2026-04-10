/**
 * Main JavaScript for Portfolio
 * Handles: Smooth scroll, fade-in animations, mobile menu, navbar scroll state
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ===================================
    // 1. Mobile Menu Toggle
    // ===================================
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenuToggle.classList.toggle('active');
        });
        
        // Close mobile menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuToggle.classList.remove('active');
            });
        });
    }
    
    // ===================================
    // 2. Smooth Scroll for Anchor Links
    // ===================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or external link
            if (href === '#' || !href.startsWith('#')) return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const navbarHeight = 80; // Height of fixed navbar
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                
                window.scrollTo({
                    top: targetPosition - navbarHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===================================
    // 3. Navbar Scroll State (Backdrop Blur)
    // ===================================
    const navbar = document.getElementById('navbar');
    
    if (navbar) {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state
    }
    
    // ===================================
    // 4. Fade-in on Scroll (Intersection Observer)
    // ===================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);
    
    // Observe all elements with data-aos="fade-up"
    document.querySelectorAll('[data-aos="fade-up"]').forEach(el => {
        observer.observe(el);
    });
    
    // ===================================
    // 5. Dynamic Year in Footer
    // ===================================
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // ===================================
    // 6. Performance: Debounce for Resize Events
    // ===================================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Example: Handle resize events efficiently
    const handleResize = debounce(() => {
        // Add any resize-specific logic here if needed
    }, 250);
    
    window.addEventListener('resize', handleResize);
    
});
