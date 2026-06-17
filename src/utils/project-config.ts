import { parse } from "yaml"

import type {
  Affiliation,
  Author,
  CitationConfig,
  ProjectConfig,
  ProjectLink,
  ProjectLinkItem,
  ProjectSection,
  VideoConfig,
} from "@/types/project-config"

type LinkDefaults = {
  label: string
  type: string
}

const DEFAULT_LINKS: LinkDefaults[] = [
  { label: "Paper", type: "paper" },
  { label: "Preprint", type: "preprint" },
  { label: "Code", type: "code" },
  { label: "Prototypes", type: "prototypes" },
]

export const loadProjectConfig = async (): Promise<ProjectConfig> => {
  const response = await fetch("/config.yaml")

  if (!response.ok) {
    throw new Error("Unable to load public/config.yaml")
  }

  return normalizeProjectConfig(parse(await response.text()))
}

export const loadProjectSections = async (
  config: ProjectConfig,
): Promise<Record<string, string>> => {
  const entries = await Promise.all(
    config.sections.map(async (section) => {
      const response = await fetch(
        `/sections/${encodeURIComponent(section.name)}.md`,
      )

      if (!response.ok) {
        throw new Error(
          `Unable to load public/sections/${section.name}.md`,
        )
      }

      return [section.name, await response.text()] as const
    }),
  )

  return Object.fromEntries(entries)
}

const normalizeProjectConfig = (input: unknown): ProjectConfig => {
  const root = requireRecord(input, "config")
  const project = requireRecord(root.project, "project")
  const teaser = optionalRecord(project.teaser)
  const video = optionalRecord(root.video)
  const citation = optionalRecord(root.citation)
  const videos = normalizeVideos(root.videos, video)

  return {
    project: {
      title: requireString(project.title, "project.title"),
      subtitle: requireString(project.subtitle, "project.subtitle"),
      venue: requireString(project.venue, "project.venue"),
      award: optionalString(project.award),
      abstract: requireString(project.abstract, "project.abstract"),
      teaser: teaser
        ? {
            image: requireString(teaser.image, "project.teaser.image"),
            alt: requireString(teaser.alt, "project.teaser.alt"),
          }
        : undefined,
    },
    authors: normalizeAuthors(root.authors),
    affiliations: normalizeAffiliations(root.affiliations),
    links: normalizeLinks(root.links),
    sections: normalizeSections(root.sections),
    videos,
    citation: citation ? normalizeCitation(citation) : undefined,
  }
}

const normalizeAuthors = (input: unknown): Author[] =>
  requireArray(input, "authors").map((item, index) => {
    const author = requireRecord(item, `authors[${index}]`)

    return {
      name: requireString(author.name, `authors[${index}].name`),
      affiliation: requireString(
        author.affiliation,
        `authors[${index}].affiliation`,
      ),
      homepage: optionalString(author.homepage),
      tags: mergeTags(
        optionalStringList(author.tags, `authors[${index}].tags`),
        optionalStringList(author.tag, `authors[${index}].tag`),
      ),
    }
  })

const normalizeAffiliations = (input: unknown): Affiliation[] =>
  requireArray(input, "affiliations").map((item, index) => {
    const affiliation = requireRecord(item, `affiliations[${index}]`)

    return {
      id: requireString(affiliation.id, `affiliations[${index}].id`),
      name: requireString(affiliation.name, `affiliations[${index}].name`),
      image: optionalString(affiliation.image),
      url: optionalString(affiliation.url),
    }
  })

const normalizeLinks = (input: unknown): ProjectLink[] => {
  if (Array.isArray(input)) {
    return input.map((item, index) =>
      normalizeLink(requireRecord(item, `links[${index}]`), `links[${index}]`),
    )
  }

  const links = requireRecord(input, "links")
  const normalizedLinks: ProjectLink[] = []

  for (const defaultLink of DEFAULT_LINKS) {
    const value = links[defaultLink.type]

    if (value === undefined || value === null) {
      continue
    }

    normalizedLinks.push(
      normalizeLink(value, `links.${defaultLink.type}`, defaultLink),
    )
  }

  const extras = links.extras ?? links.extra

  normalizedLinks.push(
    ...optionalArray(extras, "links.extras").map((item, index) =>
      normalizeLink(item, `links.extras[${index}]`, {
        label: "",
        type: "extra",
      }),
    ),
  )

  if (normalizedLinks.length === 0) {
    throw new Error("links must define at least one link")
  }

  return normalizedLinks
}

const normalizeLink = (
  input: unknown,
  fieldName: string,
  defaults?: LinkDefaults,
): ProjectLink => {
  if (typeof input === "string") {
    if (!defaults) {
      throw new Error(`${fieldName}.label must be a non-empty string`)
    }

    return {
      label: defaults.label,
      href: requireString(input, fieldName),
      type: defaults.type,
      items: [],
    }
  }

  if (Array.isArray(input)) {
    return {
      label: defaults?.label ?? "Links",
      type: defaults?.type ?? "extra",
      items: normalizeLinkItems(input, fieldName),
    }
  }

  const link = requireRecord(input, fieldName)
  const label =
    optionalString(link.label) ??
    defaults?.label ??
    requireString(link.label, `${fieldName}.label`)
  const items = normalizeLinkItems(
    link.items ?? link.links,
    `${fieldName}.items`,
  )
  const href = optionalString(link.href)

  if (!href && items.length === 0) {
    throw new Error(`${fieldName} must define href or items`)
  }

  return {
    label,
    href,
    type: optionalString(link.type) ?? defaults?.type ?? normalizeLinkType(label),
    icon: optionalString(link.icon),
    items,
  }
}

const normalizeLinkItems = (
  input: unknown,
  fieldName: string,
): ProjectLinkItem[] =>
  optionalArray(input, fieldName).map((item, index) => {
    if (typeof item === "string") {
      return {
        label: `Link ${index + 1}`,
        href: requireString(item, `${fieldName}[${index}]`),
      }
    }

    const linkItem = requireRecord(item, `${fieldName}[${index}]`)

    return {
      label: requireString(linkItem.label, `${fieldName}[${index}].label`),
      href: requireString(linkItem.href, `${fieldName}[${index}].href`),
      icon: optionalString(linkItem.icon),
    }
  })

const normalizeLinkType = (label: string): string =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const normalizeSections = (input: unknown): ProjectSection[] =>
  requireArray(input, "sections").map((item, index) => {
    const section = requireRecord(item, `sections[${index}]`)

    return {
      name: requireString(section.name, `sections[${index}].name`),
      title: requireString(section.title, `sections[${index}].title`),
      videos:
        mergeStringLists(
          optionalStringList(section.videos, `sections[${index}].videos`),
          optionalStringList(section.video, `sections[${index}].video`),
        ) ?? [],
    }
  })

const normalizeVideos = (
  input: unknown,
  legacyVideo?: Record<string, unknown>,
): VideoConfig[] => {
  const videos = optionalArray(input, "videos").map((item, index) =>
    normalizeVideo(requireRecord(item, `videos[${index}]`), `videos[${index}]`),
  )

  if (legacyVideo) {
    videos.push(normalizeVideo(legacyVideo, "video", "project-video"))
  }

  const ids = new Set<string>()

  for (const video of videos) {
    if (ids.has(video.id)) {
      throw new Error(`Duplicate video id "${video.id}"`)
    }

    ids.add(video.id)
  }

  return videos
}

const normalizeVideo = (
  video: Record<string, unknown>,
  fieldName: string,
  fallbackId?: string,
): VideoConfig => {
  const provider = requireString(video.provider, `${fieldName}.provider`)

  if (provider !== "youtube" && provider !== "local") {
    throw new Error(
      `${fieldName}.provider must be either 'youtube' or 'local'`,
    )
  }

  const url = normalizeVideoUrl(video, fieldName, provider)

  return {
    id:
      optionalString(video.id) ??
      fallbackId ??
      requireString(video.id, `${fieldName}.id`),
    title: requireString(video.title, `${fieldName}.title`),
    provider,
    url,
    autoplay: optionalBoolean(video.autoplay),
    hideProgressBar:
      optionalBoolean(video.hideProgressBar) ??
      optionalBoolean(video.hide_progress_bar),
    aspectRatio:
      normalizeAspectRatio(video.aspectRatio, `${fieldName}.aspectRatio`) ??
      normalizeAspectRatio(video.aspect_ratio, `${fieldName}.aspect_ratio`),
  }
}

const normalizeAspectRatio = (
  input: unknown,
  fieldName: string,
): string | undefined => {
  if (input === undefined || input === null) {
    return undefined
  }

  const value =
    typeof input === "number" ? String(input) : requireString(input, fieldName)
  const normalizedValue = value
    .replace(":", "/")
    .replace(/\s*\/\s*/g, " / ")

  if (/^\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?$/.test(normalizedValue)) {
    return normalizedValue
  }

  throw new Error(
    `${fieldName} must be a number or ratio string like "16/9"`,
  )
}

const normalizeVideoUrl = (
  video: Record<string, unknown>,
  fieldName: string,
  provider: string,
): string => {
  const url = optionalString(video.url)
  const file = optionalString(video.file)

  if (provider === "local") {
    return resolveLocalVideoUrl(
      file ?? url ?? requireString(video.url, `${fieldName}.url`),
    )
  }

  return requireString(video.url, `${fieldName}.url`)
}

const resolveLocalVideoUrl = (input: string): string => {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(input)) {
    return input
  }

  const filename = input.replace(/^\.?\/*/, "").replace(/^videos\//, "")

  return `/videos/${filename}`
}

const normalizeCitation = (
  citation: Record<string, unknown>,
): CitationConfig => ({
  title: optionalString(citation.title),
  text: optionalString(citation.text),
  label: requireString(citation.label, "citation.label"),
  bibtex: requireString(citation.bibtex, "citation.bibtex"),
})

const requireRecord = (
  input: unknown,
  fieldName: string,
): Record<string, unknown> => {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return input as Record<string, unknown>
  }

  throw new Error(`${fieldName} must be an object`)
}

const optionalRecord = (input: unknown): Record<string, unknown> | undefined => {
  if (input === undefined || input === null) {
    return undefined
  }

  return requireRecord(input, "optional config block")
}

const requireArray = (input: unknown, fieldName: string): unknown[] => {
  if (Array.isArray(input) && input.length > 0) {
    return input
  }

  throw new Error(`${fieldName} must be a non-empty array`)
}

const optionalArray = (input: unknown, fieldName: string): unknown[] => {
  if (input === undefined || input === null) {
    return []
  }

  if (Array.isArray(input)) {
    return input
  }

  throw new Error(`${fieldName} must be an array`)
}

const optionalString = (input: unknown): string | undefined =>
  typeof input === "string" && input.trim().length > 0
    ? input.trim()
    : undefined

const optionalBoolean = (input: unknown): boolean | undefined =>
  typeof input === "boolean" ? input : undefined

const optionalStringList = (
  input: unknown,
  fieldName: string,
): string[] | undefined => {
  if (input === undefined || input === null) {
    return undefined
  }

  if (typeof input === "string") {
    return [requireString(input, fieldName)]
  }

  if (!Array.isArray(input)) {
    throw new Error(`${fieldName} must be a string or an array of strings`)
  }

  const tags = input.map((item, index) =>
    requireString(item, `${fieldName}[${index}]`),
  )

  return tags.length > 0 ? tags : undefined
}

const mergeTags = (
  ...tagGroups: Array<string[] | undefined>
): string[] | undefined => mergeStringLists(...tagGroups)

const mergeStringLists = (
  ...tagGroups: Array<string[] | undefined>
): string[] | undefined => {
  const tags = tagGroups.flatMap((group) => group ?? [])

  return tags.length > 0 ? Array.from(new Set(tags)) : undefined
}

const requireString = (input: unknown, fieldName: string): string => {
  const value = optionalString(input)

  if (!value) {
    throw new Error(`${fieldName} must be a non-empty string`)
  }

  return value
}
