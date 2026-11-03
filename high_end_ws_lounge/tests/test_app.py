import os
import sqlite3
import sys
from datetime import datetime
import pytest
import uuid
from io import BytesIO

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database_fixed import User, db, Room, PaymentInfo, Reservation, SoloPlan
from run import create_app
import client_fixed
from admin import admin_bp
from client_fixed import api_bp, auth_bp, main_bp
from membership_routes import membership_bp


@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    with app.app_context():
        db.create_all()
        yield app
        # db.drop_all()  # Skip cleanup to see test results


@pytest.fixture
def client(app):
    return app.test_client()


def register_customer_routes(app):
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(main_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(membership_bp)


def test_index(app):
    with app.app_context():
        client = app.test_client()
        res = client.get('/')
        print(f"Index response status: {res.status_code}")
        assert res.status_code == 200


def test_login(app, client):
    with app.app_context():
        # Create test user with a unique email to avoid collisions in a shared DB.
        email = f"test-{uuid.uuid4().hex[:8]}@example.com"
        user = User(name='test', email=email, role='member')
        user.set_password('testpass')
        db.session.add(user)
        db.session.commit()
        
        res = client.post('/auth/login', data={'email': email, 'password': 'testpass'})
        print(f"Login response status: {res.status_code}")
        print(f"Login response location: {res.location}")
        assert res.status_code == 302  # Redirect on success


def test_login_accepts_existing_account_without_csrf_token(app, client):
    with app.app_context():
        email = f"legacy-{uuid.uuid4().hex[:8]}@example.com"
        user = User(name='legacy', email=email, role='member')
        user.password = 'legacy-pass'
        db.session.add(user)
        db.session.commit()

        app.config['WTF_CSRF_ENABLED'] = True
        res = client.post('/auth/login', data={'email': email, 'password': 'legacy-pass'})

        assert res.status_code == 302
        assert res.headers['Location'].endswith('/dashboard')


def test_login_falls_back_to_local_sqlite_user(app, client):
    with app.app_context():
        email = f"sqlite-fallback-{uuid.uuid4().hex[:8]}@example.com"
        sqlite_path = os.path.join(os.path.dirname(__file__), '..', 'app.db')
        conn = sqlite3.connect(sqlite_path)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (name, email, phone, password, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            ('sqlite fallback', email, '09170000000', 'legacy-pass', 'member', 1, datetime.utcnow()),
        )
        conn.commit()
        conn.close()

        res = client.post('/auth/login', data={'email': email, 'password': 'legacy-pass'})

        assert res.status_code == 302
        assert res.headers['Location'].endswith('/dashboard')


def test_admin_dashboard_deduplicates_room_cards(app, client):
    with app.app_context():
        admin_email = f"admin-{uuid.uuid4().hex[:8]}@example.com"
        admin = User(name='admin', email=admin_email, role='admin')
        admin.set_password('adminpass')
        db.session.add(admin)

        duplicate_room_name = f"Duplicate Room {uuid.uuid4().hex[:4]}"
        db.session.add(Room(name=duplicate_room_name, base_rate=50.0, status='available'))
        db.session.add(Room(name=duplicate_room_name, base_rate=50.0, status='available'))
        db.session.commit()

        login_res = client.post('/auth/login', data={'email': admin_email, 'password': 'adminpass'})
        assert login_res.status_code == 302

        dash = client.get('/admin/dashboard')
        assert dash.status_code == 200
        html = dash.get_data(as_text=True)
        assert html.count(f'<span class="room-name">{duplicate_room_name}</span>') == 1


def test_reservation(app, client):
    with app.app_context():
        member_email = f"member-{uuid.uuid4().hex[:8]}@example.com"
        admin_email = f"admin-{uuid.uuid4().hex[:8]}@example.com"

        # Create test users
        member = User(name='member', email=member_email, role='member')
        member.set_password('memberpass')
        admin = User(name='admin', email=admin_email, role='admin')
        admin.set_password('adminpass')
        db.session.add(member)
        db.session.add(admin)

        # Create a room and initial payment settings. Reuse existing GCash entry if present.
        payment_info = PaymentInfo.query.filter_by(method='GCash').first()
        if not payment_info:
            payment_info = PaymentInfo(method='GCash', account_name='Admin', account_number='09170000000', instructions='Pay and upload receipt')
            db.session.add(payment_info)
        room = Room(name='Test Room', base_rate=50.0, status='available')
        db.session.add(room)
        db.session.commit()

        # Member login
        login_res = client.post('/auth/login', data={'email': member_email, 'password': 'memberpass'})
        assert login_res.status_code == 302

        # Submit a reservation with receipt upload
        reservation_data = {
            'room_id': str(room.id),
            'customer_name': 'Test Member',
            'contact_number': '09171234567',
            'pax_count': '2',
            'start_time': '2026-05-17T10:00',
            'end_time': '2026-05-17T12:00',
            'payment_method': 'GCash',
            'extra_notes': 'Feature test booking',
        }
        reservation_data['receipt_image'] = (BytesIO(b'testreceipt'), 'receipt.png')
        res = client.post('/rooms', data=reservation_data, content_type='multipart/form-data', follow_redirects=True)
        assert res.status_code == 200
        assert b'Awaiting admin approval' in res.data

        # Admin login and update payment settings
        client.get('/auth/logout')
        login_res = client.post('/auth/login', data={'email': admin_email, 'password': 'adminpass'})
        assert login_res.status_code == 302

        payment_data = {
            'method': 'GCash',
            'account_name': 'New Admin',
            'account_number': '09170000001',
            'instructions': 'Please pay and upload receipt',
        }
        payment_data['qr_image'] = (BytesIO(b'qrdata'), 'qr.png')
        payment_res = client.post('/admin/payment_settings', data=payment_data, content_type='multipart/form-data', follow_redirects=True)
        assert payment_res.status_code == 200
        assert b'GCash payment settings updated.' in payment_res.data


def test_room_availability_ignores_zero_length_reservations(app, client):
    app.register_blueprint(main_bp)
    with app.app_context():
        email = f"availability-{uuid.uuid4().hex[:8]}@example.com"
        member = User(name='availability member', email=email, role='member')
        member.set_password('memberpass')
        room = Room(
            name=f"Availability Room {uuid.uuid4().hex[:8]}",
            base_rate=50.0,
            status='available',
        )
        db.session.add_all([member, room])
        db.session.flush()

        invalid_reservation = Reservation(
            room_id=room.id,
            customer_name='Invalid zero-length reservation',
            start_time=datetime(2030, 7, 17, 22, 17),
            end_time=datetime(2030, 7, 17, 22, 17),
            status='Pending',
        )
        invalid_open_flag_reservation = Reservation(
            room_id=room.id,
            customer_name='Invalid zero-length reservation with stale open flag',
            start_time=datetime(2030, 7, 17, 22, 17),
            end_time=datetime(2030, 7, 17, 22, 17),
            is_open_time=True,
            status='Pending',
        )
        open_reservation = Reservation(
            room_id=room.id,
            customer_name='Open reservation',
            start_time=datetime(2030, 7, 19, 10, 0),
            end_time=None,
            is_open_time=True,
            status='Pending',
        )
        valid_reservation = Reservation(
            room_id=room.id,
            customer_name='Valid reservation',
            start_time=datetime(2030, 7, 18, 10, 0),
            end_time=datetime(2030, 7, 18, 11, 0),
            status='Pending',
        )
        db.session.add_all([
            invalid_reservation,
            invalid_open_flag_reservation,
            open_reservation,
            valid_reservation,
        ])
        db.session.commit()

        with client.session_transaction() as session:
            session['_user_id'] = str(member.id)
            session['_fresh'] = True

        available = client.get(
            '/api/check_availability',
            query_string={
                'room_id': room.id,
                'start_time': '2030-07-17T10:17',
                'end_time': '2030-07-17T11:17',
            },
        )
        assert available.status_code == 200
        assert available.json['status'] == 'ok'
        assert Reservation.check_conflict(
            room.id,
            datetime(2030, 7, 17, 10, 17),
            datetime(2030, 7, 17, 11, 17),
        ) is None

        unavailable = client.get(
            '/api/check_availability',
            query_string={
                'room_id': room.id,
                'start_time': '2030-07-18T10:30',
                'end_time': '2030-07-18T11:30',
            },
        )
        assert unavailable.status_code == 200
        assert unavailable.json['status'] == 'conflict'

        open_unavailable = client.get(
            '/api/check_availability',
            query_string={
                'room_id': room.id,
                'start_time': '2030-07-19T10:30',
                'end_time': '2030-07-19T11:30',
            },
        )
        assert open_unavailable.status_code == 200
        assert open_unavailable.json['status'] == 'conflict'
        assert Reservation.check_conflict(
            room.id,
            datetime(2030, 7, 19, 10, 30),
            datetime(2030, 7, 19, 11, 30),
        ) is not None

        db.session.delete(invalid_reservation)
        db.session.delete(invalid_open_flag_reservation)
        db.session.delete(open_reservation)
        db.session.delete(valid_reservation)
        db.session.delete(room)
        db.session.delete(member)
        db.session.commit()


def test_member_with_pending_reservation_cannot_submit_another(app, client):
    register_customer_routes(app)
    with app.app_context():
        member = User(
            name='pending reservation member',
            email=f"pending-reservation-{uuid.uuid4().hex[:8]}@example.com",
            role='member',
        )
        room = Room(
            name=f"Pending Reservation Room {uuid.uuid4().hex[:8]}",
            base_rate=50.0,
            status='available',
        )
        db.session.add_all([member, room])
        db.session.flush()
        reservation = Reservation(
            user_id=member.id,
            room_id=room.id,
            customer_name=member.name,
            start_time=datetime(2030, 7, 17, 10, 0),
            end_time=datetime(2030, 7, 17, 11, 0),
            status='Pending',
        )
        db.session.add(reservation)
        db.session.commit()

        with client.session_transaction() as session:
            session['_user_id'] = str(member.id)
            session['_fresh'] = True

        try:
            page = client.get('/rooms')
            assert page.status_code == 200
            assert b'You already have a pending or active reservation.' in page.data
            assert b'id="submit-booking" disabled="disabled"' in page.data

            response = client.post('/rooms', data={'room_id': str(room.id)})
            assert response.status_code == 200
            assert (
                b'You already have an active or pending reservation request.'
                in response.data
            )
            assert Reservation.query.filter_by(user_id=member.id).count() == 1
        finally:
            db.session.delete(reservation)
            db.session.delete(room)
            db.session.delete(member)
            db.session.commit()


@pytest.mark.parametrize('status', ['Pending', 'Approved', 'Active'])
def test_member_with_blocking_solo_plan_cannot_submit_another(app, client, status):
    register_customer_routes(app)
    with app.app_context():
        member = User(
            name='solo plan member',
            email=f"solo-plan-{uuid.uuid4().hex[:8]}@example.com",
            role='member',
        )
        db.session.add(member)
        db.session.flush()
        plan = SoloPlan(
            user_id=member.id,
            plan_name='DAY/NIGHT PASS',
            status=status,
        )
        db.session.add(plan)
        db.session.commit()

        with client.session_transaction() as session:
            session['_user_id'] = str(member.id)
            session['_fresh'] = True

        try:
            page = client.get('/solo_rates')
            assert page.status_code == 200
            assert (
                b'You currently have an active or pending SoloPlan membership request.'
                in page.data
            )
            assert b'class="btn btn-primary btn-block purchase-plan-btn"' not in page.data

            response = client.post(
                '/api/submit-solo-payment',
                data={'plan_name': 'DAY/NIGHT PASS'},
            )
            assert response.status_code == 409
            assert response.json['success'] is False
            assert 'active or pending SoloPlan' in response.json['message']
            assert SoloPlan.query.filter_by(user_id=member.id).count() == 1
        finally:
            db.session.delete(plan)
            db.session.delete(member)
            db.session.commit()


@pytest.mark.parametrize('status', ['Completed', 'Cancelled'])
def test_member_with_finished_reservation_can_submit_new_booking(
    app, client, monkeypatch, status
):
    register_customer_routes(app)
    with app.app_context():
        member = User(
            name='finished reservation member',
            email=f"finished-reservation-{uuid.uuid4().hex[:8]}@example.com",
            role='member',
        )
        room = Room(
            name=f"Finished Reservation Room {uuid.uuid4().hex[:8]}",
            base_rate=50.0,
            status='available',
        )
        other_member = User(
            name='other account member',
            email=f"other-reservation-{uuid.uuid4().hex[:8]}@example.com",
            role='member',
        )
        other_room = Room(
            name=f"Other Account Room {uuid.uuid4().hex[:8]}",
            base_rate=50.0,
            status='available',
        )
        db.session.add_all([member, room, other_member, other_room])
        db.session.flush()
        old_reservation = Reservation(
            user_id=member.id,
            room_id=room.id,
            customer_name=member.name,
            start_time=datetime(2025, 7, 17, 10, 0),
            end_time=datetime(2025, 7, 17, 11, 0),
            status=status,
        )
        other_account_reservation = Reservation(
            user_id=other_member.id,
            room_id=other_room.id,
            customer_name=other_member.name,
            start_time=datetime(2030, 7, 18, 10, 0),
            end_time=datetime(2030, 7, 18, 11, 0),
            status='Pending',
        )
        db.session.add_all([old_reservation, other_account_reservation])
        db.session.commit()

        with client.session_transaction() as session:
            session['_user_id'] = str(member.id)
            session['_fresh'] = True

        receipt_filename = f"booking-regression-{member.id}.png"
        monkeypatch.setattr(
            client_fixed,
            'secure_filename',
            lambda _filename: receipt_filename,
        )
        receipt_path = (
            os.path.join(
                app.root_path,
                'static',
                'uploads',
                'receipts',
                receipt_filename,
            )
        )
        booking_data = {
            'room_id': str(room.id),
            'customer_name': member.name,
            'contact_number': '09171234567',
            'pax_count': '1',
            'start_time': '2030-07-18T10:00',
            'end_time': '2030-07-18T11:00',
            'payment_method': 'GCash',
            'payment_type': 'Full Payment',
            'receipt_image': (BytesIO(b'test receipt'), 'receipt.png'),
        }

        try:
            response = client.post(
                '/rooms',
                data=booking_data,
                content_type='multipart/form-data',
                follow_redirects=True,
            )
            assert response.status_code == 200
            assert b'Awaiting admin approval' in response.data
            assert Reservation.query.filter_by(user_id=member.id).count() == 2
        finally:
            if os.path.exists(receipt_path):
                os.remove(receipt_path)
            for reservation in Reservation.query.filter_by(user_id=member.id).all():
                db.session.delete(reservation)
            db.session.delete(other_account_reservation)
            db.session.delete(other_room)
            db.session.delete(other_member)
            db.session.delete(room)
            db.session.delete(member)
            db.session.commit()
