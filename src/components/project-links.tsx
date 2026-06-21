import {
  ChevronDown,
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
import { cn } from "@/lib/utils"
import type {
  ProjectLink,
  ProjectLinkItem,
} from "@/types/project-config"

export function ProjectLinkControl({ link }: { link: ProjectLink }) {
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
