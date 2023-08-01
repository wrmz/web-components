/**
 * @injectHTML
 */
class Donut extends HTMLElement {
    static get observedAttributes() {
        return [

        ];
    }

    constructor() {
        super();this.attachShadow({mode:'open'}).innerHTML=`<style></style><div class="chart chart--donut"><svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events" width="160" height="160" viewBox="0 0 160 160" class="donut"></svg></div>`;
        console.log('in a donut');
    }

    attributeChangedCallback(attr, oldVal, newVal) {

    }
}

if (!window.customElements.get('donut')) {
    window.customElements.define('donut', Donut);
}

export { Donut };
//# sourceMappingURL=donut.js.map
