import { registerComponents } from '../../common/register-components.js';
import { ChevronIcon } from '../../icon/chevron-icon/chevron-icon.js';

/**
 * @injectHTML
 */
class InfoMessage extends HTMLElement {
    constructor() {
        super();const el=document.createElement('template');el.innerHTML=`<style>:host{display:none;padding:2px;font-size:12px;line-height:16px;color:#555;align-items:center}:host([shown]){display:flex}:host([role=alert][shown]:not([invalid])){display:none}:host([role=alert][invalid][shown]){display:flex}</style><chevron-icon aria-hidden="true"></chevron-icon><slot></slot>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
        registerComponents(ChevronIcon);
        this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.handleSlotChange, false);
    }

    handleSlotChange(e) {
        e.target.assignedElements({ flatten: true }).length > 0 ? this.setAttribute('shown', '') : this.removeAttribute('shown');
    }
}

if (!window.customElements.get('info-message')) {
    window.customElements.define('info-message', InfoMessage);
}

export { InfoMessage };
//# sourceMappingURL=info-message.js.map
