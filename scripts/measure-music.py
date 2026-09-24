#!/usr/bin/env python3
"""Measures how long each composer's tracks are, combined, and writes
data/library/music-durations.json ({composerId: seconds}) for the Music page.

Run `python3 scripts/measure-music.py` after adding, removing or replacing
mp3s (needs macOS's `afinfo`), then commit the updated JSON."""
import json
import os
import re
import subprocess

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
composers = json.load(open(os.path.join(root, 'data', 'library', 'music.json')))

durations = {}
for c in composers:
    folder = os.path.join(root, 'public', c['audioFolder'])
    tracks_file = os.path.join(folder, 'tracks.json')
    if not os.path.exists(tracks_file):
        continue
    total = 0.0
    for name in json.load(open(tracks_file)):
        out = subprocess.run(['afinfo', os.path.join(folder, name)], capture_output=True, text=True).stdout
        m = re.search(r'estimated duration:\s*([\d.]+)', out)
        if not m:
            raise SystemExit(f'Could not read the length of {c["id"]}/{name}')
        total += float(m.group(1))
    durations[c['id']] = round(total)
    print(f'{c["composer"]:14} {durations[c["id"]]:6d}s  ({durations[c["id"]] / 60:.1f} min)')

with open(os.path.join(root, 'data', 'library', 'music-durations.json'), 'w') as f:
    json.dump(durations, f, indent=2)
    f.write('\n')
