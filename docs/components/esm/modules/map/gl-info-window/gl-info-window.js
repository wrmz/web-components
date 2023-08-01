/**
 * @injectHTML
 */
class GlInfoWindow extends HTMLElement {
    constructor() {
        super();const el=document.createElement('template');el.innerHTML=`<article class="lot"><div class="lot__image"><img alt="" src="https://picsum.photos/id/237/320/240" width="320" height="240" loading="lazy" class="lot__img"></div><div class="lot__content"><h3><span contenteditable="true">Dog</span> <span class="model">Model</span></h3><p>Block 1, Homesite 1</p><p>Lot location, Orlando, FL 32837</p><div class="lot__snapshot"><div><strong>3</strong> bds</div><div><strong>2</strong> ba</div><div><strong>1,447</strong> sqft</div></div><a href="#google-map-code" class="lot__cta">Say More</a></div></article>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
    }
}

if (!window.customElements.get('gl-info-window')) {
    window.customElements.define('gl-info-window', GlInfoWindow);
}

export { GlInfoWindow };
//# sourceMappingURL=gl-info-window.js.map
