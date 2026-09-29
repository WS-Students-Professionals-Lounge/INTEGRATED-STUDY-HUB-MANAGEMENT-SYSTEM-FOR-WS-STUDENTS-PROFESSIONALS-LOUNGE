document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('resSearch');
    const tableBody = document.getElementById('confirmReservationsBody');

    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            const term = e.target.value.toLowerCase();

            document.querySelectorAll('.custom-table tbody tr:not(.empty-reservations-row)').forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(term)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    const receiptModal = document.getElementById('receipt-modal');
    const receiptModalImage = document.getElementById('receipt-modal-image');
    const receiptModalClose = document.getElementById('receipt-modal-close');

    document.addEventListener('click', function(event) {
        const link = event.target.closest('.receipt-link');
        if (!link) return;
        event.preventDefault();
        const imageSrc = link.dataset.img;
        if (!imageSrc) return;
        receiptModalImage.src = imageSrc;
        receiptModal.classList.remove('d-none');
    });

    if (receiptModalClose) {
        receiptModalClose.addEventListener('click', function() {
            receiptModal.classList.add('d-none');
        });
    }

    if (receiptModal) {
        receiptModal.addEventListener('click', function(event) {
            if (event.target === receiptModal) {
                receiptModal.classList.add('d-none');
            }
        });
    }

    const makeCell = (text, className = '') => {
        const cell = document.createElement('td');
        if (className) cell.className = className;
        cell.textContent = text == null || text === '' ? 'N/A' : String(text);
        return cell;
    };

    const formatDateTime = value => {
        if (!value) return { date: 'N/A', time: 'Open' };
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return { date: 'N/A', time: 'N/A' };
        const options = { timeZone: 'Asia/Manila' };
        return {
            date: new Intl.DateTimeFormat('en-US', {
                ...options, month: 'short', day: '2-digit', year: 'numeric',
            }).format(date),
            time: new Intl.DateTimeFormat('en-US', {
                ...options, hour: '2-digit', minute: '2-digit', hour12: true,
            }).format(date),
        };
    };

    const createActionForm = (action, label, className, nextUrl) => {
        const form = document.createElement('form');
        form.method = 'post';
        form.action = action || '#';
        if (nextUrl && label === 'Delete') {
            const nextInput = document.createElement('input');
            nextInput.type = 'hidden';
            nextInput.name = 'next';
            nextInput.value = nextUrl;
            form.appendChild(nextInput);
        }
        const button = document.createElement('button');
        button.type = 'submit';
        button.className = className;
        button.textContent = label;
        if (label === 'Delete') {
            button.addEventListener('click', event => {
                if (!window.confirm('Permanently delete this reservation?')) event.preventDefault();
            });
        }
        form.appendChild(button);
        return form;
    };

    const appendReservationRequest = request => {
        if (!tableBody || !request || !request.id) return;
        const rowId = `res-${request.id}`;
        if (document.getElementById(rowId)) return;

        tableBody.querySelector('.empty-reservations-row')?.remove();
        const row = document.createElement('tr');
        row.id = rowId;
        row.dataset.reservationId = String(request.id);

        row.appendChild(makeCell(`#${request.customer_id || request.id}`));

        const customerCell = document.createElement('td');
        const customerName = document.createElement('div');
        customerName.className = 'fw-bold';
        customerName.textContent = request.customer_name || 'Guest';
        const address = document.createElement('small');
        address.className = 'text-muted';
        address.textContent = request.address || 'No Address';
        customerCell.append(customerName, address);
        row.appendChild(customerCell);
        row.appendChild(makeCell(request.room_name || 'Common Area'));

        const start = formatDateTime(request.start_time);
        const end = formatDateTime(request.end_time);
        const dateCell = document.createElement('td');
        const dateValue = document.createElement('div');
        dateValue.textContent = start.date;
        const timeValue = document.createElement('small');
        timeValue.className = 'text-muted';
        timeValue.textContent = `${start.time} - ${end.time}`;
        dateCell.append(dateValue, timeValue);
        row.appendChild(dateCell);

        const paymentCell = document.createElement('td');
        if (request.payment_method) {
            const method = document.createElement('div');
            method.textContent = request.payment_method;
            const paymentType = document.createElement('small');
            paymentType.className = 'text-muted';
            paymentType.textContent = request.payment_type === 'Full Payment'
                ? 'Full Payment'
                : 'Downpayment (50%)';
            const paidAmount = document.createElement('div');
            paidAmount.className = request.payment_type === 'Full Payment' ? 'text-success' : 'text-warning';
            paidAmount.textContent = `₱${Number(request.amount_paid || 0).toFixed(2)}`;
            paymentCell.append(method, paymentType, paidAmount);
            if (request.payment_type !== 'Full Payment') {
                const total = document.createElement('small');
                total.className = 'text-muted';
                total.textContent = `Grand Total: ₱${Number(request.total_amount || 0).toFixed(2)}`;
                paymentCell.appendChild(total);
            }
            if (request.paid) {
                const paid = document.createElement('div');
                paid.className = 'text-success fw-bold';
                paid.textContent = 'Full Paid';
                paymentCell.appendChild(paid);
            }
        } else {
            paymentCell.textContent = 'N/A';
        }
        row.appendChild(paymentCell);

        const receiptCell = document.createElement('td');
        if (request.receipt_url) {
            const receiptLink = document.createElement('a');
            receiptLink.href = '#';
            receiptLink.className = 'receipt-link';
            receiptLink.dataset.img = request.receipt_url;
            receiptLink.textContent = 'View Receipt';
            receiptCell.appendChild(receiptLink);
        } else {
            receiptCell.textContent = 'None';
        }
        row.appendChild(receiptCell);

        row.appendChild(makeCell(`₱${Number(request.total_amount || 0).toFixed(2)}`, 'fw-bold text-primary'));
        row.appendChild(makeCell(request.user_role === 'admin' || request.user_role === 'staff'
            ? `${request.user_name || request.added_by || 'Unknown'} (Staff)`
            : (request.user_name || request.added_by || 'Unknown')));

        const actionsCell = document.createElement('td');
        const actionStack = document.createElement('div');
        actionStack.className = 'd-flex flex-column gap-2';
        const addonSummary = document.createElement('div');
        addonSummary.className = 'text-muted small';
        addonSummary.textContent = 'Add-ons: None';
        const actionButtons = document.createElement('div');
        actionButtons.className = 'd-flex flex-wrap gap-1';
        actionButtons.append(
            createActionForm(request.confirm_url, 'Confirm', 'btn-sm btn-success'),
            createActionForm(request.hold_url, 'Hold', 'btn-sm btn-secondary'),
            createActionForm(request.delete_url, 'Delete', 'btn-sm btn-danger', request.next_url)
        );
        actionStack.append(addonSummary, actionButtons);
        actionsCell.appendChild(actionStack);
        row.appendChild(actionsCell);

        tableBody.prepend(row);
        if (searchInput?.value) {
            const matches = row.textContent.toLowerCase().includes(searchInput.value.toLowerCase());
            row.style.display = matches ? '' : 'none';
        }
    };

    window.addEventListener('newReservationRequestReceived', event => {
        appendReservationRequest(event.detail);
    });
});