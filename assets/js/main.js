/**
 * Utils
 */

// Throttle
const throttle = (callback, limit) => {
  let timeoutHandler = null;
  return () => {
    if (timeoutHandler == null) {
      timeoutHandler = setTimeout(() => {
        callback();
        timeoutHandler = null;
      }, limit);
    }
  };
};

// addEventListener Helper
const listen = (selector, event, callback) => {
  const ele = document.querySelector(selector);
  if (ele) ele.addEventListener(event, callback);
};

/**
 * Functions
 */

// Auto Hide Header
const header = document.querySelector('.site-header');
let lastScrollPosition = window.pageYOffset;

const autoHideHeader = () => {
  if (!header) return;
  const currentScrollPosition = window.pageYOffset;
  if (currentScrollPosition > lastScrollPosition) {
    header.classList.remove('slideInUp');
    header.classList.add('slideOutDown');
  } else {
    header.classList.remove('slideOutDown');
    header.classList.add('slideInUp');
  }
  lastScrollPosition = currentScrollPosition;
};

// Mobile Menu Toggle
let mobileMenuVisible = false;
const toggleMobileMenu = () => {
  const mobileMenu = document.getElementById('mobile-menu');
  if (!mobileMenu) return;
  if (!mobileMenuVisible) {
    mobileMenu.style.animationName = 'bounceInRight';
    mobileMenu.style.webkitAnimationName = 'bounceInRight';
    mobileMenu.style.display = 'block';
    mobileMenuVisible = true;
  } else {
    mobileMenu.style.animationName = 'bounceOutRight';
    mobileMenu.style.webkitAnimationName = 'bounceOutRight';
    mobileMenuVisible = false;
  }
};

// Featured Image Toggle
const showImg = () => {
  const bgImg = document.querySelector('.bg-img');
  if (bgImg) bgImg.classList.add('show-bg-img');
};
const hideImg = () => {
  const bgImg = document.querySelector('.bg-img');
  if (bgImg) bgImg.classList.remove('show-bg-img');
};

// ToC Toggle
const toggleToc = () => {
  const toc = document.getElementById('toc');
  if (toc) toc.classList.toggle('show-toc');
};

// Post-Year Navigation
const postYears = document.querySelectorAll('.post-year');
postYears.forEach(ele => {
  ele.addEventListener('click', () => {
    window.location.hash = '#' + ele.id;
  });
});

// Initialize Event Listeners
if (header) {
  listen('#menu-btn', 'click', toggleMobileMenu);
  listen('#toc-btn', 'click', toggleToc);
  listen('#img-btn', 'click', showImg);
  listen('.bg-img', 'click', hideImg);

  window.addEventListener('scroll', throttle(() => {
    autoHideHeader();
    if (mobileMenuVisible) toggleMobileMenu();
  }, 250));
}

/**
 * Theme toggle logic
 */
document.addEventListener("DOMContentLoaded", () => {
    const typewriterEl = document.getElementById("announcement");
    const textPrimary = typewriterEl.dataset.primary;
    const textSecondary = typewriterEl.dataset.secondary;
    const pauseAfterTyping = 2000; // pause after typing primary text
    let index = 0;
    let deleting = false;

    function typewriterLoop() {
        if (!deleting) {
            typewriterEl.textContent = textPrimary.substring(0, index + 1);
            index++;
            if (index === textPrimary.length) {
                setTimeout(() => {
                    deleting = true;
                    typewriterLoop();
                }, pauseAfterTyping);
                return;
            }
            setTimeout(typewriterLoop, 100);
        } else {
            typewriterEl.textContent = textPrimary.substring(0, index - 1);
            index--;
            if (index === 0) {
                // After backward deletion, show secondary text
                deleting = false;
                typewriterEl.style.fontWeight = "400"; // lighter font for secondary text
                typewriterEl.style.fontSize = "1.5rem"; // adjust size if needed
                typewriterEl.textContent = textSecondary;
                typewriterEl.style.opacity = 1;
                typewriterEl.style.transition = "transform 0.5s ease, opacity 0.5s ease";
                typewriterEl.style.transform = "scale(0.8)";
                setTimeout(() => {
                    typewriterEl.style.transform = "scale(1)";
                }, 50);
                // No loop back to primary text
                return;
            } else {
                setTimeout(typewriterLoop, 50);
            }
        }
    }

    typewriterLoop();
});