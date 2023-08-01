class GlMarker extends HTMLElement {
    static get observedAttributes() {
        return [
            'latitude',
            'longitude',
            'status',
            'color',
            'path',
            'is-admin',
        ];
    }

    static #defaultAdminPath = 'M10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10Z';
    static #defaultPath = 'M10 0c5.52285 0 10 4.47715 10 10 0 7.50794-5.59957 12.48988-10 12.48988S0 17.78101 0 10C0 4.47715 4.47715 0 10 0Zm0 3.4743c-3.60404 0-6.5257 2.92166-6.5257 6.5257 0 3.60404 2.92166 6.5257 6.5257 6.5257 3.60404 0 6.5257-2.92166 6.5257-6.5257 0-3.60404-2.92166-6.5257-6.5257-6.5257Zm0 3.0039c1.94504 0 3.5218 1.57676 3.5218 3.5218 0 1.94504-1.57676 3.5218-3.5218 3.5218-1.94504 0-3.5218-1.57676-3.5218-3.5218 0-1.94504 1.57676-3.5218 3.5218-3.5218Z';

    #id = `gl-marker-${crypto.randomUUID ? crypto.randomUUID().split('-').pop() : Math.round(Math.random() * 9999)}`;
    #marker;

    constructor() {
        super();
    }

    get id() { return this.hasAttribute('id') ? this.getAttribute('id') : this.#id; }

    get map() { return this.parentElement.map; }

    get mapMarker() {
        return this.#marker;
    }

    set mapMarker(newMapMarker) {
        this.#marker = newMapMarker;
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

    get isAdmin() {
        return this.hasAttribute('is-admin') && this.getAttribute('is-admin') === 'true';    }

    set isAdmin(val) {
        if (val) {
            this.setAttribute('is-admin', true);
        } else if (this.hasAttribute('is-admin')) {
            this.removeAttribute('is-admin');
        }
    }

    get path() {
        if (this.hasAttribute('path')) {
            return this.getAttribute('path');
        } else {
            return GlMarker.#defaultPath;
        }
    }

    set path(val) {
        if (val) {
            this.setAttribute('path', val);
        } else if (this.hasAttribute('path')) {
            this.removeAttribute('path');
        }
    }
}

if (!window.customElements.get('gl-marker')) {
    window.customElements.define('gl-marker', GlMarker);
}

export { GlMarker };
//# sourceMappingURL=gl-marker.js.map
