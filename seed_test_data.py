#!/usr/bin/env python3
"""Restore required local system configuration without creating customer test data."""

import os
import sys

PROJECT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "high_end_ws_lounge")
sys.path.insert(0, PROJECT_DIR)
os.chdir(PROJECT_DIR)

from database_fixed import PaymentInfo, Room, db  # noqa: E402
from run import create_app  # noqa: E402


DEFAULT_ROOMS = (
    ("Common Area", 35.0, "solo"),
    ("Small Meeting Room 1", 50.0, "meeting"),
    ("Small Meeting Room 2", 50.0, "meeting"),
    ("Lecture Room", 150.0, "lecture"),
    ("Conference Room", 250.0, "conference"),
    ("Comfy Room", 150.0, "comfy"),
    ("Event Room 1", 300.0, "event"),
    ("Event Room 2", 300.0, "event"),
)

DEFAULT_PAYMENT_INFO = (
    ("GCash", "WS Students & Professionals Lounge", "09997672051", "Send 50% downpayment and upload the receipt."),
    ("Maya", "WS Students & Professionals Lounge", "09997672051", "Please upload the receipt after payment."),
)

app = create_app()


def seed_required_data():
    with app.app_context():
        rooms_added = 0
        payments_added = 0

        for name, base_rate, category in DEFAULT_ROOMS:
            if not Room.query.filter_by(name=name).first():
                db.session.add(Room(name=name, base_rate=base_rate, category=category, status="available"))
                rooms_added += 1

        for method, account_name, account_number, instructions in DEFAULT_PAYMENT_INFO:
            if not PaymentInfo.query.filter_by(method=method).first():
                db.session.add(PaymentInfo(
                    method=method,
                    account_name=account_name,
                    account_number=account_number,
                    instructions=instructions,
                ))
                payments_added += 1

        db.session.commit()
        print(f"Required local data ready: added {rooms_added} rooms and {payments_added} payment settings.")
        print("No customer accounts, reservations, memberships, plans, or attendance records were created.")


if __name__ == "__main__":
    seed_required_data()
