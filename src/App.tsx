import {
  Fragment,
  isValidElement,
  memo,
  useEffect,
  useMemo,
  useState,
} from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Award,
  Check,
  ChevronDown,
  Clipboard,
  Code as CodeIcon,
  Database,
  ExternalLink,
  FilePenLine,
  FileText,
  Link as LinkIcon,
  Microscope,
} from "lucide-react"
import {
  DynamicIcon,
  iconNames,
  type IconName,
} from "lucide-react/dynamic"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  OnThisPageTracker,
  type PageTrackerItem,
} from "@/components/on-this-page-tracker"
import {
  loadProjectConfig,
  loadProjectSections,
} from "@/utils/project-config"
import { cn } from "@/lib/utils"
import type {
  Affiliation,
  Author,
  CitationConfig,
  ProjectConfig,
  ProjectLink,
  ProjectLinkItem,
  VideoConfig,
} from "@/types/project-config"

import "./App.css"

type AppState =
  | { status: "loading" }
  | {
      status: "ready"
      config: ProjectConfig
      markdown: Record<string, string>
    }
  | { status: "error"; message: string }

function App() {
  const [state, setState] = useState<AppState>({ status: "loading" })
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadContent() {
      try {
        const config = await loadProjectConfig()
        const markdown = await loadProjectSections(config)

        if (isMounted) {
          setState({ status: "ready", config, markdown })
        }
      } catch (error) {
        if (isMounted) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unable to load project content",
          })
        }
      }
    }

    void loadContent()

    return () => {
      isMounted = false
    }
  }, [])

  const pageTrackerItems = useMemo(() => {
    if (state.status !== "ready") {
      return []
    }

    return getPageTrackerItems(state.config, state.markdown)
  }, [state])

  if (state.status === "loading") {
    return <LoadingPage />
  }

  if (state.status === "error") {
    return <ErrorPage message={state.message} />
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col bg-background text-muted-foreground md:flex-row">
      <OnThisPageTracker
        title={state.config.project.title}
        items={pageTrackerItems}
        footer={<CopyrightLine config={state.config} />}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
        onNavigate={() => setIsMenuOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <main className="w-full flex-1 p-4 md:p-8">
          <HomeHeader config={state.config} />
          <ArticleContent
            config={state.config}
            markdown={state.markdown}
          />
        </main>
      </div>
    </div>
  )
}

function LoadingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-sm text-muted-foreground">
      Loading project configuration...
    </main>
  )
}

function ErrorPage({ message }: { message: string }) {
  return (
    <main className="mx-auto grid min-h-screen max-w-2xl place-items-center bg-background p-6">
      <section className="w-full rounded-lg border bg-card p-5">
        <h1 className="text-lg font-semibold text-foreground">
          Project content could not be loaded
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </section>
    </main>
  )
}

function HomeHeader({ config }: { config: ProjectConfig }) {
  const affiliationsById = useMemo(() => {
    return new Map(
      config.affiliations.map((affiliation) => [
        affiliation.id,
        affiliation,
      ]),
    )
  }, [config.affiliations])

  const affiliationNumbers = useMemo(() => {
    return new Map(
      config.affiliations.map((affiliation, index) => [
        affiliation.id,
        index + 1,
      ]),
    )
  }, [config.affiliations])

  const headerLinks = useMemo(() => {
    const links: ProjectLink[] = [...config.links]

    return links
  }, [config.links])

  return (
    <header
      id="home-header"
      className={
        config.project.award
          ? "pb-10 pt-16 md:pt-0"
          : "pb-10 pt-16 md:pt-8"
      }
    >
      {config.project.award ? <AwardLine award={config.project.award} /> : null}

      <h1 className="mb-4 max-w-5xl text-balance text-3xl font-semibold leading-tight text-foreground">
        {config.project.title}
      </h1>

      <AuthorLine
        authors={config.authors}
        affiliationsById={affiliationsById}
        affiliationNumbers={affiliationNumbers}
      />

      <AffiliationList affiliations={config.affiliations} />
      <ContributionNotes authors={config.authors} />
      <TeaserImage teaser={config.project.teaser} />

      <ul className="flex flex-wrap items-center gap-3">
        {headerLinks.map((link) => (
          <li key={getProjectLinkKey(link)}>
            <ProjectLinkControl link={link} />
          </li>
        ))}
      </ul>
    </header>
  )
}

function ProjectLinkControl({ link }: { link: ProjectLink }) {
  if (link.items.length > 0) {
    return <ProjectLinkMenu link={link} />
  }

  if (!link.href) {
    return null
  }

  return (
    <Button
      asChild
      variant="outline"
      size="lg"
      className="h-9 rounded-md bg-background px-3 text-foreground shadow-sm"
    >
      <a href={link.href} target="_blank" rel="noreferrer">
        <ProjectLinkIcon link={link} className="size-4" />
        {link.label}
      </a>
    </Button>
  )
}

function ProjectLinkMenu({ link }: { link: ProjectLink }) {
  return (
    <details className="group relative">
      <summary
        className={cn(
          buttonVariants({
            variant: "outline",
            size: "lg",
            className:
              "h-9 cursor-pointer rounded-md bg-background px-3 text-foreground shadow-sm",
          }),
          "list-none [&::-webkit-details-marker]:hidden",
        )}
      >
        <ProjectLinkIcon link={link} className="size-4" />
        {link.label}
        <ChevronDown
          data-icon="inline-end"
          className="size-4 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div className="absolute left-0 z-30 mt-2 min-w-52 rounded-md border bg-background p-1 shadow-lg">
        {link.items.map((item) => {
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-foreground no-underline hover:bg-muted"
            >
              <ProjectLinkItemIcon
                item={item}
                link={link}
                className="size-4 text-muted-foreground"
              />
              {item.label}
            </a>
          )
        })}
      </div>
    </details>
  )
}

function ProjectLinkIcon({
  link,
  className,
}: {
  link: Pick<ProjectLink, "icon" | "type">
  className?: string
}) {
  const dynamicIconName = getDynamicIconName(link.icon)

  if (dynamicIconName) {
    return (
      <DynamicIcon
        name={dynamicIconName}
        className={className}
        aria-hidden="true"
      />
    )
  }

  return <DefaultProjectLinkIcon type={link.type} className={className} />
}

function ProjectLinkItemIcon({
  item,
  link,
  className,
}: {
  item: ProjectLinkItem
  link: ProjectLink
  className?: string
}) {
  return (
    <ProjectLinkIcon
      link={{ type: link.type, icon: item.icon ?? link.icon }}
      className={className}
    />
  )
}

function DefaultProjectLinkIcon({
  type,
  className,
}: {
  type: string
  className?: string
}) {
  const normalizedType = type.toLowerCase()

  if (["paper", "pdf"].includes(normalizedType)) {
    return <FileText className={className} aria-hidden="true" />
  }

  if (normalizedType === "preprint") {
    return <FilePenLine className={className} aria-hidden="true" />
  }

  if (["code", "github"].includes(normalizedType)) {
    return <CodeIcon className={className} aria-hidden="true" />
  }

  if (["prototype", "prototypes"].includes(normalizedType)) {
    return <Microscope className={className} aria-hidden="true" />
  }

  if (["data", "dataset"].includes(normalizedType)) {
    return <Database className={className} aria-hidden="true" />
  }

  if (normalizedType === "doi") {
    return <ExternalLink className={className} aria-hidden="true" />
  }

  return <LinkIcon className={className} aria-hidden="true" />
}

const DYNAMIC_ICON_NAMES = new Set<string>(iconNames)

function getDynamicIconName(iconName?: string): IconName | undefined {
  const trimmedName = iconName?.trim()

  if (!trimmedName) {
    return undefined
  }

  const normalizedName = trimmedName
    .replace(/^Lucide/, "")
    .replace(/Icon$/, "")

  const candidates = [
    normalizedName,
    normalizedName.toLowerCase(),
    normalizedName
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase(),
  ]

  return candidates.find((candidate): candidate is IconName =>
    DYNAMIC_ICON_NAMES.has(candidate),
  )
}

function getProjectLinkKey(link: ProjectLink) {
  return `${link.type}:${link.href ?? link.label}`
}

function AuthorLine({
  authors,
  affiliationsById,
  affiliationNumbers,
}: {
  authors: Author[]
  affiliationsById: Map<string, Affiliation>
  affiliationNumbers: Map<string, number>
}) {
  return (
    <p className="mb-2 max-w-4xl text-left text-base leading-7 text-muted-foreground">
      {authors.map((author, index) => {
        const affiliation = affiliationsById.get(author.affiliation)
        const affiliationNumber = affiliationNumbers.get(author.affiliation)
        const markers = [
          affiliationNumber?.toString(),
          ...(author.tags?.map((tag) => getTagMarker(tag)) ?? []),
        ].filter(Boolean)
        const delimiter = index < authors.length - 1 ? ", " : ""

        return (
          <Fragment key={author.name}>
            <span
              title={affiliation?.name}
              className="inline whitespace-nowrap"
            >
              {author.homepage ? (
                <a
                  href={author.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-foreground underline"
                >
                  {author.name}
                </a>
              ) : (
                <span className="font-medium text-foreground">
                  {author.name}
                </span>
              )}
              {markers.length > 0 ? (
                <sup className="ml-0.5 align-super text-[0.65em] font-medium leading-none text-muted-foreground">
                  {markers.join("")}
                </sup>
              ) : null}
            </span>
            {delimiter}
          </Fragment>
        )
      })}
    </p>
  )
}

function AffiliationList({ affiliations }: { affiliations: Affiliation[] }) {
  return (
    <ul className="m-0 mb-2 flex max-w-6xl list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-left text-sm leading-6 text-muted-foreground">
      {affiliations.map((affiliation, index) => (
        <li key={affiliation.id} className="min-w-0">
          <AffiliationItem affiliation={affiliation} number={index + 1} />
        </li>
      ))}
    </ul>
  )
}

function AffiliationItem({
  affiliation,
  number,
}: {
  affiliation: Affiliation
  number: number
}) {
  const name = affiliation.url ? (
    <a
      href={affiliation.url}
      target="_blank"
      rel="noreferrer"
      className="min-w-0 text-muted-foreground no-underline hover:text-foreground hover:underline"
    >
      {affiliation.name}
    </a>
  ) : (
    <span className="min-w-0">{affiliation.name}</span>
  )

  return (
    <span className="inline-grid min-w-0 grid-cols-[auto_1.25rem_auto] items-center gap-x-1.5 whitespace-nowrap">
      <sup className="text-[0.68rem] leading-none text-muted-foreground">
        {number}
      </sup>
      {affiliation.image ? (
        <img
          src={affiliation.image}
          alt=""
          className="size-5 shrink-0 rounded-full object-contain"
        />
      ) : (
        <span className="size-5" aria-hidden="true" />
      )}
      {name}
    </span>
  )
}

function ContributionNotes({ authors }: { authors: Author[] }) {
  const tags = Array.from(
    new Set(authors.flatMap((author) => author.tags ?? [])),
  )

  if (tags.length === 0) {
    return null
  }

  return (
    <ul className="m-0 mb-2 mt-1 list-none p-0 text-left text-xs leading-5 text-muted-foreground">
      {tags.map((tag) => (
        <li key={tag}>
          <sup className="mr-1 align-super text-[0.68rem]">
            {getTagMarker(tag)}
          </sup>
          {getTagLabel(tag)}
        </li>
      ))}
    </ul>
  )
}

function AwardLine({ award }: { award: string }) {
  return (
    <p className="mb-3 flex w-fit items-center gap-1.5 text-left text-sm font-medium leading-5 text-orange-600">
      <Award className="size-4" />
      {award}
    </p>
  )
}

function TeaserImage({
  teaser,
}: {
  teaser: ProjectConfig["project"]["teaser"]
}) {
  if (!teaser) {
    return null
  }

  return (
    <figure className="my-6 max-w-4xl">
      <img
        src={teaser.image}
        alt={teaser.alt}
        className="block h-auto w-full"
      />
    </figure>
  )
}

const ArticleContent = memo(function ArticleContent({
  config,
  markdown,
}: {
  config: ProjectConfig
  markdown: Record<string, string>
}) {
  const videosById = useMemo(() => {
    return new Map(config.videos.map((video) => [video.id, video]))
  }, [config.videos])

  return (
    <article className="article-content max-w-4xl text-base leading-7 text-muted-foreground">
      {config.sections.map((section) => {
        const source = markdown[section.name] ?? ""

        return (
          <section
            key={section.name}
            id={section.name}
            className="scroll-mt-20"
          >
            <MarkdownSection
              sectionId={section.name}
              source={source}
              videosById={videosById}
            />
            <SectionVideos videoIds={section.videos} videosById={videosById} />
          </section>
        )
      })}

      {config.citation ? (
        <CitationSection citation={config.citation} />
      ) : null}
    </article>
  )
})

const CitationSection = memo(function CitationSection({
  citation,
}: {
  citation: CitationConfig
}) {
  const [copiedCitation, setCopiedCitation] = useState(false)

  const copyCitation = () => {
    void navigator.clipboard.writeText(citation.bibtex).then(() => {
      setCopiedCitation(true)
      window.setTimeout(() => setCopiedCitation(false), 1800)
    })
  }

  return (
    <section id="citation" className="scroll-mt-20">
      <div className="mt-8 mb-4">
        <h2 className="border-b pb-3 text-2xl font-semibold leading-tight text-foreground">
          Citing these materials
        </h2>
      </div>
      <p className="my-5">
        If you use {citation.label} or reference this project, please use the
        following BibTeX entry.
      </p>
      <div className="relative my-6 max-w-4xl">
        <pre className="max-h-[32rem] overflow-x-auto rounded-md border bg-muted/35 p-4 pr-28 font-mono text-[0.8rem] leading-6 text-foreground">
          <code>{citation.bibtex}</code>
        </pre>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Copy BibTeX citation"
          className="absolute right-3 top-3 bg-background/95 shadow-sm backdrop-blur"
          onClick={copyCitation}
        >
          {copiedCitation ? <Check /> : <Clipboard />}
          {copiedCitation ? "Copied" : "Copy"}
        </Button>
      </div>
    </section>
  )
})

const MarkdownSection = memo(function MarkdownSection({
  sectionId,
  source,
  videosById,
}: {
  sectionId: string
  source: string
  videosById: Map<string, VideoConfig>
}) {
  const trackedHeadings = useMemo(
    () => getTrackedMarkdownHeadings(source, sectionId),
    [sectionId, source],
  )
  const headingState = {
    index: 0,
  }

  function renderHeading(
    level: MarkdownHeadingLevel,
    children: React.ReactNode,
  ) {
    const id = trackedHeadings[headingState.index]?.id

    headingState.index += 1

    return (
      <MarkdownHeading level={level} id={id}>
        {children}
      </MarkdownHeading>
    )
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        ...markdownComponents,
        h1: ({ children }: { children?: React.ReactNode }) =>
          renderHeading(1, children),
        h2: ({ children }: { children?: React.ReactNode }) =>
          renderHeading(2, children),
        h3: ({ children }: { children?: React.ReactNode }) =>
          renderHeading(3, children),
        h4: ({ children }: { children?: React.ReactNode }) =>
          renderHeading(4, children),
        h5: ({ children }: { children?: React.ReactNode }) =>
          renderHeading(5, children),
        h6: ({ children }: { children?: React.ReactNode }) =>
          renderHeading(6, children),
        p: ({ children }: { children?: React.ReactNode }) => {
          const videoId = getVideoDirectiveId(children)

          if (videoId) {
            return (
              <ConfiguredVideoEmbed videoId={videoId} videosById={videosById} />
            )
          }

          return markdownComponents.p({ children })
        },
      }}
    >
      {source}
    </ReactMarkdown>
  )
})

const SectionVideos = memo(function SectionVideos({
  videoIds,
  videosById,
}: {
  videoIds: string[]
  videosById: Map<string, VideoConfig>
}) {
  if (videoIds.length === 0) {
    return null
  }

  return (
    <>
      {videoIds.map((videoId, index) => (
        <ConfiguredVideoEmbed
          key={`${videoId}-${index}`}
          videoId={videoId}
          videosById={videosById}
        />
      ))}
    </>
  )
})

const ConfiguredVideoEmbed = memo(function ConfiguredVideoEmbed({
  videoId,
  videosById,
}: {
  videoId: string
  videosById: Map<string, VideoConfig>
}) {
  const video = videosById.get(videoId)

  if (!video) {
    return (
      <p className="my-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        Video "{videoId}" is not configured.
      </p>
    )
  }

  return <VideoEmbed video={video} />
})

const VideoEmbed = memo(function VideoEmbed({ video }: { video: VideoConfig }) {
  return (
    <figure className="my-8 max-w-4xl">
      <div className="aspect-video w-full overflow-hidden rounded-md border bg-card">
        {video.provider === "youtube" ? (
          <iframe
            src={getYoutubeEmbedUrl(video.url)}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={video.url}
            title={video.title}
            controls
            className="h-full w-full bg-black"
          />
        )}
      </div>
      <figcaption className="mt-2 text-sm text-muted-foreground">
        {video.title}
      </figcaption>
    </figure>
  )
})

function getVideoDirectiveId(children: React.ReactNode) {
  const text = getNodeText(children).trim()
  const match = /^\{\{\s*video\s*:\s*([^}]+?)\s*\}\}$/.exec(text)

  return match?.[1].trim()
}

function getYoutubeEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname.replace(/^www\./, "")

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0]

      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com"
    ) {
      const videoId = parsedUrl.searchParams.get("v")

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }

    return url
  } catch {
    return url
  }
}

type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

function MarkdownHeading({
  level,
  id,
  children,
}: {
  level: MarkdownHeadingLevel
  id?: string
  children?: React.ReactNode
}) {
  const className = getMarkdownHeadingClassName(level)

  if (level === 1) {
    return (
      <h1 id={id} className={className}>
        {children}
      </h1>
    )
  }

  if (level === 2) {
    return (
      <h2 id={id} className={className}>
        {children}
      </h2>
    )
  }

  if (level === 3) {
    return (
      <h3 id={id} className={className}>
        {children}
      </h3>
    )
  }

  if (level === 4) {
    return (
      <h4 id={id} className={className}>
        {children}
      </h4>
    )
  }

  if (level === 5) {
    return (
      <h5 id={id} className={className}>
        {children}
      </h5>
    )
  }

  return (
    <h6 id={id} className={className}>
      {children}
    </h6>
  )
}

function getMarkdownHeadingClassName(level: MarkdownHeadingLevel) {
  if (level === 1) {
    return "mt-0 mb-8 scroll-mt-20 text-4xl font-semibold leading-tight text-foreground"
  }

  if (level === 2) {
    return "mt-8 mb-4 scroll-mt-20 border-b pb-3 text-2xl font-semibold leading-tight text-foreground first:mt-8"
  }

  if (level === 3) {
    return "mt-7 mb-3 scroll-mt-20 text-xl font-semibold leading-8 text-foreground"
  }

  if (level === 4) {
    return "mt-6 mb-2 scroll-mt-20 text-lg font-semibold leading-7 text-foreground"
  }

  if (level === 5) {
    return "mt-5 mb-2 scroll-mt-20 text-base font-semibold leading-7 text-foreground"
  }

  return "mt-4 mb-2 scroll-mt-20 text-sm font-semibold uppercase leading-6 text-foreground"
}

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <MarkdownHeading level={1}>
      {children}
    </MarkdownHeading>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <MarkdownHeading level={2}>
      {children}
    </MarkdownHeading>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <MarkdownHeading level={3}>
      {children}
    </MarkdownHeading>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <MarkdownHeading level={4}>
      {children}
    </MarkdownHeading>
  ),
  h5: ({ children }: { children?: React.ReactNode }) => (
    <MarkdownHeading level={5}>
      {children}
    </MarkdownHeading>
  ),
  h6: ({ children }: { children?: React.ReactNode }) => (
    <MarkdownHeading level={6}>
      {children}
    </MarkdownHeading>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-5">{children}</p>
  ),
  a: ({
    href,
    children,
  }: {
    href?: string
    children?: React.ReactNode
  }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
      className="font-medium text-foreground underline"
    >
      {children}
    </a>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-5 list-disc space-y-2 pl-6">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-5 list-decimal space-y-2 pl-6">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="pl-1">{children}</li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-6 border-l-4 pl-4">{children}</blockquote>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="font-semibold text-foreground">{children}</code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-6 overflow-x-auto rounded-md border bg-card p-3 text-sm leading-6">
      {children}
    </pre>
  ),
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <img
      src={src ?? ""}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      className="my-8 block h-auto w-full"
    />
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-8 overflow-x-auto">
      <table className="w-full table-auto text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border-b px-2 pb-2 text-left font-semibold text-foreground first:pl-0 last:pr-0">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border-b px-2 py-2 align-baseline first:pl-0 last:pr-0">
      {children}
    </td>
  ),
}

function getPageTrackerItems(
  config: ProjectConfig,
  markdown: Record<string, string>,
): PageTrackerItem[] {
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

function getMarkdownHeadingItems(
  source: string,
  sectionId: string,
) {
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

type TrackedMarkdownHeading = {
  id?: string
  label: string
  level: MarkdownHeadingLevel
}

function getTrackedMarkdownHeadings(
  source: string,
  sectionId: string,
): TrackedMarkdownHeading[] {
  const headingCounts = new Map<string, number>()

  return getMarkdownHeadings(source).map((heading, index) => ({
    ...heading,
    id:
      index === 0
        ? undefined
        : createTrackedHeadingId(sectionId, heading.label, headingCounts),
  }))
}

function getMarkdownHeadings(source: string) {
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

function getHeadingDepth(
  level: MarkdownHeadingLevel,
  baseLevel: MarkdownHeadingLevel,
) {
  return Math.min(
    Math.max(level - baseLevel, 0),
    3,
  ) as PageTrackerItem["depth"]
}

function createTrackedHeadingId(
  sectionId: string,
  label: string,
  headingCounts: Map<string, number>,
) {
  const slug = slugifyHeading(label)
  const count = (headingCounts.get(slug) ?? 0) + 1

  headingCounts.set(slug, count)

  return `${sectionId}-${slug}${count > 1 ? `-${count}` : ""}`
}

function cleanHeadingText(input: string) {
  return input
    .replace(/\s+#+\s*$/, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .trim()
}

function slugifyHeading(input: string) {
  return (
    cleanHeadingText(input)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  )
}

function getNodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join("")
  }

  if (isValidElement(node)) {
    return getNodeText(
      (node.props as { children?: React.ReactNode }).children,
    )
  }

  return ""
}

function CopyrightLine({ config }: { config: ProjectConfig }) {
  const codeLink = config.links.find(
    (link) =>
      link.href && ["code", "github"].includes(link.type.toLowerCase()),
  )

  return (
    <p>
      © Ruishi Zou 2026.
      {codeLink?.href ? (
        <>
          {" "}
          <a
            href={codeLink.href}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline"
          >
            View on GitHub
          </a>
        </>
      ) : null}
    </p>
  )
}

function getTagMarker(tag: string) {
  const normalized = normalizeTag(tag)

  if (normalized === "co-first") {
    return "*"
  }

  if (normalized === "co-last") {
    return "†"
  }

  return tag
}

function getTagLabel(tag: string) {
  const normalized = normalizeTag(tag)

  if (normalized === "co-first") {
    return "Equal contribution"
  }

  if (normalized === "co-last") {
    return "Co-last authors"
  }

  return tag
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ")
}

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase().replaceAll("_", "-").replaceAll(" ", "-")
}

export default App
