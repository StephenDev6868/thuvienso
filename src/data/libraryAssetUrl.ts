const DEFAULT_LIBRARY_ASSET_BASE_URL =
  'https://media.githubusercontent.com/media/StephenDev6868/thuvienso/a408872a22ea245abe448733b1c621b83d1585c4/src/data'
const PDF_PROXY_BASE_URL = '/books'

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

export function getPdfAssetUrl(sourceFolder: string, relativePath: string) {
  if (import.meta.env.DEV) return getLibraryAssetUrl(sourceFolder, relativePath)

  return `${PDF_PROXY_BASE_URL}/${encodeAssetPath(`${sourceFolder}/${relativePath}`)}`
}
