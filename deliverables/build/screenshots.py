"""Captures screenshots of the running TruthShift app for the slides.
Needs the backend (port 8000) and frontend (port 5173) running. Uses the installed Microsoft Edge.
Run: python screenshots.py
"""
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent / "shots"
OUT.mkdir(exist_ok=True)
URL = "http://localhost:5173"


def tab(page, name):
    page.get_by_role("button", name=name).first.click()
    page.wait_for_timeout(700)


with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge")

    # Desktop screens
    page = browser.new_page(viewport={"width": 1280, "height": 800}, device_scale_factor=2)
    page.goto(URL)
    page.wait_for_selector(".slider")
    page.screenshot(path=OUT / "priorities.png")

    tab(page, "Scan & search")
    page.fill("#search", "peanut")
    page.wait_for_timeout(400)
    page.get_by_text("Prairie Creamy Peanut Butter").first.click()
    page.wait_for_selector(".factor")
    page.wait_for_timeout(500)
    page.locator("#detail, .card").filter(has_text="Why this score?").first.screenshot(path=OUT / "detail.png")

    tab(page, "Compare")
    page.select_option("#compareCat", "Coffee")
    page.wait_for_timeout(500)
    page.screenshot(path=OUT / "compare.png")

    tab(page, "Ask")
    page.get_by_role("button", name="I want to buy Canadian, avoid plastic, and support fair labour. Which coffee?").click()
    page.wait_for_selector(".answer")
    page.wait_for_timeout(500)
    page.screenshot(path=OUT / "ask.png")

    tab(page, "Nearby")
    page.wait_for_timeout(2500)  # map tiles
    page.screenshot(path=OUT / "nearby.png")

    # Phone view of a product, for the cover
    phone = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=3)
    phone.goto(URL)
    phone.wait_for_selector(".slider")
    tab(phone, "Scan & search")
    phone.fill("#search", "peanut")
    phone.wait_for_timeout(400)
    phone.get_by_text("Prairie Creamy Peanut Butter").first.click()
    phone.wait_for_selector(".factor")
    phone.wait_for_timeout(600)
    phone.locator(".card").filter(has_text="Why this score?").first.scroll_into_view_if_needed()
    phone.evaluate("window.scrollBy(0, -70)")
    phone.wait_for_timeout(300)
    phone.screenshot(path=OUT / "phone.png")

    browser.close()
print("saved", sorted(f.name for f in OUT.iterdir()))
