"""Create display-sized derivatives of the approved assets (Python + Pillow)."""
from hashlib import sha256
from io import BytesIO
from pathlib import Path
import json

from PIL import Image

assets = Path(__file__).resolve().parents[1] / "public" / "assets"
originals = {
    "tetelestai-symbol.png": "2d9c7c3c12403aa55de0b8092cb78c7898615d084e0fd7bfedcb922dd7c063fd",
    "circuit-network.png": "c3ecb4a6b71115df91bb0b6bc793a53d16ab167faaddcb582093cf73b14a769d",
}
for name, expected in originals.items():
    if sha256((assets / name).read_bytes()).hexdigest() != expected:
        raise ValueError(f"Approved source asset changed: {name}")

outputs = []
symbol = Image.open(assets / "tetelestai-symbol.png")
for width in (144, 320, 640):
    image = symbol.resize((width, width), Image.Resampling.LANCZOS)
    data = BytesIO()
    image.save(data, format="WEBP", lossless=True, method=6)
    outputs.append((f"tetelestai-symbol-{width}.webp", data.getvalue()))

circuit = Image.open(assets / "circuit-network.png")
data = BytesIO()
circuit.save(data, format="WEBP", lossless=True, method=6)
outputs.append(("circuit-network.webp", data.getvalue()))

data = BytesIO()
symbol.resize((64, 64), Image.Resampling.LANCZOS).save(data, format="PNG", optimize=True)
outputs.append(("tetelestai-favicon.png", data.getvalue()))

for name, data in outputs:
    (assets / name).write_bytes(data)
    if (assets / name).read_bytes() != data:
        raise IOError(f"Derivative readback mismatch: {name}")
print(json.dumps([{ "asset": name, "bytes": len(data) } for name, data in outputs]))
