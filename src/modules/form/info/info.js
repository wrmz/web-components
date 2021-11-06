import { registerComponents } from '../../common/register-components';
import { ChevronIcon } from '../../icon/chevron-icon/chevron-icon';

/**
 * @injectHTML
 */
export class Info extends HTMLElement {
    constructor() {
        super();
        registerComponents(ChevronIcon);
        this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.handleSlotChange, false);
    }

    handleSlotChange(e) {
        e.target.assignedElements({ flatten: true }).length > 0 ? this.setAttribute('shown', '') : this.removeAttribute('shown');
    }
}

if (!window.customElements.get('info')) {
    window.customElements.define('info', Info);
}
