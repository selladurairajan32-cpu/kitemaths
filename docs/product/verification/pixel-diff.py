"""Usage: python3 docs/product/verification/pixel-diff.py <baselineDir> <headDir>
Compares same-named PNGs pixel by pixel and prints the number of differing pixels per file and in total."""
import sys, os
from PIL import Image, ImageChops
a, b = sys.argv[1], sys.argv[2]
names = sorted(f for f in os.listdir(a) if f.endswith('.png'))
total = 0
for n in names:
    pb = os.path.join(b, n)
    if not os.path.exists(pb): print(f"{n}: MISSING in {b}"); total += 1; continue
    ia, ib = Image.open(os.path.join(a, n)).convert('RGB'), Image.open(pb).convert('RGB')
    if ia.size != ib.size: print(f"{n}: SIZE {ia.size} vs {ib.size}"); total += 1; continue
    d = ImageChops.difference(ia, ib).convert('L').point(lambda v: 255 if v else 0)
    pixels = d.get_flattened_data() if hasattr(d, "get_flattened_data") else d.getdata()
    c = sum(1 for v in pixels if v)
    total += c
    print(f"{n}: {ia.size[0]}x{ia.size[1]} differing pixels {c}")
print("TOTAL differing", total, "files", len(names))
