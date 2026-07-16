"""
Elo-rating-based match prediction.

WHAT THIS IS: a transparent, explainable statistical model -- the same
family of method FiveThirtyEight's SPI and clubelo.com use. It is NOT a
black box, and it will NOT be "almost 100% accurate." Real football
outcome models plateau around 50-55% accuracy on straight win/draw/loss
because the sport has genuine variance (a deflected shot, a red card, a
missed penalty). Treat the output as a calibrated probability, not a
prophecy -- that's the honest pitch for a hackathon demo too: "here's a
real statistical method reasoning over real data," not "here's magic."

WHERE THE NUMBERS COME FROM: FIFA/Coca-Cola Men's World Ranking points,
snapshot dated June 11 2026 (next official update: July 20 2026). Ranking
points ARE Elo-like already (FIFA switched to an Elo-based formula in
2018), so we use them directly as the base rating rather than building a
second parallel rating system from scratch.

TODO (Ashray): only ~20 of the 48 World Cup teams below have verified
June 2026 points -- the rest are estimated from their last known ranking
tier and flagged "# EST". Pull the full 48-team table from
https://inside.fifa.com/fifa-world-ranking/men before you rely on this
for anything beyond a demo, and re-check it after the July 20 update.
"""

# FIFA points as of the 11 June 2026 release. Verified against FIFA/Wikipedia.
ELO_RATINGS = {
    "France": 1877,
    "Spain": 1876,
    "Argentina": 1875,
    "England": 1826,
    "Portugal": 1764,
    "Brazil": 1761,
    "Netherlands": 1758,
    "Morocco": 1756,
    "Belgium": 1735,
    "Germany": 1730,
    "Croatia": 1717,
    "Italy": 1700,
    "Colombia": 1693,
    "Senegal": 1689,
    "Mexico": 1681,
    "USA": 1673,
    "Uruguay": 1673,
    "Japan": 1660,
    "Switzerland": 1649,
    "Denmark": 1621,

    # --- estimated, not individually verified for June 2026 -- update these ---
    "Canada": 1610,        # EST -- host nation, ranking has been climbing
    "Ecuador": 1600,       # EST
    "Paraguay": 1560,      # EST
    "Poland": 1580,        # EST
    "Ukraine": 1570,       # EST
    "Norway": 1590,        # EST
    "Sweden": 1550,        # EST
    "Turkey": 1560,        # EST
    "Scotland": 1600,      # EST
    "Wales": 1540,         # EST
    "Austria": 1610,       # EST
    "South Korea": 1570,   # EST
    "Iran": 1550,          # EST
    "Saudi Arabia": 1500,  # EST
    "Australia": 1480,     # EST
    "Qatar": 1440,         # EST
    "Uzbekistan": 1450,    # EST
    "Jordan": 1420,        # EST
    "Nigeria": 1500,       # EST
    "Egypt": 1520,         # EST
    "Ghana": 1470,         # EST
    "Ivory Coast": 1560,   # EST
    "Tunisia": 1490,       # EST
    "Algeria": 1520,       # EST
    "Cameroon": 1500,      # EST
    "South Africa": 1420,  # EST
    "New Zealand": 1350,   # EST
    "Panama": 1450,        # EST
}

DEFAULT_RATING = 1500  # fallback for any team not in the table above

# Standard estimate for international-football home advantage, in Elo points.
# (Club football runs closer to 100; national teams playing a true "home"
# tournament match tend to see a similar-sized bump.)
HOME_ADVANTAGE = 100
HOST_NATIONS = {"canada", "mexico", "usa"}

# Historical base rate of draws in international football (~24-27%).
# Draws are most likely when teams are evenly matched and become less
# likely as the rating gap widens -- modeled below, not a flat constant.
BASE_DRAW_RATE = 0.26


def get_rating(team: str) -> float:
    return ELO_RATINGS.get(team, DEFAULT_RATING)


def elo_predict(team_a: str, team_b: str, venue_country: str = "Canada") -> dict:
    """
    Returns calibrated win/draw/loss percentages for team_a vs team_b.

    Method:
    1. Rating gap = Elo(A) - Elo(B), plus a home-advantage bump if either
       team is a 2026 host nation playing in its own country.
    2. Convert the gap to a standard Elo expected-score value in (0, 1)
       via the logistic curve -- this is the same curve chess Elo uses.
    3. Split that expected score into three buckets (win/draw/loss) by
       scaling the draw probability down as the gap widens -- evenly
       matched teams draw more often; blowout-gap teams almost never do.
    """
    rating_a = get_rating(team_a)
    rating_b = get_rating(team_b)

    gap = rating_a - rating_b
    if team_a.lower() in HOST_NATIONS and venue_country.lower() == team_a.lower():
        gap += HOME_ADVANTAGE
    elif team_b.lower() in HOST_NATIONS and venue_country.lower() == team_b.lower():
        gap -= HOME_ADVANTAGE

    expected_score = 1 / (1 + 10 ** (-gap / 400))  # in (0, 1); 0.5 = evenly matched

    # Draw likelihood shrinks the further expected_score sits from 0.5.
    closeness = 1 - abs(2 * expected_score - 1)  # 1.0 when dead even, 0.0 at extremes
    p_draw = BASE_DRAW_RATE * closeness

    remaining = 1 - p_draw
    p_a_win = remaining * expected_score
    p_b_win = remaining * (1 - expected_score)

    return {
        "team_a_win_pct": round(p_a_win * 100, 1),
        "draw_pct": round(p_draw * 100, 1),
        "team_b_win_pct": round(p_b_win * 100, 1),
        "team_a_rating": rating_a,
        "team_b_rating": rating_b,
        "rating_gap": round(gap, 1),
    }