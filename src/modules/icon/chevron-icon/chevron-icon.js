/**
 * @injectHTML
 */
export class ChevronIcon extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() { return ['title'] };

    attributeChangedCallback(attrName, oldVal, newVal) {
        this.shadowRoot.querySelector('svg title').textContent = newVal;
    }
}

if (!window.customElements.get('chevron-icon')) {
    window.customElements.define('chevron-icon', ChevronIcon);
}
