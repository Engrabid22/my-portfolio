/**
 * Alex Morgan Portfolio - Main JavaScript
 * Handles animations, form validation, navigation, and interactive elements
 */

// =========================================
// DOM Elements
// =========================================
const elements = {
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('navToggle'),
    navMenu: document.getElementById('navMenu'),
    navLinks: document.querySelectorAll('.nav-link'),
    contactForm: document.getElementById('contactForm'),
    formSuccess: document.getElementById('formSuccess'),
    backToTop: document.getElementById('backToTop'),
    animatedElements: document.querySelectorAll('.animate-on-scroll'),
    skillBars: document.querySelectorAll('.skill-progress'),
    statNumbers: document.querySelectorAll('.stat-number'),
    particles: document.getElementById('particles'),
    themeToggle: document.getElementById('themeToggle')
};

// =========================================
// Theme Toggle (Dark/Light Mode)
// =========================================

/**
 * Get the current theme from localStorage or system preference
 * @returns {string} - 'dark' or 'light'
 */
function getPreferredTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Set the theme on the document
 * @param {string} theme - 'dark' or 'light'
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

/**
 * Toggle between dark and light themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

/**
 * Initialize theme based on saved preference or system preference
 */
function initTheme() {
    const theme = getPreferredTheme();
    setTheme(theme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// =========================================
// Utility Functions
// =========================================

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait = 10) {
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

/**
 * Throttle function to limit function calls to a specific rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @param {number} offset - Offset from viewport edge
 * @returns {boolean} - True if element is in viewport
 */
function isInViewport(element, offset = 100) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
        rect.bottom >= offset
    );
}

// =========================================
// Navigation
// =========================================

/**
 * Handle navbar scroll effects
 */
function handleNavbarScroll() {
    const scrolled = window.scrollY > 50;
    elements.navbar.classList.toggle('scrolled', scrolled);
}

/**
 * Toggle mobile navigation menu
 */
function toggleMobileMenu() {
    const isActive = elements.navToggle.classList.toggle('active');
    elements.navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open', isActive);
    
    // Update aria-expanded for accessibility
    elements.navToggle.setAttribute('aria-expanded', isActive);
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    elements.navToggle.classList.remove('active');
    elements.navMenu.classList.remove('active');
    document.body.classList.remove('menu-open');
    elements.navToggle.setAttribute('aria-expanded', 'false');
}

/**
 * Update active navigation link based on scroll position
 */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 150;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            elements.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

/**
 * Smooth scroll to section
 * @param {Event} e - Click event
 */
function smoothScrollToSection(e) {
    const href = e.currentTarget.getAttribute('href');
    
    if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            closeMobileMenu();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// =========================================
// Back to Top Button
// =========================================

/**
 * Handle back to top button visibility
 */
function handleBackToTop() {
    const isVisible = window.scrollY > 500;
    elements.backToTop.classList.toggle('visible', isVisible);
}

/**
 * Scroll to top of page
 */
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================
// Scroll Animations
// =========================================

/**
 * Initialize Intersection Observer for scroll animations
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger skill bar animations
                if (entry.target.classList.contains('skill-category')) {
                    animateSkillBars(entry.target);
                }
                
                // Trigger stat counter animations
                if (entry.target.classList.contains('about-image')) {
                    animateStatCounters();
                }
            }
        });
    }, observerOptions);
    
    elements.animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Animate skill progress bars
 * @param {HTMLElement} container - Container with skill bars
 */
function animateSkillBars(container) {
    const bars = container.querySelectorAll('.skill-progress');
    
    bars.forEach((bar, index) => {
        const progress = bar.getAttribute('data-progress');
        
        setTimeout(() => {
            bar.style.width = `${progress}%`;
        }, index * 100);
    });
}

/**
 * Animate stat counter numbers
 */
let statsAnimated = false;

function animateStatCounters() {
    if (statsAnimated) return;
    statsAnimated = true;
    
    elements.statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'), 10);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            
            if (current < target) {
                stat.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// =========================================
// Form Validation
// =========================================

/**
 * Form validation rules
 */
const validationRules = {
    name: {
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-Z\s'-]+$/,
        messages: {
            required: 'Please enter your name',
            minLength: 'Name must be at least 2 characters',
            maxLength: 'Name must be less than 100 characters',
            pattern: 'Please enter a valid name'
        }
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        messages: {
            required: 'Please enter your email address',
            pattern: 'Please enter a valid email address'
        }
    },
    subject: {
        required: true,
        minLength: 3,
        maxLength: 200,
        messages: {
            required: 'Please enter a subject',
            minLength: 'Subject must be at least 3 characters',
            maxLength: 'Subject must be less than 200 characters'
        }
    },
    message: {
        required: true,
        minLength: 10,
        maxLength: 5000,
        messages: {
            required: 'Please enter your message',
            minLength: 'Message must be at least 10 characters',
            maxLength: 'Message must be less than 5000 characters'
        }
    }
};

/**
 * Validate a single form field
 * @param {string} fieldName - Name of the field
 * @param {string} value - Value to validate
 * @returns {string|null} - Error message or null if valid
 */
function validateField(fieldName, value) {
    const rules = validationRules[fieldName];
    
    if (!rules) return null;
    
    const trimmedValue = value.trim();
    
    // Required check
    if (rules.required && !trimmedValue) {
        return rules.messages.required;
    }
    
    // Only validate other rules if there's a value
    if (trimmedValue) {
        // Min length check
        if (rules.minLength && trimmedValue.length < rules.minLength) {
            return rules.messages.minLength;
        }
        
        // Max length check
        if (rules.maxLength && trimmedValue.length > rules.maxLength) {
            return rules.messages.maxLength;
        }
        
        // Pattern check
        if (rules.pattern && !rules.pattern.test(trimmedValue)) {
            return rules.messages.pattern;
        }
    }
    
    return null;
}

/**
 * Show field error
 * @param {HTMLElement} input - Input element
 * @param {string} message - Error message
 */
function showFieldError(input, message) {
    const errorElement = document.getElementById(`${input.name}Error`);
    
    input.classList.add('error');
    
    if (errorElement) {
        errorElement.textContent = message;
    }
}

/**
 * Clear field error
 * @param {HTMLElement} input - Input element
 */
function clearFieldError(input) {
    const errorElement = document.getElementById(`${input.name}Error`);
    
    input.classList.remove('error');
    
    if (errorElement) {
        errorElement.textContent = '';
    }
}

/**
 * Validate entire form
 * @returns {boolean} - True if form is valid
 */
function validateForm() {
    let isValid = true;
    const formInputs = elements.contactForm.querySelectorAll('.form-input');
    
    formInputs.forEach(input => {
        const error = validateField(input.name, input.value);
        
        if (error) {
            showFieldError(input, error);
            isValid = false;
        } else {
            clearFieldError(input);
        }
    });
    
    return isValid;
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        // Focus first error field
        const firstError = elements.contactForm.querySelector('.form-input.error');
        if (firstError) firstError.focus();
        return;
    }
    
    // Get submit button
    const submitBtn = elements.contactForm.querySelector('.btn-submit');
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Submit form to Formspree
    try {
        const formData = new FormData(elements.contactForm);
        
        const response = await fetch(elements.contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // Show success message
            elements.formSuccess.classList.add('show');
            
            // Reset form
            elements.contactForm.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                elements.formSuccess.classList.remove('show');
            }, 5000);
        } else {
            const data = await response.json();
            if (data.errors) {
                throw new Error(data.errors.map(e => e.message).join(', '));
            }
            throw new Error('Form submission failed');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        alert('There was an error sending your message. Please try again or email directly at abidguru97@gmail.com');
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

/**
 * Handle input blur for validation
 * @param {Event} e - Blur event
 */
function handleInputBlur(e) {
    const input = e.target;
    const error = validateField(input.name, input.value);
    
    if (error) {
        showFieldError(input, error);
    } else {
        clearFieldError(input);
    }
}

/**
 * Handle input focus to clear errors
 * @param {Event} e - Focus event
 */
function handleInputFocus(e) {
    clearFieldError(e.target);
}

// =========================================
// Particles Background
// =========================================

/**
 * Create floating particles in hero section
 */
function createParticles() {
    if (!elements.particles) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 4 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 15;
        const opacity = Math.random() * 0.3 + 0.1;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background-color: var(--color-primary);
            border-radius: 50%;
            left: ${posX}%;
            top: ${posY}%;
            opacity: ${opacity};
            animation: particleFloat ${duration}s ease-in-out ${delay}s infinite;
        `;
        
        elements.particles.appendChild(particle);
    }
    
    // Add particle animation keyframes
    if (!document.getElementById('particle-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'particle-styles';
        styleSheet.textContent = `
            @keyframes particleFloat {
                0%, 100% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: var(--opacity, 0.2);
                }
                25% {
                    transform: translate(20px, -30px) rotate(90deg);
                }
                50% {
                    transform: translate(-10px, -60px) rotate(180deg);
                    opacity: calc(var(--opacity, 0.2) * 0.5);
                }
                75% {
                    transform: translate(-30px, -30px) rotate(270deg);
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

// =========================================
// Keyboard Navigation
// =========================================

/**
 * Handle keyboard navigation
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyboardNavigation(e) {
    // Close mobile menu on Escape
    if (e.key === 'Escape' && elements.navMenu.classList.contains('active')) {
        closeMobileMenu();
    }
}

// =========================================
// Initialize
// =========================================

/**
 * Initialize all functionality
 */
function init() {
    // Initialize theme first (before any visual rendering)
    initTheme();
    
    // Theme toggle
    elements.themeToggle?.addEventListener('click', toggleTheme);
    
    // Navigation
    window.addEventListener('scroll', throttle(handleNavbarScroll, 50));
    window.addEventListener('scroll', throttle(updateActiveNavLink, 100));
    window.addEventListener('scroll', throttle(handleBackToTop, 100));
    
    elements.navToggle?.addEventListener('click', toggleMobileMenu);
    elements.navLinks.forEach(link => {
        link.addEventListener('click', smoothScrollToSection);
    });
    
    // Back to top
    elements.backToTop?.addEventListener('click', scrollToTop);
    
    // Scroll animations
    initScrollAnimations();
    
    // Form
    if (elements.contactForm) {
        elements.contactForm.addEventListener('submit', handleFormSubmit);
        
        const formInputs = elements.contactForm.querySelectorAll('.form-input');
        formInputs.forEach(input => {
            input.addEventListener('blur', handleInputBlur);
            input.addEventListener('focus', handleInputFocus);
        });
    }
    
    // Particles
    createParticles();
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', smoothScrollToSection);
    });
    
    // Initial scroll position check
    handleNavbarScroll();
    updateActiveNavLink();
    handleBackToTop();
    
    // Trigger initial animations for elements in view
    setTimeout(() => {
        elements.animatedElements.forEach(element => {
            if (isInViewport(element, 50)) {
                element.classList.add('visible');
            }
        });
    }, 100);
}

// =========================================
// DOM Ready
// =========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// =========================================
// Service Worker Registration (Optional)
// =========================================

/**
 * Register service worker for offline support
 * Uncomment to enable
 */
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}
*/

// =========================================
// Performance Monitoring (Optional)
// =========================================

/**
 * Log performance metrics
 * Uncomment to enable
 */
/*
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page Load Time:', perfData.loadEventEnd - perfData.startTime, 'ms');
            console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.startTime, 'ms');
        }, 0);
    });
}
*/
