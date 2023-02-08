import { registerComponents } from '../../common/register-components.js';
import { GlGoogleMarker } from '../gl-google-marker/gl-google-marker.js';
import GlGoogleImageFactory from './gl-google-image.factory.js';

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
            'admin',
            'hide-kml',
            'hide-image',
        ];
    }

    static async getStyle(url) {
        const repsonse = await fetch(url);
        const json = await repsonse.json();

        return json;
    }

    constructor() {
        super();const el = document.createElement('template');el.innerHTML = `<style>.lot__content,.lot__image{background:rgb(255 255 255 / 85%);backdrop-filter:brightness(140%) blur(10px)}.lot__content h3 span,.lot__cta{font-weight:300;text-transform:uppercase;color:#fff}:host{position:relative;display:block;width:100%;min-height:410px}:host .gl-map{display:flex;position:absolute;top:0;left:0;width:100%;height:100%;border-radius:4px;overflow:hidden}:host .gl-map__detail,:host .gl-map__map{position:absolute;top:0;height:100%}:host .gl-map__map{left:0;width:100%}:host .gm-style .gmnoprint.gm-bundled-control{margin:3px!important}:host .gl-map__detail{right:0;width:0;max-width:360px;overflow:hidden;box-sizing:border-box;transition:width .2s ease-out;will-change:width}:host .gl-map__detail::after{content:'';position:absolute;top:0;left:0;width:100%;mix-blend-mode:multiply}:host .gl-map.has-detail .gl-map__detail{width:50%}:host .gl-map__detail-close{cursor:pointer;position:absolute;display:flex;align-items:center;justify-content:center;top:9px;right:9px;width:30px;height:30px;margin:0;padding:0;font-size:30px;font-weight:300;color:#666;border:0;border-radius:4px;background:rgb(255 255 255 / 85%);backdrop-filter:brightness(140%) blur(10px);transition:color .2s ease-out,background .2s ease-out}:host .gl-map__detail-close:focus,:host .gl-map__detail-close:hover{color:#333;background:#fff}:host .gl-map__detail-content{position:relative;top:3px;width:calc(100% - 3px);height:calc(100% - 6px);overflow:auto;box-sizing:border-box}:host .gl-map__legend{position:relative;height:80px;padding:0 33px 0 0;margin:3px;border-radius:3px;box-sizing:border-box;overflow:hidden}:host .gl-map__legend-toggle{cursor:pointer;position:absolute;top:0;right:0;width:80px;height:30px;font-size:20px;letter-spacing:2px;color:#666;border:0;border-radius:3px;box-sizing:border-box;background:rgb(255 255 255 / 85%);backdrop-filter:brightness(140%) blur(10px);transform-origin:top left;transform:rotate(90deg) translate(0,-80px);transition:color .2s ease-out}.lot,.lot__image{position:relative}:host .gl-map__legend-toggle:focus,:host .gl-map__legend-toggle:hover{color:#000}:host .gl-map__legend-drawer{height:100%}:host .gl-map__legend-content{position:relative;display:grid;grid-auto-flow:column dense;grid-auto-columns:minmax(0,1fr);gap:3px;height:100%;padding:3px;box-sizing:border-box;background:rgb(255 255 255 / 65%);backdrop-filter:brightness(140%) blur(6px)}.lot{display:grid;grid-template-rows:max-content 1fr;height:100%}.lot__image{width:100%;height:0;margin-bottom:3px;padding-top:calc(100% * (9 / 16));border-radius:0 4px 0 0}.lot__cta,.lot__img{width:calc(100% - 6px)}.lot__img{position:absolute;display:block;top:3px;left:3px;height:calc(100% - 6px);object-fit:cover;object-position:center;border-radius:2px 4px 2px 2px}.lot__content{position:relative;padding:17px;border-radius:0 0 4px}.lot__content h3{display:grid;grid-auto-flow:column;grid-auto-columns:max-content;gap:3px;margin:0 0 10px}.lot__content h3 span{display:inline-block;margin:0;padding:.25em .75em;font-size:12px;border-radius:2px;background:#333}.lot__content h3 .sold{background:#d72525}.lot__content h3 .model{background:#0089d1}.lot__content h3 .pending{background:#9d7f09}.lot__content p{margin:0;font-size:16px}.lot__snapshot{display:grid;grid-template-columns:repeat(3,max-content);gap:.75em;margin:10px 0;line-height:1}.lot__snapshot div:not(:first-child){padding-left:.75em;border-left:1px solid #666}.lot__cta{position:absolute;display:flex;align-items:center;justify-content:center;height:40px;right:3px;bottom:3px;padding:0 17px;font-size:14px;text-decoration:none;border-radius:2px 2px 4px;background:#1649c8;box-sizing:border-box;transition:background .2s ease-out}.lot__cta:focus,.lot__cta:hover{background:#142755}.legend-item{display:grid;align-items:center;justify-items:center;padding:10px;background:rgb(255 255 255 / 50%);box-sizing:border-box}.legend-item:first-child{border:3px}.legend-item.available svg{color:#666}.legend-item.pending svg{color:#9d7f09}.legend-item.model svg{color:#0089d1}.legend-item.sold svg{color:#d72525}</style><div class="gl gl-map"><div class="gl-map__map"></div></div>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));

        registerComponents(GlGoogleMarker);

        this.key = '';
        this._id = crypto.randomUUID ? crypto.randomUUID().split('-').pop() : Math.round(Math.random() * 9999);
        this._imageElem = this.querySelector('img');
        this._legendElem = this.querySelector('gl-google-legend');
        this._markerElems = [...this.querySelectorAll('gl-google-marker')];
        this._markerPath = 'M10 0c5.52285 0 10 4.47715 10 10 0 7.50794-5.59957 12.48988-10 12.48988S0 17.78101 0 10C0 4.47715 4.47715 0 10 0Zm0 3.4743c-3.60404 0-6.5257 2.92166-6.5257 6.5257 0 3.60404 2.92166 6.5257 6.5257 6.5257 3.60404 0 6.5257-2.92166 6.5257-6.5257 0-3.60404-2.92166-6.5257-6.5257-6.5257Zm0 3.0039c1.94504 0 3.5218 1.57676 3.5218 3.5218 0 1.94504-1.57676 3.5218-3.5218 3.5218-1.94504 0-3.5218-1.57676-3.5218-3.5218 0-1.94504 1.57676-3.5218 3.5218-3.5218Z';
        this._markers = [];
        this._adminMarkers = [];
        this.apiLoadedCBName = `gl_cb_${this._id}`;
        this.loadDetailTimeout = undefined;
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

        this.generateLegend = this.generateLegend.bind(this);
        this.generateAdminMarker = this.generateAdminMarker.bind(this);
        this.generateMarker = this.generateMarker.bind(this);
        this.loadDetail = this.loadDetail.bind(this);
        this.showDetail = this.showDetail.bind(this);
    }

    get isAdmin() {
        return this.getAttribute('admin') === 'true';
    }

    set isAdmin(val) {
        this.setAttribute('admin', val);
    }

    get isKmlVisible() {
        return this.getAttribute('hide-kml') !== 'true';
    }

    get isImageVisible() {
        return this.getAttribute('hide-image') !== 'true';
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
            this.imageLayer.draw(bounds);
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
            zoomControlOptions: {
                position: google.maps.ControlPosition.TOP_LEFT
            },
            zoom: 8
        });


        this.setMapStyle();

        if (this._legendElem) {
            this.generateLegend();
        }

        // Must create an OverlayView derivitive either way for access
        // to LatLng to pixel methods
        if (this._imageElem) {
            this.placeImages();
        } else {
            this.imageLayer = GlGoogleImageFactory.create(this.map);
        }

        this.generateKml();
        this.markers = this.markerElems;
    }

    async setMapStyle() {
        const mapStyle = await GlGoogleMap.getStyle(this.mapStyle);

        if (mapStyle) {
            this.styleLayer = new google.maps.StyledMapType(mapStyle, { name: `Map${this._id}` });
            this.map.mapTypes.set(`map_${this._id}`, this.styleLayer);
            this.map.setMapTypeId(`map_${this._id}`);
        }
    }

    placeImages() {
        const imageUrl = this._imageElem.getAttribute('src');
        const neLatitude = this.imageElemPosition.neLatitude;
        const neLongitude = this.imageElemPosition.neLongitude;
        const swLatitude = this.imageElemPosition.swLatitude;
        const swLongitude = this.imageElemPosition.swLongitude;
        const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(neLatitude, neLongitude),
            new google.maps.LatLng(swLatitude, swLongitude)
        );

        if (!imageUrl) {
            return;
        }

        this.imageLayer = GlGoogleImageFactory.create(this.map, bounds, this._imageElem);

        if (this.adminMarkers.length !== 2) {
            this.adminMarkers = [
                { label: 'ne', latitude: neLatitude, longitude: neLongitude },
                { label: 'sw', latitude: swLatitude, longitude: swLongitude },
            ];
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
            visible: this.isAdmin,
            draggable: this.isAdmin
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
            status: marker.status,
            color: marker.color,
            position: { lat: marker.latitude, lng: marker.longitude },
            icon: {
                path: this._markerPath,
                fillColor: marker.color,
                fillOpacity: 1,
                strokeWeight: 0,
                anchor: new google.maps.Point(10, 22)
            },
            animation: google.maps.Animation.DROP,
            draggable: this.isAdmin,
        });
        console.log('marker', marker.status, marker.color, marker.latitude);
        mapMarker.addListener('mouseover', () => {
            if (!mapMarker.isSelected) {
                mapMarker.setIcon({
                    path: this._markerPath,
                    fillColor: 'white',
                    fillOpacity: 1,
                    strokeWeight: 0,
                    anchor: new google.maps.Point(10, 22)
                });
            }
        });
        mapMarker.addListener('mouseout', () => {
            if (!mapMarker.isSelected) {
                mapMarker.setIcon({
                    path: this._markerPath,
                    fillColor: mapMarker.color,
                    fillOpacity: 1,
                    strokeWeight: 0,
                    anchor: new google.maps.Point(10, 22)
                });
            }
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

        mapMarker.addListener('mouseover', () => {

        });

        mapMarker.addListener('mouseout', () => {

        });

        mapMarker.addListener('click', () => {
            const projection = this.imageLayer.getProjection();
            const pixelPosition = projection.fromLatLngToDivPixel(mapMarker.getPosition());

            pixelPosition.x += 100;

            const newPosition = projection.fromDivPixelToLatLng(pixelPosition);
            this.markers.forEach((marker) => {
                if (marker.type !== 'admin') {
                    if (marker.id === mapMarker.id) {
                        marker.isSelected = true;
                        marker.setIcon({
                            path: this._markerPath,
                            fillColor: 'white',
                            fillOpacity: 1,
                            strokeWeight: 0,
                            anchor: new google.maps.Point(10, 22)
                        });
                    } else {
                        marker.isSelected = false;
                        marker.setIcon({
                            path: this._markerPath,
                            fillColor: marker.color,
                            fillOpacity: 1,
                            strokeWeight: 0,
                            anchor: new google.maps.Point(10, 22)
                        });
                    }
                }
            });

            this.map.panTo(newPosition);
            this.loadDetail(mapMarker);
        });

        return mapMarker;
    }

    generateLegend() {
        const legendElem = document.createElement('div');
        const legendToggleElem = document.createElement('button');
        const legendDrawerElem = document.createElement('div');
        const legendContentElem = document.createElement('div');
        const legendContentElems = [...this._legendElem.childNodes];

        legendContentElem.className = 'gl-map__legend-content';
        legendContentElems.forEach((elem) => {
            legendContentElem.appendChild(elem);
        });

        legendDrawerElem.setAttribute('id', `gl_legend_${this._id}`);
        legendDrawerElem.className = 'gl-map__legend-drawer';
        legendDrawerElem.appendChild(legendContentElem);

        legendToggleElem.setAttribute('type', 'button');
        legendToggleElem.setAttribute('id', `gl_legend_toggle_${this._id}`);
        legendToggleElem.setAttribute('aria-controls', `gl_legend_${this._id}`);
        legendToggleElem.setAttribute('aria-expanded', false);
        legendToggleElem.setAttribute('title', 'Show Map Legend');
        legendToggleElem.className = 'gl-map__legend-toggle';
        legendToggleElem.textContent = '•••';

        legendElem.className = 'gl-map__legend';
        legendElem.appendChild(legendDrawerElem);
        legendElem.appendChild(legendToggleElem);

        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(legendElem);
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

        this.loadDetailTimeout = setTimeout(this.showDetail, 200);
    }

    showDetail() {
        this.elem.classList.add('has-detail');
    }

    closeDetail() {
        this.elem.classList.remove('has-detail');
        this.markers.forEach((marker) => {
            if (marker.isSelected && marker.type !== 'admin') {
                marker.setIcon({
                    path: this._markerPath,
                    fillColor: marker.color,
                    fillOpacity: 1,
                    strokeWeight: 0,
                    anchor: new google.maps.Point(10, 22)
                });
            }
        });
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

    setAdminMode(isAdmin) {
        if (this.map) {
            this.map.isAdmin = isAdmin;
        }
        if (this.imageLayer) {
            this.imageLayer.setAdminMode(isAdmin);
        }

        this.markers.forEach((marker) => {
            marker.setDraggable(this.isAdmin);
            if (marker.type === 'admin') {
                marker.setVisible(this.isAdmin && this.isImageVisible);
            }
        });
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

        if (name === 'admin') {
            this.setAdminMode(this.isAdmin);
        }

        if (name === 'hide-kml' && this.kmlLayer) {
            this.kmlLayer.setMap(this.isKmlVisible ? this.map : null);
        }

        if (name === 'hide-image' && this.imageLayer) {
            if (this.isImageVisible) {
                this.placeImages();
            } else {
                this.imageLayer.setMap(null);
            }

            this.markers.forEach((marker) => {
                if (marker.type === 'admin') {
                    marker.setVisible(this.isAdmin && this.isImageVisible);
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