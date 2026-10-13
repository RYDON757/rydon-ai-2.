import io
import itertools
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import app as rydon_app

_client_ips = itertools.count(1)


def client():
    rydon_app.app.config.update(TESTING=True, SECRET_KEY="test-secret", RATELIMIT_ENABLED=False)
    # Give each test client a distinct IP so rate-limit counters never leak between tests.
    ip = "192.0.2." + str(next(_client_ips))
    test_client = rydon_app.app.test_client()
    test_client.environ_base["REMOTE_ADDR"] = ip
    return test_client


def test_health_endpoint_returns_ok_and_security_headers():
    response = client().get("/health")

    assert response.status_code == 200
    assert response.get_json() == {"ok": True}
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


def test_chat_local_greeting_works_without_provider_key():
    rydon_app.API_KEY = ""
    response = client().post("/api/chat", json={"message": "hello"})

    assert response.status_code == 200
    assert response.get_json()["source"] == "local"
    assert "RYDON AI" in response.get_json()["reply"]


def test_empty_chat_message_is_rejected():
    response = client().post("/api/chat", json={"message": "   "})

    assert response.status_code == 400
    assert "reply" in response.get_json()


def test_upload_rejects_unsupported_file_type():
    response = client().post(
        "/api/upload",
        data={"file": (io.BytesIO(b"not a pdf"), "notes.exe")},
        content_type="multipart/form-data",
    )

    assert response.status_code == 400
    assert "Only TXT and PDF" in response.get_json()["error"]


def test_oversized_request_returns_json_413():
    oversized_json = b'{"message":"' + (b"x" * (6 * 1024 * 1024)) + b'"}'
    response = client().post(
        "/api/chat",
        data=oversized_json,
        content_type="application/json",
    )

    assert response.status_code == 413
    assert response.get_json()["error"] == "request_too_large"
    assert "under 5 MB" in response.get_json()["reply"]


def test_embed_route_still_loads():
    response = client().get("/embed")

    assert response.status_code == 200
    assert "Content-Security-Policy" in response.headers

def test_creative_studio_page_loads():
    response = client().get("/studio")

    assert response.status_code == 200
    assert b"Document creator" in response.data
    assert b"Image generator" in response.data



def test_account_register_login_and_duplicate_email():
    import uuid
    email = "rydon-test-" + uuid.uuid4().hex + "@example.com"
    c = client()
    registered = c.post("/api/auth/register", json={
        "name": "Test User",
        "email": email,
        "password": "a-strong-test-password",
    })
    assert registered.status_code == 201
    assert registered.get_json()["account"]["plan"] == "free"
    assert registered.get_json()["account"]["email"] == email

    duplicate = c.post("/api/auth/register", json={
        "name": "Test User",
        "email": email,
        "password": "a-strong-test-password",
    })
    assert duplicate.status_code == 409

    c.post("/api/auth/logout")
    bad_login = c.post("/api/auth/login", json={
        "email": email,
        "password": "wrong-password",
    })
    assert bad_login.status_code == 401

    login = c.post("/api/auth/login", json={
        "email": email,
        "password": "a-strong-test-password",
    })
    assert login.status_code == 200
    assert login.get_json()["account"]["email"] == email


def test_account_registration_validates_password_and_email():
    c = client()
    short_password = c.post("/api/auth/register", json={
        "name": "Test User",
        "email": "user@example.com",
        "password": "short",
    })
    assert short_password.status_code == 400

    bad_email = c.post("/api/auth/register", json={
        "name": "Test User",
        "email": "not-an-email",
        "password": "a-strong-test-password",
    })
    assert bad_email.status_code == 400


def test_paid_checkout_requires_login_and_configuration(monkeypatch):
    for name in (
        "STRIPE_SECRET_KEY", "STRIPE_PRICE_PLUS",
        "STRIPE_PRICE_PRO", "STRIPE_WEBHOOK_SECRET",
    ):
        monkeypatch.delenv(name, raising=False)
    c = client()
    response = c.post("/api/billing/checkout", json={"plan": "plus"})
    assert response.status_code == 401

    import uuid
    c.post("/api/auth/register", json={
        "name": "Billing Test",
        "email": "billing-" + uuid.uuid4().hex + "@example.com",
        "password": "a-strong-test-password",
    })
    response = c.post("/api/billing/checkout", json={"plan": "plus"})
    assert response.status_code == 503
    assert "STRIPE_SECRET_KEY" in response.get_json()["error"]


def test_account_can_select_free_plan():
    import uuid
    c = client()
    c.post("/api/auth/register", json={
        "name": "Free Plan Test",
        "email": "free-" + uuid.uuid4().hex + "@example.com",
        "password": "a-strong-test-password",
    })
    response = c.post("/api/account/plan", json={"plan": "free"})
    assert response.status_code == 200
    assert response.get_json()["account"]["plan"] == "free"


def test_studio_document_uses_configured_ai(monkeypatch):
    rydon_app.API_KEY = "test-key"
    monkeypatch.setattr(
        rydon_app, "ask_hosted_model",
        lambda message, history, memory: "# Test document\n\nCreated."
    )
    response = client().post(
        "/api/studio/document",
        json={"kind": "report", "prompt": "Write a short test report"}
    )

    assert response.status_code == 200
    assert response.get_json()["content"].startswith("# Test document")


def test_studio_export_txt_returns_download():
    response = client().post(
        "/api/studio/export",
        json={"content": "Hello RYDON", "format": "txt", "filename": "hello"}
    )

    assert response.status_code == 200
    assert response.data == b"Hello RYDON"
    assert "attachment" in response.headers.get("Content-Disposition", "")


def test_studio_export_rejects_unknown_format():
    response = client().post(
        "/api/studio/export",
        json={"content": "Hello", "format": "exe"}
    )

    assert response.status_code == 400


def test_image_generation_explains_missing_provider(monkeypatch):
    monkeypatch.delenv("RYDON_IMAGE_API_BASE", raising=False)
    monkeypatch.delenv("RYDON_IMAGE_API_KEY", raising=False)
    monkeypatch.delenv("RYDON_IMAGE_MODEL", raising=False)
    response = client().post(
        "/api/studio/image",
        json={"prompt": "A sunrise above the mountains"}
    )

    assert response.status_code == 503
    assert "compatible provider" in response.get_json()["error"]



def test_studio_edit_requires_photo():
    response = client().post(
        "/api/studio/edit",
        data={"prompt": "Add dreadlocks"},
        content_type="multipart/form-data",
    )
    assert response.status_code == 400
    assert "Choose a photo" in response.get_json()["error"]


def test_studio_edit_rejects_fake_image():
    response = client().post(
        "/api/studio/edit",
        data={
            "prompt": "Add dreadlocks",
            "image": (io.BytesIO(b"not really an image"), "photo.jpg"),
        },
        content_type="multipart/form-data",
    )
    assert response.status_code == 400
    assert "valid JPEG, PNG, or WebP" in response.get_json()["error"]


def test_studio_edit_explains_missing_provider(monkeypatch):
    for name in (
        "RYDON_IMAGE_EDIT_API_BASE", "RYDON_IMAGE_EDIT_API_KEY",
        "RYDON_IMAGE_EDIT_MODEL", "RYDON_IMAGE_API_BASE",
        "RYDON_IMAGE_API_KEY", "RYDON_IMAGE_MODEL",
    ):
        monkeypatch.delenv(name, raising=False)
    response = client().post(
        "/api/studio/edit",
        data={
            "prompt": "Add dreadlocks",
            "image": (io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"\x00" * 20), "photo.png"),
        },
        content_type="multipart/form-data",
    )
    assert response.status_code == 503
    assert "RYDON_FREE_IMAGE_EDIT_API_BASE" in response.get_json()["error"]



def test_studio_edit_rejects_unknown_provider(monkeypatch):
    monkeypatch.setenv("RYDON_IMAGE_EDIT_API_BASE", "https://example.test/v1")
    monkeypatch.setenv("RYDON_IMAGE_EDIT_API_KEY", "test-key")
    monkeypatch.setenv("RYDON_IMAGE_EDIT_MODEL", "test-model")
    response = client().post(
        "/api/studio/edit",
        data={
            "provider": "unknown",
            "prompt": "Add dreadlocks",
            "image": (io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"\x00" * 20), "photo.png"),
        },
        content_type="multipart/form-data",
    )
    assert response.status_code == 400
    assert "free or paid" in response.get_json()["error"]


def test_studio_edit_provider_specific_configuration_error(monkeypatch):
    for name in (
        "RYDON_FREE_IMAGE_EDIT_API_BASE", "RYDON_FREE_IMAGE_EDIT_API_KEY",
        "RYDON_FREE_IMAGE_EDIT_MODEL", "RYDON_PAID_IMAGE_EDIT_API_BASE",
        "RYDON_PAID_IMAGE_EDIT_API_KEY", "RYDON_PAID_IMAGE_EDIT_MODEL",
        "RYDON_IMAGE_EDIT_API_BASE", "RYDON_IMAGE_EDIT_API_KEY",
        "RYDON_IMAGE_EDIT_MODEL", "RYDON_IMAGE_API_BASE",
        "RYDON_IMAGE_API_KEY", "RYDON_IMAGE_MODEL",
    ):
        monkeypatch.delenv(name, raising=False)
    response = client().post(
        "/api/studio/edit",
        data={
            "provider": "paid",
            "prompt": "Add dreadlocks",
            "image": (io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"\x00" * 20), "photo.png"),
        },
        content_type="multipart/form-data",
    )
    assert response.status_code == 503
    assert "RYDON_PAID_IMAGE_EDIT_API_BASE" in response.get_json()["error"]
