document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.getElementById('soloMenuToggle');
    const menuBackdrop = document.getElementById('soloSidebarBackdrop');
    const sidebar = document.querySelector('.sidebar');

    if (menuButton && menuBackdrop && sidebar) {
        sidebar.id = 'soloMobileSidebar';
        const menuIcon = menuButton.querySelector('i');

        function setSoloMenuOpen(isOpen) {
            sidebar.classList.toggle('solo-drawer-open', isOpen);
            menuBackdrop.classList.toggle('is-visible', isOpen);
            menuButton.setAttribute('aria-expanded', String(isOpen));
            menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
            document.body.classList.toggle('solo-menu-open', isOpen);

            if (menuIcon) {
                menuIcon.classList.toggle('fa-bars', !isOpen);
                menuIcon.classList.toggle('fa-xmark', isOpen);
            }
        }

        menuButton.addEventListener('click', () => {
            setSoloMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
        });
        menuBackdrop.addEventListener('click', () => setSoloMenuOpen(false));
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setSoloMenuOpen(false));
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
                setSoloMenuOpen(false);
                menuButton.focus();
            }
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) setSoloMenuOpen(false);
        });
    }

    const modal = document.getElementById("plan-selection-modal");
    const planTitle = document.getElementById("modal-plan-title");
    const planPrice = document.getElementById("modal-plan-price");
    const paymentDetails = document.getElementById("modal-payment-details");
    const accountName = document.getElementById("modal-account-name");
    const accountNumber = document.getElementById("modal-account-number");
    const instructions = document.getElementById("modal-instructions");
    const qrWrap = document.getElementById("modal-qr-wrap");
    const qrImage = document.getElementById("modal-qr-image");
    const receiptInput = document.getElementById("modal-receipt");
    const termsCheckbox = document.getElementById("modal-terms");
    const errorContainer = document.getElementById("modal-error");
    const submitButton = document.getElementById("modal-submit");
    const cancelButton = document.getElementById("modal-cancel");
    const closeButton = document.getElementById("plan-modal-close");
    const paymentMethodRadios = Array.from(document.querySelectorAll("input[name='modal_payment_method']"));

    let selectedPlan = null;
    let paymentInfo = {};
    let selectedMethod = null;

    async function loadPaymentInfo() {
        try {
            const response = await fetch('/api/payment-info');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Unable to load payment instructions.`);
            }
            paymentInfo = await response.json();
            console.log('Payment info loaded:', paymentInfo);
            
            // Validate that payment methods have QR codes
            for (const method in paymentInfo) {
                const info = paymentInfo[method];
                if (!info.qr_image) {
                    console.warn(`Warning: ${method} payment method has no QR code configured.`);
                } else {
                    console.log(`✓ ${method} QR code: ${info.qr_image}`);
                }
            }
        } catch (err) {
            console.error('Error loading payment info:', err);
            errorContainer.textContent = 'Unable to load payment instructions. Please refresh the page and try again.';
        }
    }

    function showModal() {
        if (!selectedPlan) return;
        planTitle.textContent = `Purchase ${selectedPlan.name}`;
        planPrice.textContent = selectedPlan.price;
        paymentDetails.classList.add('d-none');
        qrWrap.classList.add('d-none');
        accountName.textContent = '';
        accountNumber.textContent = '';
        instructions.textContent = '';
        receiptInput.value = '';
        termsCheckbox.checked = false;
        errorContainer.textContent = '';
        selectedMethod = null;
        paymentMethodRadios.forEach(radio => radio.checked = false);
        modal.classList.remove('d-none');
        modal.setAttribute('aria-hidden', 'false');
        // Prevent background scroll while modal is open
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.classList.add('d-none');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        selectedPlan = null;
        selectedMethod = null;
    }

    // Function para mag-update sang Payment Details & QR Code Image
    function updatePaymentDetails(method) {
        selectedMethod = method;
        const info = paymentInfo[method];

        if (info) {
            accountName.textContent = info.account_name || 'N/A';
            accountNumber.textContent = info.account_number || 'N/A';
            instructions.textContent = info.instructions || 'N/A';
            paymentDetails.classList.remove('d-none');

            // QR IMAGE PATH:
            if (info.qr_image) {
                // Gin-dugang ang '/static/uploads/payment/' path
                qrImage.src = `/static/uploads/payment/${info.qr_image}`;
                qrWrap.classList.remove('d-none');
            } else {
                qrWrap.classList.add('d-none');
            }
        } else {
            paymentDetails.classList.add('d-none');
            qrWrap.classList.add('d-none');
        }
    }

    //  2. Event Listener para sa GCash kag Maya Radio Buttons
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                updatePaymentDetails(e.target.value); // e.target.value contains 'GCash' or 'Maya'
            }
        });
    });

    function updatePaymentInstructions() {
        const method = selectedMethod;
        
        // Wait for payment info to load if not ready yet
        if (Object.keys(paymentInfo).length === 0) {
            paymentDetails.classList.add('d-none');
            errorContainer.textContent = 'Loading payment information... Please wait.';
            return;
        }
        
        if (!method || !paymentInfo[method]) {
            paymentDetails.classList.add('d-none');
            errorContainer.textContent = 'Payment method not available.';
            return;
        }
        
        const info = paymentInfo[method];
        errorContainer.textContent = '';
        paymentDetails.classList.remove('d-none');
        accountName.textContent = info.account_name || 'Not available';
        accountNumber.textContent = info.account_number || 'Not available';
        instructions.textContent = info.instructions || 'Follow the selected payment method instructions.';
        
        if (info.qr_image) {
            const fileName = info.qr_image.split('/').pop();
            qrImage.src = `/static/uploads/payment/${fileName}`;
            qrImage.alt = `${method} QR Code`;
            qrWrap.classList.remove('d-none'); 
        } else {
            qrWrap.classList.add('d-none');
        }
    }

    function getSelectedPaymentMethod() {
        const radio = document.querySelector("input[name='modal_payment_method']:checked");
        return radio ? radio.value : null;
    }

    function validateModal() {
        if (!selectedPlan) {
            errorContainer.textContent = 'No plan selected.';
            return false;
        }

        selectedMethod = getSelectedPaymentMethod();
        if (!selectedMethod) {
            errorContainer.textContent = 'Please choose a payment method.';
            return false;
        }

        if (!receiptInput.files || receiptInput.files.length === 0) {
            errorContainer.textContent = 'Please upload your payment receipt.';
            return false;
        }

        const file = receiptInput.files[0];
        const fileName = file.name.toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'jpe', 'png', 'webp', 'pdf'];
        const fileExtension = fileName.split('.').pop();

        if (!allowedExtensions.includes(fileExtension)) {
            errorContainer.textContent = 'Unsupported file type. Please upload JPG, JPEG, PNG, or PDF.';
            return false;
        }

        if (!termsCheckbox.checked) {
            errorContainer.textContent = 'You must agree to the terms before submitting.';
            return false;
        }
        return true;
    }

    if (receiptInput) {
        receiptInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                const file = this.files[0];
                const fileName = file.name.toLowerCase();
                const allowedExtensions = ['jpg', 'jpeg', 'jpe', 'png', 'gif', 'webp', 'pdf'];
                const fileExtension = fileName.split('.').pop();

                if (!allowedExtensions.includes(fileExtension)) {
                    errorContainer.textContent = 'Unsupported file type. Please upload JPG, JPEG, PNG, or PDF.';
                } else {
                    errorContainer.textContent = ''; // Clear error if valid
                }
            }
        });
    }

    async function submitPayment() {
        if (!validateModal()) return;

        submitButton.disabled = true;
        errorContainer.textContent = '';

        const formData = new FormData();
        formData.append('plan_name', selectedPlan.name);
        formData.append('payment_method', selectedMethod);
        formData.append('receipt_image', receiptInput.files[0]);

        try {
            const response = await fetch('/api/submit-solo-payment', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Submission failed.');
            }
            window.location.href = window.location.pathname;
        } catch (err) {
            errorContainer.textContent = err.message || 'Unable to submit payment.';
            console.error(err);
        } finally {
            submitButton.disabled = false;
        }
    }

    document.querySelectorAll('.purchase-plan-btn').forEach(button => {
        button.addEventListener('click', () => {
            selectedPlan = {
                name: button.dataset.planName,
                price: button.dataset.planPrice,
            };
            showModal();
        });
    });

    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            selectedMethod = radio.value;
            updatePaymentInstructions();
        });
    });

    cancelButton.addEventListener('click', hideModal);
    closeButton.addEventListener('click', hideModal);
    submitButton.addEventListener('click', submitPayment);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

        function initMembershipCountdown() {
        const countdownEl = document.getElementById('membership-countdown');
        if (!countdownEl) return;

        let remainingSeconds = 0;
        let isPaused = false;
        let intervalId = null;

        function formatSecondsToDHMS(totalSeconds) {
            totalSeconds = Math.max(0, Math.floor(totalSeconds));

            if (totalSeconds <= 0) {
                return 'Expired';
            }

            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = Math.floor(totalSeconds % 60);

            const hoursStr = hours.toString().padStart(2, '0');
            const minutesStr = minutes.toString().padStart(2, '0');
            const secondsStr = seconds.toString().padStart(2, '0');

            if (days > 0) {
                return `${days}d ${hoursStr}h ${minutesStr}m ${secondsStr}s`;
            }

            return `${hoursStr}h ${minutesStr}m ${secondsStr}s`;
        }

        async function syncMembershipCountdown() {
            try {
                const response = await fetch('/api/membership/current-session', {
                    credentials: 'same-origin'
                });

                const data = await response.json();

                if (!response.ok || data.status !== 'success') {
                    countdownEl.textContent = 'No active session';
                    countdownEl.style.color = '';
                    return;
                }

                remainingSeconds = Number(data.remaining_seconds) || 0;
                isPaused = Boolean(data.is_paused);

                if (isPaused) {
                    countdownEl.textContent =
                        `${formatSecondsToDHMS(remainingSeconds)} (PAUSED)`;

                    countdownEl.style.color = '#ffc107';
                } else {
                    countdownEl.textContent =
                        formatSecondsToDHMS(remainingSeconds);

                    countdownEl.style.color = '';
                }

            } catch (error) {
                console.error('Failed to sync membership countdown:', error);
                countdownEl.textContent = 'Unable to load';
                countdownEl.style.color = '';
            }
        }

        function startCountdown() {
            if (intervalId) {
                clearInterval(intervalId);
            }

            intervalId = setInterval(() => {

                // PAUSED = freeze countdown
                if (isPaused) {
                    countdownEl.textContent =
                        `${formatSecondsToDHMS(remainingSeconds)} (PAUSED)`;

                    countdownEl.style.color = '#ffc107';
                    return;
                }

                if (remainingSeconds <= 0) {
                    countdownEl.textContent = 'Expired';
                    countdownEl.style.color = '#dc3545';

                    clearInterval(intervalId);
                    return;
                }

                remainingSeconds--;

                countdownEl.textContent =
                    formatSecondsToDHMS(remainingSeconds);

                countdownEl.style.color = '';

            }, 1000);
        }

        // Initial load
        syncMembershipCountdown().then(() => {
            startCountdown();
        });

        // Re-sync with backend every 5 seconds
        // This keeps the countdown synchronized with the actual session state.
        setInterval(() => {
            syncMembershipCountdown();
        }, 5000);
    }

    initMembershipCountdown();

    // Load payment info and ensure it's ready before page is fully interactive
    loadPaymentInfo().catch(err => {
        console.error('Failed to load payment info:', err);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const badge = document.getElementById('solo-plan-status-badge');
    const details = document.getElementById('solo-plan-status-details');
    if (!badge || !details) return;

    const statusLabel = status => {
        const normalized = String(status || '').trim().toLowerCase();
        if (normalized === 'approved') return 'Approved';
        if (normalized === 'active') return 'Active';
        if (normalized === 'pending') return 'Pending';
        if (normalized === 'rejected') return 'Rejected';
        if (normalized === 'checked_out' || normalized === 'checked-out') return 'Checked Out';
        if (!normalized || normalized === 'none') return 'None';
        return normalized.replace(/(^|[_\s-])\w/g, character => character.toUpperCase());
    };

    const addDetail = (label, value) => {
        const row = document.createElement('p');
        const heading = document.createElement('strong');
        heading.textContent = `${label}: `;
        row.append(heading, document.createTextNode(value || 'N/A'));
        details.appendChild(row);
    };

    const updateStatusCard = plan => {
        const normalizedStatus = String(plan.solo_plan_status || 'none').trim().toLowerCase();
        const label = statusLabel(normalizedStatus);
        badge.textContent = label;
        badge.className = 'badge ' + (
            ['approved', 'active'].includes(normalizedStatus)
                ? 'badge-success'
                : normalizedStatus === 'pending'
                    ? 'badge-warning'
                    : normalizedStatus === 'rejected'
                        ? 'bg-danger'
                        : 'badge-secondary'
        );

        details.replaceChildren();
        if (!plan.solo_plan_name) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'No solo plan is currently active.';
            details.appendChild(emptyMessage);
            return;
        }

        addDetail('Plan', plan.solo_plan_name);
        const expiry = plan.solo_plan_expiry_date
            ? new Date(plan.solo_plan_expiry_date).toLocaleString()
            : 'Not set';
        addDetail('Expiry', expiry);
        addDetail('Payment Method', plan.solo_plan_payment_method || 'N/A');
        addDetail('Status', label);

        if (normalizedStatus === 'pending') {
            const pendingMessage = document.createElement('p');
            pendingMessage.textContent = 'Your plan request is waiting for admin approval.';
            details.appendChild(pendingMessage);
        }
    };

    let statusRequestInProgress = false;
    let statusRefreshRequested = false;
    const refreshStatusCard = async () => {
        if (document.visibilityState === 'hidden') return;
        if (statusRequestInProgress) {
            statusRefreshRequested = true;
            return;
        }
        statusRequestInProgress = true;
        try {
            const response = await fetch('/api/membership/status', {
                cache: 'no-store',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Unable to refresh Solo Plan status.`);
            }
            const data = await response.json();
            if (data.solo_plan_status !== undefined) updateStatusCard(data);
        } catch (error) {
            console.error('Failed to refresh Solo Plan status card:', error);
        } finally {
            statusRequestInProgress = false;
            if (statusRefreshRequested) {
                statusRefreshRequested = false;
                refreshStatusCard();
            }
        }
    };

    const memberSocket = window.memberNotificationSocket;
    if (memberSocket && typeof memberSocket.on === 'function') {
        memberSocket.on('solo_plan_status_changed', data => {
            if (!data || String(data.status || '').toLowerCase() !== 'approved') return;
            badge.textContent = 'Approved';
            badge.className = 'badge badge-success';
            refreshStatusCard();
        });
    }

    refreshStatusCard();
    window.setInterval(refreshStatusCard, 2000);
    document.addEventListener('visibilitychange', refreshStatusCard);
});

//         function initMembershipCountdown() {
//         const countdownEl = document.getElementById('membership-countdown');
//         if (!countdownEl) return;

//         // Check kon paused ang session kag kuhaon ang natipon nga natabilin nga seconds
//         const isPaused = countdownEl.dataset.isPaused === 'true';
//         const remainingSeconds = parseInt(countdownEl.dataset.remainingSeconds || '0', 10);

//         function formatSecondsToDHMS(totalSeconds) {
//             if (totalSeconds <= 0) return 'Expired';

//             const days = Math.floor(totalSeconds / 86400);
//             const hours = Math.floor((totalSeconds % 86400) / 3600);
//             const minutes = Math.floor((totalSeconds % 3600) / 60);
//             const seconds = Math.floor(totalSeconds % 60);

//             const hoursStr = hours.toString().padStart(2, '0');
//             const minutesStr = minutes.toString().padStart(2, '0');
//             const secondsStr = seconds.toString().padStart(2, '0');

//             if (days > 0) {
//                 return `${days}d ${hoursStr}h ${minutesStr}m ${secondsStr}s`;
//             }
//             return `${hoursStr}h ${minutesStr}m ${secondsStr}s`;
//         }

//         // KON PAUSED: Freeze ang countdown kag ipakita ang natipon nga natabilin nga oras
//         if (isPaused) {
//             countdownEl.textContent = `${formatSecondsToDHMS(remainingSeconds)} (PAUSED)`;
//             countdownEl.style.color = '#ffc107'; // Yellow/Orange color indicator
//             return;
//         }

//         let expiryISO = countdownEl.dataset.expiry;
//         if (!expiryISO) {
//         countdownEl.textContent = 'Not available';
//         return;
//         }

//         expiryISO = expiryISO.replace(' ', 'T');
//         const expiryTime = new Date(expiryISO).getTime();

//         if (isNaN(expiryTime)) {
//         countdownEl.textContent = 'Invalid Date';
//         return;
//         }

//         const intervalId = setInterval(() => {
//             const now = Date.now();
//             const distance = expiryTime - now;

//             if (distance <= 0) {
//                 countdownEl.textContent = 'Expired';
//                 countdownEl.style.color = '#dc3545';
//                 clearInterval(intervalId);
//                 return;
//             }

//             const totalSeconds = Math.floor(distance / 1000);
//             countdownEl.textContent = formatSecondsToDHMS(totalSeconds);
//         }, 1000);
//     }

//     initMembershipCountdown();
//     
//     // Load payment info and ensure it's ready before page is fully interactive
//     loadPaymentInfo().catch(err => {
//         console.error('Failed to load payment info:', err);
//     });
// });