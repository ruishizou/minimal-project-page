# Minimal Academic Folio

## Features

- Single-page application with header, footer and automatic page grid
- Navigation bar that includes the document structure and external links
- Main content that corresponds to the navigation bar
- Clean typography that uses original HTML headers for accessibility
- Configurable project metadata:
  - Project title & subtitle
  - Authors & Affiliations (with options to add logo of the affiliation) & optional link to author homepage
  - Research links (PDF, DOI, supplemental, etc.)
  - Award information
- Configurable sections that reads from a markdown file with presanitation
- Video embed section that allows youtube link embed and local video embed.
- Citation section that allows copy pasting bib item.

## Video Embeds

Define reusable videos in `public/config.yaml`:

```yaml
videos:
  - id: "project-presentation"
    title: "Project Presentation"
    provider: "youtube"
    url: "https://www.youtube.com/embed/ysz5S6PUM-U"
  - id: "demo"
    title: "Demo"
    provider: "local"
    url: "/videos/demo.mp4"
```

Insert one or more videos after a configured section:

```yaml
sections:
  - name: "overview"
    title: "Overview"
    videos:
      - "project-presentation"
```

Insert a video inline inside a markdown file by placing this on its own line:

```md
{{ video: project-presentation }}
```

## Link Buttons

Define research links in `public/config.yaml`. The standard slots get default Lucide icons automatically: `paper`, `preprint`, `code`, and `prototypes`.

```yaml
links:
  paper:
    href: "https://example.com/paper.pdf"
  preprint:
    href: "https://example.com/preprint.pdf"
  code:
    href: "https://github.com/example/project"
  prototypes:
    items:
      - label: "Interactive Demo"
        href: "https://example.com/demo"
      - label: "Artifact Browser"
        href: "https://example.com/artifacts"
```

Add extra links with `extras`. The `icon` value should match an exported icon name from `lucide-react`.

```yaml
links:
  extras:
    - label: "Dataset"
      href: "https://example.com/dataset"
      icon: "Database"
    - label: "DOI"
      href: "https://doi.org/10.0000/example"
      icon: "BadgeCheck"
```

## Constraints

- The project metadata come from public/config.yaml. This link to the sections.
- The section markdowns in public/sections folder. The match is determined by section name = markdown file name
- The markdowns should support image embed.

## Development

Use UI libraries and icon libraries whenever possible. Do not rewrite components. Refer to:
- shadcn (https://ui.shadcn.com/docs/components) for components. Do not change anything in folder @/components/ui. For personalized components, create it under @/components.
- lucide-react (https://lucide.dev/guide/react/) for icons

You should use tailwindcss to style everything. 

## Inspiration

This project is inspired by [orderedlist/minimal](https://github.com/orderedlist/minimal) and [ritesh-kanchi/axya](https://github.com/ritesh-kanchi/axya).
