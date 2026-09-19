#!/usr/bin/env python3
"""Regenerates the splash screens from public/icon.png: solid blue with the
logo mark centered. Run `python3 scripts/make-splash.py` after changing the
icon, then rebuild. Needs Pillow."""
from PIL import Image, ImageChops
import os

BLUE = (0x0C, 0xC0, 0xDF)
MARK_WIDTH = 0.30  # logo width as a fraction of the screen width

# (css width, css height, device pixel ratio) for every portrait iPhone size
DEVICES = [
    (440, 956, 3), (402, 874, 3), (430, 932, 3), (393, 852, 3), (420, 912, 3),
    (390, 844, 3), (428, 926, 3), (375, 812, 3), (414, 896, 3), (414, 896, 2),
    (375, 667, 2), (414, 736, 3), (320, 568, 2),
]

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
icon = Image.open(os.path.join(root, 'public', 'icon.png')).convert('RGB')
bg = Image.new('RGB', icon.size, BLUE)
bbox = ImageChops.difference(icon, bg).convert('L').point(lambda v: 255 if v > 12 else 0).getbbox()
mark = icon.crop(bbox)


def make(width, height, mark_px):
    canvas = Image.new('RGB', (width, height), BLUE)
    h = round(mark_px * mark.height / mark.width)
    scaled = mark.resize((mark_px, h), Image.LANCZOS)
    canvas.paste(scaled, ((width - mark_px) // 2, (height - h) // 2))
    return canvas


out = os.path.join(root, 'public', 'splash')
os.makedirs(out, exist_ok=True)
for w, h, r in DEVICES:
    pw, ph = w * r, h * r
    make(pw, ph, round(pw * MARK_WIDTH)).save(os.path.join(out, f'{pw}x{ph}.png'), optimize=True)

# Launch image for the native iOS wrapper (square, aspect-filled by iOS).
native = os.path.join(root, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset')
if os.path.isdir(native):
    img = make(2732, 2732, round(2732 * 0.14))
    for n in ('splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png'):
        img.save(os.path.join(native, n), optimize=True)
