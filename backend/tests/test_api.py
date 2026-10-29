import json
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"]


def test_health_endpoint_reports_ollama_unavailable():
    with patch("app.main.httpx.AsyncClient") as mock_client:
        mock_response = MagicMock()
        mock_response.get = AsyncMock(
            side_effect=httpx.ConnectError("Ollama unavailable")
        )

        mock_client.return_value.__aenter__ = AsyncMock(
            return_value=mock_response
        )
        mock_client.return_value.__aexit__ = AsyncMock(return_value=False)

        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["ollama_reachable"] is False


def test_analyze_rejects_empty_log():
    response = client.post(
        "/api/analyze",
        json={"log": "", "language": "Python"},
    )
    assert response.status_code == 422


def test_analyze_rejects_log_over_limit():
    response = client.post(
        "/api/analyze",
        json={"log": "x" * 20001, "language": "Python"},
    )
    assert response.status_code == 422


def test_analyze_rejects_missing_log():
    response = client.post(
        "/api/analyze",
        json={"language": "Python"},
    )
    assert response.status_code == 422


def test_analyze_returns_valid_report():
    fake_report = {
        "summary": "A missing module stopped execution.",
        "root_cause": "The requests package is unavailable.",
        "evidence": [
            "ModuleNotFoundError: No module named 'requests'"
        ],
        "fixes": [
            "Install requests in the active environment."
        ],
        "severity": "medium",
        "confidence": 90,
        "spooky_line": (
            "A phantom dependency haunts the execution path."
        ),
    }

    mock_response = MagicMock()
    mock_response.raise_for_status.return_value = None
    mock_response.json.return_value = {
        "message": {"content": json.dumps(fake_report)}
    }

    with patch("app.main.httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__ = AsyncMock(
            return_value=mock_client.return_value
        )
        mock_client.return_value.__aexit__ = AsyncMock(
            return_value=False
        )
        mock_client.return_value.post = AsyncMock(
            return_value=mock_response
        )

        response = client.post(
            "/api/analyze",
            json={
                "log": "ModuleNotFoundError: No module named 'requests'",
                "language": "Python",
            },
        )

    assert response.status_code == 200
    result = response.json()
    assert result["root_cause"] == fake_report["root_cause"]
    assert result["evidence"] == fake_report["evidence"]
    assert result["severity"] == "medium"
    assert result["confidence"] == 90
