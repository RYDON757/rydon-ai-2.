import struct

import app as rydon_app


def test_pwa_manifest_is_valid_and_points_to_existing_icons():
    client = rydon_app.app.test_client()
    response = client.get("/static/manifest.webmanifest")

    assert response.status_code == 200
    manifest = response.get_json()
    assert manifest["name"] == "RYDON AI 2.0"
    assert manifest["start_url"] == "/"
    assert manifest["scope"] == "/"
    assert manifest["display"] == "standalone"
    assert manifest["theme_color"] == "#212121"

    png_sizes = {"192x192": (192, 192), "512x512": (512, 512)}
    for icon in manifest["icons"]:
        assert icon["src"].startswith("/static/")
        icon_response = client.get(icon["src"])
        assert icon_response.status_code == 200
        if icon["type"] == "image/png":
            data = icon_response.data
            assert data.startswith(b"\x89PNG\r\n\x1a\n")
            width, height = struct.unpack(">II", data[16:24])
            assert (width, height) == png_sizes[icon["sizes"]]


def test_home_page_includes_mobile_pwa_metadata_and_apple_icon():
    client = rydon_app.app.test_client()
    response = client.get("/")

    assert response.status_code == 200
    assert b'name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"' in response.data
    assert b'<link rel="manifest" href="/static/manifest.webmanifest">' in response.data
    assert b'name="apple-mobile-web-app-capable" content="yes"' in response.data
    assert b'href="/static/apple-touch-icon.png"' in response.data

    icon = client.get("/static/apple-touch-icon.png")
    assert icon.status_code == 200
    assert icon.data.startswith(b"\x89PNG\r\n\x1a\n")
    assert struct.unpack(">II", icon.data[16:24]) == (180, 180)


def test_service_worker_caches_mobile_icons_and_skips_api_requests():
    response = rydon_app.app.test_client().get("/static/service-worker.js")

    assert response.status_code == 200
    script = response.get_data(as_text=True)
    assert "rydon-ai-shell-v3" in script
    assert "self.addEventListener('install'" in script
    assert "url.pathname.startsWith('/api/')" in script
    assert "self.clients.claim()" in script
    assert "/static/rydon-icon-192.png" in script
    assert "/static/rydon-icon-512.png" in script
    assert "/static/apple-touch-icon.png" in script
