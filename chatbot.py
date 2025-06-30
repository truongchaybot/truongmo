import openai
import json
import os
import datetime

# Xác định đường dẫn gốc dự án
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --- Load cấu hình ---
with open(os.path.join(BASE_DIR, "config", "config.json"), "r", encoding="utf-8") as f:
    config = json.load(f)

openai.api_key = config["api_key"]
bot_name = config["bot_name"]
model = config["model"]

# Đây là nơi sẽ viết thêm class hoặc hàm chatbot về sau
def chat_with_bot(message, history):
    # Gọi API của OpenAI
    response = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "system", "content": config["system_prompt"]},
            *history,
            {"role": "user", "content": message}
        ]
    )
    reply = response.choices[0].message["content"]
    return reply
