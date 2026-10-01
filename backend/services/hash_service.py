import hashlib
import random
import os

class HashService:
    @staticmethod
    def calculate_sha256(file_path: str) -> str:
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    @staticmethod
    def calculate_md5(file_path: str) -> str:
        md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                md5.update(chunk)
        return md5.hexdigest()

    @staticmethod
    def generate_evidence_id() -> str:
        """
        Generates a 12-digit numeric Evidence ID string like '384729104857'
        """
        first_digit = str(random.randint(1, 9))
        remaining = ''.join([str(random.randint(0, 9)) for _ in range(11)])
        return first_digit + remaining

    @staticmethod
    def compare_hashes(current_sha256: str, original_sha256: str) -> dict:
        is_match = (current_sha256.lower().strip() == original_sha256.lower().strip())
        if is_match:
            return {
                "status": "EXACT MATCH",
                "is_match": True,
                "explanation": "The uploaded file is byte-for-byte identical to the registered reference file."
            }
        else:
            return {
                "status": "REFERENCE MISMATCH",
                "is_match": False,
                "explanation": "The uploaded file is not byte-for-byte identical to the registered reference. Compression, resizing, metadata changes, format conversion, or editing may account for the difference."
            }
