// ===== Three.js Background Removed =====


// ===== Scroll Handling =====
function handleScroll() {




    // Reveal animations for sections
    revealOnScroll();
}

// ===== Reveal on Scroll =====
function setupRevealAnimations() {
    const revealElements = document.querySelectorAll('.project-card, .section-header');
    revealElements.forEach(el => {
        el.classList.add('reveal');
    });
}

function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    const windowHeight = window.innerHeight;

    reveals.forEach(reveal => {
        const revealTop = reveal.getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
            reveal.classList.add('visible');
        }
    });
}



// ===== Smooth Scroll for Anchor Links =====
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    // Setup animations and interactions
    setupRevealAnimations();
    setupSmoothScroll();

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial reveal check
    setTimeout(revealOnScroll, 100);
});

// ===== Typed Text Animation =====
const typedTexts = [
    'stuff',
    'more stuff',
    'even more stuff',
    'and even more stuff'
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typedElement = null;

function typeText() {
    if (!typedElement) {
        typedElement = document.querySelector('.typed-text');
        if (!typedElement) return;
    }

    const currentText = typedTexts[textIndex];

    if (isDeleting) {
        typedElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typedElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typedTexts.length;
        typeSpeed = 500; // Pause before new word
    }

    setTimeout(typeText, typeSpeed);
}

// Start typing animation after page load
window.addEventListener('load', () => {
    setTimeout(typeText, 1500);
});
