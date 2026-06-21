import type {
  Affiliation,
  Author,
  AuthorTagDefinition,
  CitationConfig,
  ProjectConfig,
  ProjectSection,
} from "@/types/project-config"
import {
  DEFAULT_AUTHOR_TAGS,
  normalizeTagKey,
} from "@/utils/author-tags"
import {
  mergeStringLists,
  optionalRecord,
  optionalString,
  optionalStringList,
  requireArray,
  requireRecord,
  requireString,
} from "@/utils/project-config-guards"
import { normalizeLinks } from "@/utils/project-config-links"
import { normalizeVideos } from "@/utils/project-config-videos"

export const normalizeProjectConfig = (input: unknown): ProjectConfig => {
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
    copyright: optionalString(root.copyright),
    authors: normalizeAuthors(root.authors),
    authorTags: normalizeAuthorTags(root.authorTags ?? root.author_tags),
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
      tags: mergeStringLists(
        optionalStringList(author.tags, `authors[${index}].tags`),
        optionalStringList(author.tag, `authors[${index}].tag`),
      ),
    }
  })

const normalizeAuthorTags = (
  input: unknown,
): Record<string, AuthorTagDefinition> => {
  if (input === undefined || input === null) {
    return DEFAULT_AUTHOR_TAGS
  }

  const tags = requireRecord(input, "authorTags")
  const normalizedTags: Record<string, AuthorTagDefinition> = {
    ...DEFAULT_AUTHOR_TAGS,
  }

  for (const [key, value] of Object.entries(tags)) {
    const tag = requireRecord(value, `authorTags.${key}`)

    normalizedTags[normalizeTagKey(key)] = {
      marker: requireString(tag.marker, `authorTags.${key}.marker`),
      label: requireString(tag.label, `authorTags.${key}.label`),
    }
  }

  return normalizedTags
}

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

const normalizeCitation = (
  citation: Record<string, unknown>,
): CitationConfig => ({
  title: optionalString(citation.title),
  text: optionalString(citation.text),
  label: requireString(citation.label, "citation.label"),
  bibtex: requireString(citation.bibtex, "citation.bibtex"),
})
