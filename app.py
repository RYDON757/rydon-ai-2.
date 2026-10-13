
from flask import Flask, render_template, request, jsonify, session
import os
import datetime
import ast
import operator
import json
import urllib.request
import urllib.error

app = Flask(__name__)
app.secret_key = os.environ.get(
    "RYDON_SECRET_KEY", "development-only-change-me"
)
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax"
)

if (
    os.environ.get("RENDER")
    or os.environ.get("RAILWAY_ENVIRONMENT")
    or os.environ.get("PRODUCTION") == "1"
):
    app.config["SESSION_COOKIE_SECURE"] = True

# Ollama settings
MODEL = os.environ.get("RYDON_MODEL", "qwen2.5:3b")
OLLAMA_URL = os.environ.get(
    "OLLAMA_URL", "http://localhost:11434/api/chat"
)

# Hosted AI settings: supports both old and new key names
API_KEY = (
    os.environ.get("GROQ_API_KEY")
    or os.environ.get("RYDON_API_KEY", "")
).strip()

API_BASE = os.environ.get(
    "RYDON_API_BASE", "https://api.groq.com/openai/v1"
).rstrip("/")

HOSTED_MODEL = os.environ.get(
    "GROQ_MODEL",
    os.environ.get("RYDON_HOSTED_MODEL", "openai/gpt-oss-120b")
)


OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def calculate(expr):
    if len(expr) > 120:
        raise ValueError("Expression is too long.")

    tree = ast.parse(expr, mode="eval")

    def visit(node):
        if isinstance(node, ast.Expression):
            return visit(node.body)

        if (
            isinstance(node, ast.Constant)
            and type(node.value) in (int, float)
        ):
            return node.value

        if isinstance(node, ast.BinOp) and type(node.op) in OPS:
            left = visit(node.left)
            right = visit(node.right)

            if isinstance(node.op, ast.Pow) and abs(right) > 8:
                raise ValueError("That exponent is too large.")

            return OPS[type(node.op)](left, right)

        if isinstance(node, ast.UnaryOp) and type(node.op) in OPS:
            return OPS[type(node.op)](visit(node.operand))

        raise ValueError("Please use numbers and basic operators only.")

    result = visit(tree)

    if isinstance(result, (int, float)) and abs(result) > 1e100:
        raise ValueError("Result is too large.")

    return result


def get_memory():
    return {"user_name": session.get("user_name", "")}


def local_reply(message, memory):
    m = message.lower().strip()
    name = memory.get("user_name", "")

    if m.startswith("my name is "):
        name = message[11:].strip()[:80]
        if name:
            session["user_name"] = name
            return (
                f"Nice to meet you, {name}! "
                "I'll remember your name in this browser."
            )

    if m in {"hi", "hello", "hey", "hey rydon"}:
        return (
            f"Hey{' ' + name if name else ''}! 😎 "
            "I'm RYDON AI. What's on your mind?"
        )

    if "what is my name" in m or "what's my name" in m:
        return (
            f"Your name is {name}!"
            if name else
            "You haven't told me your name yet. "
            "Say 'my name is ...' and I'll remember it."
        )

    if "who are you" in m or "your name" in m:
        return "I'm RYDON AI 2.0, your personal AI assistant."

    if "how are you" in m:
        return "I'm running smoothly! Thanks for asking. What can I help you with?"

    if "good morning" in m:
        return "Good morning! Welcome back to RYDON AI."

    if "good afternoon" in m:
        return "Good afternoon! Welcome back to RYDON AI."

    if "good evening" in m:
        return "Good evening! Welcome back to RYDON AI."

    if "date" in m:
        return (
            "Today's date is "
            + datetime.date.today().strftime("%A, %d %B %Y")
            + "."
        )

    if "time" in m:
        return (
            "The server time is "
            + datetime.datetime.now().strftime("%H:%M:%S")
            + "."
        )

    if "joke" in m:
        return "Why do programmers prefer dark mode? Because light attracts bugs! 😄"

    if "thank you" in m or m == "thanks":
        return "You're welcome, bro! I'm always ready to help."

    if "what can you do" in m or m == "help":
        return (
            "I can chat with you using an AI model, remember your name "
            "in this browser, tell the date and time, calculate maths, "
            "and use browser voice features."
        )

    if m.startswith("calculate "):
        try:
            return "The answer is " + str(calculate(message[10:].strip()))
        except ZeroDivisionError:
            return "You cannot divide by zero."
        except Exception:
            return (
                "I could not calculate that. "
                "Try something like: calculate 25 * 4"
            )

    return None

def ask_hosted_model(message, history, memory):
    if not API_KEY:
        app.logger.error("Hosted AI unavailable: API key is missing.")
        return (
            "Configuration error: set GROQ_API_KEY in Render "
            "Environment Variables."
        )

    messages = [{
        "role": "system",
        "content": (
            "You are RYDON AI 2.0, a friendly, helpful personal assistant. "
            "Be clear and practical. The user may prefer casual English "
            "or Swahili/Sheng; adapt naturally. Known user name: "
            + (memory.get("user_name") or "not provided") + ". "
            "Do not claim to remember details that are not present "
            "in this conversation or saved memory."
        )
    }]

    if isinstance(history, list):
        for item in history[-12:]:
            if (
                isinstance(item, dict)
                and item.get("role") in ("user", "assistant")
                and isinstance(item.get("content"), str)
            ):
                messages.append({
                    "role": item["role"],
                    "content": item["content"][:4000]
                })

    messages.append({
        "role": "user",
        "content": message[:4000]
    })

    payload = {
        "model": HOSTED_MODEL,
        "messages": messages,
        "temperature": 0.7
    }

    req = urllib.request.Request(
        API_BASE + "/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": "Bearer " + API_KEY,
            "Content-Type": "application/json",
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/131.0.0.0 Safari/537.36"
            )
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            result = json.loads(response.read().decode("utf-8"))
            app.logger.info(
                "Hosted AI HTTP request succeeded; configured_model=%s",
                HOSTED_MODEL
            )

        choices = result.get("choices", [])
        if choices:
            content = choices[0].get("message", {}).get("content")
            if isinstance(content, str) and content.strip():
                app.logger.info(
                    "Hosted AI returned a completion; configured_model=%s",
                    HOSTED_MODEL
                )
                return content

        app.logger.warning(
            "Hosted AI returned no usable completion; configured_model=%s",
            HOSTED_MODEL
        )
        return "The AI provider returned an empty response. Please try again."

    except urllib.error.HTTPError as error:
        details = error.read().decode("utf-8", errors="replace")[:1000]
        app.logger.error(
            "AI provider HTTP %s: %s", error.code, details
        )
        return (
            f"AI provider returned HTTP {error.code}. "
            "Check your API key, model access, and Render logs."
        )

    except Exception:
        app.logger.exception("Hosted AI request failed")
        return "RYDON AI couldn't connect right now. Please try again."
def ask_ollama(message, history, memory):
    messages = [{
        "role": "system",
        "content": (
            "You are RYDON AI 2.0, a friendly, helpful personal assistant. "
            "Be clear and practical. Adapt naturally to English or "
            "Swahili/Sheng. Known user name: "
            + (memory.get("user_name") or "not provided") + ". "
            "Do not claim to remember unsaved details."
        )
    }]

    if isinstance(history, list):
        for item in history[-12:]:
            if (
                isinstance(item, dict)
                and item.get("role") in ("user", "assistant")
                and isinstance(item.get("content"), str)
            ):
                messages.append({
                    "role": item["role"],
                    "content": item["content"][:4000]
                })

    messages.append({"role": "user", "content": message[:4000]})

    payload = {
        "model": MODEL,
        "messages": messages,
        "stream": False
    }

    req = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=120) as response:
        data = json.loads(response.read().decode("utf-8"))

    return (
        data.get("message", {}).get("content", "").strip()
        or "I did not receive a response. Please try again."
    )


@app.get("/")
def index():
    return render_template(
        "index.html",
        user_name=session.get("user_name", "")
    )


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.get("/api/status")
def status():
    return jsonify({
        "model": HOSTED_MODEL if API_KEY else MODEL,
        "provider": "hosted" if API_KEY else "ollama",
        "memory_name": session.get("user_name", ""),
        "voice_supported_hint": True
    })


@app.post("/api/chat")
def chat():
    body = request.get_json(silent=True) or {}
    message = str(body.get("message", "")).strip()
    history = body.get("history", [])

    if not message:
        return jsonify({"reply": "Please type a message first."}), 400

    if len(message) > 4000:
        return jsonify({
            "reply": "Please keep each message under 4,000 characters."
        }), 400

    if not isinstance(history, list):
        history = []

    memory = get_memory()
    quick = local_reply(message, memory)

    if quick is not None:
        return jsonify({"reply": quick, "source": "local"})

    try:
        if API_KEY:
            reply = ask_hosted_model(message, history, memory)
            app.logger.info("RYDON DIAGNOSTIC: hosted model call returned to chat route")
            source = "hosted"
        else:
            reply = ask_ollama(message, history, memory)
            source = "ollama"

        return jsonify({"reply": reply, "source": source})

    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:1000]
        app.logger.warning(
            "AI provider HTTP %s: %s", exc.code, detail
        )
        return jsonify({
            "reply": (
                f"AI provider returned HTTP {exc.code}. "
                "Check Render logs for details."
            )
        }), 502

    except Exception:
        app.logger.exception("Chat endpoint failed")
        return jsonify({
            "reply": "Something went wrong. Please try again."
        }), 500


@app.post("/api/memory")
@app.post("/api/update-memory")
def update_memory():
    body = request.get_json(silent=True) or {}
    name = str(body.get("user_name", "")).strip()[:80]

    if name:
        session["user_name"] = name
    else:
        session.pop("user_name", None)

    session.modified = True

    return jsonify({
        "ok": True,
        "user_name": session.get("user_name", "")
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "5000")),
        debug=False
    )
