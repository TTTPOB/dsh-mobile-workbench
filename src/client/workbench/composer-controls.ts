import type { Context } from '@deepseek-ai/cordis'
import { COMPOSER_NS } from './composer-locales.ts'

export interface ComposerControls {
  button: HTMLButtonElement
  header: HTMLElement
  heading: HTMLElement
  done: HTMLButtonElement
  update(value: boolean): void
  dispose(): void
}

let headingSequence = 0

/** Only the plugin-owned controls are mounted or moved; the editor remains native. */
export function createComposerControls(ctx: Context, toggle: (keyboard: boolean) => void): ComposerControls {
  const button = document.createElement('button')
  button.type = 'button'
  button.setAttribute('data-mobile-compose-toggle', '')
  button.setAttribute('aria-expanded', 'false')
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6')
  svg.append(path)
  button.append(svg)
  const header = document.createElement('div')
  header.setAttribute('data-mobile-compose-header', '')
  const heading = document.createElement('strong')
  heading.id = 'mobile-compose-heading-' + ++headingSequence
  const done = document.createElement('button')
  done.type = 'button'
  header.append(heading, done)
  const t = ctx.locale.bind(COMPOSER_NS)
  let expanded = false
  const render = (): void => {
    const caption = t(expanded ? 'collapse' : 'expand')
    button.setAttribute('aria-label', caption)
    button.title = caption
    button.setAttribute('aria-expanded', String(expanded))
    heading.textContent = t('draft')
    done.textContent = t('done')
    done.setAttribute('aria-label', t('collapse'))
    done.title = t('collapse')
  }
  const keepSelection = (event: Event): void => event.preventDefault()
  const onClick = (event: MouseEvent): void => {
    event.stopPropagation()
    toggle(event.detail === 0)
  }
  for (const control of [button, done]) {
    control.addEventListener('pointerdown', keepSelection)
    control.addEventListener('mousedown', keepSelection)
    control.addEventListener('click', onClick)
  }
  const unsubscribe = ctx.locale.subscribe(render)
  render()
  return {
    button, header, heading, done,
    update(value: boolean): void { expanded = value; render() },
    dispose(): void {
      unsubscribe()
      for (const control of [button, done]) {
        control.removeEventListener('pointerdown', keepSelection)
        control.removeEventListener('mousedown', keepSelection)
        control.removeEventListener('click', onClick)
      }
      button.remove()
      header.remove()
    },
  }
}
