---
name: "frontend-cv"
description: "Generates an advanced, print-friendly, multi-theme HTML resume based on local markdown files. Invoke when user wants to regenerate, update, or create their resume."
---

# Frontend CV

This skill converts a structured set of Markdown files containing resume data into a highly polished, responsive, and print-friendly HTML resume.

## When to Use

Invoke this skill whenever the user asks to:
- "Regenerate my resume"
- "Update my CV based on the latest markdown changes"
- "Create a new HTML resume"
- "Make my resume look like the advanced template"

## File Structure

This skill accepts resume data from two sources (user chooses at runtime):
- **Pasted content:** User directly pastes resume text in the chat.
- **File/folder path:** User provides a path to a `.txt`, `.md`, `.html` file, or a folder containing multiple markdown files (conventionally named `basics.md`, `education-experience.md`, `working-experience.md`, `project-experience.md`).

Regardless of the source, the content is parsed into four logical sections:
- **Basics:** Name, contact, experience, level, tech stack.
- **Education Experience:** Education history.
- **Working Experience:** Work history.
- **Project Experience:** Project details.

The skill provides two template files located in its own directory:
- `template/style.css`: Contains the advanced CSS for theming (Bold Signal, Terminal, Editorial) and print (`@media print`).
- `template/script.js`: Contains the JS for theme switching and scroll animations.

## How to Execute

When invoked, perform the following steps:

0. **Confirm Personalization Info:**
   Ask ALL questions at once (use your agent's interactive question tool if available, otherwise ask in plain text and wait for user response):

   **Question 1 — Data Source** (header: "Data Source"):
   How would you like to provide the resume data? Options:
   - "Direct Paste" — Paste your resume content directly in the chat (plain text, Markdown, etc.)
   - "File/Folder Path" — Provide a local file or folder path (supports .txt, .md, .html files, or a folder containing multiple markdown files)

   **Question 2 — Architecture Diagrams** (header: "Architecture Diagrams"):
   Do you want to automatically generate architecture diagrams for your project experiences? Options:
   - "Yes, auto-generate" — Auto-generate SVG architecture diagrams based on project descriptions, save them to `proj_svg/`, and make them viewable via a button in the HTML
   - "No, text only" — Do not generate diagrams, display projects using text only

   Remember the user's choices — they determine how source content is obtained and whether SVG generation is needed in subsequent steps.

1. **Obtain the Source Content:**
   Based on the user's answer to Question 1:

   - **If "Direct Paste":** Ask the user to paste their resume content in the chat. The user may paste it all at once or in sections. Once received, parse the content into four logical sections: basics (name, contact, experience, level), education experience, working experience, and project experience. If the pasted content does not clearly separate these sections, infer the structure as best as possible.

   - **If "File/Folder Path":** Ask the user to provide the file or folder path. Then:
     - If a **single file** is provided (.txt, .md, .html): Use the Read tool to read it, then parse the content into the four logical sections (basics, education, working, project). If the file is HTML, extract the text content first.
     - If a **folder** is provided: Use the LS tool to list its contents. Look for files matching the conventional names (`basics.md`, `education-experience.md`, `working-experience.md`, `project-experience.md`). Use the Read tool to read each file. If the folder structure differs, read all available files and infer the section mapping from their content.

1.5. **Follow-up: Confirm Diagram Scope (conditional):**
   If the user answered "Yes, auto-generate" to Question 2, you MUST ask a follow-up question to confirm which projects need architecture diagrams (use your agent's interactive question tool if available, otherwise ask in plain text):

   - First, extract the list of project names from the project experience content you obtained in Step 1.
   - Then, ask the user:

   **Question — Generation Scope** (header: "Generation Scope", multiSelect: true):
   Which projects should have architecture diagrams generated? (Select all that apply) Options: [List each project name as an option]

   If the user answered "No, text only" to Question 2, skip this step entirely.

2. **Read the Templates:**
   Use the Read tool to read `template/style.css` and `template/script.js` (relative to this skill's directory).

3. **Generate Architecture Diagrams (if requested):**
   If the user answered "Yes, auto-generate" to Question 2, generate SVG architecture diagrams ONLY for the projects the user selected in Step 1.5:

   a. **Analyze each selected project** from the project experience content obtained in Step 1, and design an appropriate architecture diagram that visualizes the project's technical structure, data flow, or system design. The diagram should capture the key technical decisions and components mentioned in the project description.

   b. **Generate SVG files** following these rules:
      - Each SVG must be a "pure semantic skeleton" — use CSS variables (e.g., `var(--tvc-box1-bg)`, `var(--ta-connector-accent)`) instead of hardcoded colors for fills and strokes, so the diagram adapts to the active theme (`bold-signal`, `terminal-green`, `editorial`).
      - Use semantic CSS class names on SVG elements (e.g., `class="block-user-input"`, `class="arrow-path"`, `class="node-box"`, `class="frame-box"`).
      - Include a `<style>` block inside the SVG that defines CSS variable defaults and per-theme overrides (using `[data-theme="..."]` selectors) to ensure perfect theme adaptation.
      - Use `viewBox` for responsive sizing and set `width="100%"`.
      - Include a decorative label (e.g., `project_name.arch.v1`) in small text at the top.
      - Use `<defs>` for arrow markers and glow filters.
      - The SVG should be visually consistent with the existing diagram style: rounded rect nodes, labeled connections, frame grouping, and emoji icons for nodes.

   c. **Save each SVG** to a `proj_svg/` directory under the workspace root (create if it doesn't exist) with a descriptive filename (e.g., `TV_Companion.svg`, `TTLite_Album_Architecture.svg`). Use the Write tool.

4. **Generate the HTML:**
   Parse the markdown content into the appropriate HTML structure. The HTML MUST use the advanced CSS classes and structure (e.g., `theme-switcher`, `reveal` animations, `.project-card`, `.entry`, etc.).

   **CRITICAL STRUCTURAL REQUIREMENTS:**
   - The `.theme-switcher` div MUST include layout buttons for single/double column switching (`<button class="layout-btn active" data-layout="double" title="Double Column">⏛</button>` and `<button class="layout-btn" data-layout="single" title="Single Column">☰</button>`).
   - The entries under "Working Experience" and "Education Experience" MUST be wrapped in a `<div class="entries-group">` inside their respective `.section` to support flex column/row switching.
   - For `.project-card`, the project title (`h3`) and its associated tag (`.project-tag`) MUST be wrapped in a `<div class="project-title-group">` to ensure they are aligned horizontally.
   - Do NOT generate a "Core Skills" section or floating tech stack tags in the header unless explicitly requested, as they have been removed by design.
   - **FOOTER REQUIREMENT**: MUST append a `<footer class="cv-footer">` at the bottom of the page container. It must extract the resume version from the basics.md (e.g., "v0.1"), and include text stating "Generated by AI Skill".

   **SVG DIAGRAM IN HTML:**
   - If architecture diagrams were generated (Step 3) or pre-existing SVGs were found, each project card that has an associated diagram MUST include a `<button class="diagram-trigger" data-modal="modal-{project-id}">▸ Architecture</button>` inside the `.project-title-group`.
   - For each diagram, generate a `<div class="diagram-modal" id="modal-{project-id}">` at the bottom of the page (before `</main>`). The modal uses a split-view layout:
     - Left side (`.diagram-modal-left`): Clones the project card content for context.
     - Right side (`.diagram-modal-right`): Embeds the full SVG content inline.
   - The SVG embedded in the HTML modal MUST be the complete inline SVG (not an `<img>` reference), so that CSS variable theming works correctly.
   - If no diagram exists for a project, do NOT include the diagram-trigger button.

   **SVG DIAGRAM CSS REQUIREMENT:**
   - When SVG diagrams are present, their per-theme CSS variable definitions MUST be included in the `<style>` block of the HTML (embedded from `style.css` which already contains the SVG adaptation rules for known diagram types).
   - For newly generated diagram types, append their CSS variable definitions (with defaults and per-theme overrides) to the `<style>` block, following the same pattern as the existing SVG adaptation sections in `style.css`.

   **CRITICAL JS/CSS INCLUSION:** Embed the exact contents of `style.css` into a `<style>` tag in the `<head>`, and the exact contents of `script.js` into a `<script>` tag just before the closing `</body>` tag. This ensures the output is a portable, single-file HTML resume without external dependencies.

   **DIAGRAM MODAL JS:** Append the following JS logic inside the `<script>` tag (after the existing script.js content) to handle diagram modal interactions:
   ```js
   document.querySelectorAll('.diagram-trigger').forEach(btn => {
       btn.addEventListener('click', () => {
           const modalId = btn.getAttribute('data-modal');
           const modal = document.getElementById(modalId);
           if (modal) modal.classList.add('active');
       });
   });
   document.querySelectorAll('.diagram-modal').forEach(modal => {
       const closeBtn = modal.querySelector('.diagram-modal-close');
       if (closeBtn) {
           closeBtn.addEventListener('click', () => modal.classList.remove('active'));
       }
       modal.addEventListener('click', (e) => {
           if (e.target === modal) modal.classList.remove('active');
       });
   });
   document.addEventListener('keydown', (e) => {
       if (e.key === 'Escape') {
           document.querySelectorAll('.diagram-modal.active').forEach(m => m.classList.remove('active'));
       }
   });
   ```

5. **Output the Result:**
   Write the final HTML to `res/resume.html` (create the `res/` directory if it doesn't exist).

6. **Notify the User:**
   Provide a brief summary including:
   - A markdown link to the generated file: `[resume.html](file:///absolute/path/to/res/resume.html)`
   - Whether architecture diagrams were generated, and if so, their save locations under `proj_svg/`
   - Note that the file is fully self-contained and ready to be printed or shared
