[English](./README.md) | 中文

# Frontend CV

一个通用的 AI Agent Skill，基于结构化 Markdown 文件生成高级、打印友好、多主题的 HTML 简历。支持 Trae IDE、Claude Code 及其他 Agent 平台。

https://github.com/user-attachments/assets/f0062090-7405-40eb-aa5a-83fa1028f26f

## 它能做什么

Frontend CV 将一组结构化的 Markdown 文件（或直接粘贴的文本）转换为精致的、响应式的、打印就绪的 HTML 简历 —— 一个完全自包含的单文件，无任何外部依赖。

支持 **3 套精选主题**、项目经历的 **SVG 架构图自动生成**，以及 **单列/双列布局** 一键切换。

### Bold Signal | Editorial | Terminal Green

<p align="center">
  <img src="https://github.com/user-attachments/assets/94bf98a5-e378-4f08-99db-856fb7256481" width="30%" alt="Bold Signal 主题">
  <img src="https://github.com/user-attachments/assets/e371e1e6-b3fe-4e05-98bd-ebc1653bd210" width="30%" alt="Editorial 主题">
  <img src="https://github.com/user-attachments/assets/8d36469b-bdb8-4197-8808-8551d48523f7" width="30%" alt="Terminal Green 主题">
</p>

## 核心特性

- **零依赖** — 单个 HTML 文件，CSS/JS 全部内联。不需要 npm、构建工具或框架。
- **3 套精选主题** — Bold Signal（暗黑高冲击）、Terminal Green（黑客美学）、Editorial（优雅轻盈）。拒绝千篇一律的 AI 审美。
- **SVG 架构图自动生成** — 为项目经历自动生成跟随主题变色的架构图，支持弹窗分屏展示。
- **布局切换** — 单列/双列布局一键切换，适配不同场景。
- **打印就绪** — 专用的 `@media print` 样式，Ctrl+P 即可打印。
- **滚动动画** — 基于 IntersectionObserver 的交错渐入动画。
- **水印防搬运** — URL 加 `#wm=公司名` 即可添加可见水印 + 零宽字符隐写 + HTML 注释标记，三重追踪防护。

## 安装

### Trae IDE

克隆到全局 skills 目录，所有项目均可使用：

```bash
git clone https://github.com/luoyixin2019/frontend-cv.git ~/.trae/skills/frontend-cv
```

或者克隆到项目目录后创建软链接：

```bash
git clone https://github.com/luoyixin2019/frontend-cv.git ~/code/frontend-cv
ln -s ~/code/frontend-cv ~/.trae/skills/frontend-cv
```

然后在 Trae IDE 中输入 `/frontend-cv` 即可调用。

### Claude Code

克隆到 Claude Code 的 skills 目录：

```bash
git clone https://github.com/luoyixin2019/frontend-cv.git ~/.claude/skills/frontend-cv
```

然后在 Claude Code 中输入 `/frontend-cv` 即可调用。

### 其他 AI 编程工具（Cursor、Windsurf 等）

将 `SKILL.md` 和 `template/` 目录复制到你的 Agent 的 skill/rules 目录，然后在配置中引用即可。该 Skill 仅使用相对路径和标准工具描述（Read、Write、LS），因此兼容任何支持文件读写的 Agent。

### 无代码对话式安装（适合非程序员，如 扣子 Coze）

**如果你不懂编程，也没有装过代码编辑器，完全没关系**！你可以只用一句提示词（Prompt），就在扣子（Coze）中打造你的私人简历生成器。

直接把下面这段话复制发送给 Coze：

> “我想生成一份简历。请你读取这个 GitHub 仓库：https://github.com/luoyixin2019/frontend-cv ，学习 `SKILL.md` 里的工作流规则，并使用 `template/` 目录下的代码模板来帮我生成 `resume.html` 文件。以下是我的个人信息……”

只要它读取了仓库代码，就会自动去仓库里“进修”，然后根据你的履历输出一个完美设计的 `.html` 文件，下载双击即可！

## 使用方式

### 从 Markdown 文件生成简历

```
/frontend-cv

> "用 ./src/demo/zh/ 生成我的简历"
```

Skill 将自动：

1. 询问数据来源（直接粘贴 or 文件路径）
2. 询问是否为项目自动生成架构图
3. 解析 Markdown 为结构化段落
4. 生成 SVG 架构图（如需）
5. 输出单文件 HTML 简历，CSS/JS 全部内嵌

### 数据来源

两种方式提供简历数据：

- **直接粘贴** — 在对话中直接粘贴简历文本
- **文件/文件夹路径** — 提供一个 `.txt`、`.md`、`.html` 文件路径，或者包含多个 Markdown 文件的文件夹。AI 会自动读取并整理其中的内容，通常包括：
  - **基础信息** — 姓名、联系方式、工作年限、当前职级、技术栈
  - **教育经历** — 学校、学历、专业、毕业时间
  - **工作经历** — 公司名称、职位、任期、工作职责
  - **项目经历** — 项目描述、业务架构、个人贡献与收益

示例见 `src/demo/zh/` 目录。

## 主题预览

### Bold Signal（默认）

自信、高冲击。暗黑底色配鲜艳橙色强调。锐利直角，无圆角。

### Terminal Green

开发者专属，黑客美学。绿字暗底，虚线边框，等宽字体。

### Editorial

优雅、精致。奶油底色配经典红强调。衬线展示字体，圆角设计。

## 项目结构

该 Skill 使用扁平目录结构 —— 所有文件位于仓库根目录，确保跨 Agent 平台的最大可移植性。

| 文件                 | 用途                                   | 加载时机         |
| -------------------- | -------------------------------------- | ---------------- |
| `SKILL.md`           | 核心工作流与规则                       | 始终（Skill 调用时） |
| `template/style.css` | 主题定义、布局、打印样式、SVG 适配     | 生成阶段         |
| `template/script.js` | 主题/布局切换、滚动动画               | 生成阶段         |

```
frontend-cv/
├── SKILL.md                      # Skill 定义（跨 Agent 通用）
├── template/
│   ├── style.css                 # 全部主题 + 布局 + 打印 + SVG 适配
│   └── script.js                 # 主题/布局切换 + 动画
├── scripts/
│   ├── screenshot.js             # 主题预览截图
│   └── demo-video.js             # 生成演示视频
├── src/
│   └── demo/                     # 示例简历数据
│       ├── en/                   # 英文版示例
│       │   ├── basics.md
│       │   ├── project-experience.md
│       │   └── ...
│       └── zh/                   # 中文版示例
└── res/
    └── demo/                     # 生成输出
        ├── en/resume_en.html
        └── zh/resume_zh.html
```

## 分享简历

生成简历后，你可以通过以下两种简单的方式分享它：

### 1. 打印并导出为 PDF

点击简历 **右上角的“打印”按钮** （或按 `Ctrl+P`）。
简历内置了专门的 `@media print` 样式，能够确保排版完美，自动隐藏交互按钮，并生成一份干净无暇的 PDF 文档。
*注：为了获得最佳效果，请在浏览器的打印设置中将“边距”设为无，并勾选“背景图形”。*

### 2. 直接分享 HTML 单文件

Frontend CV 的核心理念是 **“100% 自包含的单文件”** （所有的 CSS、JS 逻辑、以及生成的 SVG 架构图都已经被完全内联）。
所以你不需要打包任何资源文件夹，直接把 `resume.html` 文件通过微信、邮件发给面试官或 HR，对方双击即可在任何设备上离线打开这个完整、交互式的网页简历。

## 设计理念

- **单文件，零维护。** 一个自包含的 HTML 网页是简历的终极形态。相比 Word 简历，它永远不会因为接收方用了不同版本的 WPS 而导致排版错乱和乱码；相比死板的 PDF 简历，它能承载丝滑的滚动动画、能弹出交互式的架构图，甚至能在单双列布局间一键切换。最重要的是，无论十年后的浏览器怎么变，它双击打开依然完美。
- **靠直觉选设计，而非描述。** 一键切换主题，选感觉对的那一个。
- **架构图胜千言。** 一张精心制作的 SVG 架构图比大段文字更有说服力。
- **打印不是事后补丁。** 简历就是要打印的。专用打印样式确保输出干净。
- **跨 Agent 通用设计。** 无硬编码路径，无平台特定工具。到处都能用。

## 环境要求

- 支持 skill 文件的 AI Agent（Trae IDE、Claude Code、Cursor 等）

## 许可证

MIT — 随便用，随便改，随便分享。
