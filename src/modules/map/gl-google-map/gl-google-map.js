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
            'map-style',
            'show-markers',
            'show-kml',
            'show-image',
        ];
    }

    static async getStyle(url) {
        const repsonse = await fetch(url);
        const json = await repsonse.json();

        return json;
    }

    constructor() {
        super();

        registerComponents(GlGoogleMarker);

        this.isAdmin = true;
        this.key = '';
        this._id = crypto.randomUUID ? crypto.randomUUID().split('-').pop() : Math.round(Math.random() * 9999);
        this._imageElem = this.querySelector('img');
        this._markerElems = [...this.querySelectorAll('gl-google-marker')];
        this._markers = [];
        this._adminMarkers = [];
        this.apiLoadedCBName = `gl_cb_${this._id}`;
        this.map = undefined;
        this.styleLayer = undefined;
        this.imageLayer = undefined;
        this.imageNE = 0.0;
        this.imageNW = 0.0;
        this.imageSW = 0.0;
        this.imageSE = 0.0;
        this.overlayLayer = undefined;
        this.elem = this.shadowRoot.querySelector('.map');
        this.elem.setAttribute('id', `map_${this._id}`);

        this.generateAdminMarker = this.generateAdminMarker.bind(this);
        this.generateMarker = this.generateMarker.bind(this);
    }

    get isMarkersVisible() {
        return this.getAttribute('show-markers') === 'true';
    }

    set isMarkersVisible(val) {
        this.setAttribute('show-markers', val);
    }

    get isKmlVisible() {
        return this.getAttribute('show-kml') === 'true';
    }

    set isKmlVisible(val) {
        this.setAttribute('show-kml', val);
    }

    get isImageVisible() {
        return this.getAttribute('show-image') === 'true';
    }

    set isImageVisible(val) {
        this.setAttribute('show-image', val);
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

    get mapStyle() {
        return this.getAttribute('map-style');
    }

    get markerElems() {
        return [...this._markerElems];
    }

    get imageElemPosition() {
        const neLatitude = parseFloat(this._imageElem.getAttribute('latitude-ne'));
        const neLongitude = parseFloat(this._imageElem.getAttribute('longitude-ne'));
        const swLatitude = parseFloat(this._imageElem.getAttribute('latitude-sw'));
        const swLongitude = parseFloat(this._imageElem.getAttribute('longitude-sw'));

        return {
            neLatitude: isNaN(neLatitude) ? 0.00 : neLatitude,
            neLongitude: isNaN(neLongitude) ? 0.00 : neLongitude,
            swLatitude: isNaN(swLatitude) ? 0.00 : swLatitude,
            swLongitude: isNaN(swLongitude) ? 0.00 : swLongitude
        };
    }

    set imageElemPosition(val) {
        this._imageElem.setAttribute('latitude-ne', val.neLatitude);
        this._imageElem.setAttribute('longitude-ne', val.neLongitude);
        this._imageElem.setAttribute('latitude-sw', val.swLatitude);
        this._imageElem.setAttribute('longitude-sw', val.swLongitude);

        if (google && google.maps && this.imageLayer) {
            const bounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(val.neLatitude, val.neLongitude),
                new google.maps.LatLng(val.swLatitude, val.swLongitude)
            );
            this.imageLayer.setBounds(bounds);
            this.imageLayer.draw();
        }
    }

    get adminMarkers() {
        return this._adminMarkers;
    }

    set adminMarkers(arr) {
        this._adminMarkers = Array.isArray(arr) ? arr.map(this.generateAdminMarker) : [];
    }

    get markers() {
        return this._markers;
    }

    set markers(markers) {
        if (this.map && google && google.maps) {
            this._markers = [
                ...this.adminMarkers,
                ...markers.map(this.generateMarker)
            ];
        } else {
            this._markers = [...this.adminMarkers];
        }
    }

    /**
     * @todo This should be an async function.
     * Need a way to know when everything has been loaded and
     * drawn before actually displaying the map.
     */
    handleApiLoaded() {
        this.map = new google.maps.Map(this.elem, {
            center: { lat: this.latitude, lng: this.longitude },
            zoom: 8
        });
        this.setMapStyle();
        this.placeImages();
        this.generateOverlay();
        this.markers = this.markerElems;
    }

    async placeImages() {
        const imageUrl = this._imageElem.getAttribute('src');
        const neLatitude = this.imageElemPosition.neLatitude;
        const neLongitude = this.imageElemPosition.neLongitude;
        const swLatitude = this.imageElemPosition.swLatitude;
        const swLongitude = this.imageElemPosition.swLongitude;
        const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(neLatitude, neLongitude),
            new google.maps.LatLng(swLatitude, swLongitude)
        );

        this.adminMarkers = [
            { label: 'ne', latitude: neLatitude, longitude: neLongitude },
            { label: 'sw', latitude: swLatitude, longitude: swLongitude },
        ];

        if (!imageUrl) {
            return;
        }

        GlGoogleImage.prototype = new google.maps.OverlayView();
        function GlGoogleImage(bounds, image, map) {
            this._bounds = bounds;
            this._imageElem = image;
            this._map = map;
            this._div = undefined;

            this.setMap(map);
        }

        GlGoogleImage.prototype.setBounds = function(bounds) {
            this._bounds = bounds;
        };

        GlGoogleImage.prototype.onAdd = function() {
            const panes = this.getPanes();

            this._div = document.createElement('div');
            // this._div.style.borderStyle = 'none';
            // this._div.style.borderWidth = '0';
            this._div.style.border = '2px solid red';
            this._div.style.position = 'absolute';

            this._imageElem.parentNode.removeChild(this._imageElem);
            this._imageElem.style.width = '100%';
            this._imageElem.style.height = '100%';
            this._imageElem.style.position = 'absolute';
            this._imageElem.style.display = 'block';
            this._div.appendChild(this._imageElem);

            // For draggable positioning, we'll use `floatPane` instead of `overlayLayer`
            panes.overlayLayer.appendChild(this._div);
        };

        GlGoogleImage.prototype.draw = function(bounds) {
            const overlayProjection = this.getProjection();
            const boundsNE = bounds ? bounds.getNorthEast() : this._bounds.getNorthEast();
            const boundsSW = bounds ? bounds.getSouthWest() : this._bounds.getSouthWest();
            const sw = overlayProjection.fromLatLngToDivPixel(boundsSW);
            const ne = overlayProjection.fromLatLngToDivPixel(boundsNE);

            if (this._div) {
                this._div.style.top = `${sw.y}px`;
                this._div.style.left = `${ne.x}px`;
                this._div.style.width = `${sw.x - ne.x}px`;
                this._div.style.height = `${ne.y - sw.y}px`;
            }
        };

        GlGoogleImage.prototype.onRemove = function() {
            if (this._div) {
                this._div.parentNode.removeChild(this._div);
                this._div = null;
            }
        };


        this.imageLayer = new GlGoogleImage(bounds, this._imageElem, this.map);
        this.imageLayer.setMap(this.map);
    }

    async setMapStyle() {
        const mapStyle = await GlGoogleMap.getStyle(this.mapStyle);

        if (mapStyle) {
            this.styleLayer = new google.maps.StyledMapType(mapStyle, { name: `Map${this._id}` });
            this.map.mapTypes.set(`map_${this._id}`, this.styleLayer);
            this.map.setMapTypeId(`map_${this._id}`);
        }
    }

    generateOverlay() {
        this.overlayLayer = new google.maps.KmlLayer({
            url: this.overlay,
            map: this.map
        });
    }

    generateAdminMarker(marker) {
        const adminMarker = new google.maps.Marker({
            map: this.map,
            type: 'admin',
            position: { lat: marker.latitude, lng: marker.longitude },
            icon: {
                path: 'M10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10Z',
                scale: 1,
                fillColor: 'white',
                strokeColor: 'white',
                fillOpacity: 0.8,
                strokeWeight: 2,
                anchor: new google.maps.Point(10, 10)
            },
            draggable: true
        });

        adminMarker.addListener('dragstart', (event) => {
            console.log('drag began', event);
        });
        adminMarker.addListener('drag', (event) => {
            const label = marker.label;
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();

            this.imageElemPosition = {
                neLatitude: (label === 'nw' || label === 'ne') ? lat : this.imageElemPosition.neLatitude,
                neLongitude: (label === 'nw' || label === 'ne') ? lng : this.imageElemPosition.neLongitude,
                swLatitude: (label === 'sw' || label == 'se') ? lat : this.imageElemPosition.swLatitude,
                swLongitude: (label === 'sw' || label == 'se') ? lng : this.imageElemPosition.swLongitude,
            };
        });
        adminMarker.addListener('dragend', (event) => {
            console.log('drag finished', event);
        });
        return adminMarker;
    }

    generateMarker(marker) {
        const mapMarker = new google.maps.Marker({
            map: this.map,
            type: 'client',
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

        if (name === 'show-markers') {
            this.markers.forEach((marker) => {
                if (marker.type === 'client') {
                    marker.setVisible(this.isMarkersVisible);
                }
            });
        }

        if (name === 'show-kml') {
            this.overlayLayer.setMap(this.isKmlVisible ? this.map : null);
        }

        if (name === 'show-image') {
            this.imageLayer.setMap(this.isImageVisible ? this.map : null);
            this.markers.forEach((marker) => {
                if (marker.type === 'admin') {
                    marker.setVisible(this.isImageVisible);
                }
            });
        }
    }
}

if (!window.customElements.get('gl-google-map')) {
    window.customElements.define('gl-google-map', GlGoogleMap);
}
