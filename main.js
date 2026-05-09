document.addEventListener('DOMContentLoaded', () => {
  // Reveal animations on scroll
  const revealElements = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.1
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
});

/* ============================================================
   ROAMCREW from V1— MAIN JAVASCRIPT
   ============================================================ */

'use strict';

// ── NAVBAR SCROLL ─────────────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── HAMBURGER MENU ────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.querySelectorAll('span').forEach((s, i) => {
      s.style.transform = isOpen
        ? i === 0 ? 'translateY(7px) rotate(45deg)'
          : i === 1 ? 'scaleX(0)'
            : 'translateY(-7px) rotate(-45deg)'
        : '';
    });
  });
  // Close on nav link click (but not dropdown toggle)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      // Don't close if this is a dropdown toggle
      if (link.closest('.dropdown') && link.getAttribute('href') === '#') {
        return;
      }
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.querySelectorAll('span').forEach(s => s.style.transform = '');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.querySelectorAll('span').forEach(s => s.style.transform = '');
    }
  });
}

// ── MODAL HELPERS ─────────────────────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.remove('active');
    document.body.style.overflow = '';
  }
}
window.openModal = openModal;
window.closeModal = closeModal;

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      closeModal(m.id);
    });
  }
});

// ── ADVENTURE CARD LIGHTBOX ───────────────────────────────
document.querySelectorAll('.adventure-card[data-lightbox]').forEach(card => {
  card.addEventListener('click', e => {
    // Allow "Book Now" button to work normally
    if (e.target.closest('.btn-primary')) return;

    const img = card.querySelector('.card-bg-img');
    const title = card.querySelector('.card-content h3');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');

    if (img && lightboxImg) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
    }
    if (title && lightboxCaption) {
      lightboxCaption.textContent = title.textContent;
    }

    openModal('imageLightbox');
  });
});

// ── JOIN CREW MODAL ───────────────────────────────────────
window.openJoinModal = () => openModal('joinModal');

window.handleJoin = (e) => {
  e.preventDefault();
  const form = e.target;

  // Validate all fields
  let isValid = true;

  const nameInput = form.querySelector('#joinName');
  const emailInput = form.querySelector('#joinEmail');
  const whatsappInput = form.querySelector('#joinWhatsapp');

  // Clear previous errors
  clearFormErrors(form);

  // Validate name (required)
  if (!validateField(nameInput, validateName)) {
    isValid = false;
  }

  // Validate email (required)
  if (!validateField(emailInput, validateEmail)) {
    isValid = false;
  }

  // Validate WhatsApp if provided (optional but validated if filled)
  if (whatsappInput && whatsappInput.value.trim().length > 0) {
    if (!validateField(whatsappInput, validatePhone)) {
      isValid = false;
    }
  }

  // If validation fails, stop here
  if (!isValid) {
    // Focus first error field
    const firstError = form.querySelector('.input-error');
    if (firstError) {
      firstError.focus();
    }
    return;
  }

  const formData = new FormData(form);

  fetch(form.action, {
    method: 'POST',
    body: formData
  })
    .then(() => {
      closeModal('joinModal');
      showJoinOverlay();
      form.reset();
    })
    .catch(() => {
      closeModal('joinModal');
      showJoinOverlay();
      form.reset();
    });
};

function showJoinOverlay() {
  let overlay = document.getElementById('joinOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'joinOverlay';
    overlay.className = 'contact-overlay';  // Reuse contact styles
    overlay.innerHTML = `
      <div class="contact-popup">
        <div>Welcome to the crew. A Curator will contact you soon.</div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';

  const hideTimer = setTimeout(() => closeJoinOverlay(overlay), 5000);

  const handler = (ev) => {
    if (ev.target === overlay) {
      clearTimeout(hideTimer);
      overlay.removeEventListener('click', handler);
      closeJoinOverlay(overlay);
    }
  };
  overlay.addEventListener('click', handler);
}

function closeJoinOverlay(overlay) {
  overlay.classList.remove('show');
  document.body.style.overflow = '';
  setTimeout(() => {
    if (overlay && !overlay.classList.contains('show')) {
      overlay.remove();
    }
  }, 400);
}

// ── BOOK EVENT MODAL ───────────────────────────────────────
window.openBookModal = (eventName) => {
  const select = document.getElementById('bookEvent');
  if (select && eventName) {
    select.value = eventName;
  }
  openModal('bookModal');
};

window.handleBook = (e) => {
  e.preventDefault();
  const form = e.target;

  // Validate all fields
  let isValid = true;

  const nameInput = form.querySelector('#bookName');
  const emailInput = form.querySelector('#bookEmail');
  const whatsappInput = form.querySelector('#bookWhatsapp');

  // Clear previous errors
  clearFormErrors(form);

  if (!validateField(nameInput, validateName)) isValid = false;
  if (!validateField(emailInput, validateEmail)) isValid = false;
  if (!validateField(whatsappInput, validatePhone)) isValid = false;

  // If validation fails, stop here
  if (!isValid) {
    const firstError = form.querySelector('.input-error');
    if (firstError) firstError.focus();
    return;
  }

  const formData = new FormData(form);

  fetch(form.action, {
    method: 'POST',
    body: formData
  })
    .then(() => {
      closeModal('bookModal');
      showBookOverlay();
      form.reset();
    })
    .catch(() => {
      closeModal('bookModal');
      showBookOverlay();
      form.reset();
    });
};

function showBookOverlay() {
  let overlay = document.getElementById('bookOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'bookOverlay';
    overlay.className = 'contact-overlay';
    overlay.innerHTML = `
      <div class="contact-popup">
        <div>Your booking request has been sent. A Curator will contact you soon.</div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';

  const hideTimer = setTimeout(() => closeBookOverlay(overlay), 5000);

  const handler = (ev) => {
    if (ev.target === overlay) {
      clearTimeout(hideTimer);
      overlay.removeEventListener('click', handler);
      closeBookOverlay(overlay);
    }
  };
  overlay.addEventListener('click', handler);
}

function closeBookOverlay(overlay) {
  overlay.classList.remove('show');
  document.body.style.overflow = '';
  setTimeout(() => {
    if (overlay && !overlay.classList.contains('show')) {
      overlay.remove();
    }
  }, 400);
}


// ── NOTIFY ME MODAL ───────────────────────────────────────
window.openNotifyModal = (tripDate) => {
  const sub = document.getElementById('notifyModalSub');
  if (sub) sub.textContent = `Be the first to know when the ${tripDate} trip drops. Reserve your spot in line.`;
  openModal('notifyModal');
};

window.handleNotify = (e) => {
  e.preventDefault();
  closeModal('notifyModal');
  showToast('🔔 You\'re on the list! We\'ll notify you the moment it drops.');
  e.target.reset();
};

// ── TOAST ─────────────────────────────────────────────────
function showToast(message) {
  const toast = document.getElementById('successToast');
  const msg = document.getElementById('toastMessage');
  if (!toast) return;
  if (msg) msg.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}
window.showToast = showToast;

// ── SCROLL REVEAL ─────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── CONTACT FORM TABS ─────────────────────────────────────
document.querySelectorAll('.form-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(target);
    if (panel) panel.classList.add('active');
  });
});

// ── GALLERY FILTER ────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.gallery-item').forEach(item => {
      const cat = item.dataset.category || 'all';
      item.style.display = (filter === 'all' || cat === filter) ? '' : 'none';
    });
  });
});

// ── SMOOTH HREF ANCHORS ───────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── SET ACTIVE NAV LINK ───────────────────────────────────
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const servicePages = ['corporate.html', 'family.html', 'individual.html'];

document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href');
  let isActive = false;

  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    isActive = true;
  }

  // Keep Services dropdown active on service sub-pages
  if (servicePages.includes(currentPage) && href === '#') {
    isActive = true;
  }

  if (isActive) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});

// ── PARALLAX HERO ─────────────────────────────────────────
const heroVideo = document.getElementById('heroVideo');
if (heroVideo) {
  window.addEventListener('scroll', () => {
    const translateY = window.scrollY * 0.35;
    heroVideo.style.transform = `translateY(${translateY}px)`;
  }, { passive: true });
}

// ── SERVICES DROPDOWN TOGGLE ──────────────────────────────
document.querySelectorAll('.dropdown > .nav-link').forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const dropdown = toggle.closest('.dropdown');
    if (dropdown) {
      dropdown.classList.toggle('open');
    }
  });
});

// ── WHY STAT COUNT-UP ─────────────────────────────────────
(function initWhyCountUp() {
  // Handle both home page stats and corporate page highlight bar stats
  const statNumbers = document.querySelectorAll('.why_stat-number[data-count], .stat-number[data-count]');
  if (statNumbers.length === 0) return;

  const duration = 1500; // ms — reasonably fast

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = Math.round(eased * target);

      // Wrap suffix in span for superscript styling
      el.innerHTML = current + (suffix ? '<span class="stat-suffix">' + suffix + '</span>' : '');

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => countObserver.observe(el));
})();

// ── WHY BAR CLICK / TAP ACTIVE STATE ──────────────────────
document.querySelectorAll('.why-bar').forEach(bar => {
  bar.addEventListener('click', () => {
    // Toggle active class; remove from siblings for single-active feel
    const isActive = bar.classList.contains('active');
    document.querySelectorAll('.why-bar').forEach(b => b.classList.remove('active'));
    if (!isActive) {
      bar.classList.add('active');
    }
  });
});

// ── GALLERY LIGHTBOX WITH SWIPE & BENTO LOGIC ────────────────
let currentGalleryIndex = 0;
let galleryImages = [];

document.addEventListener('DOMContentLoaded', () => {
  // Collect all gallery images
  const items = document.querySelectorAll('.gallery-grid .gallery-item');
  items.forEach((item, index) => {
    const img = item.querySelector('img');
    if (!img) return;

    // Extract caption from the onclick attribute, or alt text
    let caption = img.alt;
    const onclickStr = item.getAttribute('onclick');
    if (onclickStr) {
      const match = onclickStr.match(/openGalleryLightbox\('[^']+',\s*'([^']+)'\)/);
      if (match && match[1]) {
        caption = match[1];
      }
    }

    galleryImages.push({
      src: img.src,
      caption: caption
    });

    // Update onclick to use index instead
    item.removeAttribute('onclick');
    item.addEventListener('click', () => openGalleryLightbox(index));
  });

  // Touch event variables for swipe
  const lightboxImg = document.getElementById('galleryLightboxImg');
  let touchStartX = 0;
  let touchEndX = 0;

  if (lightboxImg) {
    lightboxImg.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxImg.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swiped left -> next
      nextGalleryImage();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swiped right -> prev
      prevGalleryImage();
    }
  }

  // Mobile Gallery Pagination
  const seeMoreBtn = document.getElementById('gallerySeeMoreBtn');
  const seeLessBtn = document.getElementById('gallerySeeLessBtn');
  const controls = document.getElementById('galleryControls');
  
  if (items.length > 0 && controls) {
    let currentLimit = 9;
    
    // Check if mobile view (standard max-width 768px for mobile)
    const isMobile = () => window.innerWidth <= 768;

    const updateGalleryVisibility = () => {
      if (!isMobile()) {
        // Show all on desktop
        items.forEach(item => item.style.display = '');
        controls.style.display = 'none';
        return;
      }
      
      controls.style.display = 'block';
      items.forEach((item, index) => {
        item.style.display = index < currentLimit ? '' : 'none';
      });
      
      if (seeMoreBtn) {
        seeMoreBtn.style.display = currentLimit < items.length ? 'inline-block' : 'none';
      }
      if (seeLessBtn) {
        seeLessBtn.style.display = currentLimit > 9 ? 'inline-block' : 'none';
      }
    };

    if (seeMoreBtn) {
      seeMoreBtn.addEventListener('click', () => {
        currentLimit += 9;
        updateGalleryVisibility();
      });
    }

    if (seeLessBtn) {
      seeLessBtn.addEventListener('click', () => {
        currentLimit = 9;
        updateGalleryVisibility();
        // Scroll back to top of gallery
        const galleryTitle = document.querySelector('.gallery-grid').previousElementSibling;
        if (galleryTitle) galleryTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    window.addEventListener('resize', updateGalleryVisibility);
    updateGalleryVisibility(); // Initial trigger
  }
});

function openGalleryLightbox(index) {
  if (typeof index === 'string') {
    // Fallback if called with string
    index = galleryImages.findIndex(item => item.src.includes(index));
    if (index === -1) index = 0;
  }

  const lightbox = document.getElementById('galleryLightbox');
  const img = document.getElementById('galleryLightboxImg');
  const cap = document.getElementById('galleryLightboxCaption');

  if (lightbox && img && galleryImages.length > 0) {
    currentGalleryIndex = index;
    const data = galleryImages[currentGalleryIndex];
    img.src = data.src;
    if (cap) cap.textContent = data.caption || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}
window.openGalleryLightbox = openGalleryLightbox;

function nextGalleryImage() {
  if (galleryImages.length === 0) return;
  currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
  updateGalleryLightbox();
}
window.nextGalleryImage = nextGalleryImage;

function prevGalleryImage() {
  if (galleryImages.length === 0) return;
  currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
  updateGalleryLightbox();
}
window.prevGalleryImage = prevGalleryImage;

function updateGalleryLightbox() {
  const img = document.getElementById('galleryLightboxImg');
  const cap = document.getElementById('galleryLightboxCaption');
  const data = galleryImages[currentGalleryIndex];

  if (img) {
    img.src = data.src;
    if (cap) cap.textContent = data.caption || '';
  }
}

// Add Keyboard support
document.addEventListener('keydown', e => {
  const lightbox = document.getElementById('galleryLightbox');
  if (lightbox && lightbox.classList.contains('active')) {
    if (e.key === 'ArrowRight') nextGalleryImage();
    if (e.key === 'ArrowLeft') prevGalleryImage();
  }
});

function closeGalleryLightbox(event) {
  if (event && event.target !== event.currentTarget && !event.target.classList.contains('lightbox-close')) return;
  const lightbox = document.getElementById('galleryLightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
}
window.closeGalleryLightbox = closeGalleryLightbox;

console.log('%cRoamCrew 🌿 — Rooted in Ghana. Built for the World.',
  'color:#c4622d;font-size:1rem;font-weight:700;');

// ── FORM VALIDATION FUNCTIONS ────────────────────────────────

// Validate name - min 2 chars, letters/spaces/hyphens only
function validateName(name) {
  if (!name || name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (!/^[a-zA-Z\s\-']+$/.test(name.trim())) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }
  return null;
}

// Validate email - proper email format
function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return 'Email is required';
  }
  const trimmedEmail = email.trim().toLowerCase();
  // Simple but effective email validation
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return 'Please enter a valid email (e.g., name@domain.com)';
  }
  return null;
}

// Validate phone - accepts Ghana and international formats
function validatePhone(phone) {
  if (!phone || phone.trim().length === 0) {
    return 'Phone number is required';
  }
  // Remove spaces and + for validation
  const cleanPhone = phone.replace(/[\s\+]/g, '');
  // Accept Ghana formats (+233, 0XX) or international (country codes 1-3 digits + number)
  // Minimum 8 digits, maximum 15 digits after removing special chars
  const phoneRegex = /^\d{8,15}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return 'Please enter a valid phone number (e.g., +233 24 123 4567)';
  }
  return null;
}

// Validate message - min 5 characters
function validateMessage(message) {
  if (!message || message.trim().length < 5) {
    return 'Message must be at least 5 characters';
  }
  return null;
}

// Show input error
function showInputError(input, message) {
  clearInputError(input);
  input.classList.add('input-error');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  input.parentNode.appendChild(errorDiv);
}

// Clear input error
function clearInputError(input) {
  input.classList.remove('input-error');
  const existingError = input.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
}

// Validate a form field and show error
function validateField(input, validatorFn, clearOnKeypress = true) {
  const error = validatorFn(input.value);
  if (error) {
    showInputError(input, error);
    return false;
  } else {
    clearInputError(input);
    input.classList.add('input-valid');
    return true;
  }
}

// Clear validation styles on input
function clearValidationStyles(input) {
  input.classList.remove('input-error', 'input-valid');
  const errorMsg = input.parentNode.querySelector('.error-message');
  if (errorMsg) {
    errorMsg.remove();
  }
}

// Clear all validation errors from a form
function clearFormErrors(form) {
  form.querySelectorAll('.input-error, .input-valid').forEach(input => {
    clearValidationStyles(input);
  });
}

// ── SHEETDB CONFIG ──────────────────────────────────────────────
const SHEETDB_API = 'https://sheetdb.io/api/v1/7xg1kjd78lg2t';
const SHEETDB_EMAIL = 'rahinakohusnah@gmail.com';

// ── CONTACT FORM HANDLER ─────────────────────────────────────
window.handleContact = async (e) => {
  e.preventDefault();
  const form = e.target;

  // Validate all fields
  let isValid = true;

  const nameInput = form.querySelector('#name');
  const emailInput = form.querySelector('#email');
  const mobileInput = form.querySelector('#mobile');
  const messageInput = form.querySelector('#message');

  // Clear previous errors
  clearFormErrors(form);

  // Validate name
  if (!validateField(nameInput, validateName)) {
    isValid = false;
  }

  // Validate email
  if (!validateField(emailInput, validateEmail)) {
    isValid = false;
  }

  // Validate phone
  if (!validateField(mobileInput, validatePhone)) {
    isValid = false;
  }

  // Validate message
  if (!validateField(messageInput, validateMessage)) {
    isValid = false;
  }

  // If validation fails, stop here
  if (!isValid) {
    // Focus first error field
    const firstError = form.querySelector('.input-error');
    if (firstError) {
      firstError.focus();
    }
    return;
  }

  // Get form values - use keys matching SheetDB column headers
  const formData = {
    data: [{
      'Full Name': nameInput.value.trim(),
      'Email Address': emailInput.value.trim(),
      'Mobile Number': mobileInput.value.trim(),
      'Company Name': form.querySelector('#company')?.value.trim() || '',
      'Message': messageInput.value.trim(),
      'submittedAt': new Date().toISOString()
    }]
  };

  try {
    // Submit to SheetDB
    const response = await fetch(SHEETDB_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('SheetDB submission failed');
    }

    // Send email notification via FormSubmit (silent, no UI)
    const notifyForm = new FormData();
    const companyVal = form.querySelector('#company')?.value.trim() || '';
    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const mobileVal = mobileInput.value.trim();
    const messageVal = messageInput.value.trim();
    
    notifyForm.append('email', emailVal); // The sender's email (if formsubmit supports reply-to, else use for tracking)
    notifyForm.append('name', nameVal);
    notifyForm.append('mobile', mobileVal);
    notifyForm.append('company', companyVal);
    notifyForm.append('message', `New Contact Form Submission\n\nName: ${nameVal}\nEmail: ${emailVal}\nMobile: ${mobileVal}\nCompany: ${companyVal}\n\nMessage:\n${messageVal}`);

    // Fire-and-forget email notification with no-cors
    fetch('https://formsubmit.co/rahinakohusnah@gmail.com', {
      method: 'POST',
      body: notifyForm,
      mode: 'no-cors'
    }).catch(() => { }); // Ignore errors

    // Show success overlay
    showContactSuccess();

  } catch (error) {
    console.error('Contact form error:', error);
    showContactSuccess(); // Still show success to avoid confusing user
  }
};

function showContactSuccess() {
  // Create overlay if not exists
  let overlay = document.getElementById('contactOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'contactOverlay';
    overlay.className = 'contact-overlay';
    overlay.innerHTML = `
      <div class="contact-popup">
        <div>Thank you. We'll be in touch shortly.</div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // Show overlay
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';

  // Reset form
  const form = document.getElementById('contactForm');
  if (form) form.reset();

  // Auto-hide after 5s
  const hideTimer = setTimeout(() => closeContactOverlay(overlay), 5000);

  // Hide on overlay click (not popup)
  const handler = (ev) => {
    if (ev.target === overlay) {
      clearTimeout(hideTimer);
      overlay.removeEventListener('click', handler);
      closeContactOverlay(overlay);
    }
  };
  overlay.addEventListener('click', handler);
}

function closeContactOverlay(overlay) {
  overlay.classList.remove('show');
  document.body.style.overflow = '';
  // Cleanup after animation
  setTimeout(() => {
    if (overlay && !overlay.classList.contains('show')) {
      overlay.remove();
    }
  }, 400);
}
