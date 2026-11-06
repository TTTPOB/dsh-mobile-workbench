import { type ReactElement } from 'react';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { type InstallNameSnapshot } from './install-name.ts';
/** Controller face shared with the management menu that opens this editor. */
export interface InstallNameInjected {
    hooks: {
        installName: {
            getSnapshot(): InstallNameSnapshot;
            subscribe(listener: () => void): () => void;
        };
    };
    closeInstallName: () => void;
    saveInstallName: (name: string) => void;
    restoreInstallName: () => void;
}
type Props = PropsRuntime<'shell.overlay'> & InjectFace<InstallNameInjected> & PropsLocale<'mobileWorkbench'>;
/** Edit the name this origin will suggest when installed; saved names rewrite the manifest link. */
export declare function InstallNameModal({ useInstallName, closeInstallName, saveInstallName, restoreInstallName, t }: Props): ReactElement | null;
export {};
//# sourceMappingURL=InstallNameModal.d.ts.map