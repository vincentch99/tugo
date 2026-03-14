"""
AI Service — Claude Opus integration for TUGO.AI
Handles vessel matchmaking, route optimization, and dynamic pricing.
"""
import json
import anthropic
from core.config import get_settings

settings = get_settings()


def _get_client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


async def match_vessels(shipment_data: dict, vessels_data: list[dict]) -> list[dict]:
    """
    Use Claude Opus to rank and match vessels to a shipment.
    Returns a list of match results sorted by match_score descending.
    """
    client = _get_client()

    system_prompt = """You are TUGO.AI's maritime logistics matching engine for Indonesian waters.
Your task is to analyze a shipment request and available vessels, then provide ranked matches.

You understand:
- Indonesian archipelago geography and inter-island shipping challenges
- Tug and barge operations, capacity requirements, and vessel specifications
- Commodity-specific requirements (coal, palm oil, cement, containers, etc.)
- Indonesian maritime regulations and port capacities

Always respond with valid JSON only. No markdown, no explanation outside the JSON."""

    user_prompt = f"""Match the following shipment to the best available vessels.

SHIPMENT:
{json.dumps(shipment_data, indent=2, default=str)}

AVAILABLE VESSELS:
{json.dumps(vessels_data, indent=2, default=str)}

Return a JSON array of matches. For each vessel, provide:
{{
  "vessel_id": "<uuid>",
  "match_score": <0-100 float>,
  "reasoning": "<2-3 sentences explaining the match quality>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "concerns": ["<concern 1>"] or [],
  "estimated_price_usd": <float>,
  "price_breakdown": {{
    "base_freight": <float>,
    "fuel_surcharge": <float>,
    "port_fees": <float>,
    "total": <float>
  }}
}}

Sort by match_score descending. Return top 5 matches maximum.
Only include vessels that can handle this shipment (capacity, availability, vessel type).
Return ONLY the JSON array."""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2000,
        messages=[{"role": "user", "content": user_prompt}],
        system=system_prompt,
    )

    raw = message.content[0].text.strip()
    # Strip markdown code blocks if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)


async def optimize_route(
    origin: dict,
    destination: dict,
    vessel: dict,
    cargo_weight_tons: float,
    commodity_type: str,
) -> dict:
    """
    Use Claude Opus to optimize a sea route between two Indonesian ports.
    """
    client = _get_client()

    system_prompt = """You are an expert Indonesian maritime route planner.
You have deep knowledge of Indonesian sea lanes, straits, and inter-island navigation.
Key knowledge:
- Major straits: Selat Malaka, Selat Sunda, Selat Lombok, Selat Makassar, Selat Karimata, Selat Bangka
- Seasonal monsoons: Monsoon Barat (Nov-Mar, west wind), Monsoon Timur (May-Sep, east wind)
- Laut Java, Laut Banda, Laut Flores, Laut Sulawesi, Laut Maluku
- Barge and tug speed typically 5-8 knots

Respond with valid JSON only."""

    user_prompt = f"""Plan the optimal sea route for this shipment:

ORIGIN PORT: {json.dumps(origin, default=str)}
DESTINATION PORT: {json.dumps(destination, default=str)}
VESSEL: {json.dumps(vessel, default=str)}
CARGO: {cargo_weight_tons} tons of {commodity_type}

Return a JSON object:
{{
  "waypoints": [
    {{"name": "<port or strait name>", "latitude": <float>, "longitude": <float>, "type": "port|strait|waypoint"}}
  ],
  "distance_nm": <estimated nautical miles>,
  "duration_days": <estimated transit days at 6 knots average>,
  "sea_lanes": ["<lane description>"],
  "risk_notes": ["<Indonesian-specific risk or advisory>"],
  "best_season": "<recommended season to sail this route>",
  "draft_clearance": "<note about depth/draft requirements>"
}}

Return ONLY the JSON."""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1500,
        messages=[{"role": "user", "content": user_prompt}],
        system=system_prompt,
    )

    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)


async def calculate_price(
    route_data: dict,
    cargo_weight_tons: float,
    commodity_type: str,
    vessel_daily_rate: float,
    special_requirements: str | None = None,
) -> dict:
    """
    Use Claude Opus to generate dynamic pricing for a shipment.
    """
    client = _get_client()

    system_prompt = """You are an Indonesian maritime freight pricing expert.
You understand:
- Indonesian coastal and inter-island freight market rates
- Commodity-specific handling costs (bulk coal vs palm oil vs cement vs containers)
- Fuel costs for tugs (approximately $500-800/day for fuel)
- Indonesian port fees structure
- Seasonal demand fluctuations

Respond with valid JSON only."""

    duration_days = route_data.get("duration_days", 3)
    distance_nm = route_data.get("distance_nm", 500)

    user_prompt = f"""Calculate freight pricing for this Indonesian maritime shipment:

ROUTE DISTANCE: {distance_nm} nautical miles
TRANSIT DURATION: {duration_days} days
CARGO: {cargo_weight_tons} tons of {commodity_type}
VESSEL DAILY RATE: USD {vessel_daily_rate}/day
SPECIAL REQUIREMENTS: {special_requirements or "None"}

Return a JSON object:
{{
  "base_freight_usd": <vessel_daily_rate * duration_days>,
  "fuel_surcharge_usd": <estimated fuel cost>,
  "port_fees_usd": <origin + destination port fees>,
  "cargo_handling_usd": <loading/unloading based on commodity>,
  "special_requirements_surcharge_usd": <0 if none>,
  "total_usd": <sum of all>,
  "price_per_ton_usd": <total / cargo_weight_tons>,
  "confidence": "high|medium|low",
  "market_notes": "<1-2 sentences on current market conditions for this route/commodity in Indonesia>"
}}

Return ONLY the JSON."""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=800,
        messages=[{"role": "user", "content": user_prompt}],
        system=system_prompt,
    )

    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)
