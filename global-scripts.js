// Global JavaScript - Unified Components and Interactions

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializeScrollAnimations();
  initializeImageGallery();
  initializeForms();
  initializeSearchFunctionality();
});

// Navigation Management
function initializeNavigation() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Mobile menu toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      // Prevent body scroll when menu is open
      if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }
  
  // Close mobile menu when clicking on a link
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (menuToggle && navMenu) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (menuToggle && navMenu && 
        !menuToggle.contains(e.target) && 
        !navMenu.contains(e.target)) {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  
  // Active navigation highlighting
  updateActiveNavigation();
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Update active navigation based on current page
function updateActiveNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    
    if (href === currentPath || 
        href === currentPath.split('/').pop() ||
        (currentPath.includes('index') && href === 'index.html') ||
        (currentPath.endsWith('/') && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Scroll Animations using Intersection Observer
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);
  
  // Observe elements that should animate
  const animatedElements = document.querySelectorAll('.card, .info-card, .gallery-item, .content-section');
  animatedElements.forEach(el => {
    el.classList.add('animate-ready');
    observer.observe(el);
  });
  
  // Add CSS for animations
  addScrollAnimationStyles();
}

// Add scroll animation CSS
function addScrollAnimationStyles() {
  if (document.getElementById('scroll-animations')) return;
  
  const style = document.createElement('style');
  style.id = 'scroll-animations';
  style.textContent = `
    .animate-ready {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .animate-in {
      opacity: 1;
      transform: translateY(0);
    }
    
    .card.animate-ready,
    .info-card.animate-ready {
      transform: translateY(20px) scale(0.95);
    }
    
    .card.animate-in,
    .info-card.animate-in {
      transform: translateY(0) scale(1);
    }
    
    @media (prefers-reduced-motion: reduce) {
      .animate-ready {
        opacity: 1;
        transform: none;
        transition: none;
      }
    }
  `;
  document.head.appendChild(style);
}

// Image Gallery Management
function initializeImageGallery() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach(item => {
    const img = item.querySelector('.gallery-image');
    if (!img) return;
    
    // Add loading state
    img.addEventListener('load', function() {
      item.classList.add('loaded');
    });
    
    // Add error handling
    img.addEventListener('error', function() {
      item.classList.add('error');
      console.warn('Failed to load image:', img.src);
    });
    
    // Add click interaction for potential lightbox
    item.addEventListener('click', function(e) {
      e.preventDefault();
      // Future: implement lightbox functionality
      console.log('Gallery item clicked:', img.src);
    });
  });
  
  // Add lazy loading for images
  implementLazyLoading();
}

// Implement lazy loading for images
function implementLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });
    
    // Observe images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Form Management
function initializeForms() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    // Real-time validation
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateField(this);
      });
      
      input.addEventListener('input', function() {
        // Remove error state on input
        if (this.classList.contains('error')) {
          this.classList.remove('error');
          const errorMsg = this.parentNode.querySelector('.form-error');
          if (errorMsg) errorMsg.remove();
        }
      });
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      let isValid = true;
      inputs.forEach(input => {
        if (!validateField(input)) {
          isValid = false;
        }
      });
      
      if (isValid) {
        handleFormSubmission(form);
      }
    });
  });
}

// Field validation
function validateField(field) {
  const value = field.value.trim();
  const type = field.type;
  const required = field.hasAttribute('required');
  
  // Clear previous errors
  field.classList.remove('error');
  const existingError = field.parentNode.querySelector('.form-error');
  if (existingError) existingError.remove();
  
  let isValid = true;
  let errorMessage = '';
  
  // Required validation
  if (required && !value) {
    isValid = false;
    errorMessage = 'Este campo es obligatorio';
  }
  // Email validation
  else if (type === 'email' && value && !isValidEmail(value)) {
    isValid = false;
    errorMessage = 'Ingresa un email válido';
  }
  // Phone validation
  else if (type === 'tel' && value && !isValidPhone(value)) {
    isValid = false;
    errorMessage = 'Ingresa un número de teléfono válido';
  }
  // Minimum length validation
  else if (field.minLength && value.length > 0 && value.length < field.minLength) {
    isValid = false;
    errorMessage = `Mínimo ${field.minLength} caracteres`;
  }
  
  if (!isValid) {
    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = errorMessage;
    field.parentNode.appendChild(errorDiv);
  }
  
  return isValid;
}

// Email validation
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Phone validation
function isValidPhone(phone) {
  const re = /^\+?[\d\s\-\(\)]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 9;
}

// Handle form submission
function handleFormSubmission(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  // Show loading state
  submitBtn.textContent = 'Enviando...';
  submitBtn.disabled = true;
  
  // Simulate form submission (replace with actual API call)
  setTimeout(() => {
    showNotification('¡Formulario enviado exitosamente!', 'success');
    form.reset();
    
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }, 2000);
}

// Search Functionality
function initializeSearchFunctionality() {
  const searchBtn = document.querySelector('.search-btn');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      // Toggle search interface
      toggleSearchInterface();
    });
  }
  
  // Handle search form if it exists
  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const query = this.querySelector('input').value.trim();
      if (query) {
        performSearch(query);
      }
    });
  }
}

// Toggle search interface
function toggleSearchInterface() {
  let searchOverlay = document.querySelector('.search-overlay');
  
  if (!searchOverlay) {
    searchOverlay = createSearchOverlay();
    document.body.appendChild(searchOverlay);
  }
  
  searchOverlay.classList.toggle('active');
  
  if (searchOverlay.classList.contains('active')) {
    const searchInput = searchOverlay.querySelector('input');
    setTimeout(() => searchInput.focus(), 100);
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

// Create search overlay
function createSearchOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-modal">
      <div class="search-header">
        <h3>Buscar en el sitio</h3>
        <button class="search-close">&times;</button>
      </div>
      <form class="search-form">
        <input type="text" placeholder="¿Qué estás buscando?" class="search-input">
        <button type="submit" class="btn btn-primary">Buscar</button>
      </form>
      <div class="search-results"></div>
    </div>
  `;
  
  // Add styles
  addSearchStyles();
  
  // Add event listeners
  overlay.querySelector('.search-close').addEventListener('click', () => {
    toggleSearchInterface();
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      toggleSearchInterface();
    }
  });
  
  return overlay;
}

// Add search styles
function addSearchStyles() {
  if (document.getElementById('search-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'search-styles';
  style.textContent = `
    .search-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    
    .search-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    
    .search-modal {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      width: 90%;
      max-width: 600px;
      transform: scale(0.9);
      transition: transform 0.3s ease;
    }
    
    .search-overlay.active .search-modal {
      transform: scale(1);
    }
    
    .search-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    
    .search-close {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      padding: 0;
      color: #666;
    }
    
    .search-form {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .search-input {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
    }
    
    .search-results {
      max-height: 300px;
      overflow-y: auto;
    }
  `;
  document.head.appendChild(style);
}

// Perform search
function performSearch(query) {
  const resultsContainer = document.querySelector('.search-results');
  if (!resultsContainer) return;
  
  resultsContainer.innerHTML = '<p>Buscando...</p>';
  
  // Simulate search (replace with actual search implementation)
  setTimeout(() => {
    resultsContainer.innerHTML = `
      <div class="search-result">
        <h4>Resultados para: "${query}"</h4>
        <p>La funcionalidad de búsqueda está en desarrollo.</p>
      </div>
    `;
  }, 1000);
}

// Notification System
function showNotification(message, type = 'info', duration = 5000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add styles if not exists
  addNotificationStyles();
  
  document.body.appendChild(notification);
  
  // Show animation
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Auto hide
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Add notification styles
function addNotificationStyles() {
  if (document.getElementById('notification-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
    }
    
    .notification.show {
      transform: translateX(0);
    }
    
    .notification-info {
      background-color: #3b82f6;
    }
    
    .notification-success {
      background-color: #10b981;
    }
    
    .notification-warning {
      background-color: #f59e0b;
    }
    
    .notification-error {
      background-color: #ef4444;
    }
  `;
  document.head.appendChild(style);
}

// Utility Functions
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

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
  // Update any size-dependent elements
  updateActiveNavigation();
}, 250));

// Handle scroll events
window.addEventListener('scroll', throttle(() => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
}, 100));

// Export functions for global use
window.AppUtils = {
  showNotification,
  validateField,
  debounce,
  throttle
};