import json


def test_pwa_manifest_is_valid_and_points_to_existing_icon():
    from app import app

    client = app.test_client()
    response = client.get("/static/manifest.webmanifest")

    assert response.status_code == 200
    manifest = json.loads(response.get_data(as_text=True))
    assert manifest["name"] == "Chat IPA"
    assert manifest["short_name"]
    assert manifest["start_url"] == "/"
    assert manifest["scope"] == "/"
    assert manifest["display"] == "standalone"
    assert manifest["icons"]

    for icon in manifest["icons"]:
        icon_response = client.get(icon["src"])
        assert icon_response.status_code == 200
        assert icon_response.data


def test_service_worker_is_served_and_excludes_api_requests_from_cache():
    from app import app

    response = app.test_client().get("/static/service-worker.js")

    assert response.status_code == 200
    source = response.get_data(as_text=True)
    assert "addEventListener('install'" in source
    assert "addEventListener('activate'" in source
    assert "url.pathname.startsWith('/api/')" in source
    assert "rydon-ai-shell" in source
