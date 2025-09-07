#!/usr/bin/env python3
import os
import re
import json
from html import unescape

ROOT = os.getcwd()
CONTENT_PAGES_DIR = os.path.join(ROOT, 'content', 'pages')

FONTS_BLOCK = (
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600&family=Noto+Serif:wght@700&display=swap&subset=latin-ext" rel="stylesheet">'
)

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def get_root_html_files():
    return [f for f in os.listdir(ROOT) if f.endswith('.html') and os.path.isfile(os.path.join(ROOT, f))]

def slug_from_filename(filename: str) -> str:
    return os.path.splitext(os.path.basename(filename))[0]

def extract_title(html: str, default: str) -> str:
    m = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    if m:
        return unescape(re.sub(r'\s+', ' ', m.group(1)).strip())
    return default

def extract_first_h1_text(html: str) -> str:
    m = re.search(r'<h1\b[^>]*>(.*?)</h1>', html, re.IGNORECASE | re.DOTALL)
    if m:
        txt = re.sub('<[^<]+?>', ' ', m.group(1))
        return re.sub(r'\s+', ' ', unescape(txt)).strip()
    return ''

def extract_first_p_after_first_h1_text(html: str) -> str:
    h1 = re.search(r'<h1\b[^>]*>', html, re.IGNORECASE)
    if not h1:
        return ''
    idx = h1.end()
    m = re.search(r'<p\b[^>]*>(.*?)</p>', html[idx:], re.IGNORECASE | re.DOTALL)
    if m:
        txt = re.sub('<[^<]+?>', ' ', m.group(1))
        return re.sub(r'\s+', ' ', unescape(txt)).strip()
    return ''

def create_page_json_if_missing(slug: str, html_text: str):
    ensure_dir(CONTENT_PAGES_DIR)
    json_path = os.path.join(CONTENT_PAGES_DIR, f'{slug}.json')
    if os.path.exists(json_path):
        return False
    data = {
        'title': extract_title(html_text, slug),
        'heroHeading': extract_first_h1_text(html_text),
        'heroSubheading': extract_first_p_after_first_h1_text(html_text)
    }
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return True

def ensure_html_lang_lv(html: str) -> str:
    if re.search(r'<html\b[^>]*\blang=\"lv\"', html, re.IGNORECASE):
        return html
    if re.search(r'<html\b[^>]*\blang=\"', html, re.IGNORECASE):
        # replace existing lang
        return re.sub(r'(<html\b[^>]*\blang=)\".*?\"', r'\1"lv"', html, count=1, flags=re.IGNORECASE)
    # add lang attribute to <html>
    return re.sub(r'<html(\b[^>]*)?>', lambda m: '<html lang="lv"{}>'.format(m.group(1) if m.group(1) else ''), html, count=1, flags=re.IGNORECASE)

def ensure_meta_charset_first_in_head(html: str) -> str:
    # Find <head> ... </head>
    m = re.search(r'<head\b[^>]*>(.*?)</head>', html, re.IGNORECASE | re.DOTALL)
    if not m:
        return html
    head_inner = m.group(1)
    # Remove any leading whitespace/newlines
    head_inner_stripped = head_inner.lstrip()
    changed = False
    if not re.match(r'^<meta\s+charset=\"utf-8\"\s*/?>', head_inner_stripped, re.IGNORECASE):
        # Remove existing meta charset if exists (we will insert a correct one at the top)
        head_inner_no_old = re.sub(r'<meta\s+charset=\".*?\"\s*/?>\s*', '', head_inner, flags=re.IGNORECASE)
        head_inner = '<meta charset="utf-8">\n' + head_inner_no_old.lstrip()
        changed = True
    if changed:
        start, end = m.span(1)
        html = html[:start] + head_inner + html[end:]
    return html

def ensure_fonts_links(html: str) -> str:
    if 'fonts.googleapis.com/css2?family=Noto+Sans' in html and 'fonts.gstatic.com' in html:
        return html
    # Insert before the first stylesheet link in head
    def repl(match):
        inner = match.group(1)
        # place fonts block before the first <link rel="stylesheet">
        parts = inner.split('\n')
        inserted = False
        out_lines = []
        for line in parts:
            if (not inserted) and re.search(r'<link\s+rel=\"stylesheet\"', line):
                out_lines.append(FONTS_BLOCK)
                inserted = True
            out_lines.append(line)
        if not inserted:
            out_lines.insert(0, FONTS_BLOCK)
        return '<head>' + '\n'.join(out_lines) + '</head>'
    html2 = re.sub(r'<head\b[^>]*>(.*?)</head>', repl, html, count=1, flags=re.IGNORECASE | re.DOTALL)
    return html2

def add_field_attr_to_first_h1_and_p(html: str) -> str:
    # First H1
    h1m = re.search(r'<h1\b[^>]*>', html, re.IGNORECASE)
    if not h1m:
        return html
    h1_start, h1_end = h1m.span()
    h1_tag = h1m.group(0)
    if 'data-sb-field-path=' not in h1_tag:
        # insert before closing '>'
        h1_tag_new = re.sub(r'>$', ' data-sb-field-path="heroHeading">', h1_tag)
        html = html[:h1_start] + h1_tag_new + html[h1_end:]
        # adjust indices after replacement
        delta = len(h1_tag_new) - len(h1_tag)
        h1_end += delta
    # Now find first <p> after this h1
    pm = re.search(r'<p\b[^>]*>', html[h1_end:], re.IGNORECASE)
    if pm:
        p_start = h1_end + pm.start()
        p_end = h1_end + pm.end()
        p_tag = pm.group(0)
        if 'data-sb-field-path=' not in p_tag:
            p_tag_new = re.sub(r'>$', ' data-sb-field-path="heroSubheading">', p_tag)
            html = html[:p_start] + p_tag_new + html[p_end:]
            # no need to adjust further indices since we are done
    return html

def wrap_hero_with_object(html: str, slug: str) -> str:
    marker = f'data-sb-object-id="content/pages/{slug}.json"'
    if marker in html:
        return html
    # Find first H1 and first P after it
    h1m = re.search(r'<h1\b[^>]*>', html, re.IGNORECASE)
    if not h1m:
        return html
    h1_start = h1m.start()
    h1_end = h1m.end()
    pm = re.search(r'<p\b[^>]*>', html[h1_end:], re.IGNORECASE)
    wrap_start = h1_start
    wrap_end = None
    if pm:
        p_open_start = h1_end + pm.start()
        p_close = re.search(r'</p\s*>', html[p_open_start:], re.IGNORECASE)
        if p_close:
            wrap_end = p_open_start + p_close.end()
    if wrap_end is None:
        # wrap only the <h1> element
        # find closing tag of h1
        h1_close = re.search(r'</h1\s*>', html[h1_end:], re.IGNORECASE)
        if not h1_close:
            return html
        wrap_end = h1_end + h1_close.end()
    open_div = f'<div {marker}>'
    close_div = '</div>'
    return html[:wrap_start] + open_div + html[wrap_start:wrap_end] + close_div + html[wrap_end:]

def process_html_file(path: str):
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    slug = slug_from_filename(path)
    # Create JSON if missing (based on current HTML)
    create_page_json_if_missing(slug, html)

    # Ensure html lang
    html2 = ensure_html_lang_lv(html)
    # Ensure meta charset at top of head
    html2 = ensure_meta_charset_first_in_head(html2)
    # Ensure fonts links
    html2 = ensure_fonts_links(html2)
    # Add field attributes
    html2 = add_field_attr_to_first_h1_and_p(html2)
    # Wrap hero content
    html2 = wrap_hero_with_object(html2, slug)

    if html2 != html:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html2)

def main():
    ensure_dir(CONTENT_PAGES_DIR)
    for fname in get_root_html_files():
        process_html_file(os.path.join(ROOT, fname))

if __name__ == '__main__':
    main()

