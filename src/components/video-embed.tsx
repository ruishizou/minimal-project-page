import {
  memo,
  type CSSProperties,
} from "react"

import { cn } from "@/lib/utils"
import type { VideoConfig } from "@/types/project-config"
import { getYoutubeEmbedUrl } from "@/utils/video-urls"

export const SectionVideos = memo(function SectionVideos({
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

export const ConfiguredVideoEmbed = memo(function ConfiguredVideoEmbed({
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
  const usesAspectFrame = video.provider === "youtube" || Boolean(video.aspectRatio)

  return (
    <figure className="my-8 max-w-4xl">
      <div
        className={cn(
          "w-full overflow-hidden bg-card",
          usesAspectFrame ? "aspect-video" : "",
        )}
        style={getVideoFrameStyle(video)}
      >
        {video.provider === "youtube" ? (
          <iframe
            src={getYoutubeEmbedUrl(video)}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={video.url}
            title={video.title}
            controls={!video.hideProgressBar}
            autoPlay={video.autoplay}
            muted={video.autoplay}
            playsInline
            className={cn(
              "block w-full bg-black",
              usesAspectFrame ? "h-full object-contain" : "h-auto",
            )}
          />
        )}
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        {video.title}
      </figcaption>
    </figure>
  )
})

const getVideoFrameStyle = (
  video: VideoConfig,
): CSSProperties | undefined =>
  video.aspectRatio ? { aspectRatio: video.aspectRatio } : undefined
