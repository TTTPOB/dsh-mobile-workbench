import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { ComposerFileButton } from './components/ComposerFileButton.tsx'
import { openFilesPanel } from './components/open-files-panel.ts'
import { MOBILE_CSS } from './styles/index.ts'
import { installWorkbench } from './workbench/index.ts'
import { installWorkbenchComposer } from './workbench/composer.ts'

import { installFrameController, installOverlayInteractions, installPhoneChrome, installReconciler, registerReconcileTasks } from './effects/phone-chrome.ts'
import { installSidebarSwipe } from './effects/sidebar-swipe.ts'
import { installSubagentChipTouch } from './effects/subagent-chip-touch.ts'
import { installComposerKeyboardGuard } from './effects/composer-keyboard-guard.ts'
import { installComposerPlusToggle } from './effects/composer-plus-toggle.ts'
import { installWorkspaceChipToggle } from './effects/workspace-chip-toggle.ts'
import { installTeamChipToggle } from './effects/team-chip-toggle.ts'
import { installModelMenuAnchor } from './effects/model-menu-anchor.ts'
import { installShortcutModalKeyboardGuard } from './effects/shortcut-modal-keyboard-guard.ts'
import { installSessionFocusGuard } from './effects/session-focus-guard.ts'
import { installInstalledListStyles } from './effects/installed-list.ts'
import { installAionuiCompat } from './effects/aionui-compat.ts'
import { createPanelExit, installPanelRowExit } from './effects/panel-exit.ts'
import { installDebugBadge } from './debug.ts'
import { NS, en, zh } from './i18n/locales.ts'
import type { MobileNavKey } from './i18n/locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Directory-drawer controls copy. */
    'mobileNav': MobileNavKey
  }
}

/** Required services (cordis fiber inject — the loader passes all module exports as an object plugin). */
export const inject = ['slots', 'layout', 'locale', 'sessions', 'workspaces']

/**
 * Mobile-adaptive shell, browser half: injects the mobile stylesheet, then
 * contributes the directory toggle to the session header and the backdrop +
 * floating button to the shell overlay.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-web-mobile: dictionaries')

  ctx.effect(() => {

    for (const stale of document.querySelectorAll('style[data-plugin-css="dsh-web-mobile/mobile.css"]')) {
      stale.remove()
    }
    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-web-mobile'
    tag.dataset.pluginCss = 'dsh-web-mobile/mobile.css'
    tag.textContent = MOBILE_CSS
    document.head.appendChild(tag)

    setTimeout(() => {
      if (tag.isConnected) document.head.appendChild(tag)
    }, 0)
    return () => {
      tag.remove()
    }
  }, 'dsh-web-mobile: styles')

  installInstalledListStyles(ctx)

  const panelExit = createPanelExit(ctx.layout)

  ctx.effect(() => {
    const stops = [
      installFrameController(),
      installReconciler(ctx),
      registerReconcileTasks(ctx, panelExit),
    ]
    return () => {
      for (const stop of stops) stop()
    }
  }, 'dsh-web-mobile: reconciler infrastructure')

  installOverlayInteractions(ctx)

  installPanelRowExit(ctx, panelExit.exit)

  installSidebarSwipe(ctx, openFilesPanel)

  installSubagentChipTouch(ctx)

  installComposerKeyboardGuard(ctx)
  installComposerPlusToggle(ctx)

  installWorkspaceChipToggle(ctx)

  installTeamChipToggle(ctx)

  installModelMenuAnchor(ctx)

  installShortcutModalKeyboardGuard(ctx)

  installSessionFocusGuard(ctx)

  installPhoneChrome(ctx)

  installAionuiCompat(ctx)
  installWorkbench(ctx)
  installWorkbenchComposer(ctx)

  installDebugBadge(ctx)

  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
    name: 'conversation.input.left',
    id: 'mobile-nav-file-upload',
    order: 10,
    locale: NS,
    inject: () => ({}),
  }, ComposerFileButton))
}

import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
