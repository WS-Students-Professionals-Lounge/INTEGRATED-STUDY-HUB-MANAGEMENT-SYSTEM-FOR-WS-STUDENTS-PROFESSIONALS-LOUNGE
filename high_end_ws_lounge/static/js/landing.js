document.addEventListener('DOMContentLoaded', function() {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginNavBtn = document.getElementById('loginNavBtn');
    const registerNavBtn = document.getElementById('registerNavBtn');
    const bookNowBtn = document.getElementById('bookNowBtn');
    const closeLogin = document.getElementById('closeLogin');
    const closeRegister = document.getElementById('closeRegister');
    const toRegister = document.getElementById('toRegister');
    const toLogin = document.getElementById('toLogin');
    const loginForm = document.querySelector('#loginModal form[action*="/login"]');
    const navToggle = document.getElementById('navToggle');
    const primaryNavigation = document.getElementById('primaryNavigation');
    let modalTrigger = null;

    function setNavigationOpen(isOpen) {
        if (!navToggle || !primaryNavigation) return;

        primaryNavigation.classList.toggle('is-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    }

    if (navToggle && primaryNavigation) {
        navToggle.addEventListener('click', function() {
            setNavigationOpen(navToggle.getAttribute('aria-expanded') !== 'true');
        });

        primaryNavigation.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                setNavigationOpen(false);
            });
        });

        document.addEventListener('click', function(event) {
            if (!primaryNavigation.contains(event.target) && !navToggle.contains(event.target)) {
                setNavigationOpen(false);
            }
        });

        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) setNavigationOpen(false);
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function() {
            if (typeof window.clearStaleClientSessionNotifications === 'function') {
                window.clearStaleClientSessionNotifications();
            }
        });
    }

    function showModal(modal) {
        if (modal) {
            modalTrigger = document.activeElement;
            modal.setAttribute('aria-hidden', 'false');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            const firstInput = modal.querySelector('input:not([type="hidden"]), button, a[href]');
            if (firstInput) firstInput.focus();
        }
    }

    function hideModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (modalTrigger && typeof modalTrigger.focus === 'function') {
                modalTrigger.focus();
                modalTrigger = null;
            }
        }
    }

    if (loginNavBtn) {
        loginNavBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showModal(loginModal);
        });
    }

    if (registerNavBtn) {
        registerNavBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showModal(registerModal);
        });
    }

    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showModal(registerModal);
        });
    }

    if (closeLogin) {
        closeLogin.addEventListener('click', function() {
            hideModal(loginModal);
        });
    }

    if (closeRegister) {
        closeRegister.addEventListener('click', function() {
            hideModal(registerModal);
        });
    }

    if (toRegister) {
        toRegister.addEventListener('click', function(e) {
            e.preventDefault();
            hideModal(loginModal);
            showModal(registerModal);
        });
    }

    if (toLogin) {
        toLogin.addEventListener('click', function(e) {
            e.preventDefault();
            hideModal(registerModal);
            showModal(loginModal);
        });
    }

    // Close modals on outside click
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            hideModal(loginModal);
        }
        if (e.target === registerModal) {
            hideModal(registerModal);
        }
    });

    // Close modals on Escape key
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (loginModal && loginModal.style.display === 'flex') {
                hideModal(loginModal);
            } else if (registerModal && registerModal.style.display === 'flex') {
                hideModal(registerModal);
            } else {
                setNavigationOpen(false);
            }
            return;
        }

        const openModal = [loginModal, registerModal].find(modal => modal && modal.style.display === 'flex');
        if (e.key === 'Tab' && openModal) {
            const focusableElements = Array.from(openModal.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])'
            ));
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });

    // Keep section headings visible below the sticky header during navigation.
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('.header')?.getBoundingClientRect().height || 0;
                    const targetTop = window.scrollY + target.getBoundingClientRect().top - headerHeight;
                    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

                    window.scrollTo({
                        top: Math.max(0, targetTop),
                        behavior: prefersReducedMotion ? 'auto' : 'smooth'
                    });
                }
            }
        });
    });

        // Function para mag-hide sang flash alert box kun magbalhin sang modal
    const toRegisterBtn = document.getElementById("toRegister");
    const toLoginBtn = document.getElementById("toLogin");

    if (toRegisterBtn) {
        toRegisterBtn.addEventListener("click", function() {
            // I-hide ang tanan nga existing flash alert boxes
            document.querySelectorAll(".modal-flash").forEach(el => el.style.display = "none");
        });
    }

    if (toLoginBtn) {
        toLoginBtn.addEventListener("click", function() {
            // I-hide ang tanan nga existing flash alert boxes
            document.querySelectorAll(".modal-flash").forEach(el => el.style.display = "none");
        });
    }

    // Show register or login modal if redirected from auth routes
    const showRegister = document.body.dataset.showRegister === 'true';
    const showLogin = document.body.dataset.showLogin === 'true';

    if (showRegister) {
        showModal(registerModal);
    }
    if (showLogin) {
        showModal(loginModal);
    }

    document.querySelectorAll('.btn-apply').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showModal(registerModal);
        });
    });

document.addEventListener("input", function(e) {
    // 1. Pangitaon kun ang naga-type ang user ARA SA SULOD sang Register Modal (#registerModal)
    const registerModal = e.target.closest("#registerModal");
    if (!registerModal) return; // Kun wala sa Register Modal, pabayaan lang

    // 2. Kuhanon ang duha ka Password input fields sa sulod sang Register Modal
    const regPass = registerModal.querySelector("#reg_password");
    const regConfirm = registerModal.querySelector("#reg_confirm_password");
    if (!regPass || !regConfirm) return;

    if (e.target !== regPass && e.target !== regConfirm) return;

    const regBar = document.getElementById("reg-strength-bar");
    const regText = document.getElementById("reg-strength-text");
    const regMatch = document.getElementById("reg-match-text");

    // 3. LIVE STRENGTH METER LOGIC
    if (e.target === regPass && regBar && regText) {
        const val = regPass.value;
        let score = 0;

        if (!val) {
            regBar.style.width = "0%";
            regText.textContent = "";
        } else {
            const hasLetters = /[a-zA-Z]/.test(val);
            const hasNumbers = /[0-9]/.test(val);
            const isLong = val.length >= 8;

            if (isLong) score += 33;
            if (hasLetters) score += 33;
            if (hasNumbers) score += 34;

            regBar.style.width = score + "%";

            if (!hasLetters || !hasNumbers || !isLong) {
                regBar.style.backgroundColor = "#dc3545"; // RED
                regText.style.color = "#dc3545";
                regText.textContent = "Must be 8+ characters with letters & numbers";
            } else if (val.length < 10) {
                regBar.style.backgroundColor = "#ffc107"; // YELLOW
                regText.style.color = "#d97706";
                regText.textContent = "Good Alphanumeric Password";
            } else {
                regBar.style.backgroundColor = "#198754"; // GREEN
                regText.style.color = "#198754";
                regText.textContent = "Strong Password!";
            }
        }
    }

    // Update the match indicator immediately as either password changes.
    if (regMatch) {
        const pVal = regPass.value;
        const cVal = regConfirm.value;

        if (!cVal) {
            regMatch.textContent = "";
            regMatch.classList.remove("visible", "match-success", "match-danger");
            return;
        }

        regMatch.classList.add("visible");
        if (pVal === cVal) {
            regMatch.textContent = "✓ Passwords match!";
            regMatch.classList.add("match-success");
            regMatch.classList.remove("match-danger");
        } else {
            regMatch.textContent = "✗ Passwords do not match";
            regMatch.classList.add("match-danger");
            regMatch.classList.remove("match-success");
        }
    }
});

    // Function para mag-dismiss sang alerts gamit ang CSS class nga .fade-out
    function autoDismissAlerts() {
      const alerts = document.querySelectorAll(".alert, .flash-message, .modal-flash, [role='alert']");

      alerts.forEach(function (alert) {
        // Indi na i-process liwat kon naga-fade out na o na-process na sang una
        if (alert.dataset.dismissing === "true") return;
        alert.dataset.dismissing = "true";

        // Mag-hulat 3.5 ka segundo bago mag-start fade out
        setTimeout(function () {
          // I-apply ang smooth CSS transition class
          alert.classList.add("fade-out");

          // Papanason sa DOM matapos ang animation (500ms)
          setTimeout(function () {
            alert.remove();
          }, 500);
        }, 3500); // 3.5 seconds
      });
    }

    // Run gilayon sa pag-load sang page
    autoDismissAlerts();

    // Listener para sa mga dynamic alerts (e.g., pag mag-open sang Modal)
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length) {
          autoDismissAlerts();
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("click", function (event) {
      const dismissButton = event.target instanceof Element
        ? event.target.closest(".modal-flash-close")
        : null;
      if (dismissButton) {
        const alert = dismissButton.closest(".modal-flash");
        if (alert) alert.remove();
      }
    });

    // EYE SHOW/HIDE PASSWORD TOGGLE
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Pangitaon ang kaangay nga input field sa sulod sang pareho nga container
            const container = this.closest('.password-wrapper') || this.parentElement;
            const input = container.querySelector('input');
            const icon = this.querySelector('i') || this;

            if (input) {
                const isPassword = input.getAttribute('type') === 'password';
                input.setAttribute('type', isPassword ? 'text' : 'password');

                // Switch icons (FontAwesome)
                if (icon) {
                    if (isPassword) {
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    } else {
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    }
                }
            }
        });
    });
});