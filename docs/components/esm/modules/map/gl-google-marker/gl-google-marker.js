class GlMarker extends HTMLElement {
    static get observedAttributes() {
        return [
            'latitude',
            'longitude',
            'status',
            'color',
        ];
    }

    constructor() {
        super();
    }

    get map() {
        return this.parentElement.map;
    }

    get latitude() {
        const latitude = parseFloat(this.hasAttribute('latitude') ? this.getAttribute('latitude') : '0');
        return isNaN(latitude) ? 0 : latitude;
    }

    set latitude(val) {
        this.setAttribute('latitude', val);
    }

    get longitude() {
        const longitude = parseFloat(this.hasAttribute('longitude') ? this.getAttribute('longitude') : '0');
        return isNaN(longitude) ? 0 : longitude;
    }

    set longitude(val) {
        this.setAttribute('longitude', val);
    }

    get status() {
        return this.getAttribute('status');
    }

    set status(val) {
        this.setAttribute('status', val);
    }

    get color() {
        return this.getAttribute('color');
    }

    set color(val) {
        this.setAttribute('color', val);
    }
}

if (!window.customElements.get('gl-google-marker')) {
    window.customElements.define('gl-google-marker', GlMarker);
}

export { GlMarker };
//# sourceMappingURL=gl-google-marker.js.map
