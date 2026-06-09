## Method

The page loads project metadata from YAML, then fetches each markdown section from `public/sections`. Markdown is rendered through React components, which keeps the visual treatment consistent with the application shell.

| Layer | Responsibility | Source |
| --- | --- | --- |
| Metadata | Project title, authors, awards, links, and citation | `public/config.yaml` |
| Sections | Long-form paper content | `public/sections/*.md` |
| Presentation | Responsive layout, navigation, and controls | `src/App.tsx` |

The implementation avoids raw HTML rendering in markdown. Links, images, tables, headings, and code blocks are mapped to typed React components and styled with Tailwind utility classes.

{{ video: configuration-walkthrough }}

### Section Matching

Each configured section uses its `name` as the markdown filename. For example, `name: "method"` maps to `/sections/method.md`.
