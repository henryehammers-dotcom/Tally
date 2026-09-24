#!/usr/bin/env python3
"""Regenerates the launch images iOS shows before the app loads (purple with
the logo centered), plus the native app's icon and launch image.

The logo is drawn from src/assets/logo.json (the same file the in-app splash
animation reads), so the two always match. Run `python3 scripts/make-splash.py`
after changing the logo colors/geometry, then rebuild. Needs Pillow.

The home-screen icon itself is public/icon.png — drop in a square image."""
from PIL import Image, ImageDraw
import json
import os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
logo = json.load(open(os.path.join(root, 'src', 'assets', 'logo.json')))

# (css width, css height, device pixel ratio) for every portrait iPhone size
DEVICES = [
    (440, 956, 3), (402, 874, 3), (430, 932, 3), (393, 852, 3), (420, 912, 3),
    (390, 844, 3), (428, 926, 3), (375, 812, 3), (414, 896, 3), (414, 896, 2),
    (375, 667, 2), (414, 736, 3), (320, 568, 2),
]


def rgb(hex_color):
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def draw_mark(size):
    """The dot grid as a size x size image, anti-aliased by 4x supersampling."""
    n, ss = logo['grid'], 4
    big = Image.new('RGB', (size * ss, size * ss), rgb(logo['purple']))
    d = ImageDraw.Draw(big)
    cell = size * ss / n
    white = {tuple(c) for c in logo['whiteCells']}
    for row in range(n):
        for col in range(n):
            color = rgb(logo['white'] if (row, col) in white else logo['orange'])
            d.ellipse([col * cell, row * cell, (col + 1) * cell - 1, (row + 1) * cell - 1], fill=color)
    return big.resize((size, size), Image.LANCZOS)


def launch_image(width, height, mark_fraction):
    img = Image.new('RGB', (width, height), rgb(logo['purple']))
    mark_px = round(width * mark_fraction)
    img.paste(draw_mark(mark_px), ((width - mark_px) // 2, (height - mark_px) // 2))
    return img


out = os.path.join(root, 'public', 'splash')
os.makedirs(out, exist_ok=True)
for w, h, r in DEVICES:
    launch_image(w * r, h * r, logo['logoWidth']).save(os.path.join(out, f'{w * r}x{h * r}.png'), optimize=True)

ios = os.path.join(root, 'ios', 'App', 'App', 'Assets.xcassets')
if os.path.isdir(ios):
    icon = Image.open(os.path.join(root, 'public', 'icon.png')).convert('RGB').resize((1024, 1024), Image.LANCZOS)
    icon.save(os.path.join(ios, 'AppIcon.appiconset', 'AppIcon-512@2x.png'))
    # Square image, aspect-filled by iOS: the mark is scaled up with the screen height.
    native = launch_image(2732, 2732, logo['logoWidth'] * 0.467)
    for n in ('splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png'):
        native.save(os.path.join(ios, 'Splash.imageset', n), optimize=True)
