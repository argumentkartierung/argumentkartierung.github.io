
# Homepage of the project "Kontroversen begleiten mit Argumentkarten"

This repository contains the source code of the static website for the project "Kontroversen begleiten mit Argumentkarten".

This website is based on the [quarto-course-template](https://github.com/xylomorph/quarto-course-template). You can find further technical details in that repository.

## Overview

This repository contains the source files for the project website. The website (i.e., mainly the corresponding HTML files) is generated with Quarto from plain text source files, which means most content updates can be made without writing code.

The general workflow is simple:

1. Open the page or section you want to edit.
2. Update the text, images, or metadata in the relevant source file.
3. Save the change.
4. Render or preview the site locally if needed.
5. Commit the change and push it to GitHub.

For ordinary content updates, you usually only need to work with Markdown files in the `content/` folder and optionally with images in `assets/images/` or `content/images/`.

## Making Changes

To make changes to the website, you can either use the GitHub web interface or work locally in VS Code. The easiest option for most contributors is the GitHub web interface, since no technical setup is required. If you want to work locally, you can use VS Code that allows you to edit the files, commit them to this repo and preview the site before committing changes.

### Main content locations

Most content is stored in the following places:

- `index.qmd` — homepage
- `content/` — main content pages such as project and imprint pages
- `content/team/` — team-related content and team data
- `assets/images/` — images used across the website
- `_quarto.yml` — site settings and navigation configuration

Important: the generated output in `docs/` is created automatically and should usually not be edited by hand.

### What a non-technical editor usually needs to do

Typical edits include:

- changing text on a page
- adding new paragraphs or sections
- updating team bios or contact details
- replacing images or adding new visual files
- adjusting page titles and metadata

In most cases, the relevant files are Markdown or Quarto files with `.qmd` endings. These are plain text documents and can be edited like any other text file.

### Using the GitHub Web Interface

This is the easiest way to make small content updates without installing anything:

1. Open the repository on GitHub.
2. Navigate to the file you want to change, for example `index.qmd` or a file in `content/`.
3. Click the pencil icon to edit the file.
4. Make your changes directly in the browser.
5. Add a short commit message, for example: "Update project page text".
6. Commit the change to the main branch (which triggers a fresh build of the website) or create a pull request if your workflow requires review.

If you add or replace an image, upload it first to the relevant folder in the repository and then reference it in the page file.

### Using VS Code Locally

If you prefer editing in a local editor, use the following workflow:

1. Clone the repository to your machine.
2. Open the folder in VS Code.
3. Browse to the relevant `.qmd` file in `content/` or the root directory.
4. Edit the text or update image references.
5. Save the file.
6. Optionally, preview the site locally with Quarto if you want to check the result (see [below](#local-rendering) for technical details about the needed setup).
7. Commit your changes and push them back to GitHub (which triggers a fresh build of the website).

For most content work, you do not need to understand the technical build system. If you are editing text only, the important thing is to keep the page structure and file naming consistent.

### Editing conventions

A few practical guidelines:

- Keep page titles and headings clear and consistent.
- Prefer simple Markdown formatting rather than complex HTML unless needed.
- Use relative file paths for images and other local resources.
- Keep files in the same folder structure as the existing site.
- If you are unsure where a page belongs, ask the project maintainer before creating new pages or moving existing ones.

### Team and content data

Some parts of the site may use structured data files such as YAML files. For example, team information may be stored in files under `content/team/`. These are still editable, but changes should match the expected structure of the file.

If you are updating a person’s profile, check the existing team entry first and keep the same field names and layout.

## Rendering the Website

### Server-side Rendering

A GitHub Actions workflow in `.github/workflows/deploy-pages.yml` is included for automatic deployment. When changes are pushed to the repository, the workflow rebuilds and deploys the updated website automatically.

### Local Rendering

To preview changes locally before deployment, you can render the site on your machine.

#### Prerequisites

| Tool | Purpose | Install Command |
|------|---------|----------------|
| [Quarto](https://quarto.org) ≥ 1.5 | Static site generator | [quarto.org/docs/get-started](https://quarto.org/docs/get-started/) |
| TinyTeX | LaTeX distribution for PDF output | `quarto install tinytex` (see below) |
| Python ≥ 3.11 | Course generator CLI | system or [uv](https://docs.astral.sh/uv/) |
| `quarto-coursegen` | Stub generator | `uv tool install quarto-coursegen` |
| Node.js | Argdown pandoc filter | e.g., `nvm install node` |
| [Inkscape](https://inkscape.org) | SVG→PDF conversion | See system dependencies below |

#### Setup Instructions

##### 1. Install TinyTeX (LaTeX Distribution)

TinyTeX is a lightweight, portable LaTeX distribution managed by Quarto. It automatically installs missing LaTeX packages on-demand when rendering documents.

```bash
quarto install tinytex
```

This installs TinyTeX and makes it available to Quarto. When you render documents that require LaTeX packages (like `svg`, `mdframed`, etc.), Quarto will automatically download and install them as needed. No manual package management required.

**Note:** The first PDF render may take longer as packages are installed. Subsequent renders will be faster.

#### 2. Install Node.js Dependencies

Install Argdown and related tools locally:

```bash
npm install
```

This installs the dependencies defined in `package.json`, including:
- `@argdown/cli` — Argdown processor
- `@argdown/pandoc-filter` — Pandoc filter for Argdown rendering
- `@argdown/image-export` — Argdown diagram export

##### 3. Install System Dependencies

**Inkscape** is required for SVG→PDF conversion in the PDF rendering pipeline:

- **Ubuntu/Debian:** `sudo apt install inkscape`
- **macOS:** `brew install --cask inkscape`
- **Other systems:** [Download from inkscape.org](https://inkscape.org/release/)

##### 4. Install Quarto Extensions (Optional)

If the project uses FontAwesome icons (check `_quarto.yml`), install the extension:

```bash
quarto add quarto-ext/fontawesome
```

#### Rendering the Site

To render the entire site:

```bash
quarto render
```

This generates the static website in the `docs/` directory.

To preview the site with live reload during development:

```bash
quarto preview
```

**First Render with TinyTeX:** The first time you render to PDF, TinyTeX will automatically install required LaTeX packages (e.g., `svg`, `mdframed`, `beamer`, etc.). This may take a few minutes. Subsequent renders will be much faster.

#### Troubleshooting

**Missing LaTeX packages:** If you encounter LaTeX errors, TinyTeX should automatically install missing packages. If this fails, you can manually install packages using:

```bash
quarto run tlmgr install <package-name>
```

**Clear cache:** If you experience rendering issues, try clearing the Quarto cache:

```bash
quarto render --cache-refresh
```

## License

The code of this website is licensed under the [MIT License](https://opensource.org/license/MIT) (© 2024 David Löwenstein). Texts and contents on this website are licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).
