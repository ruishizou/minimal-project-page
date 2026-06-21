import type { CSSProperties } from "react"

import { getPublicPath } from "@/utils/public-paths"

export type MarkdownImagePresentationInput = {
  src?: string
  title?: string
  basePath?: string
}

export type MarkdownImageWrapperStyle = CSSProperties & {
  "--markdown-image-width"?: string
}

export const getMarkdownImagePresentation = ({
  src,
  title,
  basePath,
}: MarkdownImagePresentationInput) => {
  const { src: sourceWithoutOptions, width } = extractMarkdownImageOptions(src)

  return {
    src: resolveMarkdownAssetSrc(sourceWithoutOptions, basePath),
    caption: title?.trim(),
    width,
  }
}

export const getMarkdownImageWrapperStyle = (
  width?: string,
): MarkdownImageWrapperStyle | undefined => {
  if (!width) {
    return undefined
  }

  return {
    "--markdown-image-width": width,
  }
}

export const isNarrowMarkdownImage = (width?: string) =>
  Boolean(width && !isFullMarkdownImageWidth(width))

const isFullMarkdownImageWidth = (width: string) => {
  const normalizedWidth = width.trim()

  if (!normalizedWidth.endsWith("%")) {
    return false
  }

  return Number(normalizedWidth.slice(0, -1)) === 100
}

const extractMarkdownImageOptions = (src?: string) => {
  if (!src) {
    return { src: "", width: undefined }
  }

  const [source, rawHash] = src.split("#", 2)

  if (!rawHash) {
    return { src, width: undefined }
  }

  const options = new URLSearchParams(rawHash ?? "")
  const width = normalizeMarkdownImageWidth(
    options.get("width") ?? options.get("w"),
  )

  if (!width) {
    return { src, width: undefined }
  }

  return {
    src: source,
    width,
  }
}

const normalizeMarkdownImageWidth = (value: string | null) => {
  if (!value) {
    return undefined
  }

  const normalizedValue = value.trim()

  if (/^\d+(?:\.\d+)?$/.test(normalizedValue)) {
    return `${normalizedValue}%`
  }

  if (/^\d+(?:\.\d+)?%$/.test(normalizedValue)) {
    return normalizedValue
  }

  return undefined
}

const resolveMarkdownAssetSrc = (src?: string, basePath?: string) => {
  if (!src) {
    return ""
  }

  if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(src)) {
    return src
  }

  if (src.startsWith("public/") || src.startsWith("/")) {
    return getPublicPath(src)
  }

  if (!basePath) {
    return src
  }

  return getPublicPath(new URL(src, `http://localhost${basePath}`).pathname)
}
