#!/bin/bash
# Script to create GitHub issues for VISIONFLOW project using GitHub CLI
# 
# Prerequisites:
#   - GitHub CLI installed (https://cli.github.com/)
#   - Authenticated with: gh auth login
#
# Usage:
#   chmod +x create_issues.sh
#   ./create_issues.sh

set -e  # Exit on error

REPO="GabrielaMoretti/VISIONFLOW"
ISSUES_DIR=".github/issues"

echo "========================================"
echo "VISIONFLOW - GitHub Issues Creator (CLI)"
echo "========================================"
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

echo "Step 1: Creating labels..."
echo ""

# Function to create label (ignore if exists)
create_label() {
    local name=$1
    local color=$2
    local description=$3
    
    if gh label create "$name" --color "$color" --description "$description" --repo "$REPO" 2>/dev/null; then
        echo "✓ Created label: $name"
    else
        echo "  Label already exists: $name"
    fi
}

# Create layer labels
create_label "camada-1-core" "0052CC" "Layer 1: Core Engine"
create_label "camada-2-color" "00AA00" "Layer 2: Color Flow Engine"
create_label "camada-3-lenses" "FFD700" "Layer 3: Lens Simulation"
create_label "camada-4-ia" "FF8800" "Layer 4: IA Processing"
create_label "camada-5-campaign" "DD0000" "Layer 5: Campaign Management"
create_label "camada-6-ux" "8800DD" "Layer 6: UX/UI"

# Create priority labels
create_label "priority-high" "B60205" "High priority"
create_label "priority-medium" "FFA500" "Medium priority"
create_label "priority-low" "90EE90" "Low priority"

# Create type labels
create_label "feature" "84B6EB" "New feature"
create_label "setup" "CCCCCC" "Project setup"
create_label "bug" "EE0000" "Bug or error"
create_label "documentation" "0E8A16" "Documentation"

echo ""
echo "Step 2: Creating issues..."
echo ""

# Function to create issue
create_issue() {
    local title=$1
    local file=$2
    local labels=$3
    
    if [ ! -f "$ISSUES_DIR/$file" ]; then
        echo "✗ File not found: $ISSUES_DIR/$file"
        return 1
    fi
    
    local issue_number=$(gh issue create \
        --title "$title" \
        --body-file "$ISSUES_DIR/$file" \
        --label "$labels" \
        --repo "$REPO" 2>&1 | grep -oP '(?<=issues/)\d+')
    
    if [ -n "$issue_number" ]; then
        echo "✓ Created issue #$issue_number: $title"
        return 0
    else
        echo "✗ Failed to create issue: $title"
        return 1
    fi
}

# Create all issues
CREATED=0
TOTAL=10

# Issue 1
if create_issue \
    "Setup do Projeto - Frontend Next.js + Backend FastAPI" \
    "issue-01-setup-projeto.md" \
    "setup,camada-1-core,priority-high"; then
    ((CREATED++))
fi

# Issue 2
if create_issue \
    "Image Loader - Upload e Visualização de Imagens" \
    "issue-02-image-loader.md" \
    "feature,camada-1-core,priority-high"; then
    ((CREATED++))
fi

# Issue 3
if create_issue \
    "Canvas Editor - Fabric.js Integration" \
    "issue-03-canvas-editor.md" \
    "feature,camada-1-core,priority-high"; then
    ((CREATED++))
fi

# Issue 4
if create_issue \
    "Layer System - Sistema de Camadas Não-Destrutivo" \
    "issue-04-layer-system.md" \
    "feature,camada-1-core,priority-medium"; then
    ((CREATED++))
fi

# Issue 5
if create_issue \
    "Export Engine - Exportação de Imagens" \
    "issue-05-export-engine.md" \
    "feature,camada-1-core,priority-medium"; then
    ((CREATED++))
fi

# Issue 6
if create_issue \
    "History & Undo/Redo System" \
    "issue-06-history-undo-redo.md" \
    "feature,camada-1-core,priority-low"; then
    ((CREATED++))
fi

# Issue 7
if create_issue \
    "Palette Extractor - Extração de Cores Dominantes" \
    "issue-07-palette-extractor.md" \
    "feature,camada-2-color,priority-medium"; then
    ((CREATED++))
fi

# Issue 8
if create_issue \
    "Tone Mapping - Controle de Shadows/Midtones/Highlights" \
    "issue-08-tone-mapping.md" \
    "feature,camada-2-color,priority-medium"; then
    ((CREATED++))
fi

# Issue 9
if create_issue \
    "HSL Adjustments - Controle de Hue/Saturation/Lightness" \
    "issue-09-hsl-adjustments.md" \
    "feature,camada-2-color,priority-low"; then
    ((CREATED++))
fi

# Issue 10
if create_issue \
    "LUT System - Lookup Tables para Color Grading" \
    "issue-10-lut-system.md" \
    "feature,camada-2-color,priority-low"; then
    ((CREATED++))
fi

echo ""
echo "========================================"
echo "Summary: Created $CREATED / $TOTAL issues"
echo "========================================"
echo ""

if [ $CREATED -eq $TOTAL ]; then
    echo "✓ All issues created successfully!"
else
    echo "⚠ Some issues were not created. Check errors above."
fi

echo ""
echo "View issues at:"
echo "https://github.com/$REPO/issues"
echo ""
