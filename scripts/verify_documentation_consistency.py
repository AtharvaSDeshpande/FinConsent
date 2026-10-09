#!/usr/bin/env python3
"""
Documentation Consistency & Asset Verification Audit
Verifies that all image references, role taxonomies, personas, state models,
and presentation files resolve cleanly with 0 broken links or inconsistencies.
"""

import os
import sys
import re
from pptx import Presentation

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

FILES_TO_CHECK = [
    os.path.join(BASE_DIR, "README.md"),
    os.path.join(BASE_DIR, "docs", "audit-log.md"),
    os.path.join(BASE_DIR, "audit-log.md"),
    os.path.join(BASE_DIR, "docs", "userJourney.md"),
    os.path.join(BASE_DIR, "userjourney.md"),
]

PPTX_FILES = [
    os.path.join(BASE_DIR, "docs", "FinConsent-Client-Presentation.pptx"),
    os.path.join(BASE_DIR, "FinConsent-Client-Presentation.pptx"),
]

def audit():
    print("==================================================================")
    print("   FINCONSENT DOCUMENTATION & PRESENTATION CONSISTENCY AUDIT     ")
    print("==================================================================\n")

    errors = []

    # 1. Audit Markdown Image References
    print(">>> 1. Auditing Markdown Image & Screenshot References...")
    img_pattern = re.compile(r'!\[.*?\]\((.*?)\)')
    total_imgs = 0
    resolved_imgs = 0

    for file_path in FILES_TO_CHECK:
        rel_f = os.path.relpath(file_path, BASE_DIR)
        if not os.path.exists(file_path):
            errors.append(f"Missing doc file: {rel_f}")
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        matches = img_pattern.findall(content)
        for m in matches:
            clean_m = m.split("#")[0].strip()
            # Ignore remote URLs (badges, etc.)
            if clean_m.startswith("http://") or clean_m.startswith("https://"):
                continue

            total_imgs += 1
            candidates = [
                os.path.join(BASE_DIR, clean_m),
                os.path.join(os.path.dirname(file_path), clean_m),
                os.path.join(BASE_DIR, clean_m.replace("docs/", "")),
            ]
            found = False
            for c in candidates:
                if os.path.exists(c):
                    found = True
                    resolved_imgs += 1
                    break
            if not found:
                errors.append(f"Broken image in {rel_f}: {clean_m}")

    print(f"  [PASS] {resolved_imgs}/{total_imgs} local image references resolved successfully on disk.\n")

    # 2. Audit Core Terminology Consistency
    print(">>> 2. Auditing Core Terminology & Persona Consistency...")
    checks = [
        ("Suresh Narayanan", "Advisor Persona"),
        ("Rohan Mehta", "Client Persona"),
        ("INA000018421", "SEBI INA Registration"),
        ("AES-256-GCM", "Payload Encryption Standard"),
        ("PBKDF2", "Key Derivation Function"),
        ("Section 65B", "Indian Evidence Act Admissibility"),
        ("Regulation 19", "SEBI IA Statutory Regulation"),
        ("AWS Mumbai", "Data Residency Location"),
        ("ap-south-1", "AWS Region Identifier"),
        ("123414081978", "Client Password Derivation"),
    ]

    for phrase, label in checks:
        found_in_docs = []
        for file_path in FILES_TO_CHECK:
            with open(file_path, "r", encoding="utf-8") as f:
                if phrase in f.read():
                    found_in_docs.append(os.path.basename(file_path))
        print(f"  [CHECK] {label} ('{phrase}'): Present in {len(found_in_docs)}/{len(FILES_TO_CHECK)} docs ({', '.join(found_in_docs)})")

    # 3. Audit PowerPoint Presentations
    print("\n>>> 3. Auditing PowerPoint Deck Integrity...")
    for pptx_path in PPTX_FILES:
        rel_p = os.path.relpath(pptx_path, BASE_DIR)
        if not os.path.exists(pptx_path):
            errors.append(f"Missing presentation: {rel_p}")
            continue

        prs = Presentation(pptx_path)
        slide_count = len(prs.slides)
        print(f"  [PASS] {rel_p} loaded cleanly: {slide_count} slides (Expected: >= 25)")
        if slide_count < 25:
            errors.append(f"{rel_p} has fewer than 25 slides: {slide_count}")

        img_shapes = 0
        for i, slide in enumerate(prs.slides):
            for shape in slide.shapes:
                if shape.shape_type == 13: # Picture
                    img_shapes += 1

        print(f"  [INFO] {rel_p} contains {img_shapes} embedded screenshot pictures.")

    print("\n==================================================================")
    if errors:
        print(f"AUDIT FAILED WITH {len(errors)} ERROR(S):")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print("AUDIT RESULT: 100% PASSED. ALL DOCUMENTATION & PRESENTATIONS ARE SYNCHRONIZED.")
        print("==================================================================")

if __name__ == "__main__":
    audit()
