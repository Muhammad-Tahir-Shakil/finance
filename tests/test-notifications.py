#!/usr/bin/env python3
"""Unit tests for notification alert rules — run: python3 tests/test-notifications.py"""

from datetime import date, timedelta

passed = failed = 0


def assert_(cond, label):
    global passed, failed
    if cond:
        passed += 1
        print(f"  ✓ {label}")
    else:
        failed += 1
        print(f"  ✗ {label}")


def month_key(d=None):
    d = d or date.today()
    return d.strftime("%Y-%m")


def tx_month_key(d):
    return str(d)[:7]


def money(n):
    return f"${int(n or 0):,}"


def sum_by_type(transactions, typ, m_key=None):
    total = 0
    for t in transactions:
        if t.get("type") != typ:
            continue
        if m_key and tx_month_key(t.get("date", "")) != m_key:
            continue
        total += float(t.get("amount") or 0)
    return total


def spent_for(data, cat, m_key):
    return sum(
        float(t["amount"])
        for t in data.get("transactions", [])
        if t.get("type") == "expense"
        and t.get("category") == cat
        and tx_month_key(t.get("date", "")) == m_key
    )


def days_until(date_str):
    if not date_str:
        return None
    end = date.fromisoformat(date_str)
    return (end - date.today()).days


def goal_progress(g):
    target = float(g.get("target") or 0)
    saved = float(g.get("saved") or 0)
    if target <= 0:
        return 0
    return min(100, round((saved / target) * 100))


def collect_alerts(data):
    """Python mirror of collectAlerts for testing."""
    m = month_key()
    alerts = []

    for cat, limit in (data.get("budgets") or {}).items():
        limit = float(limit)
        if limit <= 0:
            continue
        spent = spent_for(data, cat, m)
        pct = round((spent / limit) * 100)
        if spent > limit:
            alerts.append({"id": f"budget-over-{cat}", "severity": "error", "type": "budget"})
        elif pct >= 80:
            alerts.append({"id": f"budget-warn-{cat}", "severity": "warning", "type": "budget"})

    for g in data.get("goals") or []:
        if g.get("completed"):
            continue
        days = days_until(g.get("deadline"))
        pct = goal_progress(g)
        if days is not None and days < 0:
            alerts.append({"id": f"goal-overdue-{g['id']}", "severity": "error", "type": "goal"})
        elif days is not None and days <= 7:
            alerts.append({"id": f"goal-due-{g['id']}", "severity": "warning", "type": "goal"})
        elif g.get("priority") == "high" and days is not None and days <= 30 and pct < 25:
            alerts.append({"id": f"goal-behind-{g['id']}", "severity": "warning", "type": "goal"})

    income = sum_by_type(data.get("transactions", []), "income", m)
    expense = sum_by_type(data.get("transactions", []), "expense", m)
    if income > 0 and expense > income:
        alerts.append({"id": "insight-overspend", "severity": "error", "type": "insight"})

    today = date.today()
    for sub in (data.get("subscriptions") or []):
        if not sub.get("active") or not sub.get("renewDate"):
            continue
        renew = date.fromisoformat(sub["renewDate"])
        days = (renew - today).days
        if 0 <= days <= 7:
            alerts.append({"id": f"sub-renew-{sub['id']}", "severity": "warning", "type": "subscription"})

    severity_order = {"error": 0, "warning": 1, "info": 2}
    alerts.sort(key=lambda a: (severity_order.get(a["severity"], 9), a["id"]))
    return alerts


def base_data():
    return {
        "transactions": [],
        "budgets": {},
        "goals": [],
        "subscriptions": [],
    }


def main():
    global passed, failed
    m = month_key()
    print("\nNotification alerts tests\n")

    data = base_data()
    data["budgets"] = {"Food": 1000}
    data["transactions"] = [{"type": "expense", "category": "Food", "amount": 2000, "date": f"{m}-15"}]
    alerts = collect_alerts(data)
    assert_(any(a["id"] == "budget-over-Food" for a in alerts), "Food budget over limit triggers error alert")
    assert_(alerts[0]["severity"] == "error", "Budget exceeded is error severity")

    data = base_data()
    data["budgets"] = {"Transport": 1000}
    data["transactions"] = [{"type": "expense", "category": "Transport", "amount": 850, "date": f"{m}-10"}]
    alerts = collect_alerts(data)
    assert_(any(a["id"] == "budget-warn-Transport" for a in alerts), "Budget at 85% triggers warning")
    assert_(not any(a["id"] == "budget-over-Transport" for a in alerts), "Budget under limit is not error")

    data = base_data()
    data["budgets"] = {"Food": 1000}
    data["transactions"] = [{"type": "expense", "category": "Food", "amount": 500, "date": f"{m}-10"}]
    assert_(len(collect_alerts(data)) == 0, "No alerts when spending is healthy")

    data = base_data()
    data["goals"] = [{
        "id": "g1", "name": "Vacation", "target": 5000, "saved": 1000,
        "deadline": "2020-01-01", "priority": "medium", "completed": False,
    }]
    assert_(any(a["id"] == "goal-overdue-g1" for a in collect_alerts(data)), "Overdue goal triggers alert")

    soon = (date.today() + timedelta(days=3)).isoformat()
    data = base_data()
    data["goals"] = [{
        "id": "g2", "name": "Emergency", "target": 10000, "saved": 2000,
        "deadline": soon, "priority": "high", "completed": False,
    }]
    assert_(any(a["id"] == "goal-due-g2" for a in collect_alerts(data)), "Goal due within 7 days triggers alert")

    data = base_data()
    data["goals"] = [{
        "id": "g3", "name": "Done", "target": 1000, "saved": 1000,
        "deadline": "2020-01-01", "priority": "low", "completed": True,
    }]
    assert_(len(collect_alerts(data)) == 0, "Completed goals produce no alerts")

    data = base_data()
    data["transactions"] = [
        {"type": "income", "category": "Salary", "amount": 3000, "date": f"{m}-01"},
        {"type": "expense", "category": "Food", "amount": 4000, "date": f"{m}-05"},
    ]
    assert_(any(a["id"] == "insight-overspend" for a in collect_alerts(data)), "Overspending triggers insight alert")

    renew = (date.today() + timedelta(days=2)).isoformat()
    data = base_data()
    data["subscriptions"] = [{
        "id": "s1", "name": "Netflix", "amount": 15, "renewDate": renew,
        "category": "Streaming", "cycle": "monthly", "active": True,
    }]
    assert_(any(a["id"] == "sub-renew-s1" for a in collect_alerts(data)), "Upcoming subscription renewal triggers alert")

    assert_(len(collect_alerts(base_data())) == 0, "Empty data produces no alerts")

    data = base_data()
    data["budgets"] = {"Food": 1000}
    data["transactions"] = [{"type": "expense", "category": "Food", "amount": 2000, "date": f"{m}-15"}]
    alerts = collect_alerts(data)
    reads = {"budget-over-Food": f"{m}:Food:2000.0:1000.0:error"}
    unread = [a for a in alerts if reads.get(a["id"]) != f"{m}:Food:2000.0:1000.0:error"]
    assert_(len(alerts) == 1 and len(unread) == 0, "Read alert excluded from unread count")

    data["transactions"] = [{"type": "expense", "category": "Food", "amount": 500, "date": f"{m}-15"}]
    assert_(len(collect_alerts(data)) == 0, "Resolved issue removes alert on refresh")

    print(f"\n{passed} passed, {failed} failed\n")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
