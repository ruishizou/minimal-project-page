import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import {
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  getCurrentHashId,
  getHashHref,
  getNextActiveTrackerId,
  SCROLL_KEYS,
  scrollToElementId,
} from "@/utils/scroll-navigation"

export type PageTrackerItem = {
  id: string
  label: string
  depth: 0 | 1 | 2 | 3
}

export type PageTrackerLink = {
  label: string
  href: string
}

type OnThisPageTrackerProps = {
  title: string
  items: PageTrackerItem[]
  supportingLinks?: PageTrackerLink[]
  footer?: ReactNode
  isMenuOpen: boolean
  onMenuToggle: () => void
  onNavigate: () => void
}

export function OnThisPageTracker({
  title,
  items,
  supportingLinks = [],
  footer,
  isMenuOpen,
  onMenuToggle,
  onNavigate,
}: OnThisPageTrackerProps) {
  const { activeId, activateItem } = useActiveTrackerItem(items)
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>())

  const setLinkRef = useCallback(
    (id: string, element: HTMLAnchorElement | null) => {
      if (element) {
        linkRefs.current.set(id, element)
      } else {
        linkRefs.current.delete(id)
      }
    },
    [],
  )

  useEffect(() => {
    linkRefs.current.get(activeId)?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    })
  }, [activeId])

  const handleTitleNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    scrollToElementId("home-header")
    onNavigate()
  }

  const handleItemNavigate = (
    event: MouseEvent<HTMLAnchorElement>,
    item: PageTrackerItem,
  ) => {
    event.preventDefault()
    activateItem(item.id)
    scrollToElementId(item.id)
    onNavigate()
  }

  return (
    <nav
      className="shrink-0 md:relative md:w-[280px]"
      aria-label="On this page"
    >
      <div className="fixed left-0 top-0 z-50 flex h-14 w-full items-center justify-end border-b bg-background px-4 md:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          onClick={onMenuToggle}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <div
        className={cn(
          "fixed left-0 top-14 z-40 hidden max-h-[calc(100vh-3.5rem)] w-full flex-col overflow-y-auto border-b bg-background p-6 md:sticky md:top-0 md:flex md:h-screen md:max-h-screen md:w-[280px] md:border-b-0 md:bg-transparent md:px-8 md:pb-8 md:pt-16",
          isMenuOpen && "flex",
        )}
      >
        <div className="min-h-0">
          <a
            href="#home-header"
            onClick={handleTitleNavigate}
            className="mb-6 block text-sm font-semibold leading-5 text-foreground no-underline"
          >
            {title}
          </a>

          <ul className="m-0 list-none border-l border-border p-0">
            {items.map((item) => {
              const isActive = item.id === activeId

              return (
                <li key={item.id}>
                  <a
                    ref={(element) => setLinkRef(item.id, element)}
                    href={getHashHref(item.id)}
                    aria-current={isActive ? "location" : undefined}
                    onClick={(event) => handleItemNavigate(event, item)}
                    className={cn(
                      "-ml-px block border-l py-2 pr-2 text-sm leading-5 no-underline transition-colors hover:text-foreground",
                      getDepthClassName(item.depth),
                      isActive
                        ? "border-foreground font-semibold text-foreground"
                        : "border-transparent font-normal text-muted-foreground hover:border-muted-foreground/50",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        {supportingLinks.length > 0 || footer ? (
          <div className="mt-8 space-y-4 md:mt-auto">
            {supportingLinks.length > 0 ? (
              <ul className="m-0 list-none border-b border-border p-0 pb-5">
                {supportingLinks.map((link) => (
                  <li key={link.href}>
                    <Button
                      asChild
                      variant="ghost"
                      size="default"
                      className="h-9 w-full justify-between px-0 text-muted-foreground hover:bg-transparent"
                    >
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={onNavigate}
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}

            {footer ? (
              <div className="pt-5 text-xs leading-5 text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {isMenuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-foreground/25 md:hidden"
          onClick={onNavigate}
        />
      ) : null}
    </nav>
  )
}

function getDepthClassName(depth: PageTrackerItem["depth"]) {
  if (depth === 0) {
    return "pl-4"
  }

  if (depth === 1) {
    return "pl-7"
  }

  if (depth === 2) {
    return "pl-10"
  }

  return "pl-12"
}

function useActiveTrackerItem(items: PageTrackerItem[]) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "")
  const lockedActiveIdRef = useRef<string | null>(null)

  const activateItem = useCallback(
    (id: string) => {
      if (!items.some((item) => item.id === id)) {
        return
      }

      lockedActiveIdRef.current = id
      setActiveId(id)
    },
    [items],
  )

  useEffect(() => {
    if (items.length === 0) {
      return
    }

    let animationFrame = 0

    const updateActiveItem = () => {
      if (lockedActiveIdRef.current) {
        return
      }

      window.cancelAnimationFrame(animationFrame)

      animationFrame = window.requestAnimationFrame(() => {
        setActiveId(getNextActiveTrackerId(items))
      })
    }

    const clearActiveLock = () => {
      if (!lockedActiveIdRef.current) {
        return
      }

      lockedActiveIdRef.current = null
      updateActiveItem()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) {
        clearActiveLock()
      }
    }

    const handleHashChange = () => {
      const hashId = getCurrentHashId()

      if (!hashId || !items.some((item) => item.id === hashId)) {
        return
      }

      activateItem(hashId)
      scrollToElementId(hashId, { replace: true })
    }

    const observer = new IntersectionObserver(updateActiveItem, {
      rootMargin: "-112px 0px -70% 0px",
      threshold: [0, 1],
    })
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element))

    elements.forEach((element) => observer.observe(element))
    updateActiveItem()
    handleHashChange()

    window.addEventListener("scroll", updateActiveItem, { passive: true })
    window.addEventListener("resize", updateActiveItem)
    window.addEventListener("wheel", clearActiveLock, { passive: true })
    window.addEventListener("touchmove", clearActiveLock, { passive: true })
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("hashchange", handleHashChange)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      observer.disconnect()
      window.removeEventListener("scroll", updateActiveItem)
      window.removeEventListener("resize", updateActiveItem)
      window.removeEventListener("wheel", clearActiveLock)
      window.removeEventListener("touchmove", clearActiveLock)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [activateItem, items])

  return {
    activeId: items.some((item) => item.id === activeId)
      ? activeId
      : items[0]?.id ?? "",
    activateItem,
  }
}
