import json
import logging
import os
from urllib.parse import quote

import requests
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)

BACKEND_URL = os.getenv("backend_url", "http://127.0.0.1:3030").rstrip("/")
SENTIMENT_URL = os.getenv(
    "sentiment_analyzer_url", "http://127.0.0.1:5050"
).rstrip("/")


def read_json(request):
    try:
        return json.loads(request.body or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


def backend_get(path):
    try:
        response = requests.get(f"{BACKEND_URL}{path}", timeout=15)
        return JsonResponse(
            response.json(),
            status=response.status_code,
            safe=not isinstance(response.json(), list),
        )
    except (requests.RequestException, ValueError) as error:
        logger.exception("Backend GET failed: %s", error)
        return JsonResponse(
            {"error": "Backend service unavailable"}, status=502
        )


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    data = read_json(request)
    if not isinstance(data, dict):
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    username = data.get("userName") or data.get("username")
    password = data.get("password")

    if not username or not password:
        return JsonResponse(
            {"error": "Username and password are required"}, status=400
        )

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    login(request, user)
    return JsonResponse({
        "userName": user.username,
        "status": "Authenticated",
    })


@csrf_exempt
def logout_request(request):
    if request.method not in ("POST", "GET"):
        return JsonResponse({"error": "Method not allowed"}, status=405)

    logout(request)
    return JsonResponse({"status": "Logged out"})


@csrf_exempt
def registration(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    data = read_json(request)
    if not isinstance(data, dict):
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    username = (data.get("userName") or data.get("username") or "").strip()
    first_name = (data.get("firstName") or "").strip()
    last_name = (data.get("lastName") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not all([username, first_name, last_name, email, password]):
        return JsonResponse(
            {"error": "All five fields are required"}, status=400
        )

    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=409)

    if User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Email already exists"}, status=409)

    user = User.objects.create_user(
        username=username,
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=password,
    )

    return JsonResponse(
        {"status": "Registered", "userName": user.username},
        status=201,
    )


@csrf_exempt
def getalldealers(request):
    return backend_get("/fetchDealers")


@csrf_exempt
def get_dealerships(request):
    # Alias used by the frontend.
    return backend_get("/fetchDealers")


@csrf_exempt
def getdealerbyid(request, dealer_id):
    return backend_get(f"/fetchDealer/{dealer_id}")


@csrf_exempt
def getdealersbystate(request, state):
    return backend_get(f"/fetchDealers/{quote(state)}")


@csrf_exempt
def get_dealer_reviews(request, dealer_id):
    return backend_get(f"/fetchReviews/dealer/{dealer_id}")


@csrf_exempt
def getallcarmakes(request):
    return backend_get("/fetchCarMakes")


@csrf_exempt
def analyze_review(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    data = read_json(request)
    if not isinstance(data, dict) or not data.get("review"):
        return JsonResponse({"error": "Review text is required"}, status=400)

    try:
        response = requests.get(
            f"{SENTIMENT_URL}/analyze/{quote(str(data['review']), safe='')}",
            timeout=15,
        )
        response.raise_for_status()
        return JsonResponse(response.json())
    except (requests.RequestException, ValueError) as error:
        logger.exception("Sentiment service failed: %s", error)
        return JsonResponse(
            {"error": "Sentiment service unavailable"}, status=502
        )


@csrf_exempt
def add_review(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    data = read_json(request)
    if not isinstance(data, dict):
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    required = ("name", "dealership", "review")
    if any(not data.get(field) for field in required):
        return JsonResponse(
            {"error": "Name, dealership and review are required"},
            status=400,
        )

    try:
        response = requests.post(
            f"{BACKEND_URL}/insert_review",
            json=data,
            timeout=15,
        )
        try:
            payload = response.json()
        except ValueError:
            payload = {"error": "Invalid response from review service"}

        return JsonResponse(
            payload,
            status=response.status_code,
            safe=not isinstance(payload, list),
        )
    except requests.RequestException as error:
        logger.exception("Review submission failed: %s", error)
        return JsonResponse(
            {"error": "Review service unavailable"}, status=502
        )
