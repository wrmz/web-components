/*global google*/
import { registerComponents } from '../../common/register-components.js';
import { GlGoogleMarker } from '../gl-google-marker/gl-google-marker.js';

/**
 * @injectHTML
 */
export class GlGoogleMap extends HTMLElement {
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
        super();

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
        setTimeout(() => {
            this.markers = this.markerElems;
            console.log(this.markerElems);
            console.log(this.markers);
        }, 100);
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
            draggable: true,
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
            console.log('lat:', event.latLng.lat(), 'lng:', event.latLng.lng());
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
