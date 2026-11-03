# WS Students & Professionals Lounge — System Feature Guide

This guide documents the customer-facing and staff-facing features currently represented by the running Flask application. It is based on the registered application routes, templates, and client scripts in `high_end_ws_lounge`; it is not a promise that every optional or unfinished code path is active.

## 1. System overview

WS Lounge is a web system for managing shared study/work spaces, room reservations, walk-ins, solo plans, member attendance, payment evidence, and operational reports. It has a public marketing and sign-in page, a member portal, and an authenticated admin/staff portal.

The active app entry point registers the authentication, customer, admin, and membership routes from `run.py`. Admin and staff pages share the responsive navigation layout and support a light/dark theme preference.

## 2. User roles and access

| Role | Main capabilities |
|---|---|
| Visitor | View the public landing page, pricing cards, and About section; open the sign-in or registration dialog. |
| Member | Manage a profile, view the member dashboard, browse/request solo plans, book rooms, submit payment receipts, and view lounge usage information. |
| Staff | Use operational pages to manage reservations, walk-ins, member check-in/out, and membership requests. |
| Admin | Staff capabilities plus payment settings, reports, and staff-account management. Some destructive member actions and renewals are restricted to admin-level access. |

The app also has some routes that apply their own permission checks. A screen being visible in navigation should not be taken as evidence that every associated action is available to every role.

## 3. Visitor and account features

### Public landing page

The public page provides:

- Home, Pricing, and About Us navigation.
- Marketing cards for the Common Area, Event Room, and Comfy Room.
- A “Book a Space Now” action that directs visitors toward account access.
- Login and registration dialogs.
- A responsive menu for smaller screens.

The landing-page prices are marketing content. For available solo plan options and their current displayed rates, use the authenticated Solo Plans page.

### Registration and sign-in

- Members can register with their name, email, phone number, and password.
- Email addresses are normalized and checked for duplicates.
- Sign-in uses email and password and supports a remember-me option.
- Inactive accounts are denied access with a message to contact an administrator.
- Authenticated users can sign out.

### Password recovery

- A visitor can request a password-reset link by email.
- Reset links are time-limited to 30 minutes.
- The reset form requires matching new-password and confirmation values.
- Email delivery depends on the configured email service settings.

### Member profile

Members can update their name, email, and phone number, subject to email uniqueness validation. The profile page also provides a current-password-verified password change flow with a confirmation field.

## 4. Member portal

### Member dashboard

The dashboard brings together:

- A welcome panel and current clock.
- Total reservation count, solo-plan count, accumulated solo hours, and plan days remaining where applicable.
- Current or upcoming reservation details, including status, timing, and paused state where relevant.
- Recent completed reservations and membership/attendance information.
- Membership approval and renewal notifications.
- Reservation and membership notification badges in navigation.

Some notification counts and events are updated through the app’s live notification mechanisms; users can also view notification state on the dashboard.

### Room availability and customer reservations

Members can open **Book Space** to:

1. Review listed rooms, hourly base rates, and availability indicators.
2. Select a room, date, and start/end time, or choose open-time booking where offered.
3. Enter customer/contact information, party size, and reservation details.
4. Check availability before submission.
5. Review the calculated reservation cost and choose a payment option.
6. Submit a GCash or Maya payment receipt for staff verification.

Availability rules include:

- Private rooms are checked for overlapping active reservations.
- The Common Area is capacity-based; the application defaults to a capacity of 70 when no room-specific capacity is available.
- The Common Area check accounts for active reservations/walk-ins and checked-in members.
- Lecture Room customer bookings enforce a maximum party size of 15.
- Lecture Room and Event Room rates can vary by party-size tier.
- Invalid times, overlapping bookings, unsupported receipt formats, and oversized uploads are rejected.

For reservation payment, the interface offers full payment or a 50% downpayment. Payment evidence is uploaded as a receipt; a staff member verifies it and handles confirmation. This is not an automatic bank or e-wallet payment confirmation.

Receipt uploads on the customer reservation flow accept PNG, JPG/JPEG, JPE, GIF, WEBP, and PDF files up to 5 MB.

### Solo plans and rates

Members can compare plans, see their latest application and active membership status, view expiry/countdown information, and submit a plan request with payment method and receipt evidence.

The plan list currently shown in the application is:

| Plan | Displayed rate | Included access shown in the app |
|---|---:|---|
| Individual Rate | ₱35/hour | Hourly Common Area use, Wi-Fi, and charging |
| Individual Rate (4HRS) | ₱100 | Four hours of Common Area use, Wi-Fi, and charging |
| Day/Night Pass | ₱200 | Choice of the displayed day or night Common Area schedule; Wi-Fi and charging |
| Weekly Pass (Day/Night) | ₱800 | Seven days, day/night choice, Wi-Fi/charging, and Gold Card |
| Weekly Pass (24HRS) | ₱1,000 | Seven days of 24/7 use, Wi-Fi/charging, and Platinum Card |
| Monthly Pass (Day/Night) | ₱1,999 | 30 days, day/night choice, Wi-Fi/charging, exclusive locker, and Gold Card |
| Monthly Pass (24HRS) | ₱2,500 | 30 days of 24/7 Common Area access; listed multi-branch, locker, sleeping-pod, and shower-room benefits; Platinum Card |
| Workstation (24HRS) | ₱3,000 | 30-day workstation and listed Common Area, locker, sleeping-pod, and shower-room benefits |

Membership request flow:

1. The member selects a plan and submits payment information/receipt.
2. The request is saved as pending and appears for staff/admin review.
3. An admin or staff member approves or rejects the request.
4. Approval sets the plan status and expiry, links the membership record, and notifies the member.
5. A pending request or active plan prevents submitting another plan request through the normal plan-selection flow.

The plan details above reproduce the current UI copy; branch access and facility benefits should be confirmed with lounge operations before being treated as contractual terms.

### Lounge use, check-in, and usage history

The **Lounge Usage Logs** page shows:

- Monthly logged time.
- Most-used plan/room label.
- Average completed session length.
- Completed session count.
- Active-session status, plan, timer/countdown, and recent usage records where available.

The member-facing time-in/time-out flow requires an approved, unexpired solo plan. It prevents starting a second open time log and calculates elapsed time on time-out.

Staff also have membership-specific attendance check-in/out and pause controls. Those operational membership attendance records are distinct from the member-facing time-log records.

## 5. Admin and staff portal

### Operational dashboard

The admin dashboard includes:

- Summary cards for member count, active plans, pending reservations, and today’s earnings.
- Live room/occupancy status and a searchable active-session view.
- Common Area occupied and available slot totals.
- Active reservation and walk-in cards with session timers and time status.
- A walk-in check-in action.
- Reservation pause/resume and session-management actions.
- Waiting and held reservation views.

The dashboard also advances due reservation statuses and marks elapsed timed reservations as ended as part of its operational processing.

### Create reservations and manage reservation lists

Staff/admin users can create reservations on behalf of customers. The creation form supports room, customer/contact details, party size, schedule/open-time selection, notes, fees/discount-related fields, and a total preview. The server checks room/time conflicts and applies applicable party-size limits.

The reservation list provides:

- Search by customer or room.
- Customer, room, date/time, status, payment method/type, paid amount, receipt, total, and creator information.
- Receipt preview where a receipt is attached.
- Navigation to the separate pending-reservation confirmation page.
- Actions for confirming, holding, paying a balance, cancelling, or deleting a reservation, subject to status and role checks.
- A balance-payment flow; an on-hold reservation with a remaining balance cannot be started until the balance is paid.

Admin-created reservations are created as confirmed. Customer-submitted reservations require staff review/confirmation.

### Walk-ins and checkout

Staff/admin users can register walk-in customers with room, party size, duration/open-time option, customer details, fees, and total amount. The system checks room conflicts and Common Area capacity before creating the walk-in record.

Operational actions include checkout, processing payment, extending a session, and updating the room/session state. Billing can account for the configured room rate, duration, extra fee, discount, and add-on subtotal fields present in the form.

### Member and membership administration

The **Members** page provides tabs for:

- **Membership Requests** — review the member and requested plan, view payment receipt evidence, and approve/reject the request.
- **Member List** — search and manage member accounts and active membership state.
- **Deactivated Accounts** — review accounts deactivated by administrators.

The **Official Members** area provides active, pending, and expired membership views, search, attendance history, and staff check-in/check-out controls. Staff/admin membership operations include:

- Check in a member and create/open an attendance record.
- Pause/resume an active session.
- Check out a member and close the attendance record.
- View attendance history.
- Renew an eligible membership after confirming in-person payment and the configured plan amount.

Admin-only member operations include account deactivation/reactivation and permanent member deletion. These actions change account/membership access and should be used with care.

### Staff account management

Admin users can create staff or admin accounts and activate/deactivate managed staff accounts. The creator cannot deactivate their own account through the staff-status action. Staff account changes are recorded in an activity log.

### Payment settings

Admin users can manage the GCash and Maya payment instructions shown to customers, including account name, account number, optional instructions, and QR image. These settings provide payment details; they do not themselves verify a payment.

### Reports

The **Daily Reports & Analytics** page is admin-only. Its existing date-range and room filters control the completed-session report table; the separate analytics year selector controls the annual charts and does not change those filters. The page also retains the Daily Analytics Summary.

The Sales Analytics section displays:

- KPI cards for total revenue, paid completed sessions, average reservation bill, best month, and most-used room.
- Monthly revenue, revenue by room, revenue by source, completed room usage, and completed sessions by weekday charts.
- Server-generated sales and room-usage insights.
- A next-month estimate based on a three-finished-month moving average when at least three finished calendar months are available.
- A count of payment events whose reporting date was estimated from a fallback timestamp.

Analytics are fetched read-only from the admin analytics endpoint when the page loads or the year changes. Reservation revenue is assigned to recorded downpayment/balance payment dates; where an initial payment has no downpayment timestamp, the report uses an available fallback date and includes it in the estimated-date count. A remaining bill is assigned to checkout only for a paid, checked-out reservation. SoloPlan revenue uses the saved amount and approval date, remains in historical totals after checkout/expiry, and excludes pending, rejected, and refunded plans. Recorded membership-renewal activity is also included in total revenue. Consequently, missing or zero saved amounts and estimated dates limit what can be reported accurately; the charts do not invent those values.

The average reservation bill is reservation revenue divided by paid completed sessions; it excludes SoloPlan and membership-renewal revenue. The current Philippine calendar month is labelled “Month so far.” Future months are omitted from totals and comparisons, and forecasts use only fully finished months.

The completed-session PDF export accepts the existing date and room filters and includes customer, room, session, staff, and total-bill details. The separate general PDF-generation action currently displays an “initializing” notice rather than generating a report.

### Notifications

The shared navigation displays pending reservation and membership/member counts. Staff/admin pages expose notification counts and clear actions, and new membership requests/status changes are emitted to relevant users through the app’s live event mechanism.

## 6. Shared interface features

- Responsive navigation and mobile menu controls.
- Light/dark theme toggle, with the selected theme stored in browser local storage.
- Toast/flash notifications for success, warnings, and errors.
- Philippine-time-oriented reservation and membership operations.
- Search controls on member, reservation, and dashboard lists where provided.

## 7. Current implementation notes and limits

These notes distinguish the visible, wired application from code that is incomplete or not connected:

1. **Payments are receipt-based/manual in the normal customer journeys.** Reservation and solo-plan forms collect GCash/Maya payment evidence for review. Do not describe this as automatic e-wallet settlement.
2. **Add-on support is not fully wired into the running application.** Some forms and scripts contain add-on fields/selection logic, and an add-on API module exists, but the active startup file does not register that API blueprint. End-to-end add-on catalog management and checkout should therefore be treated as unverified.
3. **A customer reservations route exists, but its referenced `reservations.html` template is not present in the current template set.** The member dashboard still shows reservation information; the standalone route should not be advertised as a verified page until its template is restored or the route is changed.
4. **General PDF export is a placeholder.** The completed-session PDF export is implemented separately.
5. **The API contains a card-checkout-session endpoint, but the normal Solo Plans interface documents receipt submission and GCash/Maya review.** Card checkout should not be described as a completed customer feature without verifying the end-to-end flow and deployment configuration.
6. **Marketing copy and in-app plan descriptions differ in level of detail.** Use the authenticated plan comparison page as the source for the currently configured plan list, and have operations confirm the benefits before publication.

## 8. Key records managed by the system

The main business records represented in the database include:

- **User** — member, staff, or admin identity, contact information, account status, and credentials.
- **Room** — room name, category, base hourly rate, and availability status.
- **Reservation** — customer, room, date/time, party size, booking status, payment/receipt, total, fees, discount, and pause state.
- **SoloPlan** — selected plan, request/approval status, payment evidence, approval actor, and expiry.
- **Membership** — a member’s current plan state, expiry, check-in/out/pause state, and credited/remaining hours.
- **AttendanceLog / TimeLog** — membership attendance sessions and member time-in/time-out history.
- **PaymentInfo** — GCash/Maya account and QR instructions.
- **DailyReport / UserActivityLog** — operational summary and recorded account/activity events.

## 9. Source map

- App setup and registered routes: [`high_end_ws_lounge/run.py`](../high_end_ws_lounge/run.py)
- Customer, authentication, booking, plan, and time-log routes: [`high_end_ws_lounge/client_fixed.py`](../high_end_ws_lounge/client_fixed.py)
- Admin dashboard, reservation, member, payment, and reporting routes: [`high_end_ws_lounge/admin.py`](../high_end_ws_lounge/admin.py)
- Membership attendance routes: [`high_end_ws_lounge/membership_routes.py`](../high_end_ws_lounge/membership_routes.py)
- Data records: [`high_end_ws_lounge/database_fixed.py`](../high_end_ws_lounge/database_fixed.py)
- Customer templates: [`high_end_ws_lounge/app/templates/`](../high_end_ws_lounge/app/templates/)
- Admin templates: [`high_end_ws_lounge/app/templates/admin/`](../high_end_ws_lounge/app/templates/admin/)
