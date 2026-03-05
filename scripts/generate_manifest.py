#!/usr/bin/env python3
"""
Scan images/ directory and write images/manifest.json.

Expected structure:
  images/{i}/{model_name}.png
  images/{i}/prompt.txt

Each numeric subdirectory becomes one pair entry. Directories with fewer
than 2 model images are skipped with a warning.

Run from the pairwise-user-study/ directory:
  python scripts/generate_manifest.py
"""

import json
import os
import sys

IMAGES_DIR = os.path.join(os.path.dirname(__file__), '..', 'images')


def main():
    images_dir = os.path.abspath(IMAGES_DIR)

    if not os.path.isdir(images_dir):
        print(f"Error: images directory not found at {images_dir}", file=sys.stderr)
        sys.exit(1)

    pairs = []

    entries = sorted(os.listdir(images_dir))
    for entry in entries:
        subdir = os.path.join(images_dir, entry)
        if not os.path.isdir(subdir):
            continue

        # Try to interpret directory name as an integer index
        try:
            index = int(entry)
        except ValueError:
            continue

        # Read prompt text
        prompt_path = os.path.join(subdir, 'prompt.txt')
        if os.path.isfile(prompt_path):
            with open(prompt_path, 'r', encoding='utf-8') as f:
                prompt_text = f.read().strip()
        else:
            prompt_text = ''
            print(f"Warning: no prompt.txt in {subdir}")

        # Enumerate model images (*.png), excluding prompt.txt
        models = []
        for fname in sorted(os.listdir(subdir)):
            if fname.lower().endswith('.png'):
                models.append(os.path.splitext(fname)[0])

        if len(models) < 2:
            print(f"Warning: skipping {entry} — fewer than 2 model images found ({models})")
            continue

        pairs.append({
            'index': index,
            'prompt': prompt_text,
            'models': models,
        })

    pairs.sort(key=lambda p: p['index'])

    manifest = {'pairs': pairs}
    manifest_path = os.path.join(images_dir, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"Written {len(pairs)} pair(s) to {manifest_path}")


if __name__ == '__main__':
    main()
