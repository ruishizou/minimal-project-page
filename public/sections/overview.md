## Overview

This template builds a compact academic project page from one YAML file and a small set of markdown sections. Start with `public/config.yaml`, then replace the demo metadata with the title, author list, affiliations, artifact links, media, and citation for your project.

Each item in `sections` maps to a markdown file in `public/sections`. For example, this section is configured as `name: "overview"`, so the page loads `public/sections/overview.md`.

### Template Workflow

1. Update the `project` block with the page title, abstract, award, and teaser image.
2. Add authors and affiliations, including optional homepages and affiliation logos.
3. Configure external links such as paper, preprint, code, prototypes, datasets, or DOI pages.
4. Write the long-form page content in markdown files under `public/sections`.
5. Add videos and the BibTeX citation only when the project needs them.

The left navigation is generated from the configured sections and the headings inside each markdown file, so you can reorganize the page by editing content rather than touching React code.
