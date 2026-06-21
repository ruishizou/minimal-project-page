import {
  Children,
  isValidElement,
  type ReactNode,
} from "react"

import {
  getMarkdownImagePresentation,
  getMarkdownImageWrapperStyle,
  isNarrowMarkdownImage,
} from "@/utils/markdown-images"

export type MarkdownImageProps = {
  src?: string
  alt?: string
  title?: string
  basePath?: string
}

export function MarkdownImageFigure(props: MarkdownImageProps) {
  const presentation = getMarkdownImagePresentation(props)
  const wrapperStyle = getMarkdownImageWrapperStyle(presentation.width)

  return (
    <figure
      className="markdown-image-frame my-8 max-w-4xl"
      data-centered={isNarrowMarkdownImage(presentation.width) ? "true" : undefined}
      style={wrapperStyle}
    >
      <MarkdownImageElement
        src={presentation.src}
        alt={props.alt}
        caption={presentation.caption}
      />
      {presentation.caption ? (
        <figcaption className="mt-2 text-center text-sm leading-6 text-muted-foreground">
          {presentation.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

export function MarkdownImage({
  src,
  alt,
  title,
  basePath,
}: MarkdownImageProps) {
  const presentation = getMarkdownImagePresentation({
    src,
    title,
    basePath,
  })
  const wrapperStyle = getMarkdownImageWrapperStyle(presentation.width)

  if (presentation.width || presentation.caption) {
    return (
      <span
        className="markdown-image-frame my-8 block max-w-4xl"
        data-centered={isNarrowMarkdownImage(presentation.width) ? "true" : undefined}
        style={wrapperStyle}
      >
        <MarkdownImageElement
          src={presentation.src}
          alt={alt}
          caption={presentation.caption}
        />
        {presentation.caption ? (
          <span className="mt-2 block text-center text-sm leading-6 text-muted-foreground">
            {presentation.caption}
          </span>
        ) : null}
      </span>
    )
  }

  return (
    <MarkdownImageElement
      src={presentation.src}
      alt={alt}
      caption={presentation.caption}
    />
  )
}

export function MarkdownParagraph({
  children,
}: {
  children?: ReactNode
}) {
  const imageProps = getStandaloneImageProps(children)

  if (imageProps) {
    return <MarkdownImageFigure {...imageProps} />
  }

  return <p className="my-5">{children}</p>
}

function getStandaloneImageProps(
  children: ReactNode,
): MarkdownImageProps | null {
  const nodes = Children.toArray(children).filter((child) => {
    return typeof child !== "string" || child.trim().length > 0
  })

  if (nodes.length !== 1 || !isValidElement<MarkdownImageProps>(nodes[0])) {
    return null
  }

  if (nodes[0].type === MarkdownImage) {
    return nodes[0].props
  }

  if (nodes[0].type === "img") {
    return nodes[0].props
  }

  return null
}

function MarkdownImageElement({
  src,
  alt,
  caption,
}: {
  src: string
  alt?: string
  caption?: string
}) {
  return (
    <img
      src={src}
      alt={alt ?? ""}
      title={caption}
      loading="lazy"
      decoding="async"
      className="block h-auto w-full"
    />
  )
}
