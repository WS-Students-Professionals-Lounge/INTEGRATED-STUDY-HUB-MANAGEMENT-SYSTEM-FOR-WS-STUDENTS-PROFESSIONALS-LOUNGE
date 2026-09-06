document.addEventListener('DOMContentLoaded', () => {
    // Global pause state flag
    let isSessionPaused = false;

    // 1. Digital Clock
    function updateClock() {
        const now = new Date();
        const options = { 
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', second: '2-digit',
            hour12: true 
        };
        const clockEl = document.getElementById('clock');
        if (clockEl) clockEl.textContent = now.toLocaleString('en-US', options);
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 2. Real-Time Status & Pause State Sync Engine
    function syncTimelogStatus() {
        fetch('/api/membership/status')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data || data.status !== 'success') return;

                isSessionPaused = Boolean(data.is_paused);

                // Update Status Badge (Active vs Paused vs Not Checked In)
                const statusBadge = document.getElementById('sessionStatusBadge');
                const timerDisplay = document.getElementById('sessionTimer');

                if (statusBadge) {
                    if (isSessionPaused) {
                        statusBadge.textContent = 'PAUSED';
                        statusBadge.className = 'badge bg-warning text-dark';
                    } else if (data.is_checked_in) {
                        statusBadge.textContent = 'ACTIVE';
                        statusBadge.className = 'badge bg-success';
                    } else {
                        statusBadge.textContent = 'NOT CHECKED IN';
                        statusBadge.className = 'badge bg-secondary';
                    }
                }

                if (timerDisplay) {
                    if (isSessionPaused) {
                        timerDisplay.style.color = '#f59e0b'; // Amber / Yellow
                    } else {
                        timerDisplay.style.color = ''; // Reset to default theme color
                    }
                }
            })
            .catch(err => console.error("Timelog sync error:", err));
    }

    // Auto-check pause status every 2 seconds
    syncTimelogStatus();
    setInterval(syncTimelogStatus, 2000);

    // 3. Automatic Session Timer Engine (With Pause-Freeze Support)
    function initSessionTimer() {
        const timerDisplay = document.getElementById('sessionTimer');
        if (!timerDisplay) return;

        let endTimeStr = timerDisplay.getAttribute('data-endtime');
        if (!endTimeStr) return;

        // Fix Safari/iOS Date Parsing compatibility issue
        endTimeStr = endTimeStr.replace(' ', 'T');
        let endTime = new Date(endTimeStr).getTime();

        if (isNaN(endTime)) {
            timerDisplay.textContent = "INVALID TIME";
            return;
        }

        const countdownInterval = setInterval(() => {
            // KON NAKA-PAUSED: I-freeze ang countdown kag indi na pag-i-advance ang offset
            if (isSessionPaused) {
                // Adjust dynamic end-time moving forward by 1 sec to freeze remaining time visually
                endTime += 1000; 
                return;
            }

            const now = Date.now();
            const distance = endTime - now;

            // Time calculations
            if (distance <= 0) {
                clearInterval(countdownInterval);
                timerDisplay.textContent = "SESSION ENDED";
                timerDisplay.style.color = "#EB3223";
                
                // Refresh page to sync backend session status
                setTimeout(() => { location.reload(); }, 2000);
            } else {
                const totalHours = Math.floor(distance / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                // Formatting with leading zeros
                const hDisplay = String(totalHours).padStart(2, '0');
                const mDisplay = String(minutes).padStart(2, '0');
                const sDisplay = String(seconds).padStart(2, '0');
                
                timerDisplay.textContent = `${hDisplay}:${mDisplay}:${sDisplay}`;
            }
        }, 1000);
    }
    initSessionTimer();

    // 4. Legacy/Fallback Status Tracker
    function updateStatus() {
        fetch('/get_time_inside')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                const statusText = document.getElementById('statusText');
                if (!statusText) return;

                if (data.status === 'inside') {
                    statusText.textContent = isSessionPaused ? 'Session Paused' : 'Session in Progress';
                    statusText.className = isSessionPaused ? 'status-paused' : 'status-inside';
                } else {
                    statusText.textContent = 'Awaiting Reservation';
                    statusText.className = 'status-muted';
                }
            })
            .catch(err => console.error("Status check error:", err));
    }

    if (!document.getElementById('sessionTimer')) {
        setInterval(updateStatus, 5000);
        updateStatus();
    }

    // 5. Safe Modal Controller
    const modal = document.getElementById('confirmModal');
    const btnCloseModal = document.getElementById('btnCloseModal');
    
    if (btnCloseModal && modal) {
        btnCloseModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (modal && event.target === modal) {
            modal.style.display = 'none';
        }
    });
});