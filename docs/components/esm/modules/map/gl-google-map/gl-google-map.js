import { GlMap } from '../gl-map/gl-map.js';
import GlGoogleImageFactory from './gl-google-image.factory.js';

/*global google*/

/**
 * @injectHTML
 */
class GlGoogleMap {
    static async getStyle(url) {
        if (!url) return null;

        const response = await fetch(url);
        const json = await response.json();

        return json;
    }

    #id = '';
    #previousMode;
    #previousState;
    #currentMode = GlMap.MODES.DEFAULT;
    #currentState = GlMap.STATES.LOADING;
    #map;
    #mapElem;
    #tileMap;
    #legendElem;
    #imageElem;
    #detailElem;
    #glMarkers = [];
    #markers = [];
    #subscribers = [];
    #activeMarker;

    // Map layers
    #styleLayer;
    #imageLayer;

    constructor(id, mapElem, {
        latitude,
        longitude,
        mapStyle = null,
        mapTiles = null,
        legendElem = null,
        imageElem = null,
        markerElems = [],
        detailElem = null
    }) {
        this.#id = id;
        this.#mapElem = mapElem;
        this.#legendElem = legendElem;
        this.#imageElem = imageElem;
        this.#detailElem = detailElem;
        this.latitude = latitude;
        this.longitude = longitude;
        this.mapStyle = mapStyle;
        this.mapTiles = mapTiles;
        this.tileMap = null;
        this.loadDetailTimeout = null;
        this.imageNE = 0.0;
        this.imageNW = 0.0;
        this.imageSW = 0.0;
        this.imageSE = 0.0;
        this.mapControls = {
            recenter: null,
            resize: null,
            drag: null,
            addMarker: null,
            removeMarker: null,
        };

        this.loadTimeout = null;

        this.emitMarkerEvent = this.emitMarkerEvent.bind(this);
        this.createMarker = this.createMarker.bind(this);
        this.recenterMap = this.recenterMap.bind(this);
        this.restrictPanning = this.restrictPanning.bind(this);
        this.toggleResizeState = this.toggleResizeState.bind(this);
        this.toggleDragState = this.toggleDragState.bind(this);
        this.toggleAddMarkerState = this.toggleAddMarkerState.bind(this);
        this.toggleRemoveMarkerState = this.toggleRemoveMarkerState.bind(this);
        this.getNormlizedTileCoord = this.getNormlizedTileCoord.bind(this);
        this.onLoaded = this.onLoaded.bind(this);
        this.onAddMarkerClick = this.onAddMarkerClick.bind(this);

        if (this.mapTiles) {
            this.map = new google.maps.Map(this.#mapElem, {
                center: { lat: 0, lng: 0 },
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.TOP_LEFT
                },
                zoom: 1,
                // @todo - I do not know why these defaults work.
                restriction: {
                    latLngBounds: {
                        north: 88.999,
                        south: -88.999,
                        west: -179.999,
                        east: 179.999,
                    },
                    strictBounds: false,
                }
            });

            this.tileMap = new google.maps.ImageMapType({
                getTileUrl: this.getNormlizedTileCoord,
                tileSize: new google.maps.Size(256, 256),
                maxZoom: 3,
                minZoom: 2,
                name: `tileMap${this.#id}`
            });

            this.map.mapTypes.set(`tileMap${this.#id}`, this.tileMap);
            this.map.setMapTypeId(`tileMap${this.#id}`);
        } else {
            this.map = new google.maps.Map(this.#mapElem, {
                center: { lat: this.latitude, lng: this.longitude },
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.TOP_LEFT
                },
                zoom: 17,
                maxZoom: 19,
                minZoom: 10,
            });
            this.setMapStyle();
        }

        this.map.addListener('dragend', this.restrictPanning);
        this.markers = markerElems;

        this.loadImage();
        this.createLegendControl();
        this.createCenterMapControl();
        this.createResizeMapControl();
        this.createDragMapControl();
        this.createAddMarkerControl();
        this.createRemoveMarkerControl();
        this.loadTimeout = setTimeout(this.onLoaded, 1000);
    }

    async setMapStyle() {
        const mapStyle = await GlGoogleMap.getStyle(this.mapStyle);

        if (mapStyle) {
            this.styleLayer = new google.maps.StyledMapType(mapStyle, { name: `Map${this.#id}` });
            this.map.mapTypes.set(`map_${this.#id}`, this.styleLayer);
            this.map.setMapTypeId(`map_${this.#id}`);
        }
    }

    loadImage() {
        if (!this.#imageElem || (this.#imageElem && !this.#imageElem.hasAttribute('src'))) {
            this.#imageLayer = GlGoogleImageFactory.create(this);
        } else {
            this.#imageElem.getAttribute('src');
            this.#imageLayer = GlGoogleImageFactory.create(this, this.#imageElem);
        }
    }

    /**
     * Normlizes tile coordinates for a tiled map image so that
     * tiles repeat across the x axis (horizontally)
     * @param {*} coord
     * @param {*} zoom
     */
    getNormlizedTileCoord(coord, zoom) {
        // Tile range in one direction range is dependent on zoom level
        // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 times, etc
        const tileRange = 1 << zoom;
        const y = coord.y;
        let x = coord.x;

        // Don't repeat acros y-axis (vertically)
        if (y < 0 || y >= tileRange) {
            return '';
        }
        // Repeat across x-axis
        if (x < 0 || x >= tileRange) {
            x = ((x % tileRange) + tileRange) % tileRange;
        }

        return this.mapTiles
            .replace('{x}', x)
            .replace('{y}', y)
            .replace('{z}', zoom);
    }

    /**
     * Generates a marker
     *
     * @param {GlMarker} marker
     * @returns {google.maps.Marker}
     */
    createMarker(marker) {
        const mapMarker = new google.maps.Marker({
            map: this.map,
            id: marker.id,
            type: 'client',
            status: marker.status,
            color: marker.color,
            isSelected: false,
            position: { lat: marker.latitude, lng: marker.longitude },
            path: marker.path,
            icon: {
                path: marker.path,
                fillColor: marker.color,
                fillOpacity: 1,
                strokeWeight: 0,
                strokeColor: '#ffffff',
                anchor: new google.maps.Point(10, 22)
            },
            animation: google.maps.Animation.DROP,
            draggable: this.mode === 'admin',
        });

        marker.mapMarker = mapMarker;
        mapMarker.addListener('mouseover', this.onMarkerMouseover.bind(this, marker, mapMarker));
        mapMarker.addListener('mouseout', this.onMarkerMouseout.bind(this, marker, mapMarker));
        mapMarker.addListener('dragend', this.onMarkerDragend.bind(this, marker, mapMarker));
        mapMarker.addListener('click', this.onMarkerClick.bind(this, marker, mapMarker));
        return mapMarker;
    }

    /**
     * Emits a marker event from GlGoogleMap
     *
     * @this GlGoogleMap
     * @param {string} eventType
     * @param {GlMarker} glMarker
     * @param {google.maps.Marker} marker
     * @param {google.maps.event} event
     * @emits CustomEvent
     */
    emitMarkerEvent(eventType, glMarker, marker, event) {
        const customEvent = new CustomEvent(eventType, {
            detail: {
                map: this,
                marker: marker,
                glMarker: glMarker,
                pixel: event.pixel,
                domEvent: event.domEvent,
                position: {
                    latitude: event.latLng.lat(),
                    longitude: event.latLng.lng()
                }
            }
        });

        this.dispatchEvent(customEvent);
    }

    /**
     * ons & dispatches from GlGoogleMap a marker click event
     *
     * @this GlGoogleMap
     * @param {GlGoogleMap} glMarker
     * @param {google.maps.Marker} marker
     * @param {google.maps.event} event
     * @emits GlGoogleMap#click
     */
    onMarkerClick(glMarker, marker, event) {
        this.markers.forEach((m) => {
            const isSelected = m.id === marker.id;
            m.setIcon({
                path: glMarker.path,
                fillColor: isSelected ? 'white' : m.color ,
                fillOpacity: 1,
                strokeWeight: 0,
                anchor: new google.maps.Point(10, 22),
            });
        });

        this.panToSelectedMarker(marker);
        this.notifySubscribers('marker-click', { glMarker, event });
    }

    /**
     * ons & dispatches from GlGoogleMap a marker drag event
     *
     * @this GlGoogleMap
     * @param {GlMarker} glMarker
     * @param {google.maps.Event} event
     * @emits GlGoogleMap#drag
     */
    onMarkerDrag(glMarker, event) {
        this.notifySubscribers('marker-drag', { glMarker, event });
    }

    /**
     * ons & dispatches from GlGoogleMap a marker dragend event
     *
     * @this GlGoogleMap
     * @param {GlMarker} glMarker
     * @param {google.maps.Marker} marker
     * @param {google.maps.Event} event
     * @emits GlGoogleMap#dragend
     */
    onMarkerDragend(glMarker, marker, event) {
        this.notifySubscribers('marker-dragend', { glMarker, event });
    }

    /**
     * ons & dispatches from GlGoogleMap a marker dragstart event
     *
     * @this GlGoogleMap
     * @param {GlMarker} glMarker
     * @param {google.maps.Marker} marker
     * @param {google.maps.Event} event
     * @emits GlGoogleMap#dragstart
     */
    onMarkerDragstart(glMarker, marker, event) {
        this.notifySubscribers('marker-dragstart', { glMarker, event });
    }

    /**
     * ons & dispatches from GlGoogleMap a marker mouseover event
     *
     * @this GlGoogleMap
     * @param {GlMarker} glMarker
     * @param {google.maps.Marker} marker
     * @param {google.maps.event} event
     * @emits GlGoogleMap#mouseover
     */
    onMarkerMouseover(glMarker, marker, event) {
        if (!marker.isSelected) {
            marker.setIcon({
                path: glMarker.path,
                fillColor: 'white',
                fillOpacity: 1,
                strokeWeight: 0,
                anchor: new google.maps.Point(10, 22)
            });
        }

        this.notifySubscribers('marker-mouseover', { glMarker, event });
    }

    /**
     * ons & dispatches from GlGoogleMap a marker mouseout event
     *
     * @this GlGoogleMap
     * @param {GlMarker} glMarker
     * @param {google.maps.Marker} marker
     * @param {google.maps.event} event
     * @emits GlGoogleMap#mouseout
     */
    onMarkerMouseout(glMarker, marker, event) {
        if (!marker.isSelected) {
            marker.setIcon({
                path: glMarker.path,
                fillColor: marker.color,
                fillOpacity: 1,
                strokeWeight: 0,
                anchor: new google.maps.Point(10, 22)
            });
        }

        this.notifySubscribers('marker-mouseout', { glMarker, event });
    }

    onLoaded() {
        clearTimeout(this.loadTimeout);
        this.loadTimeout = null;
        this.state = GlMap.STATES.DEFAULT;
    }

    /**
     * Creates a button that fires a click event ond by `this.recenterMap`.
     */
    createCenterMapControl() {
        const recenterButton = document.createElement('button');
        recenterButton.type = 'button';
        recenterButton.title = 'Reorient the map to the Image position.';
        recenterButton.className = 'gl-map__button gl-map__recenter';
        recenterButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M10 0c5.52285 0 10 4.47715 10 10s-4.47715 10-10 10S0 15.52285 0 10 4.47715 0 10 0ZM3.72462 10.63068h-2.4409c.30834 4.32356 3.76204 7.77726 8.0856 8.0856v-2.4409c-2.97945-.29584-5.34886-2.66525-5.6447-5.6447Zm14.99251-.01202-.04376.00775-.07354.00424-2.32445.00007c-.29584 2.97941-2.66525 5.34882-5.6447 5.64466v2.4409c4.32757-.30863 7.78366-3.76844 8.08645-8.09762Zm-8.08627-4.35022-.0002.89139c0 .3483-.28236.63065-.63066.63065-.32342 0-.58998-.24346-.62641-.5571l-.00424-.07355-.00021-.8914c-1.58435.2659-2.8348 1.51636-3.1007 3.1007l1.1959.00022c.3483 0 .63065.28235.63065.63065 0 .32342-.24345.58998-.5571.62641l-.07355.00424-1.1959.00021c.2659 1.58435 1.51635 2.8348 3.1007 3.1007l.0002-1.21748c0-.3483.28236-.63065.63066-.63065.32342 0 .58998.24346.62641.5571l.00424.07355.00021 1.21748c1.58435-.2659 2.8348-1.51635 3.1007-3.1007l-1.38427-.0002c-.3483 0-.63065-.28236-.63065-.63066 0-.32342.24346-.58998.5571-.62641l.07355-.00424 1.38427-.00021c-.2659-1.58435-1.51635-2.8348-3.1007-3.1007Zm-.00018-4.98472v2.4409c2.97945.29584 5.34886 2.66525 5.6447 5.64466l2.32445.00007a.6341.6341 0 0 1 .11726.01088c-.30275-4.32807-3.75884-7.78788-8.0864-8.09651Zm-9.34696 8.0856h2.4409c.29584-2.97945 2.66525-5.34886 5.6447-5.6447v-2.4409c-4.32356.30834-7.77726 3.76204-8.0856 8.0856Z"/></svg>';
        this.mapControls.recenter = recenterButton;
        this.mapControls.recenter.addEventListener('click', this.recenterMap, false);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.mapControls.recenter);
    }

    createResizeMapControl() {
        const resizeButton = document.createElement('button');
        resizeButton.type = 'button';
        resizeButton.title = 'Resize the Image.';
        resizeButton.className = 'gl-map__button gl-map__resize';
        resizeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21"><path fill="currentColor" fill-rule="nonzero" d="m19.831.574.051.061.064.111.018.046.02.065.01.051.006.093v16a.625.625 0 0 1-1.243.092l-.007-.092V2.508l-3.756 3.758.006.11v13a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1h13l.109.006 3.757-3.756H3.375A.625.625 0 0 1 3.283.383l.092-.007h16c.04 0 .079.003.117.01l.06.015.067.024.063.031.068.045.081.073ZM12.5 7.875h-10v10h10v-10Z"/></svg>';
        this.mapControls.resize = resizeButton;
        this.mapControls.resize.style.display = 'none';
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.mapControls.resize);
    }

    createDragMapControl() {
        const dragButton = document.createElement('button');
        dragButton.type = 'button';
        dragButton.title = 'Drag the Image.';
        dragButton.className = 'gl-map__button gl-map__drag';
        dragButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21"><path fill="currentColor" fill-rule="nonzero" d="m10.346.875.09.01.078.019.058.021.046.022a.624.624 0 0 1 .15.11l2.17 2.172a.625.625 0 0 1-.813.944l-.07-.06-1.104-1.105v7.242h7.24l-1.103-1.104a.625.625 0 0 1 .814-.944l.07.06 2.171 2.171.064.075.059.099.037.1.02.101.003.088-.01.09-.019.077-.021.058-.022.046a.624.624 0 0 1-.11.15l-2.172 2.17a.625.625 0 0 1-.944-.813l.06-.07 1.104-1.104H10.95v7.241l1.105-1.103a.625.625 0 0 1 .944.813l-.06.07-2.171 2.171-.075.064-.099.06-.1.037-.101.019-.088.003-.09-.01-.077-.018-.058-.022-.046-.022a.624.624 0 0 1-.15-.11l-2.17-2.171a.625.625 0 0 1 .813-.945l.07.06 1.104 1.104V11.5H2.46l1.103 1.104a.625.625 0 0 1-.813.944l-.07-.06-2.171-2.171-.064-.075-.06-.099-.037-.1-.019-.101-.003-.088.01-.09.018-.077.022-.058.022-.046a.624.624 0 0 1 .11-.15l2.171-2.17a.625.625 0 0 1 .945.813l-.06.07-1.105 1.104H9.7V3.008L8.598 4.112a.625.625 0 0 1-.944-.813l.06-.07 2.17-2.171.075-.064.1-.059.1-.038.101-.019.087-.003Z"/></svg>';
        this.mapControls.drag = dragButton;
        this.mapControls.drag.style.display = 'none';
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.mapControls.drag);
    }

    createAddMarkerControl() {
        const addMarkerButton = document.createElement('button');
        addMarkerButton.type = 'button';
        addMarkerButton.title = 'Add a new marker.';
        addMarkerButton.className = 'gl-map__button gl-map__add-marker';
        addMarkerButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="23" viewBox="0 0 20 23"><path fill="currentColor" fill-rule="nonzero" d="M10 .374c5.523 0 10 4.477 10 10 0 7.508-5.6 12.49-10 12.49S0 18.155 0 10.374c0-5.523 4.477-10 10-10Zm0 3.475A6.526 6.526 0 1 0 10 16.9 6.526 6.526 0 0 0 10 3.85Zm0 2.562c.314 0 .574.23.618.532l.007.093-.001 2.624h2.626a.625.625 0 0 1 .092 1.244l-.092.007-2.626-.001.001 2.626a.625.625 0 0 1-1.243.092l-.007-.092-.001-2.626H6.75a.625.625 0 0 1-.092-1.243l.092-.006 2.624-.001.001-2.624c0-.346.28-.625.625-.625Z"/></svg>';
        this.mapControls.addMarker = addMarkerButton;
        this.mapControls.addMarker.style.display = 'none';
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.mapControls.addMarker);
    }

    createRemoveMarkerControl() {
        const removeMarkerButton = document.createElement('button');
        removeMarkerButton.type = 'button';
        removeMarkerButton.title = 'Add a new marker.';
        removeMarkerButton.className = 'gl-map__button gl-map__remove-marker';
        removeMarkerButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 20 24"><path fill="currentColor" fill-rule="nonzero" d="M10 .677c5.523 0 10 4.477 10 10 0 7.508-5.6 12.49-10 12.49s-10-4.71-10-12.49c0-5.523 4.477-10 10-10Zm0 3.474a6.526 6.526 0 1 0 0 13.051 6.526 6.526 0 0 0 0-13.051Zm3.25 5.812a.625.625 0 0 1 .092 1.243l-.092.007h-6.5a.625.625 0 0 1-.092-1.243l.092-.007h6.5Z"/></svg>';
        this.mapControls.removeMarker = removeMarkerButton;
        this.mapControls.removeMarker.style.display = 'none';
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.mapControls.removeMarker);
    }

    createLegendControl() {
        this.mapControls.legend = this.#legendElem;
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.mapControls.legend);
    }

    recenterMap() {
        console.log('recentering');
        if (this.#imageLayer) {
            this.#imageLayer.recenterMap();
        }
    }

    restrictPanning() {
        console.log('restricting');
        const imageBounds = this.#imageLayer.bounds;
        this.map.getBounds();
        const newMapCenter = this.map.getCenter();

        if (!imageBounds.contains(newMapCenter)) {
            // Find the nearest point within the image bounds
            const newLat = Math.max(imageBounds.getSouthWest().lat(), Math.min(imageBounds.getNorthEast().lat(), newMapCenter.lat()));
            const newLng = Math.max(imageBounds.getSouthWest().lng(), Math.min(imageBounds.getNorthEast().lng(), newMapCenter.lng()));

            // Set the map's center to the nearest point
            this.map.panTo(new google.maps.LatLng(newLat, newLng));
        }
    }

    toggleResizeState() {
        if (!this.#imageLayer) return;
        this.state = this.state === GlMap.STATES.RESIZING
            ? GlMap.STATES.DEFAULT
            : GlMap.STATES.RESIZING;
    }

    toggleDragState() {
        if (!this.#imageLayer) return;
        this.state = this.state === GlMap.STATES.DRAGGING
            ? GlMap.STATES.DEFAULT
            : GlMap.STATES.DRAGGING;
    }

    toggleAddMarkerState() {
        this.state = this.state === GlMap.STATES.ADDING_MARKER
            ? GlMap.STATES.DEFAULT
            : GlMap.STATES.ADDING_MARKER;
    }

    toggleRemoveMarkerState() {
        this.state = this.state === GlMap.STATES.REMOVING_MARKER
            ? GlMap.STATES.DEFAULT
            : GlMap.STATES.REMOVING_MARKER;
    }

    /**
     * Closes the detail
     */
    closeDetail() {
        this.markers.forEach((marker) => {
            if (marker.isSelected && marker.type !== 'admin') {
                marker.setIcon({
                    path: marker.path,
                    fillColor: marker.color,
                    fillOpacity: 1,
                    strokeWeight: 0,
                    anchor: new google.maps.Point(10, 22)
                });
            }
        });
    }

    /**
     * Converts google latLng coordinates to div pixel coordinates
     *
     * @param {google.maps.LatLng} latLng
     * @returns {Object}
     */
    getPixelCoordinate(latLng) {
        const overlayProjection = this.#imageLayer.getProjection();
        return overlayProjection.fromLatLngToDivPixel(latLng);
    }

    setAdminMode(isAdmin) {
        if (this.map) {
            this.map.isAdmin = isAdmin;
        }
        if (this.#imageLayer) {
            this.#imageLayer.isAdmin = isAdmin;
        }
    }

    /**
     * Pans the map to a marker which has been selected or clicked
     * Currently assumes conjunction of `GlGoogleMap.showDetail`,
     * this the 100px x-coordinate offset
     *
     * @param {google.maps.Marker} marker
     * @param {number=} [offsetX=100]
     * @param {number=} [offsetY=0]
     */
    panToSelectedMarker(marker, offsetX = 100, offsetY = 0) {
        const projection = this.#imageLayer.getProjection();
        const pixelPosition = projection.fromLatLngToDivPixel(marker.getPosition());
        const newPixelPosition = {
            x: pixelPosition.x + offsetX,
            y: pixelPosition.y + offsetY
        };

        this.map.panTo(projection.fromDivPixelToLatLng(newPixelPosition));
    }

    /**
     * Handles clicks on the map while in the GlMap.STATES.ADDING_MARKER state
     * @param {google.maps.MapMouseEvent} e - The google maps click event
     */
    onAddMarkerClick(e) {
        const newMarker = document.createElement('gl-marker');
        newMarker.latitude = e.latLng.lat();
        newMarker.longitude = e.latLng.lng();
        newMarker.status = 'model';
        newMarker.color = '#60b3df';
        newMarker.path = 'M10 0c5.52285 0 10 4.47715 10 10 0 7.50794-5.59957 12.48988-10 12.48988S0 17.78101 0 10C0 4.47715 4.47715 0 10 0Zm0 3.4743c-3.60404 0-6.5257 2.92166-6.5257 6.5257 0 3.60404 2.92166 6.5257 6.5257 6.5257 3.60404 0 6.5257-2.92166 6.5257-6.5257 0-3.60404-2.92166-6.5257-6.5257-6.5257Zm0 3.0039c1.94504 0 3.5218 1.57676 3.5218 3.5218 0 1.94504-1.57676 3.5218-3.5218 3.5218-1.94504 0-3.5218-1.57676-3.5218-3.5218 0-1.94504 1.57676-3.5218 3.5218-3.5218Z';

        this.#activeMarker = newMarker;

        this.notifySubscribers('marker-added', {
            glMarker: this.#activeMarker
        });

        this.state = GlMap.STATES.ADDING_MARKER;
    }

    /**
     * Switches between GlGoogleMap Modes ADMIN and DEFAULT modes.
     */
    switchModes() {
        this.state = GlMap.STATES.DEFAULT;

        // Cleanup
        if (this.#previousMode === GlMap.MODES.ADMIN) {
            this.mapControls.resize.style.display = 'none';
            this.mapControls.drag.style.display = 'none';
            this.mapControls.addMarker.style.display = 'none';
            this.mapControls.removeMarker.style.display = 'none';
            this.markers.forEach((m) => m.setDraggable(false));
            this.mapControls.resize.removeEventListener('click', this.toggleResizeState);
            this.mapControls.drag.removeEventListener('click', this.toggleDragState);
            this.mapControls.addMarker.removeEventListener('click', this.toggleAddMarkerState);
            this.mapControls.removeMarker.removeEventListener('click', this.toggleRemoveMarkerState);
            if (this.map) {
                this.map.addListener('dragend', this.restrictPanning);
            }
        }

        // New mode settings
        if (this.mode === GlMap.MODES.ADMIN) {
            this.mapControls.resize.style.display = '';
            this.mapControls.drag.style.display = '';
            this.mapControls.addMarker.style.display = '';
            this.mapControls.removeMarker.style.display = '';
            this.markers.forEach((m) => m.setDraggable(true));
            this.mapControls.resize.addEventListener('click', this.toggleResizeState, false);
            this.mapControls.drag.addEventListener('click', this.toggleDragState, false);
            this.mapControls.addMarker.addEventListener('click', this.toggleAddMarkerState, false);
            this.mapControls.removeMarker.addEventListener('click', this.toggleRemoveMarkerState, false);
            if (this.map) {
                google.maps.event.clearListeners(this.map, 'dragend');
            }
        }
    }

    /**
     * Switches between GlGoogleMap States
     */
    switchStates() {
        // Cleanup
        switch (this.#previousState) {
            case GlMap.STATES.LOADING:
                break;
            case GlMap.STATES.RESIZING:
                this.markers.forEach((m) => m.setVisible(true));
                this.#imageLayer.state = GlMap.STATES.DEFAULT;
                this.mapControls.resize.classList.remove('active');
                break;
            case GlMap.STATES.DRAGGING:
                this.markers.forEach((m) => m.setVisible(true));
                this.#imageLayer.state = GlMap.STATES.DEFAULT;
                this.mapControls.drag.classList.remove('active');
                break;
            case GlMap.STATES.ADDING_MARKER:
                google.maps.event.clearListeners(this.map, 'click');
                this.mapControls.addMarker.classList.remove('active');
                break;
            case GlMap.STATES.REMOVING_MARKER:
                this.mapControls.removeMarker.classList.remove('active');
                break;
            case GlMap.STATES.CONFIRMING:
                break;
        }

        switch (this.state) {
            case GlMap.STATES.LOADING:
                this.pingLoadState(this);
                break;
            case GlMap.STATES.RESIZING:
                this.markers.forEach((m) => m.setVisible(false));
                this.#imageLayer.state = GlMap.STATES.RESIZING;
                this.mapControls.resize.classList.add('active');
                break;
            case GlMap.STATES.DRAGGING:
                this.markers.forEach((m) => m.setVisible(false));
                this.#imageLayer.state = GlMap.STATES.DRAGGING;
                this.mapControls.drag.classList.add('active');
                break;
            case GlMap.STATES.ADDING_MARKER:
                this.mapControls.addMarker.classList.add('active');
                this.map.addListener('click', this.onAddMarkerClick);
                break;
            case GlMap.STATES.REMOVING_MARKER:
                this.mapControls.removeMarker.classList.add('active');
                break;
            case GlMap.STATES.CONFIRMING:
                break;
            default:
                this.pingLoadState(this);
                break;
        }
        this.notifySubscribers('state', this.state);
    }

    pingLoadState(component) {
        let fullyLoaded = true;

        if (this.#imageLayer.state === GlMap.STATES.LOADING) {
            fullyLoaded = false;
        }

        if (fullyLoaded) {
            this.notifySubscribers('load', {
                state: this.state,
                progress: 70
            });
        }

        if (this.state === GlMap.STATES.LOADING) {
            fullyLoaded = false;
        }

        if (fullyLoaded) {
            this.notifySubscribers('load', {
                state: this.state,
                progress: 100
            });
        }
    }

    subscribe(callback) {
        this.#subscribers.push(callback);
    }

    notifySubscribers(...data) {
        this.#subscribers.forEach((callback) => callback(...data));
    }

    /**
     * Gets the current mode of the GlGoogleMap instance.
     * @returns {string} The current mode
     */
    get mode() {
        return this.#currentMode;
    }

    /**
     * Sets the current mode of the GlGoogleMap instance, if the provided mode is valid.
     * @param {string} newMode - The new mode to set.
     */
    set mode(newMode) {
        if (!newMode || newMode === this.#currentMode) return;
        if (Object.values(GlMap.MODES).includes(newMode)) {
            this.#previousMode = this.#currentMode;
            this.#currentMode = newMode;
            this.switchModes();
        } else {
            console.error(`Invalid mode: ${newMode}`);
        }
    }

    /**
     * Gets the current state of the GlGoogleMap instance
     * @returns {string} The current state
     */
    get state() { return this.#currentState; }

    /**
     * Sets the current state of the GlGoogleMap instance, if the provided state is valid.
     * @param {string} newState - The new state to set.
     */
    set state(newState) {
        if (!newState || newState === this.#currentState) return;
        if (Object.values(GlMap.STATES).includes(newState)) {
            this.#previousState = this.#currentState;
            this.#currentState = newState;
            this.switchStates();
        } else {
            console.error(`Invalid state: ${newState}`);
        }
    }

    get map() {
        return this.#map;
    }

    set map(newMap) {
        this.#map = newMap instanceof google.maps.Map
            ? newMap
            : null;
    }

    get markers() {
        return this.#markers;
    }

    set markers(glMarkers) {
        this.#glMarkers = [...glMarkers];
        this.#markers = this.#glMarkers.map((glMarker) => {
            // If GlMarker has already been mapped, return it
            if (glMarker.mapMarker) return glMarker.mapMarker;
            return this.createMarker(glMarker);
        });
    }
}

export { GlGoogleMap };
//# sourceMappingURL=gl-google-map.js.map
