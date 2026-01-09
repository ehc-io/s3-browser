#!/usr/bin/env python3
"""
Convert S3 HTTP URLs to S3 Browser deep-links in markdown files.

Converts URLs like:
  https://bucket-name.s3.amazonaws.com/path/file.png
  https://bucket-name.s3.us-east-1.amazonaws.com/path/file.png
  https://s3.amazonaws.com/bucket-name/path/file.png

To S3 Browser deep-links:
  http://localhost:3005/?uri=s3://bucket-name/path/file.png

Usage:
  python convert-s3-links.py <folder> [--base-url URL] [--dry-run]
"""

import argparse
import re
import sys
from pathlib import Path


# Patterns for different S3 URL formats
S3_URL_PATTERNS = [
    # Virtual-hosted style: https://bucket.s3.amazonaws.com/key
    re.compile(r'https?://([a-z0-9][a-z0-9.-]+)\.s3\.amazonaws\.com/(.+?)(?=[\s\)\]\"\']|$)'),
    # Virtual-hosted with region: https://bucket.s3.us-east-1.amazonaws.com/key
    re.compile(r'https?://([a-z0-9][a-z0-9.-]+)\.s3\.[a-z0-9-]+\.amazonaws\.com/(.+?)(?=[\s\)\]\"\']|$)'),
    # Path style: https://s3.amazonaws.com/bucket/key
    re.compile(r'https?://s3\.amazonaws\.com/([a-z0-9][a-z0-9.-]+)/(.+?)(?=[\s\)\]\"\']|$)'),
    # Path style with region: https://s3.us-east-1.amazonaws.com/bucket/key
    re.compile(r'https?://s3\.[a-z0-9-]+\.amazonaws\.com/([a-z0-9][a-z0-9.-]+)/(.+?)(?=[\s\)\]\"\']|$)'),
]


def convert_s3_url_to_deeplink(url: str, base_url: str) -> str:
    """Convert an S3 HTTP URL to an S3 Browser deep-link."""
    for pattern in S3_URL_PATTERNS:
        match = pattern.match(url)
        if match:
            bucket = match.group(1)
            key = match.group(2)
            s3_uri = f"s3://{bucket}/{key}"
            return f"{base_url}/?uri={s3_uri}"
    return url  # Return original if no match


def process_file(filepath: Path, base_url: str, dry_run: bool = False) -> tuple[int, list[str]]:
    """
    Process a single markdown file and convert S3 URLs.
    Returns (count of replacements, list of changes made).
    """
    content = filepath.read_text(encoding='utf-8')
    original_content = content
    changes = []

    for pattern in S3_URL_PATTERNS:
        for match in pattern.finditer(content):
            old_url = match.group(0)
            new_url = convert_s3_url_to_deeplink(old_url, base_url)
            if old_url != new_url:
                changes.append(f"  {old_url}\n  → {new_url}")
                content = content.replace(old_url, new_url)

    if changes and not dry_run:
        filepath.write_text(content, encoding='utf-8')

    return len(changes), changes


def main():
    parser = argparse.ArgumentParser(
        description='Convert S3 HTTP URLs to S3 Browser deep-links in markdown files.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  %(prog)s ./docs
  %(prog)s ./docs --base-url http://192.168.1.108:3005
  %(prog)s ./docs --dry-run
        '''
    )
    parser.add_argument(
        'folder',
        type=Path,
        help='Folder containing markdown files to process'
    )
    parser.add_argument(
        '--base-url',
        default='http://192.168.1.108:3005',
        help='Base URL for S3 Browser (default: http://192.168.1.108:3005)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be changed without modifying files'
    )
    parser.add_argument(
        '--pattern',
        default='*.md',
        help='File pattern to match (default: *.md)'
    )

    args = parser.parse_args()

    if not args.folder.exists():
        print(f"Error: Folder '{args.folder}' does not exist", file=sys.stderr)
        sys.exit(1)

    if not args.folder.is_dir():
        print(f"Error: '{args.folder}' is not a directory", file=sys.stderr)
        sys.exit(1)

    # Find all markdown files
    files = list(args.folder.glob(args.pattern))

    if not files:
        print(f"No {args.pattern} files found in '{args.folder}'")
        sys.exit(0)

    total_changes = 0
    files_modified = 0

    print(f"{'[DRY RUN] ' if args.dry_run else ''}Processing {len(files)} file(s) in '{args.folder}'")
    print(f"Base URL: {args.base_url}")
    print("-" * 60)

    for filepath in sorted(files):
        count, changes = process_file(filepath, args.base_url, args.dry_run)
        if count > 0:
            files_modified += 1
            total_changes += count
            print(f"\n{filepath.name}: {count} link(s) converted")
            for change in changes:
                print(change)

    print("-" * 60)
    print(f"{'[DRY RUN] ' if args.dry_run else ''}Summary: {total_changes} link(s) converted in {files_modified} file(s)")

    if args.dry_run and total_changes > 0:
        print("\nRun without --dry-run to apply changes.")


if __name__ == '__main__':
    main()
