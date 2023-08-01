/**
 * @injectHTML
 */
class ChevronIcon extends HTMLElement {
    constructor() {
        super();const el=document.createElement('template');el.innerHTML=`<style>svg{display:flex;align-items:center;justify-content:center;width:var(--width,24px);height:var(--height,24px)}</style><svg width="17" height="9" viewBox="0 0 17 9" xmlns="http://www.w3.org/2000/svg" class="svg-chevron" fill="currentColor"><title>Chevron Icon</title><path d="M16.749.356l-.255-.255a.43.43 0 00-.61 0L8.878 7.113 1.866.1a.43.43 0 00-.61 0l-.255.255a.43.43 0 000 .61l7.568 7.57a.43.43 0 00.61 0l7.566-7.57a.428.428 0 00.004-.61z" fill-rule="nonzero"/></svg>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
    }

    static get observedAttributes() { return ['title']; }

    attributeChangedCallback(attrName, oldVal, newVal) {
        this.shadowRoot.querySelector('svg title').textContent = newVal;
    }
}

if (!window.customElements.get('chevron-icon')) {
    window.customElements.define('chevron-icon', ChevronIcon);
}

export { ChevronIcon };
//# sourceMappingURL=chevron-icon.js.map
