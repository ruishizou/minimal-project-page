import type { AuthorTagDefinition } from "@/types/project-config"

export const DEFAULT_AUTHOR_TAGS: Record<string, AuthorTagDefinition> = {
  "co-first": {
    marker: "*",
    label: "Equal contribution",
  },
  "co-last": {
    marker: "†",
    label: "Co-last authors",
  },
}

export const normalizeTagKey = (tag: string) =>
  tag.trim().toLowerCase().replaceAll("_", "-").replaceAll(" ", "-")

export const getTagMarker = (
  tag: string,
  definitions: Record<string, AuthorTagDefinition> = DEFAULT_AUTHOR_TAGS,
) => {
  const normalized = normalizeTag(tag)
  const definition = definitions[normalized]

  if (definition) {
    return definition.marker
  }

  return tag
}

export const getTagLabel = (
  tag: string,
  definitions: Record<string, AuthorTagDefinition> = DEFAULT_AUTHOR_TAGS,
) => {
  const normalized = normalizeTag(tag)
  const definition = definitions[normalized]

  if (definition) {
    return definition.label
  }

  return tag
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ")
}

const normalizeTag = normalizeTagKey
