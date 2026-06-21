import { parse } from "yaml"

import type { ProjectConfig } from "@/types/project-config"
import { normalizeProjectConfig } from "@/utils/project-config-normalize"
import { getPublicPath } from "@/utils/public-paths"

export const loadProjectConfig = async (): Promise<ProjectConfig> => {
  const response = await fetch(getPublicPath("config.yaml"))

  if (!response.ok) {
    throw new Error("Unable to load public/config.yaml")
  }

  return normalizeProjectConfig(parse(await response.text()))
}

export const loadProjectSections = async (
  config: ProjectConfig,
): Promise<Record<string, string>> => {
  const entries = await Promise.all(
    config.sections.map(async (section) => {
      const response = await fetch(
        getPublicPath(`sections/${encodeURIComponent(section.name)}.md`),
      )

      if (!response.ok) {
        throw new Error(
          `Unable to load public/sections/${section.name}.md`,
        )
      }

      return [section.name, await response.text()] as const
    }),
  )

  return Object.fromEntries(entries)
}
