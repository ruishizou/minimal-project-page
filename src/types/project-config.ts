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
  items: ProjectLinkItem[]
}

export type ProjectLinkItem = {
  label: string
  href: string
  icon?: string
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
  authors: Author[]
  affiliations: Affiliation[]
  links: ProjectLink[]
  sections: ProjectSection[]
  videos: VideoConfig[]
  citation?: CitationConfig
}
