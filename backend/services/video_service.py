import os
import cv2
import numpy as np
from config import Config
from services.metadata_service import MetadataService

class VideoService:
    @staticmethod
    def process_video_frames(file_path: str, evidence_id: str, ai_provider, is_demo: bool = False) -> dict:
        """
        Samples video at ~1 frame per second, extracts frame JPEG, runs frame-level AI analysis,
        calculates temporal frame-to-frame diff, and groups suspicious intervals.
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
                "temporal_anomaly_detected": False
            }

        # Step 1 sec intervals
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

                # Run frame-level AI analysis
                ai_res = ai_provider.analyze_frame(frame, frame_index=sample_count, is_demo_video=is_demo, filename=os.path.basename(file_path))

                sampled_frames.append({
                    "frame_num": sample_count,
                    "timestamp_sec": timestamp_sec,
                    "timestamp_str": timestamp_str,
                    "ai_indicator": ai_res.get("ai_indicator", "Low"),
                    "confidence": ai_res.get("confidence", 0.15),
                    "frame_url": frame_rel_url,
                    "temporal_diff": round(diff_score, 2),
                    "status": "NORMAL" if ai_res.get("ai_indicator") != "Elevated" else "SUSPICIOUS"
                })

            frame_idx += 1

        cap.release()

        # Step: Group consecutive suspicious frames into intervals with start_sec & end_sec
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
                        "reason": "Frame-level analysis detected elevated AI / synthetic indicators."
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
                "reason": "Frame-level analysis detected elevated AI / synthetic indicators."
            })

        # Temporal inconsistency flag
        avg_diff = float(np.mean(temporal_diffs)) if temporal_diffs else 0.0
        max_diff = float(np.max(temporal_diffs)) if temporal_diffs else 0.0
        temporal_anomaly = (max_diff > avg_diff * 2.8) and (max_diff > 25.0)

        return {
            "sampled_frames": sampled_frames,
            "suspicious_intervals": suspicious_intervals,
            "temporal_anomaly_detected": temporal_anomaly,
            "temporal_stats": {
                "avg_diff": round(avg_diff, 2),
                "max_diff": round(max_diff, 2),
                "advisory": "Potential temporal inconsistency detected between neighboring frames." if temporal_anomaly else "No significant temporal frame discontinuities detected."
            }
        }
