from openai import OpenAI
from config import OPENAI_API_KEY
from models.lead import Lead


def generate_message(lead: Lead, method: str) -> dict:
    """Generate an AI outreach message for a lead via OpenAI API.

    Args:
        lead: The Lead dataclass instance.
        method: "sms" or "email".

    Returns:
        For SMS: {"body": "..."}
        For email: {"subject": "...", "body": "..."}
    """
    client = OpenAI(api_key=OPENAI_API_KEY)

    rating_text = f"{lead.rating} stars ({lead.review_count} reviews)" if lead.rating else "unrated"
    category_text = lead.category or "business"

    if method == "sms":
        prompt = (
            f"Write a short, friendly SMS outreach message (strictly under 160 characters) "
            f"for a web design freelancer reaching out to a small business that has no website.\n\n"
            f"Business details:\n"
            f"- Name: {lead.name}\n"
            f"- Type: {category_text}\n"
            f"- Rating: {rating_text}\n"
            f"- Location: {lead.address or 'local area'}\n\n"
            f"Requirements:\n"
            f"- Address the business by name\n"
            f"- Mention their category or type of business\n"
            f"- Reference their rating positively\n"
            f"- Offer to build them a website\n"
            f"- Include a clear CTA to reply\n"
            f"- Keep it under 160 characters total\n"
            f"- Sound human and conversational, not spammy\n\n"
            f"Return only the SMS message text, nothing else."
        )
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        body = response.choices[0].message.content.strip()
        return {"body": body}

    elif method == "email":
        prompt = (
            f"Write a short, friendly cold email outreach from a web design freelancer "
            f"to a small business that has no website.\n\n"
            f"Business details:\n"
            f"- Name: {lead.name}\n"
            f"- Type: {category_text}\n"
            f"- Rating: {rating_text}\n"
            f"- Location: {lead.address or 'local area'}\n\n"
            f"Requirements:\n"
            f"- Address the business by name\n"
            f"- Mention their category or type of business\n"
            f"- Reference their rating positively\n"
            f"- Offer to build them a website\n"
            f"- Include a clear CTA to reply\n"
            f"- Subject line should be short and curiosity-driven (not clickbait)\n"
            f"- Body should be under 150 words, warm and human\n\n"
            f"Return your response in exactly this format:\n"
            f"SUBJECT: <subject line here>\n"
            f"BODY:\n<email body here>"
        )
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.choices[0].message.content.strip()
        subject = ""
        body = ""
        if "SUBJECT:" in text and "BODY:" in text:
            lines = text.splitlines()
            body_lines = []
            in_body = False
            for line in lines:
                if line.startswith("SUBJECT:"):
                    subject = line.replace("SUBJECT:", "").strip()
                elif line.startswith("BODY:"):
                    in_body = True
                elif in_body:
                    body_lines.append(line)
            body = "\n".join(body_lines).strip()
        else:
            body = text
        return {"subject": subject, "body": body}

    else:
        raise ValueError(f"Invalid method: {method}. Must be 'sms' or 'email'.")
