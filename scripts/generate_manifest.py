#!/usr/bin/env python3
"""
Scan images/ directory and write images/manifest.json.

Expected structure:
  images/set_{i:04d}/{model_name}.png
  images/set_{i:04d}/prompt.txt

Each set_XXXX subdirectory becomes one pair entry. Directories with fewer
than 2 model images are skipped with a warning.

Run from the pairwise-user-study/ directory:
  python scripts/generate_manifest.py
"""

import json
import os
import re
import sys

IMAGES_DIR = os.path.join(os.path.dirname(__file__), '..', 'images')
DIR_PATTERN = re.compile(r'^set_(\d+)$')


def main():
    images_dir = os.path.abspath(IMAGES_DIR)

    if not os.path.isdir(images_dir):
        print(f"Error: images directory not found at {images_dir}", file=sys.stderr)
        sys.exit(1)

    pairs = []

    for entry in sorted(os.listdir(images_dir)):
        subdir = os.path.join(images_dir, entry)
        if not os.path.isdir(subdir):
            continue

        m = DIR_PATTERN.match(entry)
        if not m:
            continue

        sort_key = int(m.group(1))

        prompt_path = os.path.join(subdir, 'prompt.txt')
        if os.path.isfile(prompt_path):
            with open(prompt_path, 'r', encoding='utf-8') as f:
                prompt_text = f.read().strip()
        else:
            prompt_text = ''
            print(f"Warning: no prompt.txt in {subdir}")

        models = [
            os.path.splitext(fname)[0]
            for fname in sorted(os.listdir(subdir))
            if fname.lower().endswith('.png')
        ]

        if len(models) < 2:
            print(f"Warning: skipping {entry} — fewer than 2 model images found ({models})")
            continue

        pairs.append({
            '_sort': sort_key,
            'dir': entry,
            'prompt': prompt_text,
            'models': models,
        })

    pairs.sort(key=lambda p: p['_sort'])
    for p in pairs:
        del p['_sort']

    manifest = {'pairs': pairs}
    manifest_path = os.path.join(images_dir, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"Written {len(pairs)} pair(s) to {manifest_path}")


if __name__ == '__main__':
    main()
