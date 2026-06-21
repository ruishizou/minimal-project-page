import {
  isValidElement,
  type ReactNode,
} from "react"

export const getNodeText = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join("")
  }

  if (isValidElement(node)) {
    return getNodeText(
      (node.props as { children?: ReactNode }).children,
    )
  }

  return ""
}
