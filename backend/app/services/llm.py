import os

import google.generativeai as genai
from dotenv import load_dotenv

from app.prompts.system_prompt import SYSTEM_PROMPT

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

if API_KEY:
    genai.configure(api_key=API_KEY)


def _build_prompt(message: str, history: list) -> str:
    conversation = ""
    for msg in history:
        role = "User" if msg.sender == "user" else "AURA"
        conversation += f"{role}: {msg.text}\n"

    return f"""
{SYSTEM_PROMPT}

Conversation History:

{conversation}

Current User Message:

{message}

AURA:
"""


def ask_ai(message: str, history: list) -> str:
    """Generate a response, returning a useful configuration message when Gemini is unavailable."""
    if not API_KEY:
        return "AURA is running, but Gemini is not configured yet. Set GEMINI_API_KEY in backend/.env to enable AI responses."

    prompt = _build_prompt(message, history)
    try:
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 4096,
            },
        )
        response = model.generate_content(prompt)
        if getattr(response, "text", None):
            return response.text
        return "I'm sorry, I couldn't generate a response."
    except Exception:
        return "AURA could not reach the AI service right now. Please check the Gemini configuration and try again."
