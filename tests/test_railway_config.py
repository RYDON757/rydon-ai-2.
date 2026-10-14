"""Deployment configuration regression tests for hosted HTTPS platforms."""
import os
import subprocess
import sys


def run_app_config(extra_env):
    env = os.environ.copy()
    env.pop("RENDER", None)
    env.pop("RAILWAY_PUBLIC_DOMAIN", None)
    env.pop("RAILWAY_ENVIRONMENT_NAME", None)
    env.pop("RYDON_SECRET_KEY", None)
    env.update(extra_env)
    return subprocess.run(
        [
            sys.executable,
            "-c",
            "import app; print(app.app.config['SESSION_COOKIE_SECURE'])",
        ],
        env=env,
        capture_output=True,
        text=True,
        timeout=20,
    )


def test_railway_uses_secure_session_cookies_with_configured_secret():
    result = run_app_config({
        "RAILWAY_PUBLIC_DOMAIN": "example.up.railway.app",
        "RYDON_SECRET_KEY": "test-only-secret-for-config-check",
    })

    assert result.returncode == 0, result.stderr
    assert result.stdout.strip().endswith("True")


def test_railway_refuses_to_start_without_session_secret():
    result = run_app_config({
        "RAILWAY_ENVIRONMENT_NAME": "production",
    })

    assert result.returncode != 0
    assert "RYDON_SECRET_KEY must be configured in production" in result.stderr
