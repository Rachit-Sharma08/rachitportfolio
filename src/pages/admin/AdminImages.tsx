import { useCallback, useEffect, useState } from 'react'
import { RotateCcw, Upload } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { AdminPanel, Button, Status, TextField } from '../../components/admin/Fields'
import { getSettings, saveSetting, uploadImage } from '../../lib/adminApi'
import { describeSize, prepareImage, probeImage } from '../../lib/imagePrep'
import type { MediaFolder } from '../../lib/adminApi'
import { DEFAULT_SETTINGS, IMAGE_FIELDS } from './constants'

type Size = { width: number; height: number }

/** How far the two hero images may differ before the reveal breaks. */
const TOLERANCE = 0.01

interface Mismatch {
  field: string
  message: string
}

export default function AdminImages() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [sizes, setSizes] = useState<Record<string, Size | null>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [mismatch, setMismatch] = useState<Mismatch | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const values = await getSettings()
      if (cancelled) return
      setSettings(values)
      const measured: Record<string, Size | null> = {}
      for (const [key, url] of Object.entries(values)) {
        measured[key] = url ? await probeImage(url) : null
      }
      if (!cancelled) setSizes(measured)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const heroSize = (key: string) =>
    (key === 'hero_base_url' ? sizes.hero_reveal_url : sizes.hero_base_url) ?? null

  const upload = useCallback(
    async (key: string, folder: MediaFolder, name: string, file: File) => {
      setBusy(key)
      setState('idle')
      setMismatch(null)
      try {
        const prepared = await prepareImage(file, 0.92)

        // The two hero layers are stacked on top of each other and the reveal is
        // a radial mask, so any difference in size or aspect ratio shows up as a
        // visible jump. Check before overwriting a good pair.
        if (key === 'hero_base_url' || key === 'hero_reveal_url') {
          // Read straight from `sizes` rather than through `heroSize`, so this
          // always compares against the current value instead of a closure
          // captured when the callback was last memoised.
          const other =
            sizes[key === 'hero_base_url' ? 'hero_reveal_url' : 'hero_base_url'] ??
            null
          if (other && prepared.width) {
            const newRatio = prepared.width / prepared.height
            const otherRatio = other.width / other.height
            const wrongSize =
              prepared.width !== other.width || prepared.height !== other.height
            if (wrongSize || Math.abs(newRatio - otherRatio) > TOLERANCE) {
              setMismatch({
                field: key,
                message: `This photo is ${describeSize({ width: prepared.width, height: prepared.height })} but the other hero layer is ${describeSize(other)}. The cursor reveal stacks these two on top of each other, so a mismatch makes the swap jump.`,
              })
              return
            }
          }
        }

        const url = await uploadImage(prepared.file, folder, `${name}.webp`)
        await saveSetting(key, url)
        setSettings((prev) => ({ ...prev, [key]: url }))
        setSizes((prev) => ({
          ...prev,
          [key]: prepared.width
            ? { width: prepared.width, height: prepared.height }
            : null,
        }))
        setState('ok')
        setMessage('Saved. The change goes live within about five minutes.')
      } catch (error) {
        setState('error')
        setMessage(error instanceof Error ? error.message : 'Upload failed.')
      } finally {
        setBusy(null)
      }
    },
    // Re-created when the measured sizes change, so the hero-pair check above
    // always sees the current values.
    [sizes],
  )

  const forceUpload = async (
    key: string,
    folder: MediaFolder,
    name: string,
    file: File,
  ) => {
    setMismatch(null)
    setBusy(key)
    setState('idle')
    try {
      const prepared = await prepareImage(file, 0.92)
      const url = await uploadImage(prepared.file, folder, `${name}.webp`)
      await saveSetting(key, url)
      setSettings((prev) => ({ ...prev, [key]: url }))
      // Record the size we actually stored. Skipping this would leave the
      // previous layer's measurement in place, so the next upload would keep
      // comparing against a size that is no longer on the site.
      setSizes((prev) => ({
        ...prev,
        [key]: { width: prepared.width, height: prepared.height },
      }))
      setState('ok')
      setMessage('Saved anyway. Crop both hero photos to the same size to be safe.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setBusy(null)
    }
  }

  const restore = async (key: string) => {
    setBusy(key)
    setState('idle')
    setMismatch(null)
    try {
      const value = DEFAULT_SETTINGS[key]
      const measured = await probeImage(value)
      await saveSetting(key, value)
      setSettings((prev) => ({ ...prev, [key]: value }))
      setSizes((prev) => ({ ...prev, [key]: measured }))
      setState('ok')
      setMessage('Restored the original file.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Could not restore.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <AdminLayout
      title="Images"
      subtitle="The two hero photos and the social preview. Uploading replaces the file in Supabase Storage and points the site at the new one."
    >
      <Status state={state} message={message} />

      {mismatch ? (
        <div
          role="alert"
          className="rounded-tile border border-danger/40 bg-danger/5 p-5"
        >
          <p className="text-sm font-semibold text-danger">Size mismatch</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{mismatch.message}</p>
          <label className="pill mt-4 inline-flex cursor-pointer items-center gap-2 border-danger/40 px-5 py-2.5 text-sm text-danger">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Upload it anyway
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                const field = IMAGE_FIELDS.find((f) => f.key === mismatch.field)
                if (file && field) void forceUpload(field.key, field.folder, field.file, file)
                e.target.value = ''
              }}
            />
          </label>
        </div>
      ) : null}

      {IMAGE_FIELDS.map((field) => {
        const value = settings[field.key] ?? DEFAULT_SETTINGS[field.key]
        const size = sizes[field.key] ?? null
        const isHero = field.key !== 'og_image_url'
        return (
          <AdminPanel key={field.key} title={field.label} description={field.hint}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="w-full flex-shrink-0 overflow-hidden rounded-tile border border-stroke bg-bg-elevated sm:w-64">
                <img
                  src={value}
                  alt={`Current ${field.label.toLowerCase()}`}
                  className={
                    isHero
                      ? 'aspect-[3/4] w-full object-contain object-bottom'
                      : 'aspect-[1200/630] w-full object-cover'
                  }
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <TextField
                  label="Current value"
                  value={value}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                />
                <p className="text-xs text-muted">
                  Size: {describeSize(size)}
                  {isHero
                    ? ` · paired with ${describeSize(heroSize(field.key))}`
                    : ''}
                </p>
                <div className="flex flex-wrap gap-3">
                  <label className="pill pill-primary inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    {busy === field.key ? 'Uploading…' : 'Upload new'}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={busy === field.key}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) void upload(field.key, field.folder, field.file, file)
                        e.target.value = ''
                      }}
                    />
                  </label>
                  <Button
                    disabled={busy === field.key}
                    onClick={() => void restore(field.key)}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" /> Restore default
                  </Button>
                  <Button
                    variant="primary"
                    disabled={busy === field.key}
                    onClick={async () => {
                      setBusy(field.key)
                      setState('idle')
                      try {
                        await saveSetting(field.key, value)
                        setState('ok')
                        setMessage('Saved.')
                      } catch (error) {
                        setState('error')
                        setMessage(
                          error instanceof Error ? error.message : 'Could not save.',
                        )
                      } finally {
                        setBusy(null)
                      }
                    }}
                  >
                    Save value
                  </Button>
                </div>
              </div>
            </div>
          </AdminPanel>
        )
      })}
    </AdminLayout>
  )
}
