import {
  memo,
  useMemo,
  type ReactNode,
} from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import {
  MarkdownBlockquote,
  MarkdownHeading,
  MarkdownHeadingFive,
  MarkdownHeadingFour,
  MarkdownHeadingOne,
  MarkdownHeadingSix,
  MarkdownHeadingThree,
  MarkdownHeadingTwo,
  MarkdownInlineCode,
  MarkdownInlineImage,
  MarkdownLink,
  MarkdownListItem,
  MarkdownOrderedList,
  MarkdownParagraphRenderer,
  MarkdownPre,
  MarkdownTable,
  MarkdownTableCell,
  MarkdownTableHeadCell,
  MarkdownUnorderedList,
} from "@/components/markdown-components"
import { MarkdownImage, MarkdownParagraph } from "@/components/markdown-image"
import { ConfiguredVideoEmbed } from "@/components/video-embed"
import type { VideoConfig } from "@/types/project-config"
import {
  getTrackedMarkdownHeadings,
  type MarkdownHeadingLevel,
} from "@/utils/markdown-headings"
import { getVideoDirectiveId } from "@/utils/video-urls"

const markdownComponents = {
  h1: MarkdownHeadingOne,
  h2: MarkdownHeadingTwo,
  h3: MarkdownHeadingThree,
  h4: MarkdownHeadingFour,
  h5: MarkdownHeadingFive,
  h6: MarkdownHeadingSix,
  p: MarkdownParagraphRenderer,
  a: MarkdownLink,
  ul: MarkdownUnorderedList,
  ol: MarkdownOrderedList,
  li: MarkdownListItem,
  blockquote: MarkdownBlockquote,
  code: MarkdownInlineCode,
  pre: MarkdownPre,
  img: MarkdownInlineImage,
  table: MarkdownTable,
  th: MarkdownTableHeadCell,
  td: MarkdownTableCell,
}

export const MarkdownSection = memo(function MarkdownSection({
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
    children: ReactNode,
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
        h1: ({ children }: { children?: ReactNode }) =>
          renderHeading(1, children),
        h2: ({ children }: { children?: ReactNode }) =>
          renderHeading(2, children),
        h3: ({ children }: { children?: ReactNode }) =>
          renderHeading(3, children),
        h4: ({ children }: { children?: ReactNode }) =>
          renderHeading(4, children),
        h5: ({ children }: { children?: ReactNode }) =>
          renderHeading(5, children),
        h6: ({ children }: { children?: ReactNode }) =>
          renderHeading(6, children),
        img: ({
          src,
          alt,
          title,
        }: {
          src?: string
          alt?: string
          title?: string
        }) => (
          <MarkdownImage
            src={src}
            alt={alt}
            title={title}
            basePath={`/sections/${encodeURIComponent(sectionId)}.md`}
          />
        ),
        p: ({ children }: { children?: ReactNode }) => {
          const videoId = getVideoDirectiveId(children)

          if (videoId) {
            return (
              <ConfiguredVideoEmbed videoId={videoId} videosById={videosById} />
            )
          }

          return <MarkdownParagraph>{children}</MarkdownParagraph>
        },
      }}
    >
      {source}
    </ReactMarkdown>
  )
})
