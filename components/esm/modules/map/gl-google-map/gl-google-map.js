let google = null;

/**
 * @injectHTML
 */
class GlGoogleMap extends HTMLElement {
    static get observedAttributes() {
        return [
            'key',
        ];
    }

    constructor() {
        super();this.attachShadow({mode:'open'}).innerHTML=`<style>:host{position:relative;display:block;width:100%;min-height:300px}:host .map{position:absolute;top:0;left:0;width:100%;height:100%}</style><div class="map"></div>`;
        this.errors = [];
        this.utilTimeout = undefined;
        this.key = '';
        this.id = crypto.randomUUID ? crypto.randomUUID().split('-').pop() : (Math.random() * 1000);
        this.handleApiLoaded = `gl_cb_${this.id}`;
        this.map = undefined;
        this.elem = this.shadowRoot.querySelector('.map');
        this.elem.setAttribute('id', `map_${this.id}`);
        this.handleApiLoaded = this.handleApiLoaded.bind(this);
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
        window[this.apiLoadedCBName] = this.handleApiLoaded;
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

export { GlGoogleMap };
//# sourceMappingURL=gl-google-map.js.map
