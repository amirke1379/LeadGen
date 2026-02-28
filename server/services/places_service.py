import math
import requests
from config import GOOGLE_PLACES_API_KEY
from models.lead import Lead

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
NEARBY_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

# Known chain keywords — pre-filter to skip obvious franchises before making
# expensive Place Details API calls.
_CHAIN_KEYWORDS = [
    "mcdonald", "tim horton", "burger king", "wendy's", "wendy ", "kfc",
    "subway", "pizza hut", "domino's", "dominos", "starbucks", "dunkin",
    "chipotle", "taco bell", "popeyes", "chick-fil-a", "panera", "five guys",
    "little caesars", "dairy queen", "baskin-robbins", "baskin robbins",
    "a&w", "harvey's", "swiss chalet", "second cup", "tim horton",
    "home depot", "walmart", "wal-mart", "target", "costco", "ikea",
    "best buy", "bestbuy", "the bay", "hudson's bay", "winners", "marshalls",
    "dollarama", "dollar tree", "dollar general", "family dollar",
    "shoppers drug", "rexall", "cvs", "walgreens", "rite aid", "london drugs",
    "loblaws", "loblaw", "metro grocery", "sobeys", "safeway", "kroger",
    "whole foods", "trader joe", "food basics", "no frills", "freshco",
    "shell", "esso", "petro-canada", "petrocanada", "bp gas", "chevron",
    "sunoco", "circle k", "couche-tard", "couche tard",
    "holiday inn", "marriott", "hilton", "hyatt", "best western",
    "comfort inn", "super 8", "days inn", "hampton inn",
    "cineplex", "rona ", " rona", "canadian tire",
]


def _is_chain(name: str) -> bool:
    name_lower = name.lower()
    return any(kw in name_lower for kw in _CHAIN_KEYWORDS)


def geocode_location(address: str) -> tuple[float, float]:
    """Convert an address string to (lat, lng)."""
    try:
        resp = requests.get(
            GEOCODE_URL,
            params={"address": address, "key": GOOGLE_PLACES_API_KEY},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get("status") != "OK" or not data.get("results"):
            raise ValueError(f"Geocoding failed: {data.get('status')} — {address}")
        location = data["results"][0]["geometry"]["location"]
        return location["lat"], location["lng"]
    except requests.RequestException as e:
        raise RuntimeError(f"Geocoding request error: {e}") from e


def search_businesses(
    lat: float,
    lng: float,
    radius_m: int,
    min_rating: float,
    max_rating: float,
    category: str | None = None,
) -> list[dict]:
    """Return raw Places API results (all pages) for the given params."""
    results = []
    params = {
        "location": f"{lat},{lng}",
        "radius": radius_m,
        "key": GOOGLE_PLACES_API_KEY,
    }
    if category:
        params["type"] = category

    while True:
        try:
            resp = requests.get(NEARBY_SEARCH_URL, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
        except requests.RequestException as e:
            raise RuntimeError(f"Places API request error: {e}") from e

        if data.get("status") not in ("OK", "ZERO_RESULTS"):
            raise RuntimeError(f"Places API error: {data.get('status')} — {data.get('error_message', '')}")

        for place in data.get("results", []):
            rating = place.get("rating")
            if rating is None:
                continue
            if min_rating <= rating <= max_rating:
                results.append(place)

        next_token = data.get("next_page_token")
        if not next_token:
            break
        # Google requires a short delay before using the next_page_token
        import time
        time.sleep(2)
        params = {"pagetoken": next_token, "key": GOOGLE_PLACES_API_KEY}

    return results


def _fetch_website(place_id: str) -> str | None:
    """Fetch the website for a place via Place Details API (fields=website only)."""
    try:
        resp = requests.get(
            PLACE_DETAILS_URL,
            params={"place_id": place_id, "fields": "website", "key": GOOGLE_PLACES_API_KEY},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json().get("result", {}).get("website")
    except requests.RequestException:
        return None  # On error, assume no website so we don't silently drop the lead


def filter_no_website(results: list[dict]) -> list[dict]:
    """Return only independent small businesses with no website.

    Two-stage filter:
    1. Name-based chain detection (fast, no extra API calls).
    2. Place Details lookup to verify no website exists.
    """
    filtered = []
    for place in results:
        if _is_chain(place.get("name", "")):
            continue
        website = _fetch_website(place.get("place_id", ""))
        if not website:
            filtered.append(place)
    return filtered


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def map_to_lead(place: dict, user_lat: float, user_lng: float) -> Lead:
    """Map a raw Places API result to a Lead dataclass."""
    geometry = place.get("geometry", {}).get("location", {})
    place_lat = geometry.get("lat")
    place_lng = geometry.get("lng")

    distance = None
    if place_lat is not None and place_lng is not None:
        distance = round(_haversine_km(user_lat, user_lng, place_lat, place_lng), 2)

    place_id = place.get("place_id", "")
    google_url = f"https://www.google.com/maps/place/?q=place_id:{place_id}"

    types = place.get("types", [])
    category = types[0] if types else None

    return Lead(
        place_id=place_id,
        name=place.get("name", ""),
        category=category,
        rating=place.get("rating"),
        review_count=place.get("user_ratings_total"),
        phone=place.get("formatted_phone_number"),
        address=place.get("vicinity"),
        lat=place_lat,
        lng=place_lng,
        distance=distance,
        google_url=google_url,
    )
