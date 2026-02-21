#!/usr/bin/env python3
"""
Script to automatically create GitHub issues for VISIONFLOW project.
Uses GitHub API to create structured issues from markdown files.

Usage:
    export GITHUB_TOKEN="your_github_token"
    python create_issues.py

Requirements:
    pip install requests
"""

import os
import sys
import json
import requests
from pathlib import Path

# Configuration
REPO_OWNER = "GabrielaMoretti"
REPO_NAME = "VISIONFLOW"
GITHUB_API = "https://api.github.com"
ISSUES_DIR = Path(__file__).parent / "issues"

# Issue metadata (title, labels, milestone)
ISSUE_METADATA = [
    {
        "file": "issue-01-setup-projeto.md",
        "title": "Setup do Projeto - Frontend Next.js + Backend FastAPI",
        "labels": ["setup", "camada-1-core", "priority-high"],
        "milestone": None,
    },
    {
        "file": "issue-02-image-loader.md",
        "title": "Image Loader - Upload e Visualização de Imagens",
        "labels": ["feature", "camada-1-core", "priority-high"],
        "milestone": None,
    },
    {
        "file": "issue-03-canvas-editor.md",
        "title": "Canvas Editor - Fabric.js Integration",
        "labels": ["feature", "camada-1-core", "priority-high"],
        "milestone": None,
    },
    {
        "file": "issue-04-layer-system.md",
        "title": "Layer System - Sistema de Camadas Não-Destrutivo",
        "labels": ["feature", "camada-1-core", "priority-medium"],
        "milestone": None,
    },
    {
        "file": "issue-05-export-engine.md",
        "title": "Export Engine - Exportação de Imagens",
        "labels": ["feature", "camada-1-core", "priority-medium"],
        "milestone": None,
    },
    {
        "file": "issue-06-history-undo-redo.md",
        "title": "History & Undo/Redo System",
        "labels": ["feature", "camada-1-core", "priority-low"],
        "milestone": None,
    },
    {
        "file": "issue-07-palette-extractor.md",
        "title": "Palette Extractor - Extração de Cores Dominantes",
        "labels": ["feature", "camada-2-color", "priority-medium"],
        "milestone": None,
    },
    {
        "file": "issue-08-tone-mapping.md",
        "title": "Tone Mapping - Controle de Shadows/Midtones/Highlights",
        "labels": ["feature", "camada-2-color", "priority-medium"],
        "milestone": None,
    },
    {
        "file": "issue-09-hsl-adjustments.md",
        "title": "HSL Adjustments - Controle de Hue/Saturation/Lightness",
        "labels": ["feature", "camada-2-color", "priority-low"],
        "milestone": None,
    },
    {
        "file": "issue-10-lut-system.md",
        "title": "LUT System - Lookup Tables para Color Grading",
        "labels": ["feature", "camada-2-color", "priority-low"],
        "milestone": None,
    },
]


def get_github_token():
    """Get GitHub token from environment variable."""
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        print("Error: GITHUB_TOKEN environment variable not set")
        print("Please set it with: export GITHUB_TOKEN='your_token'")
        sys.exit(1)
    return token


def read_issue_body(filename):
    """Read issue body from markdown file."""
    filepath = ISSUES_DIR / filename
    if not filepath.exists():
        print(f"Warning: File {filepath} not found")
        return None
    
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()


def create_issue(token, title, body, labels):
    """Create a GitHub issue via API."""
    url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}/issues"
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    
    data = {
        "title": title,
        "body": body,
        "labels": labels,
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        issue_data = response.json()
        print(f"✓ Created issue #{issue_data['number']}: {title}")
        return issue_data
    else:
        print(f"✗ Failed to create issue: {title}")
        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.text}")
        return None


def create_labels(token):
    """Create labels if they don't exist."""
    url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}/labels"
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    
    # Label definitions (name, color, description)
    labels = [
        # Camadas
        ("camada-1-core", "0052CC", "Layer 1: Core Engine"),
        ("camada-2-color", "00AA00", "Layer 2: Color Flow Engine"),
        ("camada-3-lenses", "FFD700", "Layer 3: Lens Simulation"),
        ("camada-4-ia", "FF8800", "Layer 4: IA Processing"),
        ("camada-5-campaign", "DD0000", "Layer 5: Campaign Management"),
        ("camada-6-ux", "8800DD", "Layer 6: UX/UI"),
        
        # Prioridade
        ("priority-high", "B60205", "High priority"),
        ("priority-medium", "FFA500", "Medium priority"),
        ("priority-low", "90EE90", "Low priority"),
        
        # Tipo
        ("feature", "84B6EB", "New feature"),
        ("setup", "CCCCCC", "Project setup"),
        ("bug", "EE0000", "Bug or error"),
        ("documentation", "0E8A16", "Documentation"),
    ]
    
    for name, color, description in labels:
        data = {
            "name": name,
            "color": color,
            "description": description,
        }
        
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 201:
            print(f"✓ Created label: {name}")
        elif response.status_code == 422:
            # Label already exists
            print(f"  Label already exists: {name}")
        else:
            print(f"✗ Failed to create label: {name} ({response.status_code})")


def main():
    """Main function to create all issues."""
    print("=" * 60)
    print("VISIONFLOW - GitHub Issues Creator")
    print("=" * 60)
    print()
    
    token = get_github_token()
    
    # Step 1: Create labels
    print("Step 1: Creating labels...")
    create_labels(token)
    print()
    
    # Step 2: Create issues
    print("Step 2: Creating issues...")
    created_issues = []
    
    for metadata in ISSUE_METADATA:
        title = metadata["title"]
        labels = metadata["labels"]
        body = read_issue_body(metadata["file"])
        
        if body is None:
            continue
        
        issue = create_issue(token, title, body, labels)
        if issue:
            created_issues.append(issue)
    
    print()
    print("=" * 60)
    print(f"Summary: Created {len(created_issues)} / {len(ISSUE_METADATA)} issues")
    print("=" * 60)
    print()
    
    if created_issues:
        print("Created issues:")
        for issue in created_issues:
            print(f"  #{issue['number']}: {issue['title']}")
            print(f"    {issue['html_url']}")
    
    print()
    print("Done! Visit your repository to see the issues:")
    print(f"https://github.com/{REPO_OWNER}/{REPO_NAME}/issues")


if __name__ == "__main__":
    main()
