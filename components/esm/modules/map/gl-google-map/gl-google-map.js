import { registerComponents } from '../../common/register-components.js';
import { GlGoogleMarker } from '../gl-google-marker/gl-google-marker.js';

/*global google*/

/**
 * @injectHTML
 */
class GlGoogleMap extends HTMLElement {
    static get observedAttributes() {
        return [
            'key',
            'latitude',
            'longitude',
            'overlay',
        ];
    }

    static getNormalizedCoord(coord, zoom) {
        const y = coord.y;
        let x = coord.x;
        const tileRange = 1 << zoom;

        if (y < 0 || y >= tileRange) {
            return null;
        }

        if (x < 0 || x >= tileRange) {
            x = ((x % tileRange) + tileRange) % tileRange;
        }

        return { x, y };
    }

    constructor() {
        super();const el = document.createElement('template');el.innerHTML = `<style>:host{position:relative;display:block;width:100%;min-height:400px}:host .map{position:absolute;top:0;left:0;width:100%;height:100%}</style><div class="map"></div>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));

        registerComponents(GlGoogleMarker);

        this.key = '';
        this._id = crypto.randomUUID ? crypto.randomUUID().split('-').pop() : Math.round(Math.random() * 9999);
        this._overlayElems = [...this.querySelectorAll('gl-google-overlay')];
        this._markerElems = [...this.querySelectorAll('gl-google-marker')];
        this._markers = [];
        this.apiLoadedCBName = `gl_cb_${this._id}`;
        this.map = undefined;
        this.overlayLayer = undefined;
        this.elem = this.shadowRoot.querySelector('.map');
        this.elem.setAttribute('id', `map_${this._id}`);

        this.generateMarker = this.generateMarker.bind(this);
    }

    get latitude() {
        const latitude = parseFloat(this.hasAttribute('latitude') ? this.getAttribute('latitude') : '0');
        return  isNaN(latitude) ? 0 : latitude;
    }

    get longitude() {
        const longitude = parseFloat(this.hasAttribute('longitude') ? this.getAttribute('longitude') : '0');
        return  isNaN(longitude) ? 0 : longitude;
    }

    get overlay() {
        return this.getAttribute('overlay');
    }

    get markerElems() {
        return [...this._markerElems];
    }

    get markers() {
        return this._markers;
    }

    set markers(markers) {
        if (this.map && google && google.maps) {
            this._markers = markers.map(this.generateMarker);
        } else {
            this._markers = [];
        }
    }

    handleApiLoaded() {
        this.map = new google.maps.Map(this.elem, {
            center: { lat: this.latitude, lng: this.longitude },
            zoom: 8
        });
        this.generateOverlay();
        this.markers = this.markerElems;
    }

    generateOverlay() {
        this.overlayLayer = new google.maps.KmlLayer({
            url: this.overlay,
            map: this.map
        });
    }

    generateMarker(marker) {
        const mapMarker = new google.maps.Marker({
            map: this.map,
            position: { lat: marker.latitude, lng: marker.longitude },
            icon: {
                path: 'M10 0c5.52285 0 10 4.47715 10 10 0 7.50794-5.59957 12.48988-10 12.48988S0 17.78101 0 10C0 4.47715 4.47715 0 10 0Zm0 3.4743c-3.60404 0-6.5257 2.92166-6.5257 6.5257 0 3.60404 2.92166 6.5257 6.5257 6.5257 3.60404 0 6.5257-2.92166 6.5257-6.5257 0-3.60404-2.92166-6.5257-6.5257-6.5257Zm0 3.0039c1.94504 0 3.5218 1.57676 3.5218 3.5218 0 1.94504-1.57676 3.5218-3.5218 3.5218-1.94504 0-3.5218-1.57676-3.5218-3.5218 0-1.94504 1.57676-3.5218 3.5218-3.5218Z',
                fillColor: 'red',
                fillOpacity: 0.6,
                strokeWeight: 0,
                anchor: new google.maps.Point(10, 22)
            },
            animation: google.maps.Animation.DROP,
            draggable: true,
        });
        mapMarker.addListener('mouseover', () => {
            mapMarker.setIcon({
                path: 'M10 0c5.52285 0 10 4.47715 10 10 0 7.50794-5.59957 12.48988-10 12.48988S0 17.78101 0 10C0 4.47715 4.47715 0 10 0Zm0 3.4743c-3.60404 0-6.5257 2.92166-6.5257 6.5257 0 3.60404 2.92166 6.5257 6.5257 6.5257 3.60404 0 6.5257-2.92166 6.5257-6.5257 0-3.60404-2.92166-6.5257-6.5257-6.5257Zm0 3.0039c1.94504 0 3.5218 1.57676 3.5218 3.5218 0 1.94504-1.57676 3.5218-3.5218 3.5218-1.94504 0-3.5218-1.57676-3.5218-3.5218 0-1.94504 1.57676-3.5218 3.5218-3.5218Z',
                fillColor: 'red',
                fillOpacity: 1,
                strokeWeight: 0,
                anchor: new google.maps.Point(10, 22)
            });
        });
        mapMarker.addListener('mouseout', () => {
            mapMarker.setIcon({
                path: 'M10 0c5.52285 0 10 4.47715 10 10 0 7.50794-5.59957 12.48988-10 12.48988S0 17.78101 0 10C0 4.47715 4.47715 0 10 0Zm0 3.4743c-3.60404 0-6.5257 2.92166-6.5257 6.5257 0 3.60404 2.92166 6.5257 6.5257 6.5257 3.60404 0 6.5257-2.92166 6.5257-6.5257 0-3.60404-2.92166-6.5257-6.5257-6.5257Zm0 3.0039c1.94504 0 3.5218 1.57676 3.5218 3.5218 0 1.94504-1.57676 3.5218-3.5218 3.5218-1.94504 0-3.5218-1.57676-3.5218-3.5218 0-1.94504 1.57676-3.5218 3.5218-3.5218Z',
                fillColor: 'red',
                fillOpacity: 0.6,
                strokeWeight: 0,
                anchor: new google.maps.Point(10, 22)
            });
        });
        mapMarker.addListener('dragend', (event) => {
            const dragendEvent = new CustomEvent('dragend', {
                detail: {
                    map: this.map,
                    marker: mapMarker,
                    position: {
                        latitude: event.latLng.lat(),
                        longitude: event.latLng.lng()
                    }
                }
            });
            this.dispatchEvent(dragendEvent);
        });

        return mapMarker;
    }

    loadGoogleMapsApi() {
        const endpoint = 'https://maps.googleapis.com/maps/api/js';
        const script = document.createElement('script');
        script.id = `map_script_${this._id}`;
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
        this._markerElems = this.querySelectorAll('gl-google-marker');
    }

    adoptedCallback() {
        this._markerElems = this.querySelectorAll('gl-google-marker');
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
