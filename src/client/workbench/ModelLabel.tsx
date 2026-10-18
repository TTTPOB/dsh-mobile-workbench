import { useSyncExternalStore, type ReactElement } from 'react'
import type { ModelLabelOwner } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import { MOBILE_QUERY } from '../effects/phone-chrome.ts'
import { composerModelName } from './composer-model-label.ts'

const subscribe = (notify: () => void): (() => void) => {
  const media = window.matchMedia(MOBILE_QUERY)
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}
const mobileSnapshot = (): boolean => window.matchMedia(MOBILE_QUERY).matches

/** The host owns selection, localization and catalog identity. This slot is text only. */
export function ModelLabel(owner: ModelLabelOwner): ReactElement {
  const mobile = useSyncExternalStore(subscribe, mobileSnapshot, () => false)
  return <span title={owner.model.name}>{composerModelName(owner, mobile)}</span>
}
