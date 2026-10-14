"""Regression tests for Stripe webhook signature validation."""

import hashlib
import hmac
import json
import time

import app as rydon_app


def test_webhook_refuses_when_signing_secret_is_missing(monkeypatch):
    monkeypatch.delenv("STRIPE_WEBHOOK_SECRET", raising=False)
    response = rydon_app.app.test_client().post(
        "/api/billing/webhook",
        data=b'{"type":"checkout.session.completed"}',
        content_type="application/json",
    )
    assert response.status_code == 503
    assert response.get_json()["error"] == "Billing webhook is not configured."


def test_webhook_rejects_missing_signature(monkeypatch):
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec-test-secret")
    response = rydon_app.app.test_client().post(
        "/api/billing/webhook",
        data=b'{"type":"checkout.session.completed"}',
        content_type="application/json",
    )
    assert response.status_code == 400
    assert response.get_json()["error"] == "Invalid webhook signature."


def test_webhook_rejects_expired_signature_timestamp(monkeypatch):
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec-test-secret")
    payload = json.dumps({"type": "checkout.session.completed"}).encode()
    old_timestamp = str(int(time.time()) - 600)
    signed = old_timestamp.encode("ascii") + b"." + payload
    signature = hmac.new(b"whsec-test-secret", signed, hashlib.sha256).hexdigest()

    response = rydon_app.app.test_client().post(
        "/api/billing/webhook",
        data=payload,
        headers={"Stripe-Signature": f"t={old_timestamp},v1={signature}"},
        content_type="application/json",
    )
    assert response.status_code == 400
    assert response.get_json()["error"] == "Webhook timestamp is outside the allowed window."


def test_webhook_rejects_invalid_signature(monkeypatch):
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec-test-secret")
    timestamp = str(int(time.time()))
    response = rydon_app.app.test_client().post(
        "/api/billing/webhook",
        data=b'{"type":"checkout.session.completed"}',
        headers={"Stripe-Signature": f"t={timestamp},v1=not-a-real-signature"},
        content_type="application/json",
    )
    assert response.status_code == 400
    assert response.get_json()["error"] == "Invalid webhook signature."
