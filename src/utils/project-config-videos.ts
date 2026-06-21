import type { VideoConfig } from "@/types/project-config"
import {
  optionalArray,
  optionalBoolean,
  optionalString,
  requireRecord,
  requireString,
} from "@/utils/project-config-guards"

export const normalizeVideos = (
  input: unknown,
  legacyVideo?: Record<string, unknown>,
): VideoConfig[] => {
  const videos = optionalArray(input, "videos").map((item, index) =>
    normalizeVideo(requireRecord(item, `videos[${index}]`), `videos[${index}]`),
  )

  if (legacyVideo) {
    videos.push(normalizeVideo(legacyVideo, "video", "project-video"))
  }

  const ids = new Set<string>()

  for (const video of videos) {
    if (ids.has(video.id)) {
      throw new Error(`Duplicate video id "${video.id}"`)
    }

    ids.add(video.id)
  }

  return videos
}

const normalizeVideo = (
  video: Record<string, unknown>,
  fieldName: string,
  fallbackId?: string,
): VideoConfig => {
  const provider = requireString(video.provider, `${fieldName}.provider`)

  if (provider !== "youtube" && provider !== "local") {
    throw new Error(
      `${fieldName}.provider must be either 'youtube' or 'local'`,
    )
  }

  const url = normalizeVideoUrl(video, fieldName, provider)

  return {
    id:
      optionalString(video.id) ??
      fallbackId ??
      requireString(video.id, `${fieldName}.id`),
    title: requireString(video.title, `${fieldName}.title`),
    provider,
    url,
    autoplay: optionalBoolean(video.autoplay),
    hideProgressBar:
      optionalBoolean(video.hideProgressBar) ??
      optionalBoolean(video.hide_progress_bar),
    aspectRatio:
      normalizeAspectRatio(video.aspectRatio, `${fieldName}.aspectRatio`) ??
      normalizeAspectRatio(video.aspect_ratio, `${fieldName}.aspect_ratio`),
  }
}

const normalizeAspectRatio = (
  input: unknown,
  fieldName: string,
): string | undefined => {
  if (input === undefined || input === null) {
    return undefined
  }

  const value =
    typeof input === "number" ? String(input) : requireString(input, fieldName)
  const normalizedValue = value
    .replace(":", "/")
    .replace(/\s*\/\s*/g, " / ")

  if (/^\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?$/.test(normalizedValue)) {
    return normalizedValue
  }

  throw new Error(
    `${fieldName} must be a number or ratio string like "16/9"`,
  )
}

const normalizeVideoUrl = (
  video: Record<string, unknown>,
  fieldName: string,
  provider: string,
): string => {
  const url = optionalString(video.url)
  const file = optionalString(video.file)

  if (provider === "local") {
    return resolveLocalVideoUrl(
      file ?? url ?? requireString(video.url, `${fieldName}.url`),
    )
  }

  return requireString(video.url, `${fieldName}.url`)
}

const resolveLocalVideoUrl = (input: string): string => {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(input)) {
    return input
  }

  const filename = input.replace(/^\.?\/*/, "").replace(/^videos\//, "")

  return `/videos/${filename}`
}
