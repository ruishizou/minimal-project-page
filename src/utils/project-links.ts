import type { ProjectLink } from "@/types/project-config"

export type ImportantProjectLink = {
  label: string
  href: string
}

export const getProjectLinkKey = (link: ProjectLink) =>
  `${link.type}:${link.href ?? link.label}`

export const getImportantProjectLinks = (
  links: ProjectLink[],
): ImportantProjectLink[] =>
  links.flatMap((link) => {
    const importantLinks: ImportantProjectLink[] = []

    if (link.important && link.href) {
      importantLinks.push({
        label: link.label,
        href: link.href,
      })
    }

    importantLinks.push(
      ...link.items
        .filter((item) => link.important || item.important)
        .map((item) => ({
          label: item.label,
          href: item.href,
        })),
    )

    return importantLinks
  })
