// Public assets stay separate from JavaScript and work under a subdirectory too.
export function assetUrl(filename) {
  return `${import.meta.env.BASE_URL}assets/${filename}`
}
