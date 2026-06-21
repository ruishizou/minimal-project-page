import {
  Fragment,
  useMemo,
} from "react"
import { Award } from "lucide-react"

import { ProjectLinkControl } from "@/components/project-links"
import type {
  Affiliation,
  Author,
  AuthorTagDefinition,
  ProjectConfig,
  ProjectLink,
} from "@/types/project-config"
import {
  getTagLabel,
  getTagMarker,
} from "@/utils/author-tags"
import { getProjectLinkKey } from "@/utils/project-links"

export function ProjectHeader({ config }: { config: ProjectConfig }) {
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
        authorTags={config.authorTags}
        affiliationsById={affiliationsById}
        affiliationNumbers={affiliationNumbers}
      />

      <AffiliationList affiliations={config.affiliations} />
      <ContributionNotes authors={config.authors} authorTags={config.authorTags} />
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

function AuthorLine({
  authors,
  authorTags,
  affiliationsById,
  affiliationNumbers,
}: {
  authors: Author[]
  authorTags: Record<string, AuthorTagDefinition>
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
          ...(author.tags?.map((tag) => getTagMarker(tag, authorTags)) ?? []),
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
    <ul className="m-0 mb-2 flex max-w-6xl list-none flex-wrap items-baseline gap-x-5 gap-y-2 p-0 text-left text-sm leading-6 text-muted-foreground">
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
      className="text-muted-foreground no-underline hover:text-foreground hover:underline"
    >
      {affiliation.name}
    </a>
  ) : (
    <span>{affiliation.name}</span>
  )

  return (
    <span className="inline-flex max-w-full items-baseline align-baseline">
      <sup className="text-[0.68rem] leading-none text-muted-foreground">
        {number}
      </sup>
      {affiliation.image ? (
        <img
          src={affiliation.image}
          alt=""
          className="h-5 w-auto max-w-5 shrink-0 self-center object-contain"
        />
      ) : null}
      {name}
    </span>
  )
}

function ContributionNotes({
  authors,
  authorTags,
}: {
  authors: Author[]
  authorTags: Record<string, AuthorTagDefinition>
}) {
  const tags = Array.from(
    new Set(authors.flatMap((author) => author.tags ?? [])),
  )

  if (tags.length === 0) {
    return null
  }

  return (
    <ul className="m-0 mb-2 mt-1 flex list-none flex-wrap items-baseline gap-x-4 gap-y-1 p-0 text-left text-xs leading-5 text-muted-foreground">
      {tags.map((tag) => (
        <li key={tag} className="inline-flex items-baseline gap-1">
          <sup className="align-super text-[0.68rem]">
            {getTagMarker(tag, authorTags)}
          </sup>
          <span>{getTagLabel(tag, authorTags)}</span>
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
