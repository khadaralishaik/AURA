import os

import google.generativeai as genai
from dotenv import load_dotenv

from app.prompts.system_prompt import SYSTEM_PROMPT

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured. Copy backend/.env.example to backend/.env and set the key."
    )

genai.configure(api_key=api_key)

generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 4096,
}

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config=generation_config,
)


def ask_ai(message: str, history: list) -> str:
    conversation = ""
    for msg in history:
        role = "User" if msg.sender == "user" else "AURA"
        conversation += f"{role}: {msg.text}\n"

    prompt = f"""
{SYSTEM_PROMPT}

Conversation History:

{conversation}

Current User Message:

{message}

AURA:
"""

    try:
        response = model.generate_content(prompt)
        if getattr(response, "text", None):
            return response.text
        return "I'm sorry, I couldn't generate a response."
    except Exception as exc:
        return f"Error: {exc}"
