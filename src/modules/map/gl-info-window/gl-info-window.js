
/**
 * @injectHTML
 */
export class GlInfoWindow extends HTMLElement {
    constructor() {
        super();
    }
}

if (!window.customElements.get('gl-info-window')) {
    window.customElements.define('gl-info-window', GlInfoWindow);
}
