/**
 * ============================================================================
 * Hossam Abdelghany Mostafa — Portfolio Client Script
 * Stack: Pure Vanilla JavaScript (ES6+)
 * Description: Theme Manager, Mobile Nav, Scrollspy, Form Validation,
 *              Modal Specs, Copy to Clipboard, and Scroll Reveal Animations.
 * ============================================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. THEME MANAGER (DARK / LIGHT TOGGLE WITH LOCALSTORAGE PERSISTENCE)
     -------------------------------------------------------------------------- */
  const ThemeManager = {
    STORAGE_KEY: 'ham_portfolio_theme',
    themeToggleBtn: document.getElementById('theme-toggle'),
    htmlElement: document.documentElement,
    metaThemeColor: document.querySelector('meta[name="theme-color"]'),

    init() {
      // Default to dark mode unless 'light' is explicitly stored
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'dark';
      this.applyTheme(savedTheme, false);

      if (this.themeToggleBtn) {
        this.themeToggleBtn.addEventListener('click', () => {
          const currentTheme = this.htmlElement.getAttribute('data-theme') || 'dark';
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          this.applyTheme(newTheme, true);
        });
      }
    },

    applyTheme(theme, save = true) {
      this.htmlElement.setAttribute('data-theme', theme);
      if (save) {
        try {
          localStorage.setItem(this.STORAGE_KEY, theme);
        } catch (e) {
          console.warn('LocalStorage is not accessible:', e);
        }
      }

      // Update meta theme-color for mobile browser chrome
      if (this.metaThemeColor) {
        this.metaThemeColor.setAttribute('content', theme === 'dark' ? '#0b0f19' : '#f8fafc');
      }

      // Update ARIA label
      if (this.themeToggleBtn) {
        const isDark = theme === 'dark';
        this.themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
        this.themeToggleBtn.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      }
    }
  };

  /* --------------------------------------------------------------------------
     2. NAVIGATION & MOBILE MENU MANAGER
     -------------------------------------------------------------------------- */
  const NavigationManager = {
    header: document.getElementById('site-header'),
    mobileToggle: document.getElementById('mobile-toggle'),
    navMenu: document.getElementById('primary-navigation'),
    navLinks: document.querySelectorAll('.nav-link'),

    init() {
      // Sticky header elevation on scroll
      window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
          this.header.classList.add('scrolled');
        } else {
          this.header.classList.remove('scrolled');
        }
      }, { passive: true });

      // Mobile menu toggle
      if (this.mobileToggle && this.navMenu) {
        this.mobileToggle.addEventListener('click', () => {
          this.toggleMobileMenu();
        });

        // Close menu on link click
        this.navLinks.forEach(link => {
          link.addEventListener('click', () => {
            this.closeMobileMenu();
          });
        });

        // Close menu on outside click
        document.addEventListener('click', (event) => {
          if (!this.header.contains(event.target) && this.navMenu.classList.contains('is-open')) {
            this.closeMobileMenu();
          }
        });

        // Close menu on Escape key
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && this.navMenu.classList.contains('is-open')) {
            this.closeMobileMenu();
          }
        });
      }
    },

    toggleMobileMenu() {
      const isOpen = this.navMenu.classList.toggle('is-open');
      this.mobileToggle.classList.toggle('is-active', isOpen);
      this.mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    },

    closeMobileMenu() {
      this.navMenu.classList.remove('is-open');
      this.mobileToggle.classList.remove('is-active');
      this.mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  };

  /* --------------------------------------------------------------------------
     3. SCROLLSPY (ACTIVE NAVIGATION STATE OBSERVER)
     -------------------------------------------------------------------------- */
  const ScrollspyManager = {
    sections: document.querySelectorAll('section[id], header[id]'),
    navLinks: document.querySelectorAll('.nav-link'),

    init() {
      if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers
        window.addEventListener('scroll', () => this.handleScrollFallback(), { passive: true });
        return;
      }

      const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');
            this.setActiveLink(currentId);
          }
        });
      }, observerOptions);

      this.sections.forEach(section => observer.observe(section));
    },

    setActiveLink(id) {
      this.navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${id}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    },

    handleScrollFallback() {
      let currentSectionId = 'home';
      const scrollPos = window.scrollY + 120;

      this.sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = section.getAttribute('id');
        }
      });

      this.setActiveLink(currentSectionId);
    }
  };

  /* --------------------------------------------------------------------------
     4. SCROLL REVEAL ANIMATIONS
     -------------------------------------------------------------------------- */
  const ScrollRevealManager = {
    init() {
      // Check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        document.querySelectorAll('.animate-fade-in').forEach(el => el.classList.add('is-revealed'));
        return;
      }

      // Initial reveal for hero elements
      const heroElements = document.querySelectorAll('.hero-section .animate-fade-in');
      heroElements.forEach(el => el.classList.add('is-revealed'));

      // Elements to animate on scroll
      const animatableElements = document.querySelectorAll(
        '.value-card, .about-identity-col, .about-content-col, .education-card, .cert-card, .skill-category-card, .service-card, .project-card, .timeline-item, .achievement-card, .objective-card, .contact-item-card, .form-wrapper'
      );

      animatableElements.forEach(el => {
        el.classList.add('animate-fade-in');
      });

      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
      });

      animatableElements.forEach(el => revealObserver.observe(el));
    }
  };

  /* --------------------------------------------------------------------------
     5. BACK TO TOP BUTTON
     -------------------------------------------------------------------------- */
  const BackToTopManager = {
    floatingBtn: document.getElementById('floating-back-to-top'),
    footerLink: document.getElementById('footer-back-to-top'),

    init() {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
          this.floatingBtn.classList.add('is-visible');
        } else {
          this.floatingBtn.classList.remove('is-visible');
        }
      }, { passive: true });

      if (this.floatingBtn) {
        this.floatingBtn.addEventListener('click', () => {
          this.scrollToTop();
        });
      }

      if (this.footerLink) {
        this.footerLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollToTop();
        });
      }
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  /* --------------------------------------------------------------------------
     6. CONTACT FORM VALIDATION & INTERACTION
     -------------------------------------------------------------------------- */
  const ContactFormManager = {
    form: document.getElementById('contact-form'),
    nameInput: document.getElementById('contact-name'),
    emailInput: document.getElementById('contact-email'),
    subjectInput: document.getElementById('contact-subject'),
    messageInput: document.getElementById('contact-message'),
    submitBtn: document.getElementById('submit-btn'),
    successBanner: document.getElementById('form-success-banner'),
    senderNameSpan: document.getElementById('feedback-sender-name'),

    init() {
      if (!this.form) return;

      // Realtime validation clearing on input
      [this.nameInput, this.emailInput, this.subjectInput, this.messageInput].forEach(input => {
        input.addEventListener('input', () => {
          this.clearError(input);
        });
      });

      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    },

    handleSubmit() {
      let isValid = true;

      // Validate Name
      const nameVal = this.nameInput.value.trim();
      if (nameVal.length < 2) {
        this.showError(this.nameInput, 'name-error', 'Please provide your full name (minimum 2 characters).');
        isValid = false;
      } else {
        this.clearError(this.nameInput);
      }

      // Validate Email
      const emailVal = this.emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        this.showError(this.emailInput, 'email-error', 'Please provide a valid email address.');
        isValid = false;
      } else {
        this.clearError(this.emailInput);
      }

      // Validate Subject
      const subjectVal = this.subjectInput.value.trim();
      if (subjectVal.length < 3) {
        this.showError(this.subjectInput, 'subject-error', 'Please enter a subject (minimum 3 characters).');
        isValid = false;
      } else {
        this.clearError(this.subjectInput);
      }

      // Validate Message
      const messageVal = this.messageInput.value.trim();
      if (messageVal.length < 10) {
        this.showError(this.messageInput, 'message-error', 'Please write a message (minimum 10 characters).');
        isValid = false;
      } else {
        this.clearError(this.messageInput);
      }

      if (!isValid) {
        return;
      }

      // Simulate sending state
      this.submitBtn.classList.add('is-loading');
      this.submitBtn.disabled = true;

      setTimeout(() => {
        this.submitBtn.classList.remove('is-loading');
        this.submitBtn.disabled = false;

        // Show success alert
        if (this.senderNameSpan) {
          this.senderNameSpan.textContent = nameVal;
        }
        if (this.successBanner) {
          this.successBanner.classList.add('is-visible');
        }

        // Reset form
        this.form.reset();

        ToastManager.show('Message validated successfully! (Front-end demo)');
      }, 900);
    },

    showError(input, errorId, message) {
      input.classList.add('is-invalid');
      const errEl = document.getElementById(errorId);
      if (errEl) {
        errEl.textContent = message;
      }
    },

    clearError(input) {
      input.classList.remove('is-invalid');
      const errorId = `${input.name}-error`;
      const errEl = document.getElementById(errorId);
      if (errEl) {
        errEl.textContent = '';
      }
    }
  };

  /* --------------------------------------------------------------------------
     7. TOAST NOTIFICATION MANAGER
     -------------------------------------------------------------------------- */
  const ToastManager = {
    container: document.getElementById('toast-container'),

    show(message, duration = 4000) {
      if (!this.container) return;

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'alert');
      toast.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-cyan); flex-shrink: 0;">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span>${message}</span>
      `;

      this.container.appendChild(toast);

      setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  };

  /* --------------------------------------------------------------------------
     8. CLIPBOARD MANAGER (ONE-CLICK COPY EMAIL)
     -------------------------------------------------------------------------- */
  const ClipboardManager = {
    copyBtn: document.getElementById('copy-email-btn'),
    emailAddress: 'hsambdalghny02@gmail.com',

    init() {
      if (!this.copyBtn) return;

      this.copyBtn.addEventListener('click', async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(this.emailAddress);
          } else {
            // Fallback for older browsers
            const tempInput = document.createElement('input');
            tempInput.value = this.emailAddress;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
          }

          ToastManager.show('Email address copied to clipboard!');
        } catch (err) {
          ToastManager.show('Failed to copy. Email: ' + this.emailAddress);
        }
      });
    }
  };

  /* --------------------------------------------------------------------------
     9. PROJECT ARCHITECTURE MODAL MANAGER
     -------------------------------------------------------------------------- */
  const ProjectModalManager = {
    modal: document.getElementById('project-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalProjectNum: document.getElementById('modal-project-num'),
    modalContent: document.getElementById('modal-content'),
    closeBtn: document.getElementById('modal-close-btn'),
    closeActionBtn: document.getElementById('modal-close-action'),
    triggers: document.querySelectorAll('.btn-modal-trigger'),

    // Detailed project specifications
    projectData: {
      '1': {
        num: 'PROJECT 01 SPECIFICATION',
        title: 'Secure Cloud File Management Application',
        content: `
          <h4>System Architecture &amp; Cloud Topology</h4>
          <p>
            This application is architected to showcase cloud security best practices by hosting a Python Flask microservice on an Amazon Linux EC2 instance residing within a Virtual Private Cloud (VPC).
          </p>
          <div class="modal-arch-box">
Client (TLS 1.3 HTTPS)
    ↓
Nginx Reverse Proxy / Amazon Linux EC2
    ↓
Python Flask Web Application
    ↓  [IAM Role AssumePolicy: PutObject, GetObject]
AWS KMS (Symmetric Customer Master Key)
    ↓  [Server-Side Encryption: SSE-KMS]
Amazon S3 Bucket (Private, Block Public Access Enabled)
          </div>
          <h4>Core Security Controls Implemented</h4>
          <ul>
            <li><strong>AWS KMS Encryption:</strong> Automated cryptographic protection ensuring data at rest is encrypted using customer-managed keys.</li>
            <li><strong>IAM Least Privilege:</strong> EC2 instance utilizes an attached IAM Instance Profile with precise ARN scoping, eliminating hardcoded credentials.</li>
            <li><strong>S3 Bucket Hardening:</strong> Public access block turned ON, bucket policies enforcing SSL-only connections (\`aws:SecureTransport\`).</li>
            <li><strong>Server-Side Input Sanitization:</strong> Strict file extension whitelisting, MIME type validation, and file size quotas to mitigate malicious upload vectors.</li>
            <li><strong>Linux Server Hardening:</strong> Configured systemd service isolation, least-privilege service accounts, and SSH key-based authentication.</li>
          </ul>
        `
      },
      '2': {
        num: 'PROJECT 02 SPECIFICATION',
        title: 'Python Network &amp; Web Security Scanner',
        content: `
          <h4>Tool Design &amp; Assessment Methodology</h4>
          <p>
            Engineered using standard Python networking libraries to provide lightweight reconnaissance and configuration auditing for authorized target environments.
          </p>
          <div class="modal-arch-box">
CLI Target Input (IP / Domain)
    ↓
[Socket Module Engine] ──→ TCP Connect Scan (Selected Port Range)
    ↓
[Requests HTTP Auditor] ──→ Inspect Security Headers
    ├── Strict-Transport-Security (HSTS)
    ├── Content-Security-Policy (CSP)
    ├── X-Frame-Options (Clickjacking defense)
    └── X-Content-Type-Options
    ↓
Formatted Security Assessment Report Output
          </div>
          <h4>Assessment Capabilities</h4>
          <ul>
            <li><strong>Port Scanning:</strong> Multi-threaded TCP connect scan evaluating open services, banner responsiveness, and potential perimeter exposures.</li>
            <li><strong>Security Headers Audit:</strong> Evaluates presence and configuration correctness of vital HTTP security response headers.</li>
            <li><strong>Defensive Orientation:</strong> Assists system administrators in detecting unauthorized open ports and missing defensive browser policies.</li>
            <li><strong>Strict Authorization Notice:</strong> Programmed with pre-execution safety confirmations reminding operators that testing is strictly permitted on owned or explicitly authorized targets.</li>
          </ul>
        `
      },
      '3': {
        num: 'PROJECT 03 SPECIFICATION',
        title: 'Multi-Subnet Enterprise Network Topology',
        content: `
          <h4>Enterprise Network Design &amp; Traffic Segmentation</h4>
          <p>
            Designed and simulated in Cisco Packet Tracer to demonstrate enterprise-grade network segmentation, multi-VLAN routing, and hardware-level port protection.
          </p>
          <div class="modal-arch-box">
Core Gateway Router (Inter-VLAN Routing &amp; NAT)
    ├── Trunk Link (802.1Q Encapsulation)
Distribution / Access Switches
    ├── VLAN 10: Management Subnet (192.168.10.0/24)
    ├── VLAN 20: Engineering Subnet (192.168.20.0/24)
    └── VLAN 30: Restricted Server Farm (192.168.30.0/24)
Security Controls: Extended ACLs + Port Security (Sticky MAC)
          </div>
          <h4>Implemented Network Security Mechanisms</h4>
          <ul>
            <li><strong>Network Segmentation:</strong> Isolated sensitive subnets via VLANs, preventing lateral threat movement across departments.</li>
            <li><strong>Extended Access Control Lists (ACLs):</strong> Enforced strict unidirectional traffic rules, restricting external access to the Server Farm while allowing established return traffic.</li>
            <li><strong>Switch Port Security:</strong> Configured MAC address limits and \`switchport port-security violation restrict/shutdown\` to prevent rogue hardware attachments and ARP spoofing.</li>
            <li><strong>Traffic Routing:</strong> Configured static routes and inter-VLAN routing protocols with verified connectivity benchmarks.</li>
          </ul>
        `
      }
    },

    init() {
      if (!this.modal) return;

      this.triggers.forEach(btn => {
        btn.addEventListener('click', () => {
          const projectId = btn.getAttribute('data-project');
          this.openModal(projectId);
        });
      });

      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.closeModal());
      }

      if (this.closeActionBtn) {
        this.closeActionBtn.addEventListener('click', () => this.closeModal());
      }

      // Close on backdrop click
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });

      // Close on ESC key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal.classList.contains('is-active')) {
          this.closeModal();
        }
      });
    },

    openModal(projectId) {
      const data = this.projectData[projectId];
      if (!data) return;

      this.modalProjectNum.textContent = data.num;
      this.modalTitle.textContent = data.title;
      this.modalContent.innerHTML = data.content;

      this.modal.classList.add('is-active');
      this.modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Focus close button for accessibility
      this.closeBtn.focus();
    },

    closeModal() {
      this.modal.classList.remove('is-active');
      this.modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  /* --------------------------------------------------------------------------
     10. CERTIFICATE LIGHTBOX MODAL MANAGER
     -------------------------------------------------------------------------- */
  const CertificateModalManager = {
    modal: document.getElementById('cert-lightbox-modal'),
    modalTitle: document.getElementById('cert-modal-title'),
    modalIssuer: document.getElementById('cert-modal-issuer'),
    modalMeta: document.getElementById('cert-modal-meta'),
    modalImage: document.getElementById('cert-modal-image'),
    openLink: document.getElementById('cert-modal-open-link'),
    closeBtn: document.getElementById('cert-modal-close-btn'),
    closeActionBtn: document.getElementById('cert-modal-close-action'),
    triggers: document.querySelectorAll('.btn-cert-lightbox, .btn-cert-open'),
    cardMediaWrappers: document.querySelectorAll('.cert-media-wrapper'),

    init() {
      if (!this.modal) return;

      // Attach clicks to explicit buttons
      this.triggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const img = btn.getAttribute('data-cert-img');
          const title = btn.getAttribute('data-cert-title');
          const issuer = btn.getAttribute('data-cert-issuer');
          const meta = btn.getAttribute('data-cert-meta');
          this.openModal({ img, title, issuer, meta });
        });
      });

      // Also allow clicking directly on image wrapper
      this.cardMediaWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
          // If clicked the button inside, the button handler fires with stopPropagation
          const trigger = wrapper.querySelector('.btn-cert-lightbox');
          if (trigger) {
            const img = trigger.getAttribute('data-cert-img');
            const title = trigger.getAttribute('data-cert-title');
            const issuer = trigger.getAttribute('data-cert-issuer');
            const meta = trigger.getAttribute('data-cert-meta');
            this.openModal({ img, title, issuer, meta });
          }
        });
      });

      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.closeModal());
      }

      if (this.closeActionBtn) {
        this.closeActionBtn.addEventListener('click', () => this.closeModal());
      }

      // Close on backdrop click
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });

      // Close on ESC key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal.classList.contains('is-active')) {
          this.closeModal();
        }
      });
    },

    openModal({ img, title, issuer, meta }) {
      if (!img) return;

      if (this.modalTitle) this.modalTitle.textContent = title || 'Certificate Preview';
      if (this.modalIssuer) this.modalIssuer.textContent = issuer || 'VERIFIED CREDENTIAL';
      if (this.modalMeta) this.modalMeta.textContent = meta || '';
      if (this.modalImage) {
        this.modalImage.src = img;
        this.modalImage.alt = title || 'Certificate image view';
      }
      if (this.openLink) {
        this.openLink.href = img;
      }

      this.modal.classList.add('is-active');
      this.modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      if (this.closeBtn) {
        this.closeBtn.focus();
      }
    },

    closeModal() {
      this.modal.classList.remove('is-active');
      this.modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (this.modalImage) {
        this.modalImage.src = '';
      }
    }
  };

  /* --------------------------------------------------------------------------
     11. INITIALIZATION CONTROLLER
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    NavigationManager.init();
    ScrollspyManager.init();
    ScrollRevealManager.init();
    BackToTopManager.init();
    ContactFormManager.init();
    ClipboardManager.init();
    ProjectModalManager.init();
    CertificateModalManager.init();
  });

})();
