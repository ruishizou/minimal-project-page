## Results

Markdown sections can combine prose, images, tables, links, code, and video directives. This makes the template useful for project pages that need to explain a paper, demo, dataset, or reproducible artifact without adding custom React components.

### Images

Place images under `public/images` and reference them from markdown with a root-relative path:

```md
![GistVis interface overview](/images/gistvis.jpg)
```

To render an image at 80% width with a caption, add `#width=80` or `#width=80%` to the image URL and put the caption in the markdown image title:

```md
![GistVis interface overview](/images/gistvis.jpg#width=80 "Figure 1. GistVis interface overview rendered as an 80% width figure.")
```

![GistVis interface overview](/images/gistvis.jpg#width=80 "Figure 1. GistVis interface overview rendered as an 80% width figure.")

Standalone images render as figures with square edges. If an image is colocated with a section, relative paths are also supported.

### Code Blocks

Use fenced code blocks for commands, snippets, configuration, or pseudocode:

```tsx
type ArtifactLink = {
  label: string
  href: string
}
```

Inline code such as `public/config.yaml` is styled consistently with the rest of the document.

### Tables And Lists

GitHub-flavored markdown tables are supported for compact comparisons:

| Element | Where To Configure | Rendered As |
| --- | --- | --- |
| Project metadata | `public/config.yaml` | Header and link buttons |
| Long-form content | `public/sections/*.md` | Article sections |
| Local media | `public/images` and `public/videos` | Figures |

Use lists for workflows, requirements, or artifact checklists. The page navigation automatically tracks section headings, so each `##` and `###` heading becomes part of the reading structure.
