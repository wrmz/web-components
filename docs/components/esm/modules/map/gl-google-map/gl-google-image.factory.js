import { GlMap } from '../gl-map/gl-map.js';

/*global google,GlMap*/

/**
 * GlGoogleImageFactory is a factory class to create instances of GlGoogleImage.
 * GlGoogleImage extends `google.maps.OverlayView` which is not available until the
 * Google Maps API has loaded.
 */
class GlGoogleImageFactory {

    /**
     * Creates an instance of GlGoogleImage.
     * @static
     * @param {GlMap} glMap - The Graphic Language Map instance.
     * @param {HTMLElement} imageElem - The image element to be used as an overlay.
     * @returns {GlGoogleImage} The created GlGoogleImage instance.
     * @throws {Error} If Google Maps API is not loaded.
     */
    static create(glMap, imageElem) {
        if (!google || !google.maps) {
            throw new Error('GlGoogleImageFactory: Google Maps API was not loaded.');
        }

        /**
         * GlGoogleImage is a class that extends google.maps.OverlayView and handles draggable image overlays.
         */
        class GlGoogleImage extends google.maps.OverlayView {

            #previousMode = '';
            #currentMode = '';
            #previousState = '';
            #currentState = '';
            #boundaryMarkers = {
                ne: null,
                nw: null,
                se: null,
                sw: null,
            };
            #initialBounds = {
                neLat: '',
                neLng: '',
                swLat: '',
                swLng: '',
            };
            #neLat = 0.00;
            #neLng = 0.00;
            #swLat = 0.00;
            #swLng = 0.00;
            #isAdmin = false;
            #glMap;
            #map;
            #bounds;
            #aspectRatio = 1;
            #imageElem;
            #layerElem;

            /**
             * Creates a new GlGoogleImage
             * @constructor
             * @param {GlMap} glMap - The Graphic Language Map instance
             * @param {HTMLImageElement} [imageElem] - The optional image element to overlay on the map.
             */
            constructor(glMap, imageElem) {
                super();

                this.#glMap = glMap;
                this.#map = glMap.map;

                this.#currentMode = GlMap.MODES.DEFAULT;
                this.#currentState = GlMap.STATES.LOADING;

                if (imageElem) {
                    this.#initialBounds.swLat = imageElem.getAttribute('sw-lat');
                    this.#initialBounds.swLng = imageElem.getAttribute('sw-lng');
                    this.#initialBounds.neLat = imageElem.getAttribute('ne-lat');
                    this.#initialBounds.neLng = imageElem.getAttribute('ne-lng');
                    this.#imageElem = imageElem;
                    this.#aspectRatio = imageElem.naturalHeight / imageElem.naturalWidth;
                } else {
                    this.#initialBounds.swLat = -179.99999;
                    this.#initialBounds.swLng = -179.99999;
                    this.#initialBounds.neLat = 179.99999;
                    this.#initialBounds.neLng = 179.99999;
                    this.#aspectRatio = 1;
                }

                this.startX = 0;
                this.startY = 0;
                this.isDragging = false;

                this.onDragEnd = this.onDragEnd.bind(this);
                this.onDragStart = this.onDragStart.bind(this);
                this.onDrag = this.onDrag.bind(this);
                this.createMarker = this.createMarker.bind(this);
                this.setMap(this.#map);
            }

            /**
             * Called when the mouseup event is triggered.
             * @param {MouseEvent} e - The mouse event.
             */
            onDragEnd(e) {
                if (!this.isDragging) return;
                this.isDragging = false;
                this.#map.setOptions({ draggable: true });
                window.removeEventListener('mousemove', this.onDrag);
                window.removeEventListener('mouseup', this.onDragEnd);
                this.#layerElem.addEventListener('mousedown', this.onDragStart, false);
            }

            /**
             * Called when the mousedown event is triggered.
             * @param {MouseEvent} e - The mouse event.
             */
            onDragStart(e) {
                this.isDragging = true;
                this.startX = e.clientX;
                this.startY = e.clientY;
                this.#map.setOptions({ draggable: false });
                this.#layerElem.removeEventListener('mousedown', this.onDragStart);
                window.addEventListener('mousemove', this.onDrag, false);
                window.addEventListener('mouseup', this.onDragEnd, false);
            }

            /**
             * Called when the mousemove event is triggered while dragging.
             * @param {MouseEvent} e - The mouse event.
             */
            onDrag(event) {
                if (!this.isDragging) return;
                const currentX = event.clientX;
                const currentY = event.clientY;
                const diffX = currentX - this.startX;
                const diffY = currentY - this.startY;
                this.pixelBounds = {
                    sw: {
                        x: this.pixelBounds.sw.x + diffX,
                        y: this.pixelBounds.sw.y + diffY,
                    },
                    ne: {
                        x: this.pixelBounds.ne.x + diffX,
                        y: this.pixelBounds.ne.y + diffY,
                    },
                };

                this.startX = currentX;
                this.startY = currentY;
                this.draw();
            }

            updateMarkerPositions() {
                const newBounds = this.bounds;
                const swLatLng = newBounds.getSouthWest();
                const neLatLng = newBounds.getNorthEast();
                const nwLatLng = new google.maps.LatLng(neLatLng.lat(), swLatLng.lng());
                const seLatLng = new google.maps.LatLng(swLatLng.lat(), neLatLng.lng());
                this.#boundaryMarkers.ne.setPosition(neLatLng);
                this.#boundaryMarkers.nw.setPosition(nwLatLng);
                this.#boundaryMarkers.se.setPosition(seLatLng);
                this.#boundaryMarkers.sw.setPosition(swLatLng);
            }

            /**
             * Callback function for when a boundary marker is dragged
             * @param {google.maps.Marker} draggedMarker - The marker being dragged.
             * @param {string} key - The identifier of the dragged marker (one of 'ne', 'nw', 'se', 'sw').
             */
            onMarkerDrag(draggedMarker, key) {
                const newLatLng = draggedMarker.position;
                const bounds = this.bounds;
                const draggedMarkerPositionLat = draggedMarker.position.lat();
                const draggedMarkerPositionLng = draggedMarker.position.lng();
                const swLatLng = bounds.getSouthWest();
                const neLatLng = bounds.getNorthEast();
                const nwLatLng = new google.maps.LatLng(neLatLng.lat(), swLatLng.lng());
                const seLatLng = new google.maps.LatLng(swLatLng.lat(), neLatLng.lng());

                // Update the appropriate LatLngBounds corner based on the dragged marker's index.
                switch (key) {
                    case 'ne':
                        this.bounds = new google.maps.LatLngBounds(swLatLng, newLatLng);
                        this.#boundaryMarkers.nw.setPosition(nwLatLng);
                        this.#boundaryMarkers.se.setPosition(seLatLng);
                        break;
                    case 'nw':
                        this.bounds = new google.maps.LatLngBounds(
                            new google.maps.LatLng(swLatLng.lat(), draggedMarkerPositionLng),
                            new google.maps.LatLng(draggedMarkerPositionLat, neLatLng.lng())
                        );
                        this.#boundaryMarkers.ne.setPosition(neLatLng);
                        this.#boundaryMarkers.sw.setPosition(swLatLng);
                        break;
                    case 'se':
                        this.bounds = new google.maps.LatLngBounds(
                            new google.maps.LatLng(draggedMarkerPositionLat, swLatLng.lng()),
                            new google.maps.LatLng(neLatLng.lat(), draggedMarkerPositionLng)
                        );
                        this.#boundaryMarkers.ne.setPosition(neLatLng);
                        this.#boundaryMarkers.sw.setPosition(swLatLng);
                        break;
                    case 'sw':
                        this.bounds = new google.maps.LatLngBounds(newLatLng, neLatLng);
                        this.#boundaryMarkers.nw.setPosition(nwLatLng);
                        this.#boundaryMarkers.se.setPosition(seLatLng);
                        break;
                }


                // Console. log the bounds so we can see the changes and set a new map image attributes
                console.log(this.bounds.toJSON());

                this.draw();
            }


            /**
             * Called when the overlay is added to the map.
             */
            onAdd() {
                // All 4 values for the lat/lng for ne and sw are required for any of these to be considered
                if (this.#initialBounds.neLat && this.#initialBounds.neLng && this.#initialBounds.swLat && this.#initialBounds.swLng) {
                    this.#swLat = parseFloat(this.#initialBounds.swLat);
                    this.#swLng = parseFloat(this.#initialBounds.swLng);
                    this.#neLat = parseFloat(this.#initialBounds.neLat);
                    this.#neLng = parseFloat(this.#initialBounds.neLng);
                    this.bounds = new google.maps.LatLngBounds(
                        new google.maps.LatLng(this.#swLat, this.#swLng),
                        new google.maps.LatLng(this.#neLat, this.#neLng)
                    );

                // Otherwise, we'll set reasonable defaults based on the map's boundaries and
                // the #imageElem's aspect ratio
                } else {
                    this.pixelBounds = {
                        sw: {
                            x: 0,
                            y: 0,
                        },
                        ne: {
                            x: 1,
                            y: -1 * this.#aspectRatio,
                        },
                    };
                }

                this.setupBoundaryMarkers();

                if (this.#imageElem) {
                    const panes = this.getPanes();

                    this.#imageElem.remove();
                    this.#layerElem = document.createElement('div');
                    this.#layerElem.draggable = true;
                    this.#layerElem.setAttribute('draggable', true);
                    Object.assign(this.#layerElem.style, {
                        pointerEvents: 'all',
                        position: 'absolute',
                        userSelect: 'none',
                        cursor: 'hand',
                    });
                    Object.assign(this.#imageElem.style, {
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        display: 'block',
                        transition: 'all .2s ease-out',
                    });
                    this.#layerElem.appendChild(this.#imageElem);
                    panes.overlayLayer.appendChild(this.#layerElem);

                }
                this.recenterMap();
                this.state = GlMap.STATES.DEFAULT;
            }

            /**
             * Called when the overlay is to be drawn on the map.
             */
            draw() {
                if (this.#layerElem) {
                    const pixelBounds = this.pixelBounds;
                    const width = pixelBounds.ne.x - pixelBounds.sw.x;
                    const height = pixelBounds.sw.y - pixelBounds.ne.y;
                    Object.assign(this.#layerElem.style, {
                        top: `${pixelBounds.ne.y}px`,
                        left: `${pixelBounds.sw.x}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                    });
                }

                if (this.isAdmin !== this.#map.isAdmin) {
                    this.isAdmin = this.#map.isAdmin;
                }
            }

            /**
             * Sets up the boundary markers on the corners of the LatLngBounds.
             */
            setupBoundaryMarkers() {
                const bounds = this.bounds;
                const swLatLng = bounds.getSouthWest();
                const neLatLng = bounds.getNorthEast();
                const nwLatLng = new google.maps.LatLng(neLatLng.lat(), swLatLng.lng());
                const seLatLng = new google.maps.LatLng(swLatLng.lat(), neLatLng.lng());

                const cornerLatLngs = {
                    ne: neLatLng,
                    nw: nwLatLng,
                    se: seLatLng,
                    sw: swLatLng,
                };

                Object.keys(cornerLatLngs).forEach((key) => {
                    this.#boundaryMarkers[key] = this.createMarker(cornerLatLngs[key], key);
                });
            }

            /**
             * Creates a new `google.maps.Marker` instance.
             * @param {google.maps.LatLng} markerData - The LatLng object representing the marker's position
             * @param {string} direction - The marker's cardinal position abbreviation (nw/ne/sw/se)
             */
            createMarker(latLng, direction) {
                const marker = new google.maps.Marker({
                    map: this.#map,
                    mode: this.#currentMode,
                    direction: direction,
                    position: latLng,
                    icon: {
                        path: 'M10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10Z',
                        scale: 1,
                        fillColor: 'white',
                        strokeColor: 'white',
                        fillOpacity: 0.8,
                        strokeWeight: 2,
                        anchor: new google.maps.Point(10, 10)
                    },
                    visible: false,
                    draggable: false,
                });
                marker.addListener('drag', this.onMarkerDrag.bind(this, marker, direction));
                return marker;
            }

            /**
             * Recenters the map to fit the bounds of the image.
             */
            recenterMap() {
                this.bounds;
                this.#map.fitBounds(this.bounds, 0);
            }

            /**
             * Switches between ADMIN and DEFAULT modes.
             */
            switchModes() {
                // Cleanup
                if (this.#previousMode === GlMap.MODES.ADMIN) ;

                // New mode settings
                if (this.mode === GlMap.MODES.ADMIN) ;
            }

            switchStates() {
                const panes = this.getPanes();

                // Cleanup
                if (this.#previousState === GlMap.STATES.LOADING) {
                    this.#glMap.pingLoadState(this);
                }
                if (this.#previousState === GlMap.STATES.RESIZING) {
                    this.#layerElem.style.boxShadow = 'none';
                    this.#imageElem.style.backdropFilter = 'blur(0) brightness(1)';
                    Object.values(this.#boundaryMarkers).forEach((marker) => {
                        marker.setDraggable(false);
                        marker.setVisible(false);
                    });
                }
                if (this.#previousState === GlMap.STATES.DRAGGING) {
                    this.#layerElem.removeEventListener('mousedown', this.onDragStart);
                    this.#layerElem.remove();
                    panes.overlayLayer.appendChild(this.#layerElem);
                }

                // New state settings
                if (this.state === GlMap.STATES.LOADING) ;
                if (this.state === GlMap.STATES.RESIZING) {
                    this.updateMarkerPositions();
                    this.#layerElem.style.boxShadow = '0 0 0 2px #0388d1';
                    this.#imageElem.style.backdropFilter = 'blur(2px) brightness(1.3)';
                    Object.values(this.#boundaryMarkers).forEach((marker) => {
                        marker.setDraggable(true);
                        marker.setVisible(true);
                    });
                }

                if (this.state === GlMap.STATES.DRAGGING) {
                    this.#layerElem.remove();
                    panes.overlayMouseTarget.appendChild(this.#layerElem);
                    this.#layerElem.addEventListener('mousedown', this.onDragStart, false);
                }
            }

            /**
             * Called when the overlay is removed from the map.
             */
            onRemove() {
                if (this.#layerElem) {
                    window.removeEventListener('mousemove', this.onDrag, false);
                    this.#layerElem.removeEventListener('mousedown', this.onDragStart, false);
                    this.#layerElem.removeEventListener('mouseup', this.onDragEnd, false);
                    this.#layerElem.remove();
                    this.#layerElem = null;
                    this.#imageElem = null;
                }
            }

            get neLat() { return isNaN(this.#neLat) ? 0 : this.#neLat; }
            get neLng() { return isNaN(this.#neLng) ? 0 : this.#neLng; }
            get swLat() { return isNaN(this.#swLat) ? 0 : this.#swLat; }
            get swLng() { return isNaN(this.#swLng) ? 0 : this.#swLng; }
            set pixelBounds(newPixelBounds) {
                const projection = this.getProjection();
                const newNELatLng = projection.fromDivPixelToLatLng(newPixelBounds.ne);
                const newSWLatLng = projection.fromDivPixelToLatLng(newPixelBounds.sw);
                this.bounds = new google.maps.LatLngBounds(newSWLatLng, newNELatLng);
            }
            get pixelBounds() {
                const projection = this.getProjection();
                const boundsSW = this.bounds.getSouthWest();
                const boundsNE = this.bounds.getNorthEast();
                return {
                    sw: projection.fromLatLngToDivPixel(boundsSW),
                    ne: projection.fromLatLngToDivPixel(boundsNE),
                };
            }
            get position() { return this.#map.getCenter(); }
            set bounds(latLngBounds) {
                const swLatLng = latLngBounds.getSouthWest();
                const neLatLng = latLngBounds.getNorthEast();
                this.#swLat = swLatLng.lat();
                this.#swLng = swLatLng.lng();
                this.#neLat = neLatLng.lat();
                this.#neLng = neLatLng.lng();
            }
            /**
             * Gets the current LatLngBounds of the image overlay
             * @returns {google.maps.LatLngBounds} - The LatLngBounds object.
             */
            get bounds() {
                return new google.maps.LatLngBounds(
                    new google.maps.LatLng(this.#swLat, this.#swLng),
                    new google.maps.LatLng(this.#neLat, this.#neLng)
                );
            }

            /**
             * Sets the admin mode for the image overlay.
             * @param {boolean} val - The admin mode. Set to true for admin mode, false otherwise.
             */
            set isAdmin(val) {
                this.#isAdmin = val;
                this.mode = val ? GlMap.MODES.ADMIN : GlMap.MODES.DEFAULT;
            }

            /**
             * Gets the current mode of the GlGoogleImage instance.
             * @returns {string} The current mode
             */
            get mode() { return this.#currentMode; }

            /**
             * Sets the current mode of the GlGoogleImage instance, if the provided mode is valid.
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
             * Gets the current state of the GlGoogleImage instance
             * @returns {string} The current state
             */
            get state() { return this.#currentState; }

            /**
             * Sets the current state of the GlGoogleImage instance, if the provided state is valid.
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
        }

        return new GlGoogleImage(glMap, imageElem);
    }
}

export { GlGoogleImageFactory as default };
//# sourceMappingURL=gl-google-image.factory.js.map
