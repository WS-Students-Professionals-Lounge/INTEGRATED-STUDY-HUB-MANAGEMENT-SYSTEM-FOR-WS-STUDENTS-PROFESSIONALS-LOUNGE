document.addEventListener('DOMContentLoaded', function() {
    // 1. Live Clock with Date (PHT Synchronized local display)
    function updateClock() {
        const now = new Date();
        const options = { 
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', second: '2-digit',
            hour12: true 
        };
        const timeString = now.toLocaleString('en-US', options);
        const clockEl = document.getElementById('dashboardClock');
        if (clockEl) clockEl.textContent = timeString;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Persistent Membership Expiry Countdown with localStorage
    function initMembershipExpiryCountdown() {
        const countdownEl = document.getElementById('membershipExpiryCountdown');
        if (!countdownEl) return;

        const expiryISO = countdownEl.dataset.expiry;
        const membershipId = countdownEl.dataset.membershipId;

        if (!expiryISO || expiryISO === 'None' || expiryISO === '') {
            countdownEl.textContent = 'N/A';
            return;
        }

        if (membershipId) {
            localStorage.setItem(`membership_expiry_${membershipId}`, expiryISO);
        }

        let countdownInterval = null;

        const updateCountdown = () => {
            // Dynamic & Strict Boolean Reading
            const rawCheckedIn = (countdownEl.getAttribute('data-is-checked-in') || '').toString().toLowerCase().trim();
            const isCheckedIn = (rawCheckedIn === 'true' || rawCheckedIn === '1');

            const timerContainer = document.getElementById('sessionTimerContainer');
            const parentPausedAttr = timerContainer ? timerContainer.getAttribute('data-is-paused') : null;

            const rawPaused = (countdownEl.getAttribute('data-is-paused') || parentPausedAttr || '').toString().toLowerCase().trim();
            const isPaused = (rawPaused === 'true' || rawPaused === '1');

            if (isPaused) {
                countdownEl.textContent = '⏸ PAUSED';
                countdownEl.style.color = '#f59e0b';
                return;
            }

            if (!isCheckedIn) {
                countdownEl.textContent = 'Not Checked In';
                countdownEl.style.color = '#6c757d';
                countdownEl.setAttribute('data-remaining-seconds', '0');

                if (typeof checkExpiringSessionNotification === 'function') {
                    checkExpiringSessionNotification();
                }
                return; 
            }

            const now = Date.now();
            const expiryTime = new Date(expiryISO).getTime();

            if (isNaN(expiryTime)) {
                countdownEl.textContent = 'N/A';
                return;
            }

            const distance = expiryTime - now;
            
            if (distance <= 0) {
                countdownEl.textContent = 'Expired';
                countdownEl.style.color = '#dc3545';
                countdownEl.setAttribute('data-remaining-seconds', '0');
                if (countdownInterval) clearInterval(countdownInterval);

                if (typeof checkExpiringSessionNotification === 'function') {
                    checkExpiringSessionNotification();
                }
                return;
            }
            
            const totalRemainingSeconds = Math.floor(distance / 1000);
            countdownEl.setAttribute('data-remaining-seconds', totalRemainingSeconds);

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            let countdownText = '';
            if (days > 0) countdownText += `${days}d `;
            countdownText += `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
            
            countdownEl.textContent = countdownText;
            
            if (distance < 86400000) {
                countdownEl.style.color = '#dc3545';
            } else if (distance < 604800000) {
                countdownEl.style.color = '#ff6c00';
            } else {
                countdownEl.style.color = '#28a745';
            }

            if (typeof checkExpiringSessionNotification === 'function') {
                checkExpiringSessionNotification();
            }
        };

        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    // Automatic Run
    initMembershipExpiryCountdown();

    // 2. Typewriter Effect
    const nameSpan = document.getElementById('userName');
    if (nameSpan) {
        const fullText = nameSpan.textContent; 
        nameSpan.textContent = '';
        let i = 0;
        let isDeleting = false;

        function type() {
            const currentText = isDeleting ? fullText.substring(0, i--) : fullText.substring(0, i++);
            nameSpan.textContent = currentText;

            if (!isDeleting && i > fullText.length) {
                setTimeout(() => { isDeleting = true; type(); }, 3000);
            } 
            else if (isDeleting && i < 0) {
                isDeleting = false;
                i = 0;
                setTimeout(type, 500);
            } 
            else {
                setTimeout(type, isDeleting ? 50 : 100);
            }
        }
        setTimeout(type, 1000);
    }

        const welcomeEl = document.querySelector('.welcome-text');
        if (welcomeEl) {
            welcomeEl.style.opacity = '0';
            welcomeEl.style.transform = 'translateX(-10px)';
            setTimeout(() => {
                welcomeEl.style.transition = 'all 0.45s ease-out';
                welcomeEl.style.opacity = '1';
                welcomeEl.style.transform = 'translateX(0)';
            }, 400);
        }

    // 4. SEARCH AND FILTER FUNCTIONALITY
    const searchInput = document.getElementById('reservationSearch');
    const statusFilter = document.getElementById('statusFilter');

    function filterTable() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const filterValue = statusFilter ? statusFilter.value.toLowerCase().trim() : 'all';

        // 1. Filter Table Rows
        const tableRows = document.querySelectorAll('#reservationTable tbody tr, table .filterable-row');
        tableRows.forEach(row => {
            const text = row.innerText.toLowerCase();
            const rowStatusAttr = (row.getAttribute('data-status') || '').toLowerCase().trim();
            const statusBadge = row.querySelector('.status-badge, .badge');
            const badgeText = statusBadge ? statusBadge.innerText.toLowerCase().trim() : '';
            const status = rowStatusAttr || badgeText;

            const matchesSearch = text.includes(searchTerm);
            
            let matchesFilter = (filterValue === 'all' || filterValue === 'all status' || status.includes(filterValue));

            if (filterValue === 'ended' || filterValue === 'completed') {
                matchesFilter = (status.includes('ended') || status.includes('completed') || status.includes('expired'));
            } else if (filterValue === 'confirmed' || filterValue === 'approved') {
                matchesFilter = (status.includes('approved') || status.includes('confirmed') || status.includes('active'));
            } else {
                matchesFilter = (filterValue === 'all' || filterValue === 'all status' || status.includes(filterValue));
            }

            if (matchesSearch && matchesFilter) {
                row.style.setProperty('display', '', 'important');
            } else {
                row.style.setProperty('display', 'none', 'important');
            }
        });

        // 2. Filter Solo Plans Cards
        const planCards = document.querySelectorAll('.plan-card, .solo-plan-card, div.filterable-row, .reservations-section .card');
        planCards.forEach(card => {
            if (card.closest('.member-stats-grid') || card.classList.contains('stat-card')) return;

            const text = card.innerText.toLowerCase();
            const cardStatusAttr = (card.getAttribute('data-status') || '').toLowerCase().trim();
            const badgeEl = card.querySelector('.badge, .status-badge, [class*="badge"]');
            const badgeText = badgeEl ? badgeEl.innerText.toLowerCase().trim() : '';
            const status = cardStatusAttr || badgeText;

            const matchesSearch = text.includes(searchTerm);
            
            let matchesFilter = (filterValue === 'all' || filterValue === 'all status' || status.includes(filterValue));

            if (filterValue === 'ended' || filterValue === 'completed') {
                matchesFilter = (status.includes('ended') || status.includes('completed') || status.includes('expired'));
            } else if (filterValue === 'confirmed' || filterValue === 'approved') {
                matchesFilter = (status.includes('approved') || status.includes('confirmed') || status.includes('active'));
            }

            if (matchesSearch && matchesFilter) {
                card.style.setProperty('display', '', 'important');
            } else {
                card.style.setProperty('display', 'none', 'important');
            }
        });
    }

    if (searchInput) searchInput.addEventListener('input', filterTable);
    if (statusFilter) statusFilter.addEventListener('change', filterTable);

    // 5. Delete Plan Action Event Listener
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('delete-plan-btn')) {
            const btn = e.target;
            const planId = btn.getAttribute('data-plan-id');
            const cardElement = btn.closest('.filterable-row');

            if (confirm('Are you sure you want to delete this plan?')) {
                if (cardElement) {
                    cardElement.style.transition = 'all 0.3s ease';
                    cardElement.style.opacity = '0';
                    setTimeout(() => {
                        cardElement.remove();
                    }, 300);
                }
            }
        }
    });
    
    // 5. EXPORT TO CSV
    const exportBtn = document.getElementById('exportCSV');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            let csv = [];
            const rows = document.querySelectorAll("#reservationTable tr");
            
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].style.display !== "none") {
                    let row = [], cols = rows[i].querySelectorAll("td, th");
                    for (let j = 0; j < cols.length; j++) {
                        let cellText = cols[j].innerText.trim().replace(/\n/g, ' '); 
                        row.push('"' + cellText + '"');
                    }
                    csv.push(row.join(","));
                }
            }

            const csvFile = new Blob(["\uFEFF" + csv.join("\n")], {type: "text/csv;charset=utf-8;"}); // \uFEFF para sa Excel UTF-8 support
            const downloadLink = document.createElement("a");
            downloadLink.download = `WSLounge_Reservations_${new Date().toLocaleDateString()}.csv`;
            downloadLink.href = window.URL.createObjectURL(csvFile);
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        });
    }

    // 6. Notification System
    function showNotification(message) {
    const container = document.getElementById('notificationContainer');
    if (container) {
        if (container.children.length > 0) return;

        const toast = document.createElement('div');
        toast.className = 'status-badge badge-pending';
        toast.style.padding = '15px';
        toast.style.marginBottom = '10px';
        toast.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        toast.style.display = 'block';
        toast.innerHTML = `<i class="fas fa-bell"></i> ${message}`;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }
}

    let hasShownExpiringWarning = false;

    function checkExpiringSessionNotification() {
        const countdownEl = document.getElementById('membershipExpiryCountdown');
        const container = document.getElementById('notificationContainer');

        if (!countdownEl) return;

        const rawCheckedIn = (countdownEl.getAttribute('data-is-checked-in') || '').toString().toLowerCase().trim();
        const isCheckedIn = (rawCheckedIn === 'true' || rawCheckedIn === '1');

        const rawPaused = (countdownEl.getAttribute('data-is-paused') || '').toString().toLowerCase().trim();
        const isPaused = (rawPaused === 'true' || rawPaused === '1');

        if (!isCheckedIn || isPaused) {
            if (container) container.innerHTML = '';
            hasShownExpiringWarning = false;
            return;
        }

        const remainingSeconds = parseInt(countdownEl.getAttribute('data-remaining-seconds')) || 0;

        const THRESHOLD_SECONDS = 900; 

        if (remainingSeconds > 0 && remainingSeconds <= THRESHOLD_SECONDS) {
            if (!hasShownExpiringWarning) {
                showNotification("YOUR PLAN IS EXPIRING SOON! RENEW NOW TO KEEP ACCESS.");
                hasShownExpiringWarning = true;
            }
        } else {
            if (container && remainingSeconds > THRESHOLD_SECONDS) {
                container.innerHTML = '';
            }
        }
    }

  // === 7. SESSION DURATION & LIVE TIMER ENGINE ===
    const membershipCard = document.getElementById('membershipCard');
    let sessionIntervalId = null;

    // Helper formatting functions
    function formatHMS(seconds) {
        if (!seconds || seconds < 0) seconds = 0;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // Helper to safely parse dates with fallback for Naive ISO strings
    function parseISOToTimestamp(isoStr) {
        if (!isoStr || isoStr === 'None' || isoStr === '' || isoStr === 'null' || isoStr === 'undefined') return null;
        
        let formattedStr = isoStr;
        if (!isoStr.includes('Z') && !isoStr.includes('+') && !isoStr.includes('-')) {
            formattedStr = isoStr + '+08:00';
        }
        const dt = new Date(formattedStr).getTime();
        return isNaN(dt) ? null : dt;
    }

    // Core calculation & rendering function
    function updateSessionTimer() {
        const timerContainer = document.getElementById('sessionTimerContainer');
        if (!timerContainer) return;

        // Attributes reading
        const checkInTimeISO = timerContainer.getAttribute('data-checkin-time');
        const pausedAtISO = timerContainer.getAttribute('data-paused-at');
        const accumulatedPausedSec = parseFloat(timerContainer.getAttribute('data-accumulated-paused')) || 0;

        const rawPaused = (timerContainer.getAttribute('data-is-paused') || '').toString().toLowerCase().trim();
        const isPaused = (rawPaused === 'true' || rawPaused === '1');

        const checkInDate = parseISOToTimestamp(checkInTimeISO);
        if (!checkInDate) return;

        let netElapsedSeconds = 0;
        
        if (isPaused) {
            const pausedDate = parseISOToTimestamp(pausedAtISO);

            if (pausedDate) {
                const rawElapsedSec = Math.floor((pausedDate - checkInDate) / 1000);
                netElapsedSeconds = Math.max(0, rawElapsedSec - accumulatedPausedSec);
            } else {
                if (!timerContainer.hasAttribute('data-frozen-seconds')) {
                const currentRaw = Math.floor((Date.now() - checkInDate) / 1000);
                const frozenVal = Math.max(0, currentRaw - accumulatedPausedSec);
                timerContainer.setAttribute('data-frozen-seconds', frozenVal.toString());
            }
            netElapsedSeconds = parseFloat(timerContainer.getAttribute('data-frozen-seconds')) || 0;
        }
        } else {
            timerContainer.removeAttribute('data-frozen-seconds');
            const rawElapsedSec = Math.floor((Date.now() - checkInDate) / 1000);
            netElapsedSeconds = Math.max(0, rawElapsedSec - accumulatedPausedSec);
        }

        // Update UI Elements
        const sessionTimer = document.getElementById('sessionTimer') || document.getElementById('session_duration_display');
        const hoursSpent = document.getElementById('hoursSpent');

        if (sessionTimer) {
            sessionTimer.textContent = formatHMS(netElapsedSeconds);
            if (isPaused) {
                sessionTimer.style.color = '#f59e0b'; // Amber/Yellow
            } else {
                sessionTimer.style.color = '';
            }
        }

        if (hoursSpent) {
            const h = Math.floor(netElapsedSeconds / 3600);
            const m = Math.floor((netElapsedSeconds % 3600) / 60);
            hoursSpent.textContent = `${h}h ${m}m`;
        }

        // === DYNAMIC REMAINING TIME FORMAT (Base on Actual Customer Plan) ===
        const remainingHoursEl = document.getElementById('remainingHours');
        if (remainingHoursEl) {            

            const planTotalHours = parseFloat(timerContainer?.getAttribute('data-plan-hours')) || 0;
            const planTotalSeconds = planTotalHours * 3600;
            const remainingSec = Math.max(0, planTotalSeconds - netElapsedSeconds);

            const remH = Math.floor(remainingSec / 3600);
            const remM = Math.floor((remainingSec % 3600) / 60);
            const remS = Math.floor(remainingSec % 60);

            const formattedRemainingStr = `${remH}h ${remM}m ${remS}s`;

            const hoursValueSpan = remainingHoursEl.querySelector('.hours-value');
            if (hoursValueSpan) {
                hoursValueSpan.textContent = formattedRemainingStr;
            } else {
                remainingHoursEl.textContent = formattedRemainingStr;
            }
        }
    }

    // Interval Controller Engine (Starts or Stops timer cleanly)
    function refreshTimerIntervalState() {
        const timerContainer = document.getElementById('sessionTimerContainer');
        
        // Clear existing interval always to prevent duplicate loops
        if (sessionIntervalId) {
            clearInterval(sessionIntervalId);
            sessionIntervalId = null;
        }

        if (!timerContainer) return;

        const rawPaused = (timerContainer.getAttribute('data-is-paused') || '').toString().toLowerCase().trim();
        const isPaused = (rawPaused === 'true' || rawPaused === '1');

        // Render once immediately
        updateSessionTimer();

        // STRICT CHECK: Mag-start lang sang 1-second interval kon ACTIVE (NOT PAUSED)
        if (!isPaused) {
            sessionIntervalId = setInterval(updateSessionTimer, 1000);
        }
    }

    // Engine Initialization
    function initSessionTimerEngine() {
        refreshTimerIntervalState();
    }

    // Automatic Initialization on DOM Load
    document.addEventListener('DOMContentLoaded', initSessionTimerEngine);

   // === 8. API LIVE POLLING & SYNC ENGINE ===
    async function syncSessionStatus() {
        if (!membershipCard) return;

        try {
            // 1. Fetch membership overall status
            const statusRes = await fetch('/api/membership/status');
            if (!statusRes.ok) return;
            const statusData = await statusRes.json();

            if (statusData.status !== 'success') return;

            // Update Badge Status sa Screen
            const statusBadge = document.querySelector('.detail-value .badge, .status-badge');
            if (statusBadge) {
                const isExpiredOrZero = statusData.hours_left <= 0 || !statusData.is_active;

                if (!statusData.is_checked_in) {
                    statusBadge.className = 'badge bg-secondary';
                    statusBadge.textContent = 'Not Checked In';
                } else if (statusData.is_paused) {
                    statusBadge.className = 'badge bg-warning text-dark';
                    statusBadge.textContent = '⏸ Session Paused';
                } else {
                    statusBadge.className = 'badge bg-success';
                    statusBadge.textContent = '✓ Checked In';
                }
            }

            // Sync Expiry Countdown Attributes
            const countdownEl = document.getElementById('membershipExpiryCountdown');
            if (countdownEl) {
                countdownEl.setAttribute('data-is-checked-in', statusData.is_checked_in ? 'true' : 'false');
                countdownEl.setAttribute('data-is-paused', statusData.is_paused ? 'true' : 'false');
            }

            // Sync Session Timer Attributes
            const timerContainer = document.getElementById('sessionTimerContainer');
            if (timerContainer) {
                timerContainer.setAttribute('data-is-paused', statusData.is_paused ? 'true' : 'false');
            }

            // 2. Fetch Active Session Elapsed Time
            if (statusData.is_checked_in) {
                const sessionRes = await fetch('/api/membership/current-session');
                if (sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    if (sessionData.status === 'success' && timerContainer) {
                        
                        // Sync Timestamps sa Container para saligan sang Section 7
                        if (sessionData.check_in_time) {
                            timerContainer.setAttribute('data-checkin-time', sessionData.check_in_time);
                        }
                        if (sessionData.paused_at) {
                            timerContainer.setAttribute('data-paused-at', sessionData.paused_at);
                        }
                        if (sessionData.accumulated_paused_seconds !== undefined) {
                            timerContainer.setAttribute('data-accumulated-paused', sessionData.accumulated_paused_seconds);
                        } else if (sessionData.accumulated_paused_sec !== undefined) {
                            timerContainer.setAttribute('data-accumulated-paused', sessionData.accumulated_paused_sec);
                        }

                        // Trigger smooth timer interval check nga wala nagaguba sang UI
                        if (typeof refreshTimerIntervalState === 'function') {
                            refreshTimerIntervalState();
                        } else if (typeof updateSessionTimer === 'function') {
                            updateSessionTimer();
                        }
                    }
                }
            } else {
                // Kon wala nakacheck-in, reset attributes & DOM displays
                if (timerContainer) {
                    timerContainer.setAttribute('data-is-paused', 'false');
                    timerContainer.removeAttribute('data-checkin-time');
                    timerContainer.removeAttribute('data-paused-at');
                    timerContainer.setAttribute('data-accumulated-paused', '0');
                }

                const sessionTimer = document.getElementById('sessionTimer') || document.getElementById('session_duration_display');
                if (sessionTimer) sessionTimer.textContent = '00:00:00';

                const hoursSpent = document.getElementById('hoursSpent');
                if (hoursSpent) hoursSpent.textContent = '0h 0m';
            }

            // Dynamic update sang total plan hours nga gina-avail sang customer
            if (statusData.plan_hours || statusData.total_plan_hours || statusData.hours_left) {
                const actualPlanHours = parseFloat(statusData.plan_hours || statusData.total_plan_hours || statusData.hours_left) || 0;
                const timerContainer = document.getElementById('sessionTimerContainer');
                if (timerContainer) {
                    timerContainer.setAttribute('data-plan-hours', actualPlanHours.toString());
                }
            }

            const startedOnEl = document.getElementById('startedOnDisplay');
            if (startedOnEl && statusData.check_in_time) {
                const startDate = parseISOToTimestamp(statusData.check_in_time);
                if (startDate) {
                    const dt = new Date(startDate);
                    const options = { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
                    startedOnEl.textContent = dt.toLocaleDateString('en-US', options);
                }
            }

            const expiresOnEl = document.getElementById('expiresOnDisplay') || document.querySelector('.expires-on-display');
            if (expiresOnEl && statusData.expiry_date) {
                const expDate = new Date(statusData.expiry_date);
                if (!isNaN(expDate.getTime())) {
                    const formattedDateStr = expDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                    expiresOnEl.textContent = formattedDateStr;
                }
            }

        } catch (err) {
            console.error('Error syncing status with admin database:', err);
        }
    }

    // Auto-sync kada 2 ka segundo para instant feedback sa Admin actions
    if (membershipCard) {
        syncSessionStatus();
        setInterval(syncSessionStatus, 2000);
    }
});