/**
 * Install-name editor state: a per-origin saved name rewrites the manifest link
 * and the Apple title before installation. The host manifest handler reads the
 * same name from the link query, so this module owns only page-side metadata.
 */

/** Per-origin storage key for the installer-supplied name. */
export const INSTALL_NAME_STORAGE_KEY = 'dsh-web-mobile.install-name'

/** Maximum install name length, in Unicode code points; the host handler mirrors this bound. */
export const INSTALL_NAME_LIMIT = 40

/** Management-menu entry id handled by the workbench instead of a panel. */
export const INSTALL_NAME_ENTRY_ID = 'install-name'

/** Minimal attribute surface shared by the manifest link and Apple title meta. */
export interface InstallNameAttribute {
  getAttribute(name: string): string | null
  setAttribute(name: string, value: string): void
}

/** Document surface this module queries; DOM and test doubles both satisfy it. */
export interface InstallNameDocument {
  querySelector(selector: string): InstallNameAttribute | null
}

/** Storage surface this module uses; an unavailable Storage disables persistence only. */
export interface InstallNameStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/** Render snapshot for the install-name modal. */
export interface InstallNameSnapshot {
  open: boolean
  value: string
}

/** Observable source for the slot renderer's selector hook. */
export interface InstallNameSource {
  getSnapshot(): InstallNameSnapshot
  subscribe(listener: () => void): () => void
}

/** Page metadata and modal state owned by the mobile workbench. */
export interface InstallNameController extends InstallNameSource {
  install(): void
  dispose(): void
  open(): void
  close(): void
  save(value: string): void
  restore(): void
}

/**
 * Trim and bound one user-supplied name.
 * @param value - raw input, possibly padded or empty.
 * @returns the trimmed name at most {@link INSTALL_NAME_LIMIT} code points long.
 */
export function normalizeInstallName(value: string): string {
  return Array.from(value.trim()).slice(0, INSTALL_NAME_LIMIT).join('')
}

/**
 * Manifest href carrying the install name.
 * @param href - original manifest link href, possibly already carrying a name parameter.
 * @param name - installer-supplied name; empty removes the parameter.
 * @returns the same href with only the name query updated.
 */
export function manifestHrefWithName(href: string, name: string): string {
  const isAbsolute = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)
  const url = new URL(href, 'http://localhost')
  url.searchParams.delete('name')
  const normalized = normalizeInstallName(name)
  if (normalized !== '') url.searchParams.set('name', normalized)
  return isAbsolute ? url.toString() : url.pathname + url.search
}

/**
 * Create the install-name owner.
 * @param doc - document carrying the manifest link and Apple title meta.
 * @param storage - optional per-origin storage; unavailable storage keeps this visit only.
 * @returns controller applying the saved name and serving the modal snapshot.
 */
export function createInstallNameController(doc: InstallNameDocument, storage: InstallNameStorage | undefined): InstallNameController {
  const manifest = doc.querySelector('link[rel="manifest"]')
  const appleTitle = doc.querySelector('meta[name="apple-mobile-web-app-title"]')
  const configured = doc.querySelector('meta[name="dsh-mobile-install-name"]')
  const originalHref = manifest?.getAttribute('href') ?? '/manifest.webmanifest'
  const originalTitle = appleTitle?.getAttribute('content') ?? ''
  const defaultName = normalizeInstallName(configured?.getAttribute('content') ?? '') || normalizeInstallName(originalTitle)
  const listeners = new Set<() => void>()
  let open = false
  let installed = false
  let value = ''

  function readName(): string {
    try {
      return normalizeInstallName(storage?.getItem(INSTALL_NAME_STORAGE_KEY) ?? '')
    } catch {
      // Storage can be denied in hardened browser modes; only persistence is lost.
      return ''
    }
  }

  function writeName(name: string | undefined): void {
    try {
      if (name === undefined) storage?.removeItem(INSTALL_NAME_STORAGE_KEY)
      else storage?.setItem(INSTALL_NAME_STORAGE_KEY, name)
    } catch {
      // Same fallback as reads: apply the name for this visit without persistence.
    }
  }

  function applyName(name: string): void {
    const normalized = normalizeInstallName(name)
    if (normalized === '') {
      manifest?.setAttribute('href', originalHref)
      appleTitle?.setAttribute('content', originalTitle)
      return
    }
    manifest?.setAttribute('href', manifestHrefWithName(originalHref, normalized))
    appleTitle?.setAttribute('content', normalized)
  }

  value = readName() || defaultName
  let snapshot: InstallNameSnapshot = { open, value }
  const emit = (): void => {
    snapshot = { open, value }
    for (const listener of listeners) listener()
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    install() {
      if (installed) return
      installed = true
      const stored = readName()
      value = stored || defaultName
      if (stored !== '') applyName(stored)
      emit()
    },
    dispose() {
      installed = false
      open = false
      applyName('')
      listeners.clear()
    },
    open() {
      if (open) return
      value = readName() || defaultName
      open = true
      emit()
    },
    close() {
      if (!open) return
      open = false
      emit()
    },
    save(name) {
      const normalized = normalizeInstallName(name)
      if (normalized === '') return
      writeName(normalized)
      value = normalized
      applyName(normalized)
      emit()
    },
    restore() {
      writeName(undefined)
      value = defaultName
      applyName('')
      emit()
    },
  }
}
