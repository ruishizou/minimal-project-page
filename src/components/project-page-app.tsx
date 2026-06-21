import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { ArticleContent } from "@/components/article-content"
import { ErrorPage } from "@/components/error-page"
import { LoadingPage } from "@/components/loading-page"
import {
  OnThisPageTracker,
  type PageTrackerItem,
} from "@/components/on-this-page-tracker"
import { ProjectHeader } from "@/components/project-header"
import type { ProjectConfig } from "@/types/project-config"
import {
  loadProjectConfig,
  loadProjectSections,
} from "@/utils/project-config"
import { getPageTrackerItems } from "@/utils/markdown-headings"
import { getImportantProjectLinks } from "@/utils/project-links"

type AppState =
  | { status: "loading" }
  | {
      status: "ready"
      config: ProjectConfig
      markdown: Record<string, string>
    }
  | { status: "error"; message: string }

export function ProjectPageApp() {
  const [state, setState] = useState<AppState>({ status: "loading" })
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadContent() {
      try {
        const config = await loadProjectConfig()
        const markdown = await loadProjectSections(config)

        if (isMounted) {
          setState({ status: "ready", config, markdown })
        }
      } catch (error) {
        if (isMounted) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unable to load project content",
          })
        }
      }
    }

    void loadContent()

    return () => {
      isMounted = false
    }
  }, [])

  const pageTrackerItems = useMemo<PageTrackerItem[]>(() => {
    if (state.status !== "ready") {
      return []
    }

    return getPageTrackerItems(state.config, state.markdown)
  }, [state])

  const importantLinks = useMemo(() => {
    if (state.status !== "ready") {
      return []
    }

    return getImportantProjectLinks(state.config.links)
  }, [state])

  if (state.status === "loading") {
    return <LoadingPage />
  }

  if (state.status === "error") {
    return <ErrorPage message={state.message} />
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col bg-background text-muted-foreground md:flex-row">
      <OnThisPageTracker
        title={state.config.project.title}
        items={pageTrackerItems}
        supportingLinks={importantLinks}
        footer={<CopyrightLine copyright={state.config.copyright} />}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
        onNavigate={() => setIsMenuOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <main className="w-full flex-1 p-4 md:p-8">
          <ProjectHeader config={state.config} />
          <ArticleContent
            config={state.config}
            markdown={state.markdown}
          />
        </main>
      </div>
    </div>
  )
}

function CopyrightLine({ copyright }: { copyright?: string }) {
  return (
    <p className="space-y-1">
      {copyright ? <span className="block">{copyright}</span> : null}
      <span className="block">
        Theme by{" "}
        <a
          href="https://github.com/ruishizou/minimal-project-page"
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline"
        >
          ruishizou
        </a>
      </span>
    </p>
  )
}
