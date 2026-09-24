#!/usr/bin/env python3
"""Regenerates the launch images iOS shows before the app loads (black with
the logo centered), plus the native app's icon and launch image.

The logo is drawn from src/assets/logo.json (the same file the in-app splash
animation reads), so they always match. Run `python3 scripts/make-splash.py`
after changing the logo, then rebuild. Needs Pillow.

Pass --icon to also redraw public/icon.png (the home-screen icon) from the
same geometry; without it, public/icon.png is left alone so a dropped-in
square image is kept."""
from PIL import Image, ImageDraw
import json
import os
import sys

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


def draw_mark(width_px):
    """The dot grid as an image width_px wide, anti-aliased by 4x supersampling."""
    ss = 4
    scale = width_px * ss / logo['width']
    w, h = round(logo['width'] * scale), round(logo['height'] * scale)
    big = Image.new('RGB', (w, h), rgb(logo['background']))
    d = ImageDraw.Draw(big)
    small = {tuple(c) for c in logo['smallCells']}
    for row in range(logo['rows']):
        for col in range(logo['columns']):
            is_small = (row, col) in small
            r = (logo['smallDiameter'] if is_small else logo['bigDiameter']) / 2 * scale
            cx = (logo['bigDiameter'] / 2 + col * logo['pitchX']) * scale
            cy = (logo['bigDiameter'] / 2 + row * logo['pitchY']) * scale
            d.ellipse([cx - r, cy - r, cx + r - 1, cy + r - 1], fill=rgb(logo['small'] if is_small else logo['big']))
    return big.resize((round(width_px), round(h / ss)), Image.LANCZOS)


def canvas(width, height, mark_width_fraction):
    img = Image.new('RGB', (width, height), rgb(logo['background']))
    mark = draw_mark(round(width * mark_width_fraction))
    img.paste(mark, ((width - mark.width) // 2, (height - mark.height) // 2))
    return img


out = os.path.join(root, 'public', 'splash')
os.makedirs(out, exist_ok=True)
for w, h, r in DEVICES:
    canvas(w * r, h * r, logo['logoWidth']).save(os.path.join(out, f'{w * r}x{h * r}.png'), optimize=True)

if '--icon' in sys.argv:
    canvas(1024, 1024, logo['iconMarkWidth']).save(os.path.join(root, 'public', 'icon.png'), optimize=True)

ios = os.path.join(root, 'ios', 'App', 'App', 'Assets.xcassets')
if os.path.isdir(ios):
    icon = Image.open(os.path.join(root, 'public', 'icon.png')).convert('RGB').resize((1024, 1024), Image.LANCZOS)
    icon.save(os.path.join(ios, 'AppIcon.appiconset', 'AppIcon-512@2x.png'))
    # Square image, aspect-filled by iOS: the mark is scaled up with the screen height.
    canvas(2732, 2732, logo['logoWidth'] * 0.467).save(os.path.join(ios, 'Splash.imageset', 'splash-2732x2732.png'), optimize=True)
    for n in ('splash-2732x2732-1.png', 'splash-2732x2732-2.png'):
        Image.open(os.path.join(ios, 'Splash.imageset', 'splash-2732x2732.png')).save(os.path.join(ios, 'Splash.imageset', n), optimize=True)
