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
        ];
    }

    constructor(args) {
        super();

        registerComponents(GlGoogleMarker);

        this.key = '';
        this._id = crypto.randomUUID ? crypto.randomUUID().split('-').pop() : Math.round(Math.random() * 9999);
        this._markerElems = this.querySelectorAll('gl-google-marker');
        this._markers = [];
        this.apiLoadedCBName = `gl_cb_${this._id}`;
        this.map = undefined;
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
        this.markers = this.markerElems;
    }

    generateMarker(marker) {
        const mapMarker = new google.maps.Marker({
            map: this.map,
            position: { lat: marker.latitude, lng: marker.longitude },
            draggable: true,
        });

        mapMarker.addListener('dragend', (event) => {
            const dragendEvent = new Event('dragend', {
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
        console.log('loading api');
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
        console.log('connected');
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
