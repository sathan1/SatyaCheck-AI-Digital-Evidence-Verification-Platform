import os
import time
from PIL import Image
from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = r"C:\Users\Kavinaya\.gemini\antigravity-ide\brain\c90d0030-85f8-4100-b826-6e7e148a7e12"
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def record_walkthrough():
    captured_frames = []
    tmp_dir = os.path.join(ARTIFACTS_DIR, "scratch_frames")
    os.makedirs(tmp_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=EDGE_PATH,
            headless=True
        )
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # Step 1: Landing Dashboard
        print("Capturing Dashboard...")
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(1)
        f1 = os.path.join(tmp_dir, "frame_01.png")
        page.screenshot(path=f1)
        captured_frames.append(f1)

        # Step 2: Demo Page
        print("Capturing Demo Page...")
        page.click("text=Try Demo")
        time.sleep(1)
        f2 = os.path.join(tmp_dir, "frame_02.png")
        page.screenshot(path=f2)
        captured_frames.append(f2)

        # Step 3: Run Demo 1 (Authentic Photo)
        print("Capturing Demo 1 Report...")
        page.click("text=Demo 1: Authentic Photograph")
        time.sleep(2)
        page.click("text=Run Demo Scenario")
        time.sleep(3)
        f3 = os.path.join(tmp_dir, "frame_03.png")
        page.screenshot(path=f3)
        captured_frames.append(f3)

        # Step 4: Run Demo 4 (Video Exhibit)
        print("Capturing Video Timeline Demo...")
        page.click("text=Try Demo")
        time.sleep(1)
        page.click("text=Demo 4: Short Video Exhibit")
        time.sleep(1)
        page.click("text=Run Demo Scenario")
        time.sleep(3)
        
        # Scroll down to timeline
        page.evaluate("window.scrollBy(0, 400)")
        time.sleep(1)
        f4 = os.path.join(tmp_dir, "frame_04.png")
        page.screenshot(path=f4)
        captured_frames.append(f4)

        # Step 5: Tamper Check Page
        print("Capturing Tamper Check...")
        page.click("text=Tamper Check")
        time.sleep(1)
        f5 = os.path.join(tmp_dir, "frame_05.png")
        page.screenshot(path=f5)
        captured_frames.append(f5)

        # Step 6: Admin Metrics
        print("Capturing Admin Dashboard...")
        page.click("text=Admin Metrics")
        time.sleep(1)
        f6 = os.path.join(tmp_dir, "frame_06.png")
        page.screenshot(path=f6)
        captured_frames.append(f6)

        browser.close()

    print(f"Captured {len(captured_frames)} frame screenshots.")

    # Assemble into animated WebP & GIF
    images = [Image.open(f).convert("RGB") for f in captured_frames]
    
    webp_path = os.path.join(ARTIFACTS_DIR, "satyacheck_demo_walkthrough.webp")
    gif_path = os.path.join(ARTIFACTS_DIR, "satyacheck_demo_walkthrough.gif")

    images[0].save(
        webp_path,
        save_all=True,
        append_images=images[1:],
        duration=2200,
        loop=0
    )

    images[0].save(
        gif_path,
        save_all=True,
        append_images=images[1:],
        duration=2200,
        loop=0
    )

    print(f"Saved demo animation video to {webp_path} and {gif_path}")

if __name__ == "__main__":
    record_walkthrough()
