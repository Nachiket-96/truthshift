# TruthShift

This is our project for the **RODS Tech Skills Showcase 2026** challenge, "The Ethical Consumer Compass" (Regina Open Door Society).

TruthShift scores grocery products against each shopper's own values: Buy Canadian, Support Regina, fair trade, animal welfare, environment, packaging and price. Every fact is labelled **Verified**, **Claimed** or **Unknown**, and unknown facts never count against a product.

## Run it (2 steps)

You need [Python 3.10+](https://www.python.org/downloads/) and [Node.js 20+](https://nodejs.org/) installed. On Windows, tick **"Add Python to PATH"** when installing Python.

**Step 1: Download.** On this page click **Code → Download ZIP** and unzip it, or run:
```bash
git clone https://github.com/Nachiket-96/truthshift.git
```

**Step 2: Start.** Open the `truthshift` folder and double-click **`start.bat`** (Windows). On Mac or Linux, run `./start.sh` instead.
- The first run installs packages, which takes a minute or two.
- Two windows open: keep them open while you use the app.
- The app opens at **https://localhost:5173**.
- Your browser will say "Your connection is not private". This is expected for a local app: click **Advanced → Proceed**.

## Open it on your Android phone (with camera scanning)

1. Connect the phone to the **same Wi-Fi** as the laptop running TruthShift.
2. In the **"TruthShift app"** window, find the line `Network: https://192.168.x.x:5173`.
3. On the phone, open **Chrome** and type that exact address.
4. Chrome warns "Your connection is not private": tap **Advanced → Proceed to …**.
5. Go to **Scan**, tap **Scan barcode**, and **Allow** the camera.
6. Optional: Chrome menu **⋮ → Add to Home screen** to get a TruthShift app icon.

**If the phone can't open the page:**
- Check that the laptop and phone are on the same Wi-Fi.
- Allow Node.js through the Windows Firewall when Windows asks.
- Some office or school networks block devices from talking to each other. A phone hotspot works as a fallback.

## What's in this repo

| Folder | What it is |
| --- | --- |
| [`truthshift/`](truthshift/) | **The app**: React frontend and Python FastAPI backend |
| [`presentation/`](presentation/) | **[TruthShift_Presentation.pptx](presentation/TruthShift_Presentation.pptx)**, the PowerPoint deck with speaker notes (plus source files of an earlier online slide version) |
| [`deliverables/`](deliverables/) | Word documentation, plus the scripts that generate the deck and the document |
| [`prototype/`](prototype/) | First prototype: a single-page HTML/JS version |

## Data

- **46 demo products** with fictional brands (synthetic data, which the challenge allows)
- **72 real products** sold in Canada, imported from [Open Food Facts](https://world.openfoodfacts.org) (ODbL licence)
- **10 Regina stores** at approximate locations

See [`deliverables/TruthShift_Documentation.docx`](deliverables/TruthShift_Documentation.docx) for the full write-up.
