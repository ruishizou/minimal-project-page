export const requireRecord = (
  input: unknown,
  fieldName: string,
): Record<string, unknown> => {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return input as Record<string, unknown>
  }

  throw new Error(`${fieldName} must be an object`)
}

export const optionalRecord = (
  input: unknown,
): Record<string, unknown> | undefined => {
  if (input === undefined || input === null) {
    return undefined
  }

  return requireRecord(input, "optional config block")
}

export const requireArray = (
  input: unknown,
  fieldName: string,
): unknown[] => {
  if (Array.isArray(input) && input.length > 0) {
    return input
  }

  throw new Error(`${fieldName} must be a non-empty array`)
}

export const optionalArray = (
  input: unknown,
  fieldName: string,
): unknown[] => {
  if (input === undefined || input === null) {
    return []
  }

  if (Array.isArray(input)) {
    return input
  }

  throw new Error(`${fieldName} must be an array`)
}

export const optionalString = (input: unknown): string | undefined =>
  typeof input === "string" && input.trim().length > 0
    ? input.trim()
    : undefined

export const optionalBoolean = (input: unknown): boolean | undefined =>
  typeof input === "boolean" ? input : undefined

export const optionalStringList = (
  input: unknown,
  fieldName: string,
): string[] | undefined => {
  if (input === undefined || input === null) {
    return undefined
  }

  if (typeof input === "string") {
    return [requireString(input, fieldName)]
  }

  if (!Array.isArray(input)) {
    throw new Error(`${fieldName} must be a string or an array of strings`)
  }

  const tags = input.map((item, index) =>
    requireString(item, `${fieldName}[${index}]`),
  )

  return tags.length > 0 ? tags : undefined
}

export const mergeStringLists = (
  ...tagGroups: Array<string[] | undefined>
): string[] | undefined => {
  const tags = tagGroups.flatMap((group) => group ?? [])

  return tags.length > 0 ? Array.from(new Set(tags)) : undefined
}

export const requireString = (
  input: unknown,
  fieldName: string,
): string => {
  const value = optionalString(input)

  if (!value) {
    throw new Error(`${fieldName} must be a non-empty string`)
  }

  return value
}
