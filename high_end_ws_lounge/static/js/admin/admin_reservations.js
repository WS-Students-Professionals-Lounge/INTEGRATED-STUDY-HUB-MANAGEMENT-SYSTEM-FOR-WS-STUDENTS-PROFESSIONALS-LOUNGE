document.addEventListener('DOMContentLoaded', function() {
    const resForm = document.getElementById('resForm');
    const customerName = document.getElementById('customer_name');
    const contactNumber = document.getElementById('contact_number');
    const roomId = document.getElementById('room_id');
    const paxInput = document.getElementById('pax_count'); // Dynamic Pax Input

    const startTime = document.getElementById('start_time');
    const durationSelect = document.getElementById('duration-select');
    const endTime = document.getElementById('end_time');
    const endDisplay = document.getElementById('end-display');
    const extraFeeInput = document.getElementById('extra_fee_input');
    const openTimeToggle = document.getElementById('openTimeToggle');
    const discountSelect = document.getElementById('f-discount');

    const previewName = document.getElementById('preview_name');
    const previewContact = document.getElementById('preview_contact');
    const previewRoom = document.getElementById('preview_room');
    const previewDate = document.getElementById('preview_date');

    const previewStart = document.getElementById('preview_start');
    const previewEnd = document.getElementById('preview_end');

    const previewDuration = document.getElementById('preview_duration');
    const previewExtra = document.getElementById('preview_extra');
    const previewTotal = document.getElementById('preview_total');
    const hiddenTotalPrice = document.getElementById('hidden_total_price');

    // Rate Info Banner Elements
    const rateCard = document.getElementById('room-rate-info');
    const rateTitle = document.getElementById('rate-card-title');
    const rateBody = document.getElementById('rate-card-body');

    let openTimeInterval;
    let secondsElapsed = 0;

    function formatDateTime(value) {
        if (!value) return '----';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    // Function to calculate tier hourly rate base on Pax
    function getTierHourlyRate(roomName, pax) {
        let name = roomName.toLowerCase();
        if (name.includes('lecture room')) {
            if (pax <= 5) return 150;
            if (pax <= 10) return 200;
            return 250; // 11 - 15 pax
        } else if (name.includes('event room')) {
            if (pax <= 15) return 300;
            if (pax <= 30) return 400;
            return 500; // 31+ pax
        }
        return null; // Fallback to option text rate
    }

    function updateSummary() {
        if (previewName) previewName.innerText = customerName.value.trim() || '----';
        if (previewContact) previewContact.innerText = contactNumber.value.trim() || '----';

        const extraFee = parseFloat(extraFeeInput ? extraFeeInput.value : 0) || 0;
        const addonSubtotal = parseFloat(document.getElementById('addon_subtotal')?.value || 0) || 0;
        const discountPercent = discountSelect ? parseFloat(discountSelect.value) : 0;
        
        if (previewExtra) previewExtra.innerText = '₱' + extraFee.toFixed(2);
        if (document.getElementById('preview_addon_subtotal')) {
            document.getElementById('preview_addon_subtotal').innerText = '₱' + addonSubtotal.toFixed(2);
        }

        const paxContainer = document.getElementById('pax_container');

        const selectedOption = roomId ? roomId.options[roomId.selectedIndex] : null;
        const selectedRoomText = selectedOption ? selectedOption.text : '';
        const roomNameLower = selectedRoomText.toLowerCase();

        if (previewRoom) previewRoom.innerText = selectedRoomText.split(' (')[0] || '----';

        if (previewDate && startTime) previewDate.innerText = formatDateTime(startTime.value);
        if (previewStart && startTime) previewStart.innerText = formatDateTime(startTime.value);

        const isTieredRoom = roomNameLower.includes('lecture room') || roomNameLower.includes('event room');

        if (isTieredRoom) {
            // I-show ang Pax Count field
            if (paxContainer) paxContainer.style.display = 'block';
        } else {
            // I-hide ang Pax Count field kon Common Area o iban pa
            if (paxContainer) paxContainer.style.display = 'none';
            if (paxInput) paxInput.value = 1; // Reset to 1 default
        }
        // --- 1. PAX VALIDATION & TIER BANNER DISPLAY ---
        let pax = parseInt(paxInput ? paxInput.value : 1) || 1;

        if (roomNameLower.includes('lecture room')) {
            if (pax > 15) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Capacity Exceeded',
                        text: 'Lecture Room capacity is strictly limited to 15 pax max.'
                    });
                } else {
                    alert('Lecture Room capacity is strictly limited to 15 pax max.');
                }
                pax = 15;
                if (paxInput) paxInput.value = 15;
            }

            if (rateCard) {
                rateCard.classList.remove('hidden-rate');
                if (rateTitle) rateTitle.textContent = "Lecture Room Tier Rates (Max 15 Pax)";
                if (rateBody) {
                    rateBody.innerHTML = `
                        <div class="rate-tier-item ${pax >= 1 && pax <= 5 ? 'active-tier' : ''}">1-5 Pax: ₱150/hr</div>
                        <div class="rate-tier-item ${pax >= 6 && pax <= 10 ? 'active-tier' : ''}">6-10 Pax: ₱200/hr</div>
                        <div class="rate-tier-item ${pax >= 11 && pax <= 15 ? 'active-tier' : ''}">11-15 Pax: ₱250/hr</div>
                    `;
                }
            }
        } else if (roomNameLower.includes('event room')) {
            if (rateCard) {
                rateCard.classList.remove('hidden-rate');
                if (rateTitle) rateTitle.textContent = "Event Room Tier Rates";
                if (rateBody) {
                    rateBody.innerHTML = `
                        <div class="rate-tier-item ${pax >= 1 && pax <= 15 ? 'active-tier' : ''}">1-15 Pax: ₱300/hr</div>
                        <div class="rate-tier-item ${pax >= 16 && pax <= 30 ? 'active-tier' : ''}">16-30 Pax: ₱400/hr</div>
                        <div class="rate-tier-item ${pax > 30 ? 'active-tier' : ''}">31+ Pax: ₱500/hr</div>
                    `;
                }
            }
        } else {
            if (rateCard) rateCard.classList.add('hidden-rate');
        }

        // --- 2. DURATION CALCULATION ---
        let duration = 0;
        if (openTimeToggle && openTimeToggle.checked) {
            if (previewEnd) previewEnd.innerText = 'OPEN TIME';
            duration = 1;
        } else if (!openTimeToggle?.checked && durationSelect && durationSelect.value && startTime && startTime.value) {
            const start = new Date(startTime.value);
            const addedHours = parseFloat(durationSelect.value) || 1;
            
            const end = new Date(start.getTime());
            end.setHours(end.getHours() + addedHours);

            const year = end.getFullYear();
            const month = String(end.getMonth() + 1).padStart(2, '0');
            const day = String(end.getDate()).padStart(2, '0');
            const hours = String(end.getHours()).padStart(2, '0');
            const minutes = String(end.getMinutes()).padStart(2, '0');
            const formattedEnd = `${year}-${month}-${day}T${hours}:${minutes}`;

            if (previewEnd) previewEnd.innerText = formatDateTime(formattedEnd);
            if (endTime) {
                endTime.value = formattedEnd;
                if (endDisplay) endDisplay.value = formattedEnd;
            }
            duration = addedHours;
        } else if (endTime && endTime.value) {
            if (previewEnd) previewEnd.innerText = formatDateTime(endTime.value);
            if (endDisplay) endDisplay.value = endTime.value;
            const start = new Date(startTime.value);
            const end = new Date(endTime.value);
            duration = (end - start) / (1000 * 60 * 60);
            if (duration <= 0) duration += 24;
        }

        if (previewDuration) {
            previewDuration.innerText = openTimeToggle && openTimeToggle.checked
                ? 'Open Time'
                : duration > 0
                ? duration.toFixed(1) + ' Hr/s'
                : '----';
        }

        // --- 3. DYNAMIC HOURLY RATE ENGINE ---
        let baseRate = getTierHourlyRate(selectedRoomText, pax);
        if (baseRate === null) {
            // Fallback for standard rooms (Common Area, etc.)
            const rateMatch = selectedRoomText.match(/₱(\d+)/);
            baseRate = rateMatch ? parseFloat(rateMatch[1]) : 0;
        }

        // --- 4. TOTAL PRICE CALCULATION ---
        let total = 0;
        if (openTimeToggle && openTimeToggle.checked) {
            let roomCost = baseRate * (1 - discountPercent);
            total = roomCost + extraFee + addonSubtotal;
        } else {
            let roomCost = baseRate * duration;
            roomCost = roomCost * (1 - discountPercent);
            total = roomCost + extraFee + addonSubtotal;
        }

        console.debug('[admin-reservation-total]', {
            room_charge: baseRate,
            pax_count: pax,
            duration_hours: duration,
            addon_subtotal: addonSubtotal,
            additional_fees: extraFee,
            discount: discountPercent,
            total_payable: total,
        });

        if (previewTotal) {
            previewTotal.innerText = '₱' + total.toLocaleString(undefined, { minimumFractionDigits: 2 });
        }
        if (hiddenTotalPrice) {
            hiddenTotalPrice.value = total.toFixed(2);
        }
    }

    // Global accessibility
    window.updateTotalPrice = updateSummary;

    function startRunningTimer() {
        secondsElapsed = 0;
        clearInterval(openTimeInterval);
        openTimeInterval = setInterval(() => {
            secondsElapsed++;
            const hrs = Math.floor(secondsElapsed / 3600);
            const mins = Math.floor((secondsElapsed % 3600) / 60);
            const secs = secondsElapsed % 60;
            const timeDisplay = `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            if (previewDuration) previewDuration.innerText = timeDisplay;
        }, 1000);
    }

    function updateOpenTimeToggleState() {
        if (!roomId || !openTimeToggle) return;
        openTimeToggle.disabled = false;
        openTimeToggle.style.cursor = 'pointer';
        if (openTimeToggle.parentElement) openTimeToggle.parentElement.style.opacity = '1';
        updateSummary();
    }

    if (openTimeToggle) {
        openTimeToggle.addEventListener('change', function() {
            if (this.disabled) {
                this.checked = false;
                return;
            }
            if (this.checked) {
                if (!startTime.value) {
                    const now = new Date();
                    startTime.value = now.toISOString().slice(0, 16);
                }
                endTime.disabled = true;
                endTime.value = '';
                endTime.style.opacity = '0.5';
                endTime.required = false;
                if (endDisplay) endDisplay.value = '';
                startRunningTimer();
            } else {
                endTime.disabled = false;
                endTime.style.opacity = '1';
                endTime.required = true;
                clearInterval(openTimeInterval);
                if (previewDuration) previewDuration.innerText = '----';
            }
            updateSummary();
        });
    }

    // Register all event listeners including paxInput
    [customerName, contactNumber, roomId, paxInput, startTime, endTime, durationSelect, extraFeeInput, discountSelect].forEach(el => {
        if (!el) return;
        const eventType = el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(eventType, function() {
            updateSummary();
            if (el === roomId) updateOpenTimeToggleState();
        });
    });

    setTimeout(updateOpenTimeToggleState, 100);

    function confirmReservation() {
        if (!customerName.value.trim() || !startTime.value.trim() || (!endTime.value.trim() && !openTimeToggle.checked)) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Data',
                text: 'Please fill in the Customer Name and complete the reservation date/time.',
                confirmButtonColor: '#82cae8'
            });
            return;
        }

        updateSummary();
        const checkUrl = `/admin/check_availability?room_id=${roomId.value}&start=${encodeURIComponent(startTime.value)}&end=${encodeURIComponent(endTime.value || '')}&open_time=${openTimeToggle.checked}`;

        fetch(checkUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'conflict') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Schedule Conflict',
                        text: data.message || 'The selected room is already booked for the requested time slot.',
                        confirmButtonColor: '#d90429'
                    });
                } else {
                    Swal.fire({
                        title: 'Save Reservation?',
                        text: `Confirming reservation for ${customerName.value}. Total: ${previewTotal.innerText}`,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#82cae8',
                        cancelButtonColor: '#d90429',
                        confirmButtonText: 'Yes, Save it!'
                    }).then(result => {
                        if (result.isConfirmed) {
                            if (openTimeToggle.checked) {
                                endTime.disabled = false;
                                endTime.value = '';
                            }
                            resForm.submit();
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error checking availability:', error);
                resForm.submit();
            });
    }

    const confirmButton = document.getElementById('confirmReservation');
    const cancelButton = document.getElementById('cancelReservation');

    if (confirmButton) {
        confirmButton.addEventListener('click', confirmReservation);
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', () => window.location.reload());
    }

    updateSummary();
});