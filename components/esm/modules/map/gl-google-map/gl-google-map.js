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
        super();const el = document.createElement('template');el.innerHTML = `<style>.lot__content,.lot__image{background:rgb(255 255 255 / 85%);backdrop-filter:brightness(140%) blur(10px)}.lot__content h3 span,.lot__cta{font-weight:300;text-transform:uppercase;color:#fff}:host{position:relative;display:block;width:100%;min-height:410px}:host .gl-map{display:flex;position:absolute;top:0;left:0;width:100%;height:100%;border-radius:4px;overflow:hidden}:host .gl-map__detail,:host .gl-map__map{position:absolute;top:0;height:100%}:host .gl-map__map{left:0;width:100%}:host .gl-map__detail{right:0;width:0;overflow:hidden;box-sizing:border-box;transition:width .2s ease-out;will-change:width}:host .gl-map__detail::after{content:'';position:absolute;top:0;left:0;width:100%;mix-blend-mode:multiply}:host .gl-map.has-detail .gl-map__detail{width:50%}:host .gl-map__detail-close{cursor:pointer;position:absolute;display:flex;align-items:center;justify-content:center;top:9px;right:9px;width:30px;height:30px;margin:0;padding:0;font-size:30px;font-weight:300;color:#666;border:0;border-radius:4px;background:rgb(255 255 255 / 85%);backdrop-filter:brightness(140%) blur(10px);transition:color .2s ease-out,background .2s ease-out}.lot,.lot__image{position:relative}:host .gl-map__detail-close:focus,:host .gl-map__detail-close:hover{color:#333;background:#fff}:host .gl-map__detail-content{position:relative;top:3px;width:calc(100% - 3px);height:calc(100% - 6px);overflow:auto;box-sizing:border-box}.lot{display:grid;grid-template-rows:max-content 1fr;height:100%}.lot__image{width:100%;height:0;margin-bottom:3px;padding-top:calc(100% * (9 / 16));border-radius:0 4px 0 0}.lot__cta,.lot__img{width:calc(100% - 6px)}.lot__img{position:absolute;display:block;top:3px;left:3px;height:calc(100% - 6px);object-fit:cover;object-position:center;border-radius:2px 4px 2px 2px}.lot__content{position:relative;padding:17px;border-radius:0 0 4px}.lot__content h3{display:grid;grid-auto-flow:column;grid-auto-columns:max-content;gap:3px;margin:0 0 10px}.lot__content h3 span{display:inline-block;margin:0;padding:.25em .75em;font-size:12px;border-radius:2px;background:#333}.lot__content h3 .sold{background:#600}.lot__content h3 .model,.lot__cta{background:#1649c8}.lot__content h3 .pending{background:#9d7f09}.lot__content p{margin:0;font-size:16px}.lot__snapshot{display:grid;grid-template-columns:repeat(3,max-content);gap:.75em;margin:10px 0;line-height:1}.lot__snapshot div:not(:first-child){padding-left:.75em;border-left:1px solid #666}.lot__cta{position:absolute;display:flex;align-items:center;justify-content:center;height:40px;right:3px;bottom:3px;padding:0 17px;font-size:14px;text-decoration:none;border-radius:2px 2px 4px;box-sizing:border-box;transition:background .2s ease-out}.lot__cta:focus,.lot__cta:hover{background:#142755}</style><div class="gl gl-map"><div class="gl-map__map"></div></div>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));

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
        this.kmlLayer = undefined;
        this.elem = this.shadowRoot.querySelector('.gl-map');
        this.mapElem = this.shadowRoot.querySelector('.gl-map__map');
        this.detailElem = null;


        this.elem.setAttribute('id', `map_${this._id}`);

        this.generateAdminMarker = this.generateAdminMarker.bind(this);
        this.generateMarker = this.generateMarker.bind(this);
        this.loadDetail = this.loadDetail.bind(this);
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
        this.map = new google.maps.Map(this.mapElem, {
            center: { lat: this.latitude, lng: this.longitude },
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoom: 8
        });
        this.setMapStyle();
        this.placeImages();
        this.generateKml();
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

    generateKml() {
        this.kmlLayer = new google.maps.KmlLayer({
            url: this.overlay,
            map: this.map,
            suppressInfoWindows: true,
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
            id: marker.id,
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

        mapMarker.addListener('click', () => {
            const projection = this.imageLayer.getProjection();
            const pixelPosition = projection.fromLatLngToDivPixel(mapMarker.getPosition());

            pixelPosition.x += 100;

            const newPosition = projection.fromDivPixelToLatLng(pixelPosition);

            this.map.panTo(newPosition);
            this.loadDetail(mapMarker);
        });

        return mapMarker;
    }

    generateDetail() {
        const detailElem = document.createElement('div');
        const contentElem = document.createElement('div');
        const closeElem = document.createElement('button');

        closeElem.setAttribute('type', 'button');
        closeElem.className = 'gl-map__detail-close';
        closeElem.innerHTML = '&times;';
        closeElem.addEventListener('click', this.closeDetail.bind(this), false);

        contentElem.className = 'gl-map__detail-content';

        detailElem.className = 'gl-map__detail';
        detailElem.appendChild(contentElem);
        detailElem.appendChild(closeElem);

        this.elem.appendChild(detailElem);
        this.detailElem = detailElem;
        this.detailContentElem = contentElem;
    }

    loadDetail(marker) {
        const markerElem = this.markerElems.find(elem => elem.id === marker.id);
        const markerElemChildren = markerElem ? [...markerElem.children] : [];

        this.elem.classList.remove('has-detail');

        if (!this.detailElem) {
            this.generateDetail();
        }

        while (this.detailContentElem.firstChild) {
            this.detailContentElem.removeChild(this.detailContentElem.lastChild);
        }

        markerElemChildren.forEach((child) => {
            this.detailContentElem.appendChild(child.cloneNode(true));
        });

        this.elem.classList.add('has-detail');
    }

    closeDetail() {
        this.elem.classList.remove('has-detail');
    }

    getPixelCoordinate(latLng) {
        const overlayProjection = this.imageLayer.getProjection();
        return overlayProjection.fromLatLngToDivPixel(latLng);
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
            this.kmlLayer.setMap(this.isKmlVisible ? this.map : null);
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

export { GlGoogleMap };
//# sourceMappingURL=gl-google-map.js.map
