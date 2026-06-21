import type { ReactNode } from "react"

import {
  MarkdownImage,
  MarkdownParagraph,
} from "@/components/markdown-image"
import type { MarkdownHeadingLevel } from "@/utils/markdown-headings"

export function MarkdownHeading({
  level,
  id,
  children,
}: {
  level: MarkdownHeadingLevel
  id?: string
  children?: ReactNode
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

export function MarkdownLink({
  href,
  children,
}: {
  href?: string
  children?: ReactNode
}) {
  return (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
      className="font-medium text-foreground underline"
    >
      {children}
    </a>
  )
}

export function MarkdownUnorderedList({
  children,
}: {
  children?: ReactNode
}) {
  return <ul className="my-5 list-disc space-y-2 pl-6">{children}</ul>
}

export function MarkdownOrderedList({
  children,
}: {
  children?: ReactNode
}) {
  return <ol className="my-5 list-decimal space-y-2 pl-6">{children}</ol>
}

export function MarkdownListItem({ children }: { children?: ReactNode }) {
  return <li className="pl-1">{children}</li>
}

export function MarkdownBlockquote({ children }: { children?: ReactNode }) {
  return <blockquote className="my-6 border-l-4 pl-4">{children}</blockquote>
}

export function MarkdownInlineCode({ children }: { children?: ReactNode }) {
  return <code className="font-semibold text-foreground">{children}</code>
}

export function MarkdownPre({ children }: { children?: ReactNode }) {
  return (
    <pre className="my-6 overflow-x-auto rounded-md border bg-card p-3 text-sm leading-6">
      {children}
    </pre>
  )
}

export function MarkdownTable({ children }: { children?: ReactNode }) {
  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full table-auto text-sm">{children}</table>
    </div>
  )
}

export function MarkdownTableHeadCell({
  children,
}: {
  children?: ReactNode
}) {
  return (
    <th className="border-b px-2 pb-2 text-left font-semibold text-foreground first:pl-0 last:pr-0">
      {children}
    </th>
  )
}

export function MarkdownTableCell({ children }: { children?: ReactNode }) {
  return (
    <td className="border-b px-2 py-2 align-baseline first:pl-0 last:pr-0">
      {children}
    </td>
  )
}

export function MarkdownInlineImage({
  src,
  alt,
  title,
}: {
  src?: string
  alt?: string
  title?: string
}) {
  return <MarkdownImage src={src} alt={alt} title={title} />
}

export function MarkdownHeadingOne({ children }: { children?: ReactNode }) {
  return <MarkdownHeading level={1}>{children}</MarkdownHeading>
}

export function MarkdownHeadingTwo({ children }: { children?: ReactNode }) {
  return <MarkdownHeading level={2}>{children}</MarkdownHeading>
}

export function MarkdownHeadingThree({ children }: { children?: ReactNode }) {
  return <MarkdownHeading level={3}>{children}</MarkdownHeading>
}

export function MarkdownHeadingFour({ children }: { children?: ReactNode }) {
  return <MarkdownHeading level={4}>{children}</MarkdownHeading>
}

export function MarkdownHeadingFive({ children }: { children?: ReactNode }) {
  return <MarkdownHeading level={5}>{children}</MarkdownHeading>
}

export function MarkdownHeadingSix({ children }: { children?: ReactNode }) {
  return <MarkdownHeading level={6}>{children}</MarkdownHeading>
}

export function MarkdownParagraphRenderer({
  children,
}: {
  children?: ReactNode
}) {
  return <MarkdownParagraph>{children}</MarkdownParagraph>
}

const getMarkdownHeadingClassName = (level: MarkdownHeadingLevel) => {
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
