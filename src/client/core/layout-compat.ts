import type { ILayout } from '@deepseek-ai/dsh-client-ui-layout/client'

/** Return the public rc.1 panel command used to reveal the session page. */
export function panelSelectorOf(layout: Pick<ILayout, 'selectPanel'>): () => void {
  return (): void => { layout.selectPanel(null) }
}
