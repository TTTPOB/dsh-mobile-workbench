import { useEffect, useState, type ReactElement } from 'react'
import { Button, Input, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { INSTALL_NAME_LIMIT, normalizeInstallName, type InstallNameSnapshot } from './install-name.ts'

/** Controller face shared with the management menu that opens this editor. */
export interface InstallNameInjected {
  hooks: {
    installName: {
      getSnapshot(): InstallNameSnapshot
      subscribe(listener: () => void): () => void
    }
  }
  closeInstallName: () => void
  saveInstallName: (name: string) => void
  restoreInstallName: () => void
}

type Props = PropsRuntime<'shell.overlay'> & InjectFace<InstallNameInjected> & PropsLocale<'mobileWorkbench'>

/** Edit the name this origin will suggest when installed; saved names rewrite the manifest link. */
export function InstallNameModal({ useInstallName, closeInstallName, saveInstallName, restoreInstallName, t }: Props): ReactElement | null {
  const state = useInstallName(value => value)
  const [draft, setDraft] = useState(state.value)
  // Opening starts from the current effective name; saving or restoring closes the modal.
  useEffect(() => { if (state.open) setDraft(state.value) }, [state.open, state.value])
  if (!state.open) return null
  const normalized = normalizeInstallName(draft)
  return (
    <Modal open title={t('installNameTitle')} closeLabel={t('close')} onClose={closeInstallName}
      className="mobile-workbench-install-name" description={t('installNameDescription')}
      footer={<>
        <Button variant="outline" onClick={() => { restoreInstallName(); closeInstallName() }}>{t('installNameRestore')}</Button>
        <Button variant="primary" disabled={normalized === ''}
          onClick={() => { saveInstallName(normalized); closeInstallName() }}>{t('installNameSave')}</Button>
      </>}>
      <Input value={draft} maxLength={INSTALL_NAME_LIMIT} autoComplete="off" spellCheck={false}
        data-modal-autofocus aria-label={t('installNameTitle')}
        onChange={event => { setDraft(event.target.value) }} />
      <p data-install-name-hint>{t('installNameLimit', { max: INSTALL_NAME_LIMIT })}</p>
    </Modal>
  )
}
