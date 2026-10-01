import os
import fitz  # PyMuPDF
import PyPDF2
from config import Config
from services.qr_service import QRService

class PDFService:
    @staticmethod
    def process_pdf(file_path: str, evidence_id: str) -> dict:
        pdf_img_dir = os.path.join(Config.UPLOAD_FOLDER, f"pdf_{evidence_id}")
        os.makedirs(pdf_img_dir, exist_ok=True)

        meta_result = {
            "page_count": 0,
            "title": None,
            "author": None,
            "creator": None,
            "producer": None,
            "creation_date": None,
            "mod_date": None,
            "has_digital_signature": False,
            "signature_status": "Digital Signature: Not Found",
            "extracted_images": [],
            "text_sample": "",
            "full_text": "",
            "qr_check": {
                "qr_found": False,
                "qr_count": 0,
                "decoded_content": "",
                "consistency_status": "NOT_APPLICABLE",
                "consistency_message": "No QR code present.",
                "diff_details": None
            }
        }

        full_extracted_text = ""

        # 1. PyMuPDF analysis
        try:
            doc = fitz.open(file_path)
            meta_result["page_count"] = doc.page_count
            pdf_meta = doc.metadata or {}

            meta_result["title"] = pdf_meta.get("title")
            meta_result["author"] = pdf_meta.get("author")
            meta_result["creator"] = pdf_meta.get("creator")
            meta_result["producer"] = pdf_meta.get("producer")
            meta_result["creation_date"] = pdf_meta.get("creationDate")
            meta_result["mod_date"] = pdf_meta.get("modDate")

            # Extract full text & sample
            pages_text = []
            for page_idx in range(doc.page_count):
                p_text = doc[page_idx].get_text("text")
                if p_text:
                    pages_text.append(p_text)

            full_extracted_text = "\n".join(pages_text)
            meta_result["full_text"] = full_extracted_text
            meta_result["text_sample"] = full_extracted_text[:400] + ("..." if len(full_extracted_text) > 400 else "")

            # Extract embedded images
            image_count = 0
            for page_num in range(min(doc.page_count, 10)):
                page = doc[page_num]
                image_list = page.get_images(full=True)
                for img_idx, img in enumerate(image_list):
                    xref = img[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]

                    image_count += 1
                    img_filename = f"extracted_p{page_num+1}_img{image_count}.{image_ext}"
                    img_save_path = os.path.join(pdf_img_dir, img_filename)

                    with open(img_save_path, "wb") as f_img:
                        f_img.write(image_bytes)

                    meta_result["extracted_images"].append({
                        "filename": img_filename,
                        "url": f"/uploads/pdf_{evidence_id}/{img_filename}",
                        "save_path": img_save_path,
                        "page": page_num + 1,
                        "format": image_ext
                    })

                    if image_count >= 5:
                        break
                if image_count >= 5:
                    break

            doc.close()
        except Exception as e:
            meta_result["error"] = f"PyMuPDF error: {str(e)}"

        # 2. Digital Signature check via PyPDF2
        try:
            with open(file_path, "rb") as f_pdf:
                reader = PyPDF2.PdfReader(f_pdf)
                has_sig = False
                if "/Sig" in str(reader.trailer) or any("/ByteRange" in str(page) or "/Sig" in str(page) for page in reader.pages):
                    has_sig = True

                meta_result["has_digital_signature"] = has_sig
                meta_result["signature_status"] = "Digital Signature: Present" if has_sig else "Digital Signature: Not Found"
        except Exception:
            pass

        # 3. QR Code Scan & Consistency Verification
        try:
            qr_res = QRService.process_file_for_qr(file_path, full_extracted_text)
            meta_result["qr_check"] = qr_res
        except Exception:
            pass

        return meta_result
