from database import get_connection
from models.lead import Lead


def _row_to_lead(row) -> Lead:
    return Lead(
        id=row["id"],
        place_id=row["place_id"],
        name=row["name"],
        category=row["category"],
        rating=row["rating"],
        review_count=row["review_count"],
        phone=row["phone"],
        address=row["address"],
        lat=row["lat"],
        lng=row["lng"],
        distance=row["distance"],
        google_url=row["google_url"],
        status=row["status"],
        contacted_at=row["contacted_at"],
        contact_method=row["contact_method"],
        found_at=row["found_at"],
    )


def insert_lead(lead: Lead) -> bool:
    """Insert a lead. Returns True if inserted, False if place_id already exists."""
    conn = get_connection()
    try:
        conn.execute(
            """
            INSERT OR IGNORE INTO leads
                (place_id, name, category, rating, review_count, phone, address,
                 lat, lng, distance, google_url, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                lead.place_id, lead.name, lead.category, lead.rating,
                lead.review_count, lead.phone, lead.address,
                lead.lat, lead.lng, lead.distance, lead.google_url, lead.status,
            ),
        )
        inserted = conn.execute("SELECT changes()").fetchone()[0]
        conn.commit()
        return inserted > 0
    finally:
        conn.close()


def get_all_leads() -> list[Lead]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM leads ORDER BY found_at DESC"
        ).fetchall()
        return [_row_to_lead(r) for r in rows]
    finally:
        conn.close()


def get_lead_by_id(lead_id: int) -> Lead | None:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM leads WHERE id = ?", (lead_id,)
        ).fetchone()
        return _row_to_lead(row) if row else None
    finally:
        conn.close()


def update_lead_status(lead_id: int, status: str, contact_method: str | None = None):
    conn = get_connection()
    try:
        if contact_method:
            conn.execute(
                """
                UPDATE leads
                SET status = ?, contact_method = ?, contacted_at = datetime('now')
                WHERE id = ?
                """,
                (status, contact_method, lead_id),
            )
        else:
            conn.execute(
                "UPDATE leads SET status = ? WHERE id = ?",
                (status, lead_id),
            )
        conn.commit()
    finally:
        conn.close()
