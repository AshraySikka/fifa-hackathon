"""
Thin wrapper around the Anthropic API.

Ashray: this is the placeholder you asked for. It already works end-to-end
if you drop your key into backend/.env as ANTHROPIC_API_KEY -- if the key
is missing it returns a clearly-labeled mock response instead of crashing,
so the demo never dies on stage for a missing env var.
"""
from django.conf import settings

_MOCK_NOTICE = (
    "[MOCK RESPONSE -- set ANTHROPIC_API_KEY in backend/.env to get real "
    "Claude output] "
)


def call_claude(prompt: str, system: str | None = None, max_tokens: int = 500) -> str:
    """
    Send `prompt` to Claude and return the text response.
    Falls back to a mock string if no API key is configured, so the rest
    of the app keeps working during setup/demo prep.
    """
    if not settings.ANTHROPIC_API_KEY:
        return _MOCK_NOTICE + _fallback_text(prompt)

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        kwargs = {
            "model": "claude-sonnet-4-6",
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system:
            kwargs["system"] = system
        response = client.messages.create(**kwargs)
        parts = [block.text for block in response.content if getattr(block, "type", None) == "text"]
        return "\n".join(parts).strip() or _fallback_text(prompt)
    except Exception as exc:  # noqa: BLE001 -- demo-safe catch-all
        return f"[LLM ERROR: {exc}] " + _fallback_text(prompt)


def _fallback_text(prompt: str) -> str:
    return f"Here's a placeholder answer for: '{prompt[:120]}'"
