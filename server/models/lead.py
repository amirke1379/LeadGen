from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Lead:
    place_id: str
    name: str
    category: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    distance: Optional[float] = None
    google_url: Optional[str] = None
    status: str = "new"
    contacted_at: Optional[str] = None
    contact_method: Optional[str] = None
    found_at: Optional[str] = None
    id: Optional[int] = None
