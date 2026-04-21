English | [中文](./README_CN.md)

# Frontend CV

A universal AI agent skill for generating advanced, print-friendly, multi-theme HTML resumes from structured Markdown files. Works with Trae IDE, Claude Code, and other agent platforms.

https://github.com/user-attachments/assets/de22aed7-0187-4213-83d0-a3f8182fae12

## What This Does

Frontend CV converts a set of structured Markdown files (or pasted text) into a polished, responsive, and print-ready HTML resume — a single self-contained file with no external dependencies.

It supports **3 distinctive themes**, **auto-generated SVG architecture diagrams** for project experience, and **single/double column layout** switching.

### Bold Signal | Editorial | Terminal Green

<p align="center">
  <img src="https://github.com/user-attachments/assets/9a87ab23-b432-477a-af54-49bd07a629d7" width="30%" alt="Bold Signal Theme">
  <img src="https://github.com/user-attachments/assets/de1e856a-2265-458b-a5dd-29d8704e3280" width="30%" alt="Editorial Theme">
  <img src="https://github.com/user-attachments/assets/9452222a-24f1-489b-bf4b-790e55b3282e" width="30%" alt="Terminal Green Theme">
</p>

## Key Features

- **Zero Dependencies** — Single HTML file with inline CSS/JS. No npm, no build tools, no frameworks.
- **3 Curated Themes** — Bold Signal (dark, high-impact), Terminal Green (hacker aesthetic), Editorial (elegant, light). No generic AI aesthetics.
- **SVG Architecture Diagrams** — Auto-generate theme-adaptive architecture diagrams for project experience, with modal split-view display.
- **Layout Switching** — Toggle between single-column and double-column layouts with one click.
- **Print-Ready** — Dedicated `@media print` styles. Just hit Ctrl+P.
- **Scroll Animations** — Staggered reveal animations via IntersectionObserver.

## Installation

### For Trae IDE

Clone to the global skills directory so the skill is available across all projects:

```bash
git clone https://github.com/luoyixin2019/frontend-cv.git ~/.trae/skills/frontend-cv
```

Or clone as a project and create a symlink:

```bash
git clone https://github.com/luoyixin2019/frontend-cv.git ~/code/frontend-cv
ln -s ~/code/frontend-cv ~/.trae/skills/frontend-cv
```

Then invoke it by typing `/frontend-cv` in Trae IDE.

### For Claude Code

Clone to the Claude Code skills directory:

```bash
git clone https://github.com/luoyixin2019/frontend-cv.git ~/.claude/skills/frontend-cv
```

Then invoke it by typing `/frontend-cv` in Claude Code.

### Other AI Coding Agents (Cursor, Windsurf, etc.)

Copy the `SKILL.md` and `template/` directory to your agent's custom rules/skills folder, and reference them in your prompts. The skill uses only relative paths and standard tool descriptions, making it compatible with any agent that supports file reading/writing.

### No-Code Conversational Setup (Coze)

**For Non-Programmers:** You don't need a coding IDE to use this! You can use Coze to build your personal resume generator with just one prompt.

Just copy and paste this into the Coze chat:

> "I want to create a resume. Please act as the resume generator defined in this GitHub repository: https://github.com/luoyixin2019/frontend-cv. Read its SKILL.md for your behavior rules, and use the files in its `template/` directory to generate my `resume.html`. Here is my personal information..."

The AI will read the repository, process your information, and output a complete, beautifully designed `resume.html` file for you to download.

## Usage

### Generate a Resume from Markdown Files

```
/frontend-cv

> "Generate my resume from ./src/demo/en/"
```

The skill will:

1. Ask how you want to provide data (paste or file path)
2. Ask whether to auto-generate architecture diagrams for projects
3. Parse your Markdown into structured sections
4. Generate SVG diagrams (if requested)
5. Produce a single-file HTML resume with all CSS/JS embedded

### Data Source

Provide resume data in one of two ways:

- **Paste content** — Directly paste resume text in the chat
- **File/folder path** — Provide a path to a `.txt`, `.md`, `.html` file, or a folder containing multiple markdown files. The AI will automatically read and organize the contents, which typically include:
  - **Basics** — Name, contact, years of experience, current level, tech stack
  - **Education** — Degrees, schools, graduation years
  - **Work Experience** — Companies, roles, durations, and achievements
  - **Project Experience** — Key projects, architecture, and personal contributions

See `src/demo/en/` for an example.

## Included Themes

### Bold Signal (Default)

Confident, high-impact. Vivid orange accent on dark background. Sharp edges, no border-radius.

### Terminal Green

Developer-focused, hacker aesthetic. Green-on-dark with dashed borders and monospace fonts.

### Editorial

Elegant, sophisticated. Cream background with classic red accent. Serif display font, rounded corners.

## Architecture

This skill uses a flat directory structure — all skill files are at the repository root for maximum portability across agent platforms.

| File                 | Purpose                                                 | Loaded When               |
| -------------------- | ------------------------------------------------------- | ------------------------- |
| `SKILL.md`           | Core workflow and rules                                 | Always (skill invocation) |
| `template/style.css` | Theme definitions, layout, print styles, SVG adaptation | Generation phase          |
| `template/script.js` | Theme/layout switching, scroll animations               | Generation phase          |

```
frontend-cv/
├── SKILL.md                      # Skill definition (agent-agnostic)
├── template/
│   ├── style.css                 # All themes + layout + print + SVG adaptation
│   └── script.js                 # Theme/layout switcher + animations
├── scripts/
│   ├── screenshot.js             # Capture theme preview screenshots
│   └── demo-video.js             # Generate demo videos
├── src/
│   └── demo/                     # Example resume data
│       ├── en/                   # English demo
│       │   ├── basics.md
│       │   ├── project-experience.md
│       │   └── ...
│       └── zh/                   # Chinese demo
└── res/
    └── demo/                     # Generated outputs
        ├── en/resume_en.html
        └── zh/resume_zh.html
```

## Sharing Your Resume

After generating your resume, you have two simple ways to share it:

### 1. Print to PDF

Just click the **"Print" button in the top right corner** of the resume (or press `Ctrl+P`). 
The resume includes dedicated `@media print` styles to ensure perfect layout, automatically hide interactive buttons, and produce a clean PDF document.
*Note: For best results, set Margins to "None" and check "Background graphics" in your print dialog.*

### 2. Share the HTML File Directly

Because Frontend CV generates a **100% self-contained HTML file** (with all CSS, JS, and SVG diagrams embedded inline), you can simply send the `resume.html` file to anyone via email or chat. They can double-click it to view the fully interactive resume in any browser, offline. No folders, no assets to attach.

## Philosophy

- **Single file, zero maintenance.** A self-contained HTML file is the ultimate resume format. Unlike a Word document, its layout will never break when opened on different devices. Unlike a static PDF, it supports interactive layouts, scroll animations, and modal architecture diagrams. And best of all, it will still render perfectly in any browser 10 years from now.
- **Design by reaction, not description.** Switch themes with one click and pick what feels right.
- **Architecture diagrams tell the story.** A well-crafted SVG diagram communicates more than paragraphs of text.
- **Print is not an afterthought.** Resumes are meant to be printed. Dedicated print styles ensure clean output.
- **Agent-agnostic by design.** No hardcoded paths, no platform-specific tooling. Works everywhere.

## Requirements

- An AI agent that supports skill files (Trae IDE, Claude Code, Cursor, etc.)

## License

MIT — Use it, modify it, share it.
