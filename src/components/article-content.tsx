import {
  memo,
  useMemo,
} from "react"

import { CitationSection } from "@/components/citation-section"
import { MarkdownSection } from "@/components/markdown-section"
import { SectionVideos } from "@/components/video-embed"
import type {
  ProjectConfig,
  VideoConfig,
} from "@/types/project-config"

export const ArticleContent = memo(function ArticleContent({
  config,
  markdown,
}: {
  config: ProjectConfig
  markdown: Record<string, string>
}) {
  const videosById = useMemo(
    () =>
      new Map<string, VideoConfig>(
        config.videos.map((video) => [video.id, video]),
      ),
    [config.videos],
  )

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
