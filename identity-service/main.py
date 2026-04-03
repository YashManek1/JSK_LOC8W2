from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import easyocr
from deepface import DeepFace
import cv2
import numpy as np
import re

app = FastAPI(title="Identity Verification Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

reader_instance = None

def get_reader():
    global reader_instance
    if reader_instance is None:
        print("Lazy loading EasyOCR model into memory...")
        reader_instance = easyocr.Reader(['en'], gpu=False) 
    return reader_instance

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.post("/ocr/aadhaar")
async def ocr_aadhaar(file: UploadFile = File(...)):
    """Extracts 12-digit Aadhaar number from image"""
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    local_reader = get_reader()
    results = local_reader.readtext(img)
    
    aadhaar_number = None
    extracted_text = []

    for (bbox, text, prob) in results:
        extracted_text.append(text)
        # Look for 12 digit number
        clean_text = re.sub(r'\D', '', text)
        if len(clean_text) == 12:
            aadhaar_number = clean_text

    return {
        "aadhaarNumber": aadhaar_number,
        "rawText": extracted_text
    }

@app.post("/verify/face")
async def verify_face(selfie: UploadFile = File(...), document: UploadFile = File(...)):
    """Verifies if the face in selfie matches the face in the document"""
    selfie_contents = await selfie.read()
    doc_contents = await document.read()
    
    selfie_nparr = np.frombuffer(selfie_contents, np.uint8)
    doc_nparr = np.frombuffer(doc_contents, np.uint8)
    
    selfie_img = cv2.imdecode(selfie_nparr, cv2.IMREAD_COLOR)
    doc_img = cv2.imdecode(doc_nparr, cv2.IMREAD_COLOR)
    
    if selfie_img is None or doc_img is None:
        raise HTTPException(status_code=400, detail="Invalid image files")

    try:
        # DeepFace verify using Numpy arrays (BGR from cv2)
        # enforce_detection=True ensures faces are found, else throws error
        result = DeepFace.verify(
            img1_path=selfie_img,
            img2_path=doc_img,
            model_name="ArcFace",
            detector_backend="opencv", 
            enforce_detection=True
        )
        
        # Extract the 512-dimensional face embedding from the selfie for future check-ins
        embedding_objs = DeepFace.represent(
            img_path=selfie_img,
            model_name="ArcFace",
            detector_backend="mtcnn",
            enforce_detection=True
        )
        face_embedding = embedding_objs[0]["embedding"] if len(embedding_objs) > 0 else []

        return {
            "isMatch": bool(result["verified"]),
            "distance": float(result["distance"]),
            "model": result["model"],
            "faceEmbedding": face_embedding
        }

    except ValueError as ve:
        # Could not find face in one of the images
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face verification failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
