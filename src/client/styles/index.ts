import { BASE_CSS } from './base.css.ts'
import { LAYOUT_CSS } from './layout.css.ts'
import { COMPAT_CSS } from './compat.css.ts'
import { MISC_CSS } from './misc.css.ts'
import { WORKBENCH_COMPOSER_CSS } from './workbench-composer.css.ts'

/** Region styles share one tag: frame, overlays, integrations, browser inputs, composer. */
export const MOBILE_CSS = [LAYOUT_CSS, BASE_CSS, COMPAT_CSS, MISC_CSS, WORKBENCH_COMPOSER_CSS].join('\n')
