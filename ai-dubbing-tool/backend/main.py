from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import whisper, os, uuid, shutil
from googletrans import Translator
import stripe

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = whisper.load_model("base")
translator = Translator()
stripe.api_key = os.getenv("STRIPE_API_KEY")

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.post("/upload/")
async def upload_video(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.mp4")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    result = model.transcribe(file_path)
    transcript = result["text"]
    with open(os.path.join(UPLOAD_DIR, f"{file_id}.txt"), "w") as f:
        f.write(transcript)
    return {"file_id": file_id, "transcript": transcript}

@app.post("/translate/")
async def translate_text(file_id: str = Form(...), target_lang: str = Form(...)):
    txt_path = os.path.join(UPLOAD_DIR, f"{file_id}.txt")
    if not os.path.exists(txt_path):
        return {"error": "Transcript not found"}
    with open(txt_path, "r") as f:
        transcript = f.read()
    translated = translator.translate(transcript, dest=target_lang).text
    return {"translated": translated}

@app.post("/create-checkout-session/")
def create_checkout():
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {"name": "1 Dub Credit"},
                "unit_amount": 500,
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url="https://your-frontend.vercel.app/success",
        cancel_url="https://your-frontend.vercel.app/cancel",
    )
    return {"url": session.url}
