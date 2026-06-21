type ScrollTrackerItem = {
  id: string
}

export const SCROLL_KEYS = new Set([
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  " ",
])

export const getNextActiveTrackerId = (items: ScrollTrackerItem[]) => {
  const candidates = items
    .map((item) => ({
      id: item.id,
      element: document.getElementById(item.id),
    }))
    .filter(
      (candidate): candidate is { id: string; element: HTMLElement } =>
        Boolean(candidate.element),
    )

  if (candidates.length === 0) {
    return items[0]?.id ?? ""
  }

  if (isScrolledToBottom()) {
    return candidates[candidates.length - 1].id
  }

  const topOffset = 112
  let nextActiveId = candidates[0].id

  for (const candidate of candidates) {
    if (candidate.element.getBoundingClientRect().top <= topOffset) {
      nextActiveId = candidate.id
    } else {
      break
    }
  }

  return nextActiveId
}

export const scrollToElementId = (
  id: string,
  options: { replace?: boolean } = {},
) => {
  const element = document.getElementById(id)

  if (!element) {
    return
  }

  const hashHref = getHashHref(id)

  if (options.replace) {
    window.history.replaceState(null, "", hashHref)
  } else {
    window.history.pushState(null, "", hashHref)
  }

  window.scrollTo({
    top: getElementScrollTop(element),
    left: window.scrollX,
  })
  element.focus({ preventScroll: true })
}

export const getHashHref = (id: string) => `#${encodeURIComponent(id)}`

export const getCurrentHashId = () => {
  const hash = window.location.hash.slice(1)

  if (!hash) {
    return undefined
  }

  try {
    return decodeURIComponent(hash)
  } catch {
    return hash
  }
}

const isScrolledToBottom = () => {
  const documentElement = document.documentElement

  return (
    window.scrollY + window.innerHeight >=
    documentElement.scrollHeight - 2
  )
}

const getElementScrollTop = (element: HTMLElement) => {
  const scrollMarginTop = Number.parseFloat(
    window.getComputedStyle(element).scrollMarginTop,
  )

  return Math.max(
    element.getBoundingClientRect().top +
      window.scrollY -
      (Number.isNaN(scrollMarginTop) ? 0 : scrollMarginTop),
    0,
  )
}
