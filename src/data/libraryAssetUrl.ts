const DEFAULT_LIBRARY_ASSET_BASE_URL =
  'https://media.githubusercontent.com/media/StephenDev6868/thuvienso/main/src/data'

function encodeAssetPath(path: string) {
  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export function getLibraryAssetUrl(sourceFolder: string, relativePath: string) {
  const configuredBaseUrl = import.meta.env.VITE_LIBRARY_ASSET_BASE_URL?.trim()
  const baseUrl =
    configuredBaseUrl ||
    (import.meta.env.DEV ? '/src/data' : DEFAULT_LIBRARY_ASSET_BASE_URL)

  return `${baseUrl.replace(/\/$/, '')}/${encodeAssetPath(`${sourceFolder}/${relativePath}`)}`
}
