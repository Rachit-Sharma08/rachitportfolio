/**
 * Client-side image preparation.
 *
 * Uploads are re-encoded to WebP before they leave the browser: the hero cut-outs
 * are the two largest files the site ships, and a phone photo straight off the
 * camera is several megabytes of PNG. Dimensions are never changed — the
 * cursor-reveal effect stacks the two hero images on top of each other, so any
 * resize would break the alignment it depends on.
 */

export interface PreparedImage {
  file: File
  width: number
  height: number
  /** True when the source could not be re-encoded and the original is used. */
  passthrough: boolean
}

const WEBP_SUPPORTED =
  typeof document !== 'undefined' &&
  typeof document.createElement('canvas').toDataURL === 'function' &&
  document
    .createElement('canvas')
    .toDataURL('image/webp')
    .startsWith('data:image/webp')

function swapExtension(name: string, extension: string) {
  return `${name.replace(/\.[^.]+$/, '')}.${extension}`
}

export async function prepareImage(
  file: File,
  quality = 0.9,
): Promise<PreparedImage> {
  if (!WEBP_SUPPORTED || !file.type.startsWith('image/')) {
    return { file, width: 0, height: 0, passthrough: true }
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return { file, width: 0, height: 0, passthrough: true }
  }

  const { width, height } = bitmap
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return { file, width, height, passthrough: true }
  }
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', quality),
  )

  if (!blob || blob.type !== 'image/webp') {
    return { file, width, height, passthrough: true }
  }

  return {
    file: new File([blob], swapExtension(file.name, 'webp'), {
      type: 'image/webp',
    }),
    width,
    height,
    passthrough: false,
  }
}

/** Natural size of an already-hosted image, for the hero alignment check. */
export function probeImage(
  url: string,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => resolve(null)
    img.src = url
  })
}

export function describeSize(size: { width: number; height: number } | null) {
  if (!size || !size.width || !size.height) return 'unknown size'
  const ratio = size.width / size.height
  return `${size.width} x ${size.height} (${ratio.toFixed(3)}:1)`
}
