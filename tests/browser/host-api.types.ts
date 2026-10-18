import type { ILayout } from '@deepseek-ai/dsh-client-ui-layout/client'
import type { Modal, MenuSurface, useAnchoredPosition } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InputTriggerServiceContract } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type { ModelLabelOwner } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type { SlotMap } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionProjectionMap } from '@deepseek-ai/dsh-session-projection/types'
import type {} from '@deepseek-ai/dsh-session-stats/client'
import type {} from '@deepseek-ai/dsh-token-meter/client'
export type HostApi = [
  ILayout['panelInfo'], ILayout['selectPanel'],
  typeof Modal, typeof MenuSurface, typeof useAnchoredPosition,
  SlotMap['conversation.input.model.label']['owner'], ModelLabelOwner,
  InputTriggerServiceContract['sessionOf'],
  ReturnType<InputTriggerServiceContract['sessionOf']>['menu'],
  ReturnType<InputTriggerServiceContract['sessionOf']>['dismiss'],
  SessionProjectionMap['sessionStats'], SessionProjectionMap['tokenUsage'], SessionProjectionMap['contextPressure']
]
