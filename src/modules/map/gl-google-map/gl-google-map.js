/*global google*/
/**
 * @injectHTML
 */
export class GlGoogleMap extends HTMLElement {
    static get observedAttributes() {
        return [
            'key',
        ];
    }

    constructor() {
        super();
        this.errors = [];
        this.utilTimeout = undefined;
        this.key = '';
        this.id = crypto.randomUUID ? crypto.randomUUID().split('-').pop() : (Math.random() * 1000);
        this.apiLoadedCBName = `gl_cb_${this.id}`;
        this.map = undefined;
        this.elem = this.shadowRoot.querySelector('.map');
        this.elem.setAttribute('id', `map_${this.id}`);
    }

    handleApiLoaded() {
        this.map = new google.maps.Map(this.elem, {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8
        });
    }

    loadGoogleMapsApi() {
        const endpoint = 'https://maps.googleapis.com/maps/api/js';
        const script = document.createElement('script');
        script.id = `map_script_${this.id}`;
        script.type = 'text/javascript';
        script.src = `${endpoint}?key=${this.key}&callback=${this.apiLoadedCBName}&v=weekly`;
        script.defer = true;
        script.async = true;
        window[this.apiLoadedCBName] = this.handleApiLoaded.bind(this);
        document.head.appendChild(script);
    }

    /**
     * Fires when the component is connected to the DOM
     */
    connectedCallback() {

    }

    /**
     * Handles changes to the component attributes
     * @param {String} name
     * @param {String} oldValue
     * @param {String} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'key' && newValue) {
            this.key = newValue;
            this.removeAttribute('key');
            this.loadGoogleMapsApi();
        }
    }
}

if (!window.customElements.get('gl-google-map')) {
    window.customElements.define('gl-google-map', GlGoogleMap);
}
