import json
from pathlib import Path

import app as rydon_app


def test_pwa_manifest_is_valid_and_points_to_existing_icon():
    response = rydon_app.app.test_client().get("/static/manifest.webmanifest")

    assert response.status_code == 200
    manifest = response.get_json()
    assert manifest["name"] == "RYDON AI 2.0"
    assert manifest["start_url"] == "/"
    assert manifest["scope"] == "/"
    assert manifest["display"] == "standalone"
    assert manifest["theme_color"] == "#212121"
    assert manifest["icons"]

    for icon in manifest["icons"]:
        assert icon["src"].startswith("/static/")
        icon_response = rydon_app.app.test_client().get(icon["src"])
        assert icon_response.status_code == 200


def test_home_page_includes_mobile_pwa_metadata():
    response = rydon_app.app.test_client().get("/")

    assert response.status_code == 200
    assert b'name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"' in response.data
    assert b'<link rel="manifest" href="/static/manifest.webmanifest">' in response.data
    assert b'name="apple-mobile-web-app-capable" content="yes"' in response.data


def test_service_worker_is_served_and_skips_api_requests():
    response = rydon_app.app.test_client().get("/static/service-worker.js")

    assert response.status_code == 200
    script = response.get_data(as_text=True)
    assert "self.addEventListener('install'" in script
    assert "url.pathname.startsWith('/api/')" in script
    assert "self.clients.claim()" in script
