document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Navigation Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active'); // For hamburger animation
        });

        // Close nav when a link is clicked (for mobile view)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        });
    }

    // --- Active Navigation Link Highlighting (Revised) ---
    const allNavLinks = document.querySelectorAll('header .nav-links a');
    const currentPathname = window.location.pathname;

    allNavLinks.forEach(link => {
        link.classList.remove('active'); // Remove 'active' from all links first
        const linkHref = link.getAttribute('href');

        if (linkHref) {
            // Check if the current browser path ends with the link's href value
            if (currentPathname.endsWith(linkHref)) {
                link.classList.add('active');
            }
            // Special handling for index.html or home.html when at the root or a similar path
            else if ((linkHref === 'index.html' || linkHref === 'home.html' || linkHref === './index.html' || linkHref === './home.html') &&
                     (currentPathname === '/' || currentPathname.endsWith('/index.html') || currentPathname.endsWith('/home.html') || currentPathname.endsWith('frontend/') )) { // Added /frontend/ for local dev
                // Try to find the "Home" link specifically if others don't match and current path is root-like
                if (link.textContent.trim().toLowerCase() === 'home') {
                    link.classList.add('active');
                }
            }
        }
    });
    // If no link is active based on path, and we are on a root-like page, activate 'Home'
    const activeLinkFound = Array.from(allNavLinks).some(link => link.classList.contains('active'));
    if (!activeLinkFound && (currentPathname === '/' || currentPathname.endsWith('/index.html') || currentPathname.endsWith('/home.html') || currentPathname.endsWith('frontend/'))) {
        const homeLink = Array.from(allNavLinks).find(link => (link.getAttribute('href') === 'home.html' || link.getAttribute('href') === 'index.html'));
        if (homeLink) {
            homeLink.classList.add('active');
        }
    }


    // --- Contact Form Handling (Revised for Backend) ---
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status'); // Make sure this element exists in your contact.html

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async function(event) { // Make the function async
            event.preventDefault(); // Prevent default page reload

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();

            // Initial status
            formStatus.textContent = 'Sending your message...';
            formStatus.style.color = 'var(--light-text-color)'; // Using CSS variable, ensure it's defined

            // Client-side validation (good for immediate feedback)
            if (!name || !email || !message) {
                formStatus.textContent = 'Oops! Please fill in all fields.';
                formStatus.style.color = 'red';
                return;
            }

            if (!validateEmail(email)) {
                formStatus.textContent = 'Please enter a valid email address.';
                formStatus.style.color = 'red';
                return;
            }

            try {
                // Send data to the backend
                // Ensure this URL is correct. If backend is on a different domain/port, it needs to be the full URL.
                const response = await fetch('http://localhost:3001/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, message }),
                });

                const result = await response.json(); // Get JSON response from backend

                if (response.ok && result.success) {
                    formStatus.textContent = result.message; // "Thank you for your message!..."
                    formStatus.style.color = 'green';
                    contactForm.reset(); // Clear the form fields
                } else {
                    // Handle errors from the backend or network issues
                    formStatus.textContent = result.message || 'An error occurred. Please try again.';
                    formStatus.style.color = 'red';
                }

            } catch (error) {
                console.error('Error submitting form:', error);
                formStatus.textContent = 'A network error occurred. Please check your connection and try again.';
                formStatus.style.color = 'red';
            } finally {
                // Optionally, clear status message after some time, but only if successful
                setTimeout(() => {
                    if (formStatus.style.color === 'green') { // Only clear success messages
                        formStatus.textContent = '';
                    }
                }, 7000); // 7 seconds
            }
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // --- Subtle Animations on Scroll ---
    const sections = document.querySelectorAll('main section');
    const animateOnScroll = () => {
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (sectionTop < windowHeight * 0.85) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        });
    };

    // Initial state for animation
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });

    // Check for prefers-reduced-motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('scroll', animateOnScroll);
        animateOnScroll(); // Trigger on page load for elements already in view
    } else {
        // If reduced motion is preferred, make sections visible immediately
        sections.forEach(section => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        });
    }
});