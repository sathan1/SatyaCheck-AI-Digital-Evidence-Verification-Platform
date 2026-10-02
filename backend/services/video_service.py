import os
import cv2
import numpy as np
from config import Config
from services.metadata_service import MetadataService

class VideoService:
    MODEL_1_NAME = "umm-maybe/AI-image-detector"
    MODEL_2_NAME = "king1oo1/deepfake-model"

    @staticmethod
    def process_video_frames(file_path: str, evidence_id: str, ai_provider, is_demo: bool = False) -> dict:
        """
        Samples video at ~1 frame per second.
        Applies both AI detection models (umm-maybe/AI-image-detector and king1oo1/deepfake-model)
        to each sampled video frame, averages both models' scores per frame,
        and calculates overall video trust score.
        """
        frames_dir = os.path.join(Config.UPLOAD_FOLDER, f"frames_{evidence_id}")
        os.makedirs(frames_dir, exist_ok=True)

        meta = MetadataService.extract_video_metadata(file_path)
        fps = meta.get("fps") or 30.0
        total_frames = meta.get("frame_count") or 0

        cap = cv2.VideoCapture(file_path)
        if not cap.isOpened():
            return {
                "error": "Failed to open video file",
                "sampled_frames": [],
                "suspicious_intervals": [],
                "temporal_anomaly_detected": False,
                "overall_video_trust_score": 0.0
            }

        # Step 1 sec intervals (~1 fps)
        step_frames = max(1, int(round(fps)))

        frame_idx = 0
        sample_count = 0
        sampled_frames = []
        prev_gray = None
        temporal_diffs = []

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % step_frames == 0:
                sample_count += 1
                timestamp_sec = round(frame_idx / fps, 2)
                timestamp_str = f"{int(timestamp_sec // 60):02d}:{int(timestamp_sec % 60):02d}"

                # Save frame image file
                frame_filename = f"frame_{sample_count:03d}_{int(timestamp_sec)}s.jpg"
                frame_full_path = os.path.join(frames_dir, frame_filename)
                cv2.imwrite(frame_full_path, frame)
                frame_rel_url = f"/uploads/frames_{evidence_id}/{frame_filename}"

                # Calculate temporal difference with previous frame
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                if prev_gray is not None and prev_gray.shape == gray.shape:
                    diff = cv2.absdiff(gray, prev_gray)
                    diff_score = float(np.mean(diff))
                    temporal_diffs.append(diff_score)
                else:
                    diff_score = 0.0
                prev_gray = gray

                # Run frame-level AI analysis using BOTH models
                ai_res = ai_provider.analyze_frame(
                    frame,
                    frame_index=sample_count,
                    is_demo_video=is_demo,
                    filename=os.path.basename(file_path)
                )

                score_1 = float(ai_res.get("score_model_1", ai_res.get("confidence", 0.15)))
                score_2 = float(ai_res.get("score_model_2", ai_res.get("confidence", 0.15)))

                # Average both models' scores per frame
                avg_frame_confidence = round(float((score_1 + score_2) / 2.0), 4)

                indicator = "Elevated" if avg_frame_confidence >= 0.70 else ("Medium" if avg_frame_confidence >= 0.40 else "Low")

                sampled_frames.append({
                    "frame_num": sample_count,
                    "timestamp_sec": timestamp_sec,
                    "timestamp_str": timestamp_str,
                    "ai_indicator": indicator,
                    "confidence": avg_frame_confidence,
                    "model_1_name": VideoService.MODEL_1_NAME,
                    "score_model_1": round(score_1, 4),
                    "model_2_name": VideoService.MODEL_2_NAME,
                    "score_model_2": round(score_2, 4),
                    "averaged_frame_score": avg_frame_confidence,
                    "frame_url": frame_rel_url,
                    "temporal_diff": round(diff_score, 2),
                    "status": "NORMAL" if indicator != "Elevated" else "SUSPICIOUS"
                })

            frame_idx += 1

        cap.release()

        # Group consecutive suspicious frames into intervals with start_sec & end_sec
        suspicious_intervals = []
        current_start = None
        current_start_sec = None
        current_end = None
        current_end_sec = None
        frame_start_num = None

        for f in sampled_frames:
            if f["ai_indicator"] in ["Elevated", "High"]:
                if current_start is None:
                    current_start = f["timestamp_str"]
                    current_start_sec = f["timestamp_sec"]
                    current_end = f["timestamp_str"]
                    current_end_sec = f["timestamp_sec"] + 1.0
                    frame_start_num = f["frame_num"]
                else:
                    current_end = f["timestamp_str"]
                    current_end_sec = f["timestamp_sec"] + 1.0
            else:
                if current_start is not None:
                    suspicious_intervals.append({
                        "start_time": current_start,
                        "end_time": current_end,
                        "start_sec": current_start_sec,
                        "end_sec": current_end_sec,
                        "frame_range": f"Frame {frame_start_num} → Frame {f['frame_num'] - 1}",
                        "reason": f"Averaged dual-model analysis ({VideoService.MODEL_1_NAME} + {VideoService.MODEL_2_NAME}) detected elevated synthetic indicators."
                    })
                    current_start = None
                    current_end = None
                    current_start_sec = None
                    current_end_sec = None

        if current_start is not None:
            suspicious_intervals.append({
                "start_time": current_start,
                "end_time": current_end,
                "start_sec": current_start_sec,
                "end_sec": current_end_sec,
                "frame_range": f"Frame {frame_start_num} → Frame {sampled_frames[-1]['frame_num']}",
                "reason": f"Averaged dual-model analysis ({VideoService.MODEL_1_NAME} + {VideoService.MODEL_2_NAME}) detected elevated synthetic indicators."
            })

        # Calculate overall video AI score and overall video trust score
        frame_confidences = [f["confidence"] for f in sampled_frames] if sampled_frames else [0.15]
        mean_video_ai_confidence = round(float(np.mean(frame_confidences)), 4)
        overall_video_trust_score = round(float(max(0.0, min(1.0, 1.0 - mean_video_ai_confidence))), 4)

        # Temporal inconsistency flag
        avg_diff = float(np.mean(temporal_diffs)) if temporal_diffs else 0.0
        max_diff = float(np.max(temporal_diffs)) if temporal_diffs else 0.0
        temporal_anomaly = (max_diff > avg_diff * 2.8) and (max_diff > 25.0)

        return {
            "sampled_frames": sampled_frames,
            "suspicious_intervals": suspicious_intervals,
            "temporal_anomaly_detected": temporal_anomaly,
            "mean_video_ai_confidence": mean_video_ai_confidence,
            "overall_video_trust_score": overall_video_trust_score,
            "models_applied": [VideoService.MODEL_1_NAME, VideoService.MODEL_2_NAME],
            "temporal_stats": {
                "avg_diff": round(avg_diff, 2),
                "max_diff": round(max_diff, 2),
                "advisory": "Potential temporal inconsistency detected between neighboring frames." if temporal_anomaly else "No significant temporal frame discontinuities detected."
            }
        }
