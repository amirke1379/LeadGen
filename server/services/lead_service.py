from services.places_service import (
    geocode_location,
    search_businesses,
    filter_no_website,
    map_to_lead,
)
from repositories.lead_repository import insert_lead, get_all_leads


def run_scan(
    location: str,
    radius_km: float,
    min_rating: float,
    max_rating: float,
    category: str | None = None,
) -> dict:
    """
    Orchestrate: geocode → search → filter no-website → dedup → save.
    Returns { new_leads_found, leads }.
    """
    lat, lng = geocode_location(location)
    radius_m = int(radius_km * 1000)

    raw_results = search_businesses(lat, lng, radius_m, min_rating, max_rating, category)
    filtered = filter_no_website(raw_results)

    new_count = 0
    for place in filtered:
        lead = map_to_lead(place, lat, lng)
        if insert_lead(lead):
            new_count += 1

    all_leads = get_all_leads()
    return {
        "new_leads_found": new_count,
        "leads": [_lead_to_dict(l) for l in all_leads],
    }


def _lead_to_dict(lead) -> dict:
    return {
        "id": lead.id,
        "place_id": lead.place_id,
        "name": lead.name,
        "category": lead.category,
        "rating": lead.rating,
        "review_count": lead.review_count,
        "phone": lead.phone,
        "address": lead.address,
        "lat": lead.lat,
        "lng": lead.lng,
        "distance": lead.distance,
        "google_url": lead.google_url,
        "status": lead.status,
        "contacted_at": lead.contacted_at,
        "contact_method": lead.contact_method,
        "found_at": lead.found_at,
    }
