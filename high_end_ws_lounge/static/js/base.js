/**
 * Base.js - Global utilities and auto-dismiss functionality for all pages
 */

function initializeBaseJs() {
    /**
     * 1. Auto-dismiss Flask flash messages (modern-alert and alert classes)
     * - Fade out and hide after 5 seconds
     */
    const flashAlerts = document.querySelectorAll('.modern-alert, .alert-container .alert');
    flashAlerts.forEach(alert => {
        if (!alert.dataset.autoDismissSet) {
            alert.dataset.autoDismissSet = 'true';
            setTimeout(() => {
                alert.style.transition = 'opacity 0.5s ease';
                alert.style.opacity = '0';
                setTimeout(() => {
                    alert.style.display = 'none';
                }, 500);
            }, 5000);
        }
    });

    /**
     * 2. Watch for dynamically added alerts and apply auto-dismiss
     */
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.classList && (node.classList.contains('modern-alert') || node.classList.contains('alert'))) {
                            if (!node.dataset.autoDismissSet) {
                                node.dataset.autoDismissSet = 'true';
                                setTimeout(() => {
                                    node.style.transition = 'opacity 0.5s ease';
                                    node.style.opacity = '0';
                                    setTimeout(() => {
                                        node.style.display = 'none';
                                    }, 500);
                                }, 5000);
                            }
                        }
                        const childAlerts = node.querySelectorAll('.modern-alert, .alert');
                        childAlerts.forEach(alert => {
                            if (!alert.dataset.autoDismissSet) {
                                alert.dataset.autoDismissSet = 'true';
                                setTimeout(() => {
                                    alert.style.transition = 'opacity 0.5s ease';
                                    alert.style.opacity = '0';
                                    setTimeout(() => {
                                        alert.style.display = 'none';
                                    }, 500);
                                }, 5000);
                            }
                        });
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    /**
     * 3. Dismiss button handler for alerts
     */
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('alert-dismiss')) {
            const alert = e.target.closest('.modern-alert');
            if (alert) {
                alert.style.transition = 'opacity 0.3s ease';
                alert.style.opacity = '0';
                setTimeout(() => {
                    alert.style.display = 'none';
                }, 300);
            }
        }
    });

    /**
     * 4. Generic form confirmation handler for forms using data-confirm
     */
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.matches('form[data-confirm]')) {
            const message = form.dataset.confirm || 'Are you sure you want to continue?';
            if (!window.confirm(message)) {
                e.preventDefault();
            }
        }
    });

    /**
     * 5. Sidebar logo fallback handling without inline onerror attributes
     */
    const sidebarLogo = document.getElementById('sidebarLogo');
    const fallbackIcon = document.getElementById('fallback-icon');
    if (sidebarLogo && fallbackIcon) {
        sidebarLogo.addEventListener('error', function() {
            sidebarLogo.style.display = 'none';
            fallbackIcon.style.display = 'block';
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBaseJs);
} else {
    initializeBaseJs();
}

/**
 * showToast - global helper to show non-blocking toasts.
 * Falls back to creating a `.modern-alert` element if SweetAlert2 isn't available.
 */
function showToast(message, icon = 'info', timer = 5000) {
    if (window.Swal && typeof Swal.fire === 'function') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: icon,
            title: message,
            showConfirmButton: false,
            timer: timer,
            timerProgressBar: true
        });
        return;
    }

    // Fallback: create a modern-alert inside .alert-container or body
    const container = document.querySelector('.alert-container') || document.body;
    const div = document.createElement('div');
    div.className = 'modern-alert alert alert-info';
    div.textContent = message;
    container.prepend(div);
    // let the initializeBaseJs observer pick it up and dismiss after timer
}

function fetchSidebarNotifications() {
    fetch('/admin/api/admin/notifications-count')
        .then(response => {
            if (!response.ok) return null;
            return response.json();
        })
        .then(data => {
            if (!data) return;

            const isOnMembersPage = window.location.pathname.includes('/admin/members');

            // Helper function para sa pag-update sang badge display
            const updateBadge = (elementId, count) => {
                const badge = document.getElementById(elementId);
                if (badge) {
                    const visibleCount = elementId === 'mem-notif-badge' && isOnMembersPage
                        ? 0
                        : Number(count || 0);
                    if (visibleCount > 0) {
                        badge.innerText = visibleCount;
                        badge.style.display = 'inline-flex';
                        badge.classList.remove('d-none');
                    } else {
                        badge.innerText = '0';
                        badge.style.display = 'none';
                        badge.classList.add('d-none');
                    }
                }
            };

            // Update individual counts
            updateBadge('total-notif-badge', data.total_notifications);
            updateBadge('admin-dashboard-notif-badge', data.dashboard_notifications ?? data.pending_reservations);
            updateBadge('res-notif-badge', data.pending_reservations);
            updateBadge('mem-notif-badge', data.members_notifications);
        })
        .catch(error => console.error("Error updating notification badges:", error));
}

    // Poll admin notification badges every 5 seconds.
document.addEventListener('DOMContentLoaded', function() {
    const clearSidebarMembersBadge = () => {
        const badge = document.getElementById('mem-notif-badge');
        if (badge) {
            badge.textContent = '0';
            badge.style.setProperty('display', 'none', 'important');
            badge.classList.add('d-none');
        }
        fetch('/admin/api/admin/notifications/clear-nav', {
            method: 'POST',
            keepalive: true,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        }).catch(() => {});
    };

    const membersNavLink = document.querySelector('a[href*="/admin/members"]');

    if (window.location.pathname.includes('/admin/members')) {
        clearSidebarMembersBadge();
    }

    if (membersNavLink) {
        membersNavLink.addEventListener('click', clearSidebarMembersBadge);
    }

    // Poll when an admin/staff notification badge is present.
    if (
        document.getElementById('admin-dashboard-notif-badge') ||
        document.getElementById('res-notif-badge') ||
        document.getElementById('mem-notif-badge')
    ) {
        fetchSidebarNotifications();
        setInterval(fetchSidebarNotifications, 5000);
    }
});

function showGlobalMemberToast(message, variant = 'success') {
    const container = document.getElementById('global-toast-container');
    if (!container) return;

    const variantDetails = {
        success: { icon: 'fa-circle-check', fallback: 'Update complete' },
        info: { icon: 'fa-circle-info', fallback: 'Session update' },
        warning: { icon: 'fa-circle-pause', fallback: 'Session paused' },
        danger: { icon: 'fa-circle-exclamation', fallback: 'Session ended' },
    };
    const normalizedVariant = variantDetails[variant] ? variant : 'info';
    const messageText = String(message || '');
    const lowerMessage = messageText.toLowerCase();
    let heading = variantDetails[normalizedVariant].fallback;

    if (lowerMessage.includes('solo plan') || lowerMessage.includes('membership')) {
        heading = 'Membership update';
    } else if (lowerMessage.includes('reservation')) {
        heading = 'Reservation update';
    } else if (lowerMessage.includes('extended')) {
        heading = 'Time extended';
    } else if (lowerMessage.includes('resumed') || lowerMessage.includes('welcome back')) {
        heading = 'Session resumed';
    } else if (lowerMessage.includes('paused')) {
        heading = 'Session paused';
    } else if (lowerMessage.includes('started')) {
        heading = 'Session started';
    } else if (lowerMessage.includes('ended') || lowerMessage.includes('expired')) {
        heading = 'Session ended';
    } else if (lowerMessage.includes('minutes left')) {
        heading = 'Time reminder';
    }

    const toast = document.createElement('div');
    toast.className = `global-member-toast is-${normalizedVariant}`;
    toast.setAttribute('role', 'status');

    const iconContainer = document.createElement('span');
    iconContainer.className = 'global-member-toast-icon';
    iconContainer.setAttribute('aria-hidden', 'true');

    const icon = document.createElement('i');
    icon.className = `fas ${variantDetails[normalizedVariant].icon}`;
    iconContainer.appendChild(icon);

    const content = document.createElement('div');
    content.className = 'global-member-toast-content';

    const title = document.createElement('span');
    title.className = 'global-member-toast-title';
    title.textContent = heading;

    const text = document.createElement('p');
    text.className = 'global-member-toast-message';
    text.textContent = messageText;
    content.append(title, text);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'global-member-toast-close';
    closeButton.setAttribute('aria-label', 'Dismiss notification');
    closeButton.textContent = '\u00d7';

    let dismissed = false;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        toast.classList.add('is-dismissing');
        setTimeout(() => toast.remove(), 200);
    };

    closeButton.addEventListener('click', dismiss);
    toast.append(iconContainer, content, closeButton);
    container.appendChild(toast);
    setTimeout(dismiss, 8000);
}

function initializeAdminSocketNotifications() {
    const hasAdminNotificationBadges = Boolean(
        document.getElementById('admin-dashboard-notif-badge')
        || document.getElementById('res-notif-badge')
        || document.getElementById('mem-notif-badge')
    );
    if (!hasAdminNotificationBadges || typeof io !== 'function') return;

    const socket = window.adminNotificationSocket || io();
    window.adminNotificationSocket = socket;

    socket.on('connect', function() {
        socket.emit('join_admin_room');
    });

    socket.on('new_admin_notification', function(data) {
        if (!data || !data.title || !data.message) return;

        const variant = data.type === 'reservation' ? 'info' : 'success';
        showGlobalMemberToast(`${data.title}: ${data.message}`, variant);
        if (data.type === 'membership' && data.request) {
            window.dispatchEvent(new CustomEvent('newMembershipRequestReceived', {
                detail: data.request,
            }));
        } else if (data.type === 'reservation' && data.request) {
            window.dispatchEvent(new CustomEvent('newReservationRequestReceived', {
                detail: data.request,
            }));
            if (window.location.pathname.replace(/\/$/, '') === '/admin/confirm_reservations') {
                fetch('/admin/api/admin/notifications/clear-tab?tab=reservations', {
                    method: 'POST',
                    keepalive: true,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                }).then(response => {
                    if (response.ok && typeof fetchSidebarNotifications === 'function') {
                        fetchSidebarNotifications();
                    }
                }).catch(() => {});
            }
        }
        if (typeof fetchSidebarNotifications === 'function') {
            fetchSidebarNotifications();
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeAdminSocketNotifications);

function initializeMemberSocketNotifications() {
    if (!document.getElementById('member-reservation-event-badge') || typeof io !== 'function') return;

    const socket = window.memberNotificationSocket || io();
    window.memberNotificationSocket = socket;

    socket.on('connect', function() {
        socket.emit('join_member_room');
    });

    socket.on('member_request_rejected', function(data) {
        if (!data || !data.message) return;
        showGlobalMemberToast(data.message, 'danger');
    });
}

document.addEventListener('DOMContentLoaded', initializeMemberSocketNotifications);

function initializeMemberReservationNotifications() {
    const eventBadge = document.getElementById('member-reservation-event-badge');
    if (!eventBadge) return;

    const pendingSessionKey = 'member-session-start-pending-ids';
    const activeSessionKey = 'member-active-session-id';
    const activeSessionEndKey = 'member-active-session-end-time';
    const activeSessionPausedKey = 'member-active-session-paused';
    let requestInProgress = false;
    const emittedEvents = new Set();

    const readStoredValue = key => {
        try {
            return sessionStorage.getItem(key);
        } catch (error) {
            return null;
        }
    };

    const writeStoredValue = (key, value) => {
        try {
            sessionStorage.setItem(key, value);
        } catch (error) {
            // Notifications still work for the current page if storage is unavailable.
        }
    };

    const hasEmittedEvent = key => emittedEvents.has(key) || Boolean(readStoredValue(key));
    const rememberEmittedEvent = key => {
        emittedEvents.add(key);
        writeStoredValue(key, '1');
    };

    const readPendingSessionIds = () => {
        try {
            const ids = JSON.parse(readStoredValue(pendingSessionKey) || '[]');
            return new Set(Array.isArray(ids) ? ids.map(String) : []);
        } catch (error) {
            return new Set();
        }
    };

    let pendingSessionIds = readPendingSessionIds();
    let observedActiveSessionId = readStoredValue(activeSessionKey);
    let observedActiveSessionEnd = readStoredValue(activeSessionEndKey);
    let observedActiveSessionPaused = readStoredValue(activeSessionPausedKey) === 'true';
    let activeSessionEndTimer = null;
    let activeSessionEndTimerTarget = null;

    const parseReservationTime = value => {
        if (!value) return null;
        const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)
            ? value
            : `${value}+08:00`;
        const timestamp = new Date(normalized).getTime();
        return Number.isFinite(timestamp) ? timestamp : null;
    };

    const notifySessionEnded = reservationId => {
        const eventKey = `member-session-ended:${reservationId}`;
        if (hasEmittedEvent(eventKey)) return;

        rememberEmittedEvent(eventKey);
        pendingSessionIds.add(String(reservationId));
        writeStoredValue(pendingSessionKey, JSON.stringify([...pendingSessionIds]));
        const scheduledEnd = parseReservationTime(observedActiveSessionEnd);
        const message = scheduledEnd !== null && scheduledEnd <= Date.now()
            ? 'Your fixed-time session has expired.'
            : 'Your session has ended.';
        showGlobalMemberToast(message);
    };

    const scheduleSessionEndNotification = (reservationId, endTime, isPaused) => {
        const endTimestamp = parseReservationTime(endTime);
        const timerTarget = endTimestamp === null || isPaused
            ? null
            : `${reservationId}:${endTimestamp}`;

        if (activeSessionEndTimerTarget === timerTarget) return;
        if (activeSessionEndTimer) clearTimeout(activeSessionEndTimer);
        activeSessionEndTimer = null;
        activeSessionEndTimerTarget = timerTarget;

        if (timerTarget) {
            activeSessionEndTimer = setTimeout(() => {
                activeSessionEndTimer = null;
                if (document.visibilityState === 'visible') {
                    notifySessionEnded(reservationId);
                } else {
                    activeSessionEndTimerTarget = null;
                }
            }, Math.max(0, endTimestamp - Date.now()));
        }
    };

    const renderEventBadge = unreadApprovalCount => {
        const count = pendingSessionIds.size + unreadApprovalCount;
        eventBadge.textContent = String(count);
        eventBadge.classList.toggle('d-none', count === 0);
    };

    const reservationBadge = document.getElementById('member-reservation-notif-badge');
    const renderReservationBadge = count => {
        if (!reservationBadge) return;
        reservationBadge.textContent = String(count);
        reservationBadge.classList.toggle('d-none', count === 0);
    };

    const dashboardLink = eventBadge.closest('a');
    if (dashboardLink) {
        dashboardLink.addEventListener('click', () => {
            pendingSessionIds.clear();
            writeStoredValue(pendingSessionKey, '[]');
            renderEventBadge(0);
        });
    }

    const pollReservationNotifications = async () => {
        if (requestInProgress || document.visibilityState === 'hidden') return;
        requestInProgress = true;

        try {
            const response = await fetch('/api/user-active-reservation', {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!response.ok) return;

            const data = await response.json();
            const unreadIds = Array.isArray(data.unread_confirmation_ids)
                ? data.unread_confirmation_ids.map(String)
                : [];

            unreadIds.forEach(reservationId => {
                const eventKey = `member-reservation-approved:${reservationId}`;
                if (hasEmittedEvent(eventKey)) return;
                rememberEmittedEvent(eventKey);
                showGlobalMemberToast('Admin approved your reservation request.');
            });

            const startedSessionId = data.session_started && data.started_session_id
                ? String(data.started_session_id)
                : null;

            if (observedActiveSessionId && observedActiveSessionId !== startedSessionId) {
                if (activeSessionEndTimer) clearTimeout(activeSessionEndTimer);
                activeSessionEndTimer = null;
                activeSessionEndTimerTarget = null;
                notifySessionEnded(observedActiveSessionId);
                observedActiveSessionId = null;
                observedActiveSessionEnd = null;
                observedActiveSessionPaused = false;
                writeStoredValue(activeSessionKey, '');
                writeStoredValue(activeSessionEndKey, '');
                writeStoredValue(activeSessionPausedKey, 'false');
            }

            if (startedSessionId) {
                const isSameActiveSession = observedActiveSessionId === startedSessionId;
                const wasPaused = observedActiveSessionPaused;
                const isPaused = Boolean(data.is_paused);
                const previousEndTimestamp = parseReservationTime(observedActiveSessionEnd);
                const currentEndTimestamp = parseReservationTime(data.end_time);

                if (isSameActiveSession && !wasPaused && isPaused) {
                    showGlobalMemberToast('Your time has been paused.', 'warning');
                }

                if (isSameActiveSession && wasPaused && !isPaused) {
                    showGlobalMemberToast('Your time has been resumed.', 'success');
                }

                if (
                    isSameActiveSession
                    && !data.is_open_time
                    && !(wasPaused && !isPaused)
                    && previousEndTimestamp !== null
                    && currentEndTimestamp !== null
                    && currentEndTimestamp > previousEndTimestamp
                ) {
                    const extensionEventKey = `member-session-extended:${startedSessionId}:${currentEndTimestamp}`;
                    if (!hasEmittedEvent(extensionEventKey)) {
                        rememberEmittedEvent(extensionEventKey);
                        const addedMinutes = Math.round((currentEndTimestamp - previousEndTimestamp) / 60000);
                        const addedHours = Math.floor(addedMinutes / 60);
                        const remainingMinutes = addedMinutes % 60;
                        const durationParts = [];
                        if (addedHours > 0) durationParts.push(`${addedHours} hour${addedHours === 1 ? '' : 's'}`);
                        if (remainingMinutes > 0) durationParts.push(`${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`);
                        const newEndTime = new Date(currentEndTimestamp).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'Asia/Manila',
                        });
                        showGlobalMemberToast(
                            `Your time has been extended by ${durationParts.join(' ')}. New end time: ${newEndTime}.`,
                            'info'
                        );
                    }
                }

                observedActiveSessionId = startedSessionId;
                observedActiveSessionEnd = data.is_open_time ? null : data.end_time;
                observedActiveSessionPaused = isPaused;
                scheduleSessionEndNotification(
                    startedSessionId,
                    observedActiveSessionEnd,
                    isPaused
                );
                writeStoredValue(activeSessionKey, startedSessionId);
                writeStoredValue(activeSessionEndKey, observedActiveSessionEnd || '');
                writeStoredValue(activeSessionPausedKey, String(isPaused));

                const eventKey = `member-session-started:${startedSessionId}`;
                if (!hasEmittedEvent(eventKey)) {
                    rememberEmittedEvent(eventKey);
                    pendingSessionIds.add(startedSessionId);
                    writeStoredValue(pendingSessionKey, JSON.stringify([...pendingSessionIds]));
                    showGlobalMemberToast('Your session has started.');
                }

                const endTimestamp = parseReservationTime(data.end_time);
                const remainingMilliseconds = endTimestamp === null
                    ? null
                    : endTimestamp - Date.now();
                const warningKey = `member-session-10-minutes:${startedSessionId}`;
                if (
                    !data.is_open_time &&
                    remainingMilliseconds > 0 &&
                    remainingMilliseconds <= 10 * 60 * 1000 &&
                    !hasEmittedEvent(warningKey)
                ) {
                    rememberEmittedEvent(warningKey);
                    showGlobalMemberToast('You have 10 minutes left.');
                }
            }

            renderEventBadge(unreadIds.length);
            renderReservationBadge(unreadIds.length);

            if (unreadIds.length > 0) {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                    || document.querySelector('input[name="csrf_token"]')?.value;
                const ackResponse = await fetch('/api/notifications/reservations/read', {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
                    },
                });
                if (ackResponse.ok) {
                    renderEventBadge(0);
                    renderReservationBadge(0);
                }
            }
        } catch (error) {
            console.error('Failed to poll member reservation notifications:', error);
        } finally {
            requestInProgress = false;
        }
    };

    renderEventBadge(0);
    pollReservationNotifications();
    setInterval(pollReservationNotifications, 1000);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') pollReservationNotifications();
    });
}

document.addEventListener('DOMContentLoaded', initializeMemberReservationNotifications);

function initializeMemberSoloPlanNotifications() {
    const dashboardBadge = document.getElementById('member-dashboard-notif-badge');
    if (!dashboardBadge) return;

    const memberId = dashboardBadge.dataset.memberId || 'current';
    const stateKey = `member-solo-last-state:${memberId}`;
    const pendingToastKey = `member-solo-pending-toast:${memberId}`;
    const seenBadgeStateKey = `member-solo-badge-seen:${memberId}`;
    const eventPrefix = `member-solo-event:${memberId}:`;
    let requestInProgress = false;
    let dashboardEntryHandled = false;
    let membershipAcknowledgementRequest = null;

    const readStorage = key => {
        try {
            return sessionStorage.getItem(key);
        } catch (error) {
            return null;
        }
    };
    const writeStorage = (key, value) => {
        try {
            sessionStorage.setItem(key, value);
        } catch (error) {
            // The current-page notification remains available without storage.
        }
    };
    const readState = () => {
        try {
            return JSON.parse(readStorage(stateKey) || 'null');
        } catch (error) {
            return null;
        }
    };
    const isSeen = eventKey => Boolean(readStorage(`${eventPrefix}${eventKey}`));
    const markSeen = eventKey => writeStorage(`${eventPrefix}${eventKey}`, '1');
    const sessionStateSignature = state => [
        state.sessionId,
        state.checkedIn,
        state.paused,
        state.checkedOut,
        state.expired,
    ].join(':');

    const acknowledgeMembershipNotifications = () => {
        if (membershipAcknowledgementRequest) return membershipAcknowledgementRequest;

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            || document.querySelector('input[name="csrf_token"]')?.value;
        membershipAcknowledgementRequest = fetch('/api/notifications/membership/read', {
            method: 'POST',
            keepalive: true,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
            },
        }).then(response => response.ok).catch(() => false).finally(() => {
            membershipAcknowledgementRequest = null;
        });
        return membershipAcknowledgementRequest;
    };

    const dashboardLink = dashboardBadge.closest('a');
    if (dashboardLink) {
        dashboardLink.addEventListener('click', () => {
            const currentState = readState();
            if (currentState) {
                writeStorage(seenBadgeStateKey, sessionStateSignature(currentState));
            }
            dashboardBadge.classList.add('d-none');
            dashboardBadge.style.display = 'none';
            acknowledgeMembershipNotifications();
        });
    }

    const showLifecycleToast = (message, variant, eventKey) => {
        let pending = null;
        try {
            pending = JSON.parse(readStorage(pendingToastKey) || 'null');
        } catch (error) {
            pending = null;
        }
        if (pending && pending.eventKey === eventKey) return;
        if (isSeen(eventKey)) return;
        if (
            eventKey.startsWith('session:')
            && document.getElementById('membershipCard')
            && typeof window.queueMemberLifecycleToast === 'function'
        ) {
            window.queueMemberLifecycleToast(message, variant, eventKey);
            return;
        }
        markSeen(eventKey);
        showGlobalMemberToast(message, variant);
    };

    window.queueMemberLifecycleToast = (message, variant, eventKey) => {
        try {
            sessionStorage.setItem(pendingToastKey, JSON.stringify({ message, variant, eventKey }));
        } catch (error) {
            // A reload may lose this notification when browser storage is unavailable.
        }
    };

    try {
        const pendingToast = JSON.parse(readStorage(pendingToastKey) || 'null');
        if (pendingToast && pendingToast.message) {
            sessionStorage.removeItem(pendingToastKey);
            if (!isSeen(pendingToast.eventKey)) {
                markSeen(pendingToast.eventKey);
                showGlobalMemberToast(pendingToast.message, pendingToast.variant || 'info');
            }
        }
    } catch (error) {
        // Ignore malformed or unavailable session storage.
    }

    const renderDashboardBadge = (unreadApproval, isSessionActive) => {
        const unreadCount = Number.isFinite(Number(unreadApproval))
            ? Number(unreadApproval)
            : Number(Boolean(unreadApproval));
        const count = unreadCount + Number(Boolean(isSessionActive));
        dashboardBadge.textContent = String(count);
        dashboardBadge.classList.toggle('d-none', count === 0);
        dashboardBadge.style.display = count > 0 ? 'inline-flex' : 'none';
    };

    const pollSoloPlanStatus = async () => {
        if (requestInProgress || document.visibilityState === 'hidden') return;
        requestInProgress = true;

        try {
            const response = await fetch('/api/membership/status', {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!response.ok) return;

            const data = await response.json();
            const noMembership = data.status === 'error' && data.message === 'No membership found';
            if (data.status !== 'success' && !noMembership) return;

            const currentState = {
                checkedIn: Boolean(data.is_checked_in),
                paused: Boolean(data.is_paused),
                checkedOut: Boolean(data.is_checked_out),
                expired: Boolean(data.is_expired),
                planId: data.solo_plan_id || 'current',
                sessionId: data.session_id || data.solo_plan_id || 'current',
            };
            const priorState = readState();
            const sessionKey = currentState.sessionId;

            if (data.unread_approval && data.unread_approval_status === 'approved') {
                const planId = data.unread_approval_plan_id || currentState.planId;
                const approvalEvent = `plan:${planId}:approved`;
                showLifecycleToast('Your Solo Plan request has been approved!', 'success', approvalEvent);

                if (!isSeen(`approval-ack:${planId}`)) {
                    markSeen(`approval-ack:${planId}`);
                    acknowledgeMembershipNotifications();
                }
            }

            if (priorState) {
                if (!priorState.checkedIn && currentState.checkedIn) {
                    showLifecycleToast(
                        'Your session has started.',
                        'info',
                        `session:${sessionKey}:started`
                    );
                } else if (!priorState.paused && currentState.paused) {
                    showLifecycleToast(
                        'Your session has been paused, you can leave the lounge now.',
                        'warning',
                        `session:${sessionKey}:paused`
                    );
                } else if (priorState.paused && currentState.checkedIn && !currentState.paused) {
                    const firstName = data.first_name || (data.full_name || 'Member').trim().split(/\s+/)[0];
                    showLifecycleToast(
                        `Welcome back, ${firstName}!`,
                        'success',
                        `session:${sessionKey}:resumed`
                    );
                }
            }

            const endedEvent = `session:${sessionKey}:ended`;
            if ((currentState.checkedOut || currentState.expired) && !isSeen(endedEvent)) {
                const priorStateWasTerminal = priorState
                    && (priorState.checkedOut || priorState.expired);
                let pendingEndedToast = null;
                try {
                    pendingEndedToast = JSON.parse(readStorage(pendingToastKey) || 'null');
                } catch (error) {
                    pendingEndedToast = null;
                }

                if (priorState && !priorStateWasTerminal) {
                    showLifecycleToast('Your session has ended.', 'danger', endedEvent);
                } else if (!pendingEndedToast || pendingEndedToast.eventKey !== endedEvent) {
                    markSeen(endedEvent);
                    showGlobalMemberToast('Your session has ended.', 'danger');
                }
            }

            writeStorage(stateKey, JSON.stringify(currentState));
            let unreadMembershipCount = Number(
                data.unread_membership_notification_count ?? data.unread_approval ?? 0
            ) || 0;
            if (
                !dashboardEntryHandled
                && window.location.pathname.replace(/\/$/, '') === '/dashboard'
            ) {
                dashboardEntryHandled = true;
                writeStorage(seenBadgeStateKey, sessionStateSignature(currentState));
                if (unreadMembershipCount > 0 && await acknowledgeMembershipNotifications()) {
                    unreadMembershipCount = 0;
                }
            }
            const currentSessionIsUnread = (
                currentState.checkedIn || currentState.paused
            ) && readStorage(seenBadgeStateKey) !== sessionStateSignature(currentState);
            renderDashboardBadge(
                unreadMembershipCount,
                currentSessionIsUnread
            );
        } catch (error) {
            console.error('Failed to poll Solo Plan notifications:', error);
        } finally {
            requestInProgress = false;
        }
    };

    pollSoloPlanStatus();
    setInterval(pollSoloPlanStatus, 1000);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') pollSoloPlanStatus();
    });
}

document.addEventListener('DOMContentLoaded', initializeMemberSoloPlanNotifications);

/**
 * confirmAction - Promise-based confirmation helper.
 * Uses SweetAlert2 when available; otherwise shows a simple DOM fallback modal.
 * Returns a Promise that resolves to true when confirmed, false otherwise.
 */
function confirmAction(titleOrText, textOrOptions, confirmText = 'Yes', cancelText = 'Cancel') {
    // Normalize args: allow confirmAction(text) or confirmAction(title, text)
    let title = '';
    let text = '';
    if (typeof textOrOptions === 'undefined') {
        text = titleOrText || '';
    } else {
        title = titleOrText || '';
        text = textOrOptions || '';
    }

    if (window.Swal && typeof Swal.fire === 'function') {
        return Swal.fire({
            title: title || undefined,
            text: text || undefined,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText
        }).then(result => !!result.isConfirmed);
    }

    // DOM fallback (non-blocking)
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.left = '0';
        overlay.style.top = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0,0,0,0.45)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '99999';

        const box = document.createElement('div');
        box.style.background = '#fff';
        box.style.padding = '18px';
        box.style.borderRadius = '8px';
        box.style.maxWidth = '480px';
        box.style.width = '90%';
        box.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';

        if (title) {
            const h = document.createElement('h3');
            h.style.margin = '0 0 8px 0';
            h.textContent = title;
            box.appendChild(h);
        }
        if (text) {
            const p = document.createElement('p');
            p.style.margin = '0 0 12px 0';
            p.textContent = text;
            box.appendChild(p);
        }

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.justifyContent = 'flex-end';
        actions.style.gap = '8px';

        const btnCancel = document.createElement('button');
        btnCancel.textContent = cancelText;
        btnCancel.style.padding = '6px 12px';
        btnCancel.style.background = '#eee';
        btnCancel.style.border = 'none';
        btnCancel.style.borderRadius = '4px';

        const btnConfirm = document.createElement('button');
        btnConfirm.textContent = confirmText;
        btnConfirm.style.padding = '6px 12px';
        btnConfirm.style.background = '#82cae8';
        btnConfirm.style.border = 'none';
        btnConfirm.style.borderRadius = '4px';

        actions.appendChild(btnCancel);
        actions.appendChild(btnConfirm);
        box.appendChild(actions);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        btnCancel.addEventListener('click', () => { overlay.remove(); resolve(false); });
        btnConfirm.addEventListener('click', () => { overlay.remove(); resolve(true); });
    });
    
}


