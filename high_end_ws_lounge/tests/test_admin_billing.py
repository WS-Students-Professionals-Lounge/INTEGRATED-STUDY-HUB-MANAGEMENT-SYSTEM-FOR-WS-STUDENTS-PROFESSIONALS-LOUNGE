import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import datetime, timedelta
from types import SimpleNamespace

from admin import (
    calculate_admin_total_amount,
    calculate_fixed_session_checkout_total,
    calculate_fixed_session_overtime_fee,
)


def test_calculate_admin_total_includes_addons_discount_and_fees():
    total = calculate_admin_total_amount(
        room_rate=150,
        duration_hours=1,
        extra_fee=25,
        addon_subtotal=300,
        discount_rate=0.1,
        is_open_time=False,
    )

    assert total == 460.0


def test_calculate_admin_total_includes_addons_for_open_time():
    total = calculate_admin_total_amount(
        room_rate=150,
        duration_hours=1,
        extra_fee=25,
        addon_subtotal=300,
        discount_rate=0.1,
        is_open_time=True,
    )

    assert total == 460.0


def test_fixed_session_overtime_fee_uses_common_area_tiers_for_all_rooms():
    end_time = datetime(2026, 10, 3, 12, 0)

    assert calculate_fixed_session_overtime_fee(end_time, end_time + timedelta(minutes=1)) == 5.0
    assert calculate_fixed_session_overtime_fee(end_time, end_time + timedelta(minutes=60)) == 25.0
    assert calculate_fixed_session_overtime_fee(end_time, end_time + timedelta(minutes=61)) == 30.0


def test_fixed_session_checkout_total_adds_overtime_to_stored_base_total():
    end_time = datetime(2026, 10, 3, 12, 0)
    reservation = SimpleNamespace(
        total_amount=100.0,
        start_time=end_time - timedelta(hours=1),
        end_time=end_time,
        room=SimpleNamespace(base_rate=100.0),
        extra_fee=0.0,
        addon_subtotal=0.0,
        discount_rate=0.0,
    )

    assert calculate_fixed_session_checkout_total(
        reservation,
        end_time + timedelta(minutes=61),
    ) == 130.0
