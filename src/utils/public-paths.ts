const externalOrSpecialUrlPattern = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i

export const getPublicPath = (path: string): string => {
  if (externalOrSpecialUrlPattern.test(path)) {
    return path
  }

  const baseUrl = import.meta.env.BASE_URL || "/"
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  const normalizedPath = path
    .replace(/^public\//, "")
    .replace(/^\.?\//, "")
    .replace(/^\/+/, "")

  return `${normalizedBaseUrl}${normalizedPath}`
}
