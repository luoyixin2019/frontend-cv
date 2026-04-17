---
name: "cv-generator"
description: "Generates an advanced, print-friendly, multi-theme HTML resume based on local markdown files. Invoke when user wants to regenerate, update, or create their resume."
---

# CV Generator

This skill converts a structured set of Markdown files containing resume data into a highly polished, responsive, and print-friendly HTML resume.

## When to Use

Invoke this skill whenever the user asks to:
- "Regenerate my resume"
- "Update my CV based on the latest markdown changes"
- "Create a new HTML resume"
- "Make my resume look like the advanced template"

## File Structure

This skill assumes that resume data is organized in subdirectories under `src/`. Each subdirectory represents one person's resume and must contain:
- `basics.md`: Contains basic info (Name, contact, experience, level, tech stack).
- `education-experience.md`: Contains education history.
- `working-experience.md`: Contains work history.
- `project-experience.md`: Contains project details.

Optionally, each person's directory may also contain a `proj_svg/` subdirectory with pre-existing SVG architecture diagrams for projects.

The skill provides two template files located in its own directory:
- `template/style.css`: Contains the advanced CSS for theming (Bold Signal, Terminal, Editorial) and print (`@media print`).
- `template/script.js`: Contains the JS for theme switching and scroll animations.

## How to Execute

When invoked, perform the following steps:

0. **Confirm Personalization Info:**
   Ask ALL questions in a single AskUserQuestion call so the user fills everything out at once:

   **Question 1 — 数据来源** (header: "数据来源"):
   你希望如何提供简历数据？Options:
   - "直接粘贴" — 在对话中直接粘贴你的简历内容（纯文本、Markdown 等均可）
   - "提供文件路径" — 提供一个本地文件或文件夹路径（支持 .txt、.md、.html 文件，或包含多个 markdown 文件的文件夹）

   **Question 2 — 架构图** (header: "架构图"):
   是否需要为项目经历自动生成架构图？Options:
   - "是，自动生成" — 根据项目经历内容自动生成 SVG 架构图，保存到工作目录的 `proj_svg/` 下，并在 HTML 中通过按钮可查看
   - "否，仅文本" — 不生成架构图，仅使用纯文本展示项目经历

   Remember the user's choices — they determine how source content is obtained and whether SVG generation is needed in subsequent steps.

1. **Obtain the Source Content:**
   Based on the user's answer to Question 1:

   - **If "直接粘贴":** Ask the user to paste their resume content in the chat. The user may paste it all at once or in sections. Once received, parse the content into four logical sections: basics (name, contact, experience, level), education experience, working experience, and project experience. If the pasted content does not clearly separate these sections, infer the structure as best as possible.

   - **If "提供文件路径":** Ask the user to provide the file or folder path. Then:
     - If a **single file** is provided (.txt, .md, .html): Use the Read tool to read it, then parse the content into the four logical sections (basics, education, working, project). If the file is HTML, extract the text content first.
     - If a **folder** is provided: Use the LS tool to list its contents. Look for files matching the conventional names (`basics.md`, `education-experience.md`, `working-experience.md`, `project-experience.md`). Use the Read tool to read each file. If the folder structure differs, read all available files and infer the section mapping from their content.

1.5. **Follow-up: Confirm Diagram Scope (conditional):**
   If the user answered "是，自动生成" to Question 2, you MUST ask a follow-up question via AskUserQuestion to confirm which projects need architecture diagrams:

   - First, extract the list of project names from the project experience content you obtained in Step 1.
   - Then, ask via AskUserQuestion:

   **Question — 生成范围** (header: "生成范围", multiSelect: true):
   以下哪些项目需要生成架构图？(Select all that apply) Options: [List each project name as an option]

   If the user answered "否，仅文本" to Question 2, skip this step entirely.

2. **Read the Templates:**
   Use the Read tool to read `.trae/skills/cv-generator/template/style.css` and `.trae/skills/cv-generator/template/script.js`.

3. **Generate Architecture Diagrams (if requested):**
   If the user answered "是，自动生成" to Question 2, generate SVG architecture diagrams ONLY for the projects the user selected in Step 1.5:

   a. **Analyze each project** in `project-experience.md` and design an appropriate architecture diagram that visualizes the project's technical structure, data flow, or system design. The diagram should capture the key technical decisions and components mentioned in the project description.

   b. **Generate SVG files** following these rules:
      - Each SVG must be a "pure semantic skeleton" — use CSS variables (e.g., `var(--tvc-box1-bg)`, `var(--ta-connector-accent)`) instead of hardcoded colors for fills and strokes, so the diagram adapts to the active theme (`bold-signal`, `terminal-green`, `editorial`).
      - Use semantic CSS class names on SVG elements (e.g., `class="block-user-input"`, `class="arrow-path"`, `class="node-box"`, `class="frame-box"`).
      - Include a `<style>` block inside the SVG that defines CSS variable defaults and per-theme overrides (using `[data-theme="..."]` selectors) to ensure perfect theme adaptation.
      - Use `viewBox` for responsive sizing and set `width="100%"`.
      - Include a decorative label (e.g., `project_name.arch.v1`) in small text at the top.
      - Use `<defs>` for arrow markers and glow filters.
      - The SVG should be visually consistent with the existing diagram style: rounded rect nodes, labeled connections, frame grouping, and emoji icons for nodes.

   c. **Save each SVG** to `src/{chosen_name}/proj_svg/` with a descriptive filename (e.g., `TV_Companion.svg`, `TTLite_Album_Architecture.svg`). Use the Write tool.

4. **Generate the HTML:**
   Parse the markdown content into the appropriate HTML structure. The HTML MUST use the advanced CSS classes and structure (e.g., `theme-switcher`, `reveal` animations, `.project-card`, `.entry`, etc.).

   **CRITICAL STRUCTURAL REQUIREMENTS:**
   - The `.theme-switcher` div MUST include layout buttons for single/double column switching (`<button class="layout-btn active" data-layout="double" title="双列布局">⏛</button>` and `<button class="layout-btn" data-layout="single" title="单列布局">☰</button>`).
   - The entries under "工作经历" and "教育经历" MUST be wrapped in a `<div class="entries-group">` inside their respective `.section` to support flex column/row switching.
   - For `.project-card`, the project title (`h3`) and its associated tag (`.project-tag`) MUST be wrapped in a `<div class="project-title-group">` to ensure they are aligned horizontally.
   - Do NOT generate a "核心技能" section or floating tech stack tags in the header unless explicitly requested, as they have been removed by design.
   - **FOOTER REQUIREMENT**: MUST append a `<footer class="cv-footer">` at the bottom of the page container. It must extract the resume version from the basics.md (e.g., "v0.1"), and include text stating "本简历由 AI Skill 生成".

   **SVG DIAGRAM IN HTML:**
   - If architecture diagrams were generated (Step 3) or pre-existing SVGs were found in `src/{chosen_name}/proj_svg/`, each project card that has an associated diagram MUST include a `<button class="diagram-trigger" data-modal="modal-{project-id}">▸ 架构图</button>` inside the `.project-title-group`.
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
   Write the final HTML to `res/{chosen_name}/resume.html` (create the directory if it doesn't exist).

6. **Notify the User:**
   Provide a brief summary including:
   - A markdown link to the generated file: `[resume.html](file:///absolute/path/to/res/{chosen_name}/resume.html)`
   - Whether architecture diagrams were generated, and if so, their save locations under `src/{chosen_name}/proj_svg/`
   - Note that the file is fully self-contained and ready to be printed or shared
