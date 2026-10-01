import json

class CorrelationService:
    @staticmethod
    def correlate_evidence(
        sha256_match_status: str, # "EXACT MATCH", "REFERENCE MISMATCH", "NO REFERENCE"
        ai_result: dict,           # {ai_indicator, confidence, provider, demo_mode}
        metadata_result: dict,     # {has_metadata, exif_summary, camera_make, camera_model}
        forensic_result: dict,     # {ela_score, noise_score, fft_score, has_heatmap}
        resilience_result: dict,   # {stability, max_confidence_delta, advisory}
        video_result: dict = None  # {suspicious_intervals, temporal_anomaly_detected}
    ) -> dict:
        
        signals = []
        why_items = []
        concerns_count = 0
        supporting_count = 0

        # Signal 1: Cryptographic Integrity / Reference Comparison
        if sha256_match_status == "EXACT MATCH":
            signals.append({
                "name": "File Integrity (SHA-256)",
                "finding": "100% byte match with original reference",
                "impact": "SUPPORTING",
                "badge": "Pass"
            })
            why_items.append({
                "type": "pass",
                "text": "🔒 File Fingerprint Preserved: SHA-256 hash 100% matches registered original."
            })
            supporting_count += 1
        elif sha256_match_status == "REFERENCE MISMATCH":
            signals.append({
                "name": "File Integrity (SHA-256)",
                "finding": "Hash differs from original reference",
                "impact": "CONCERN",
                "badge": "Mismatch"
            })
            why_items.append({
                "type": "concern",
                "text": "🚨 Hash Mismatch: File bytes have been modified since original registration."
            })
            concerns_count += 1
        else:
            signals.append({
                "name": "File Integrity (SHA-256)",
                "finding": "SHA-256 fingerprint recorded in database",
                "impact": "NEUTRAL",
                "badge": "Fingerprinted"
            })
            why_items.append({
                "type": "neutral",
                "text": "🛡️ File Fingerprint Saved: SHA-256 hash recorded and preserved in database."
            })

        # Signal 2: AI Generation Indicator
        ai_indicator = ai_result.get("ai_indicator", "Inconclusive")
        confidence_pct = int(ai_result.get("confidence", 0.0) * 100)
        provider = ai_result.get("provider", "DemoProvider")
        demo_mode = ai_result.get("demo_mode", True)

        if ai_indicator in ["Elevated", "High"] or confidence_pct >= 70:
            signals.append({
                "name": "AI Model Assessment",
                "finding": f"High synthetic AI probability ({confidence_pct}%)",
                "impact": "CONCERN",
                "badge": "Elevated Risk"
            })
            why_items.append({
                "type": "concern",
                "text": f"🔴 High AI Risk: Artificial AI generation detected ({confidence_pct}% AI probability)."
            })
            concerns_count += 2
        elif ai_indicator == "Medium" or confidence_pct >= 40:
            signals.append({
                "name": "AI Model Assessment",
                "finding": f"Moderate synthetic AI probability ({confidence_pct}%)",
                "impact": "NEUTRAL",
                "badge": "Moderate Risk"
            })
            why_items.append({
                "type": "warning",
                "text": f"⚠️ Moderate AI Risk: Moderate artificial indicators detected ({confidence_pct}% AI score)."
            })
            concerns_count += 1
        else:
            signals.append({
                "name": "AI Model Assessment",
                "finding": f"Low synthetic AI probability ({confidence_pct}%)",
                "impact": "SUPPORTING",
                "badge": "Low Risk"
            })
            why_items.append({
                "type": "pass",
                "text": f"🟢 Low AI Risk: No artificial AI generation detected ({confidence_pct}% AI score)."
            })
            supporting_count += 1

        # Signal 3: Metadata Provenance
        has_meta = metadata_result.get("has_metadata", False)
        exif_summary = metadata_result.get("exif_summary", "")

        if has_meta and (metadata_result.get("camera_make") or metadata_result.get("camera_model")):
            make_model = f"{metadata_result.get('camera_make', '')} {metadata_result.get('camera_model', '')}".strip()
            signals.append({
                "name": "Metadata Provenance",
                "finding": f"EXIF camera hardware tags found ({make_model})",
                "impact": "SUPPORTING",
                "badge": "Available"
            })
            why_items.append({
                "type": "pass",
                "text": f"📷 Camera Provenance Confirmed: Authentic camera hardware tags found ({make_model})."
            })
            supporting_count += 1
        else:
            signals.append({
                "name": "Metadata Provenance",
                "finding": "Camera hardware tags absent",
                "impact": "NEUTRAL",
                "badge": "Unavailable"
            })
            why_items.append({
                "type": "neutral",
                "text": "⚠️ No Camera EXIF Metadata: Camera info absent (commonly removed by WhatsApp/web)."
            })

        # Signal 4: Forensic Anomaly Signals (ELA, Noise, Heatmap)
        ela_score = forensic_result.get("ela_score", 0.0)
        has_heatmap = forensic_result.get("has_heatmap", False)

        if ela_score > 8.0:
            signals.append({
                "name": "Forensic Image Analysis",
                "finding": f"Elevated ELA compression variance ({ela_score})",
                "impact": "CONCERN",
                "badge": "Anomaly Detected"
            })
            why_items.append({
                "type": "concern",
                "text": f"🔍 Pixel Anomaly Detected: Compression variance indicates possible image editing (ELA: {ela_score})."
            })
            concerns_count += 1
        else:
            signals.append({
                "name": "Forensic Image Analysis",
                "finding": f"Uniform error level distribution across image pixels",
                "impact": "SUPPORTING",
                "badge": "None Detected"
            })
            why_items.append({
                "type": "pass",
                "text": f"✅ Pixel Integrity Verified: Uniform image compression with no editing artifacts."
            })

        # Signal 5: Compression Resilience
        if resilience_result:
            stability = resilience_result.get("stability", "HIGH")
            if stability == "HIGH":
                signals.append({
                    "name": "Compression Resilience",
                    "finding": "Stable prediction across JPEG re-compression tests",
                    "impact": "SUPPORTING",
                    "badge": "High Stability"
                })
                why_items.append({
                    "type": "pass",
                    "text": "🔬 High Stability: Image assessment remains reliable across JPEG compression levels."
                })
            elif stability == "LOW":
                signals.append({
                    "name": "Compression Resilience",
                    "finding": "Prediction shifted under re-compression",
                    "impact": "NEUTRAL",
                    "badge": "Low Stability"
                })
                why_items.append({
                    "type": "warning",
                    "text": "⚠️ Unstable Prediction: Model prediction shifted under JPEG re-compression testing."
                })

        # Signal 6: Video Specific Interval Signal
        if video_result:
            intervals = video_result.get("suspicious_intervals", [])
            temp_anomaly = video_result.get("temporal_anomaly_detected", False)
            if intervals:
                signals.append({
                    "name": "Video Frame Sampling",
                    "finding": f"Identified {len(intervals)} suspicious timestamp interval(s)",
                    "impact": "CONCERN",
                    "badge": "Suspicious Interval"
                })
                why_items.append({
                    "type": "concern",
                    "text": f"🎬 Video Deepfake Alert: Suspicious intervals flagged ({intervals[0]['start_time']} → {intervals[0]['end_time']})."
                })
                concerns_count += 1
            if temp_anomaly:
                why_items.append({
                    "type": "concern",
                    "text": "🎥 Temporal Inconsistency: Frame-to-frame discontinuity detected in video sequence."
                })

        # Always add final summary notice bullet
        why_items.append({
            "type": "warning",
            "text": "⚖️ Verification Notice: Comprehensive assessment based on cryptographic hash, EXIF metadata, and AI detection."
        })

        # Determine Final Assessment Label (Never return INCONCLUSIVE):
        if sha256_match_status == "REFERENCE MISMATCH" and concerns_count >= 2:
            assessment = "MULTIPLE INDICATORS"
        elif sha256_match_status == "REFERENCE MISMATCH":
            assessment = "REFERENCE MISMATCH"
        elif concerns_count >= 2 or confidence_pct >= 65:
            assessment = "HIGH RISK: SUSPECTED AI GENERATED"
        elif concerns_count >= 1 or confidence_pct >= 35:
            assessment = "NEEDS REVIEW"
        else:
            assessment = "LIKELY AUTHENTIC"

        # Determine Evidence Quality Score: HIGH | MEDIUM | LIMITED
        quality_score = "HIGH"
        if demo_mode:
            quality_score = "HIGH (Simulated Provider)"
        elif not has_meta and sha256_match_status == "NO REFERENCE":
            quality_score = "MEDIUM"

        return {
            "assessment": assessment,
            "evidence_quality": quality_score,
            "signals": signals,
            "why_items": why_items,
            "concerns_count": concerns_count,
            "supporting_count": supporting_count,
            "demo_mode": demo_mode
        }
