import type { PageTrackerItem } from "@/components/on-this-page-tracker"
import type { ProjectConfig } from "@/types/project-config"

export type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

type TrackedMarkdownHeading = {
  id?: string
  label: string
  level: MarkdownHeadingLevel
}

export const getPageTrackerItems = (
  config: ProjectConfig,
  markdown: Record<string, string>,
): PageTrackerItem[] => {
  const items = config.sections.flatMap((section) => [
    {
      id: section.name,
      label: section.title,
      depth: 0,
    } satisfies PageTrackerItem,
    ...getMarkdownHeadingItems(markdown[section.name] ?? "", section.name),
  ])

  if (config.citation) {
    items.push({
      id: "citation",
      label: "Citation",
      depth: 0,
    })
  }

  return items
}

export const getTrackedMarkdownHeadings = (
  source: string,
  sectionId: string,
): TrackedMarkdownHeading[] => {
  const headingCounts = new Map<string, number>()

  return getMarkdownHeadings(source).map((heading, index) => ({
    ...heading,
    id:
      index === 0
        ? undefined
        : createTrackedHeadingId(sectionId, heading.label, headingCounts),
  }))
}

const getMarkdownHeadingItems = (
  source: string,
  sectionId: string,
) => {
  const headings = getTrackedMarkdownHeadings(source, sectionId)

  if (headings.length <= 1) {
    return []
  }

  const baseLevel = headings[0].level

  return headings.slice(1).flatMap((heading) =>
    heading.id
      ? [
          {
            id: heading.id,
            label: heading.label,
            depth: getHeadingDepth(heading.level, baseLevel),
          },
        ]
      : [],
  )
}

const getMarkdownHeadings = (source: string) => {
  const headings: TrackedMarkdownHeading[] = []
  let isInCodeFence = false

  for (const line of source.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      isInCodeFence = !isInCodeFence
      continue
    }

    if (isInCodeFence) {
      continue
    }

    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line)

    if (!match) {
      continue
    }

    const label = cleanHeadingText(match[2])

    if (!label) {
      continue
    }

    headings.push({
      level: match[1].length as MarkdownHeadingLevel,
      label,
    })
  }

  return headings
}

const getHeadingDepth = (
  level: MarkdownHeadingLevel,
  baseLevel: MarkdownHeadingLevel,
) =>
  Math.min(
    Math.max(level - baseLevel, 0),
    3,
  ) as PageTrackerItem["depth"]

const createTrackedHeadingId = (
  sectionId: string,
  label: string,
  headingCounts: Map<string, number>,
) => {
  const slug = slugifyHeading(label)
  const count = (headingCounts.get(slug) ?? 0) + 1

  headingCounts.set(slug, count)

  return `${sectionId}-${slug}${count > 1 ? `-${count}` : ""}`
}

const cleanHeadingText = (input: string) =>
  input
    .replace(/\s+#+\s*$/, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .trim()

const slugifyHeading = (input: string) =>
  cleanHeadingText(input)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section"
