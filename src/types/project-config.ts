export type ProjectMetadata = {
  title: string
  subtitle: string
  venue: string
  award?: string
  abstract: string
  teaser?: {
    image: string
    alt: string
  }
}

export type Author = {
  name: string
  affiliation: string
  homepage?: string
  tags?: string[]
}

export type AuthorTagDefinition = {
  marker: string
  label: string
}

export type Affiliation = {
  id: string
  name: string
  image?: string
  url?: string
}

export type ProjectLink = {
  label: string
  href?: string
  type: string
  icon?: string
  important?: boolean
  items: ProjectLinkItem[]
}

export type ProjectLinkItem = {
  label: string
  href: string
  icon?: string
  important?: boolean
}

export type ProjectSection = {
  name: string
  title: string
  videos: string[]
}

export type VideoConfig = {
  id: string
  title: string
  provider: "youtube" | "local"
  url: string
  autoplay?: boolean
  hideProgressBar?: boolean
  aspectRatio?: string
}

export type CitationConfig = {
  title?: string
  text?: string
  label: string
  bibtex: string
}

export type ProjectConfig = {
  project: ProjectMetadata
  copyright?: string
  authors: Author[]
  authorTags: Record<string, AuthorTagDefinition>
  affiliations: Affiliation[]
  links: ProjectLink[]
  sections: ProjectSection[]
  videos: VideoConfig[]
  citation?: CitationConfig
}
