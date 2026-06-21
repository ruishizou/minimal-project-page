import type {
  ProjectLink,
  ProjectLinkItem,
} from "@/types/project-config"
import {
  optionalArray,
  optionalBoolean,
  optionalString,
  requireRecord,
  requireString,
} from "@/utils/project-config-guards"

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

export const normalizeLinks = (input: unknown): ProjectLink[] => {
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
      important: false,
      items: [],
    }
  }

  if (Array.isArray(input)) {
    return {
      label: defaults?.label ?? "Links",
      type: defaults?.type ?? "extra",
      important: false,
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
    important: optionalBoolean(link.important) ?? false,
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
      important: optionalBoolean(linkItem.important) ?? false,
    }
  })

const normalizeLinkType = (label: string): string =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
