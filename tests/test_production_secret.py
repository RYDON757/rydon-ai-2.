"""Regression tests for production session-secret configuration."""

import os
import subprocess
import sys


def test_production_refuses_missing_session_secret():
    env = os.environ.copy()
    env["RENDER"] = "true"
    env.pop("RYDON_SECRET_KEY", None)

    result = subprocess.run(
        [sys.executable, "-c", "import app"],
        env=env,
        capture_output=True,
        text=True,
        timeout=30,
    )

    assert result.returncode != 0
    assert "RYDON_SECRET_KEY must be configured in production" in (
        result.stdout + result.stderr
    )


def test_development_can_use_fallback_secret():
    env = os.environ.copy()
    env.pop("RENDER", None)
    env.pop("RYDON_SECRET_KEY", None)

    result = subprocess.run(
        [
            sys.executable,
            "-c",
            "import app; assert app.app.secret_key == 'development-only-change-me'",
        ],
        env=env,
        capture_output=True,
        text=True,
        timeout=30,
    )

    assert result.returncode == 0, result.stdout + result.stderr
