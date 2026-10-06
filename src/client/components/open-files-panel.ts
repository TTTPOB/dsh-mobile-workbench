/** Native rc.2 right-workspace controls. */
export const HOST_FILES_OPENER = '[data-sidebar-right-expand]'
export const HOST_FILES_CLOSER = '[data-sidebar-right-toggle]'

interface FilesPanelDocument {
  querySelector: (selector: string) => unknown
}

/** Delegate to the native control; absent workspace support stays unavailable. */
export function openFilesPanel(doc: FilesPanelDocument = document): boolean {
  const opener = doc.querySelector(HOST_FILES_OPENER) as { click?: () => void } | null
  const closer = doc.querySelector(HOST_FILES_CLOSER) as { click?: () => void } | null
  const control = typeof opener?.click === 'function' ? opener : closer
  if (typeof control?.click !== 'function') return false
  control.click()
  return true
}
