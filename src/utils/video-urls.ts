import type { ReactNode } from "react"

import type { VideoConfig } from "@/types/project-config"
import { getNodeText } from "@/utils/react-node"

export const getVideoDirectiveId = (children: ReactNode) => {
  const text = getNodeText(children).trim()
  const match = /^\{\{\s*video\s*:\s*([^}]+?)\s*\}\}$/.exec(text)

  return match?.[1].trim()
}

export const getYoutubeEmbedUrl = (video: VideoConfig) => {
  try {
    const parsedUrl = new URL(video.url)
    const hostname = parsedUrl.hostname.replace(/^www\./, "")
    const embedUrl = new URL(video.url)

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0]

      if (videoId) {
        embedUrl.href = `https://www.youtube.com/embed/${videoId}`
      }
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com"
    ) {
      const videoId = parsedUrl.searchParams.get("v")

      if (videoId) {
        embedUrl.href = `https://www.youtube.com/embed/${videoId}`
      }
    }

    if (video.autoplay) {
      embedUrl.searchParams.set("autoplay", "1")
      embedUrl.searchParams.set("mute", "1")
    }

    if (video.hideProgressBar) {
      embedUrl.searchParams.set("controls", "0")
    }

    return embedUrl.toString()
  } catch {
    return video.url
  }
}
