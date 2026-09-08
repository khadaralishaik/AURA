import os
from functools import lru_cache
from dotenv import load_dotenv
from app.prompts.system_prompt import SYSTEM_PROMPT
from app.services.memory import memory_context

load_dotenv()

@lru_cache(maxsize=1)
def get_model():
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        return None
    try:
        import google.generativeai as genai
    except ImportError:
        return None
    genai.configure(api_key=key)
    return genai.GenerativeModel(
        model_name=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        generation_config={"temperature": 0.7, "top_p": 0.95, "top_k": 40, "max_output_tokens": 4096},
    )


def ask_ai(message: str, history: list, extra_context: str = "") -> str:
    model = get_model()
    if model is None:
        if not os.getenv("GEMINI_API_KEY"):
            return "AURA is running, but the Gemini API key is not configured. Add GEMINI_API_KEY to backend/.env to enable AI responses."
        return "AURA cannot load the Gemini client in this environment. Install backend/requirements.txt and restart the API."

    conversation = "\n".join(
        f"{'User' if getattr(msg, 'sender', '') == 'user' else 'AURA'}: {getattr(msg, 'text', '')}"
        for msg in history[-30:]
    )
    prompt = f"""{SYSTEM_PROMPT}\n\nSaved Memory:\n{memory_context()}\n\nAdditional Context:\n{extra_context}\n\nConversation History:\n{conversation}\n\nCurrent User Message:\n{message}\n\nAURA:"""
    try:
        response = model.generate_content(prompt)
        text = getattr(response, "text", "")
        return text.strip() if text else "I couldn't generate a response."
    except Exception:
        return "AURA encountered an AI service error. Please check the AI service configuration and try again."
