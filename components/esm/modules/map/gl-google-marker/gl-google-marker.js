class GlGoogleMarker extends HTMLElement {
    static get observedAttributes() {
        return [
            'latitude',
            'longitude',
        ];
    }

    constructor() {
        super();
    }

    get latitude() {
        const latitude = parseFloat(this.hasAttribute('latitude') ? this.getAttribute('latitude') : '0');
        return  isNaN(latitude) ? 0 : latitude;
    }

    get longitude() {
        const longitude = parseFloat(this.hasAttribute('longitude') ? this.getAttribute('longitude') : '0');
        return  isNaN(longitude) ? 0 : longitude;
    }
}

if (!window.customElements.get('gl-google-marker')) {
    window.customElements.define('gl-google-marker', GlGoogleMarker);
}

export { GlGoogleMarker };
//# sourceMappingURL=gl-google-marker.js.map
