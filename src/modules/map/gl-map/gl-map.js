import { registerComponents } from '../../common/register-components';
import { GlGoogleMap } from '../gl-google-map/gl-google-map';
import { GlMarker } from './gl-marker.js';

// https://www.ecisolutions.com/products/lotvue/
// https://mandalayhomes.com/communities/jasper/

/**
 * @injectHTML
 */
export class GlMap extends HTMLElement {
    static observedAttributes = [
        'type',
        'key',
        'latitude',
        'longitude',
        'map-style',
        'map-tiles',
        'marker-color',
    ];

    static #instances = new Set();

    /**
     * @property {Object} TYPES - An object containing different types for the GlMap. Eeach type represents a specific map type
     * @property {string} TYPES.GOOGLE - The google map type (requires a license key)
     * @property {string} TYPES.MAPBOX - The mapbox map type (requires a license key)
     * @property {string} TYPES.IMAGE - The image map type
     * @property {string} TYPES.TILE - the tile map type
     */
    static TYPES = {
        GOOGLE: 'google',
        MAPBOX: 'mapbox',
        IMAGE: 'image',
        TILE: 'tile',
    };

    /**
     * @property {Object} MODES - An object containing different modes for the GlMap. Each mode represents a specific user interaction with the image.
     * @property {string} MODES.ADMIN - The admin mode, in which the image layer is drawn on the overlayMouseTarget layer.
     * @property {string} MODES.DEFAULT - The default mode, in which the image layer is drawn on the overlayLayer.
     */
    static MODES = {
        ADMIN: 'admin',
        DEFAULT: 'default',
    };

    /**
     * @property {Object} STATES - An object containing different states for the GlMap. Each state represents a specific behavior or interaction the image can have during its lifecycle.
     * @property {string} STATES.DEFAULT - The default state, in which the image behaves normally.
     * @property {string} STATES.DETAIL - The detail state, in which a marker detail is displayed.
     * @property {string} STATES.LOADING - The loading state, indicating that the image is being loaded.
     * @property {string} STATES.CONFIRMING - The confirming state indicating that the user is confirming changes to the image.
     * @property {string} STATES.RESIZING - The resizing state, indicating that the user is resizing the image.
     * @property {string} STATES.DRAGGING - The dragging state, indicating that the user is dragging the image.
     */
    static STATES = {
        DEFAULT: 'default',
        DETAIL: 'detail',
        LOADING: 'loading',
        CONFIRMING: 'confirming',
        RESIZING: 'resizing',
        DRAGGING: 'dragging',
        ADDING_MARKER: 'adding_marker',
        REMOVING_MARKER: 'removing_marker',
        POSITIONING_MARKER: 'positioning_marker',
    };

    static #googleMapsApiEndpoint = 'https://maps.googleapis.com/maps/api/js';
    static #mapboxApiEndpoint = '';

    static #googleApiKey = '';
    static #isGoogleApiLoading = false;
    static #isGoogleApiLoaded = false;

    static #mapboxApiKey = '';
    static #isMapboxApiLoading = false;
    static #isMapboxApiLoaded = false;

    /**
     * Registers a component
     * @static
     * @param {Array<Object>} [component]
     */
    static registerComponents(components = []) {
        registerComponents(components);
    }

    /**
     * Handles the Google Maps Api Loaded event. Inits all google maps instances
     * and sets the static private isGoogleApiLoaded and isGoogleApiLoading flags.
     * @static
     */
    static onGoogleMapsApiLoaded() {
        for (const instance of GlMap.#instances) {
            if (instance.type === 'google') {
                instance.initGoogleMap();
            }
        }
        GlMap.#isGoogleApiLoaded = true;
        GlMap.#isGoogleApiLoading = false;
    }

    /**
     * @static
     * @param {String} key - Api key
     */
    static loadGoogleMapApi(key) {
        const hasScript = document.getElementById('google_map_script');
        const hasLoaded = GlMap.#isGoogleApiLoaded;

        if (!hasScript) {
            const script = document.createElement('script');
            script.id = 'google_map_script';
            script.type = 'text/javascript';
            script.defer = true;
            script.async = true;
            script.src = `${GlMap.#googleMapsApiEndpoint}?key=${GlMap.#googleApiKey}&callback=onGoogleMapsApiLoaded`;
            window['onGoogleMapsApiLoaded'] = GlMap.onGoogleMapsApiLoaded;
            GlMap.#isGoogleApiLoading = true;
            document.head.appendChild(script);
        }
    }

    /**
     * @static
     * @param {String} type - google, mapbox, etc
     * @param {String} key - Api key
     */
    static loadMapApi(type, key) {
        switch (type) {
            case 'google':
                GlMap.registerComponents(GlGoogleMap, GlMarker);
                GlMap.loadGoogleMapApi(key);
                break;
            default:
                console.error(`GL Map does not recognize the ${type} map API.`);
        }
    }

    #id = crypto.randomUUID ? crypto.randomUUID().split('-').pop() : Math.round(Math.random() * 9999);
    #isLoaded = false;
    #isAdmin = false;
    #previousMode = '';
    #currentMode = GlMap.MODES.DEFAULT;
    #previousState = '';
    #currentState = GlMap.STATES.LOADING;

    #glMap;
    #mutationObserver;

    // Child elements
    #loaderElem;
    #progressElem;
    #dialogElem;
    #dialogCloseElem;
    #dialogCancelElem;
    #legendElem;
    #legendToggleElem;
    #legendDrawerElem;
    #imageElem;
    #detailElem;
    #detailContentElem;
    #detailCloseElem;
    #mapElem;
    #elem;
    #loadDetailTimeout;
    #markerElems = [];

    #switchModes() {

    }

    #switchStates() {

    }

    constructor() {
        super();

        // Event handlers
        this.onMapUpdated = this.onMapUpdated.bind(this);
        this.onMutations = this.onMutations.bind(this);
        this.onDialogClose = this.onDialogClose.bind(this);
        this.onKeydown = this.onKeydown.bind(this);
        this.onLegendToggleElemClick = this.onLegendToggleElemClick.bind(this);
        this.confirmDeletion = this.confirmDeletion.bind(this);
        this.cancelDialog = this.cancelDialog.bind(this);
        this.openDetail = this.openDetail.bind(this);
        this.closeDetail = this.closeDetail.bind(this);

        GlMap.#instances.add(this);

        if (this.type === 'google' && !this.#isLoaded && GlMap.#isGoogleApiLoaded) {
            this.initGoogleMap();
        }
    }

    initGoogleMap() {
        this.#glMap = new GlGoogleMap(this.#id, this.#mapElem, {
            latitude: this.latitude,
            longitude: this.longitude,
            mapStyle: this.mapStyle,
            mapTiles: this.mapTiles,
            legendElem: this.#legendElem,
            imageElem: this.#imageElem,
            markerElems: this.#markerElems,
            detailElem: this.#detailElem,
        });

        this.#glMap.subscribe(this.onMapUpdated);
    }

    /**
     * Handles the keyboard keyup event
     * @param {KeyboardEvent} e - The keyboard event
     */
    onKeydown(e) {
        if (e.key === 'Escape') {
            this.cancelDialog();
        }
    }


    /**
     * Cancels the dialog modal
     */
    cancelDialog() {
        this.#dialogElem.returnValue = '';
        this.#dialogElem.close();
    }

    /**
     * Closes the dialog
     * @param {Event} e - The dialog close event.
     */
    onDialogClose(e) {
        window.removeEventListener('keyup', this.onKeydown);
        this.#dialogElem.removeEventListener('close', this.onDialogClose);
        this.#dialogCloseElem.removeEventListener('click', this.cancelDialog);
        this.#dialogCancelElem.removeEventListener('click', this.cancelDialog);

        // If user has confirmed, there will be a return value
        if (!this.#dialogElem.returnValue) {

        } else {
            // The confirmation result depends on the state the component is in
            switch (this.state) {
                case GlMap.STATES.REMOVING_MARKER:
                    this.removeMarker(this.#dialogElem.returnValue);
                    break;
                default:
                    break;
            }
        }

        // Reset the return value
        this.#dialogElem.returnValue = '';
    }

    /**
     * Opens a dialog for confirming the deletion of a marker
     * @param {GlMarker} glMarker
     */
    confirmDeletion(glMarker) {
        this.#dialogElem.returnValue = glMarker.id;
        this.#dialogElem.show();
        window.addEventListener('keyup', this.onKeydown, false);
        this.#dialogElem.addEventListener('close', this.onDialogClose, false);
        this.#dialogCloseElem.addEventListener('click', this.cancelDialog, false);
        this.#dialogCancelElem.addEventListener('click', this.cancelDialog, false);
    }


    /**
     * Toggles the legend visibility via CSS by changing the `aria-expanded` attribute value
     */
    onLegendToggleElemClick() {
        if (this.#legendToggleElem.getAttribute('aria-expanded') === 'true') {
            this.#legendToggleElem.setAttribute('aria-expanded', false);
        } else {
            this.#legendToggleElem.setAttribute('aria-expanded', true);
        }
    }


    /**
     * @todo - Nearly all of these should emit an event from GlMap
     * @param {string} updateType
     * @param {*} data
     */
    onMapUpdated(updateType, data) {
        switch (updateType) {
            case 'load':
                if (data.progress && !isNaN(data.progress)) {
                    this.#progressElem.style.transform = `scaleX(${data.progress / 100})`;
                    if (data.progress === 100) this.state = GlMap.STATES.DEFAULT;
                }
                break;
            case 'state':
                if (this.state !== data) {
                    this.state = data;
                }
                break;
            case 'marker-mouseover':
                break;
            case 'marker-mouseout':
                break;
            case 'marker-click':
                if (this.state === GlMap.STATES.REMOVING_MARKER) {
                    this.confirmDeletion(data.glMarker);
                } else {
                    this.loadDetail(data.glMarker);
                }
                break;
            case 'marker-dragend':
                break;
            case 'marker-added':
                this.addMarker(data.glMarker);
                break;
            default:
                this.state = GlMap.STATES.DEFAULT;
                console.warn(`Unsupported map update type: "${updateType}".`);
                break;
        }
    }



    /**
     * Loads the detail for a selected GlMarker
     * @param {GlMarker} glMarker
     */
    loadDetail(glMarker) {
        const markerChildren = glMarker ? [...glMarker.children] : [];

        while (this.#detailContentElem.firstChild) {
            this.#detailContentElem.removeChild(this.#detailContentElem.lastChild);
        }

        markerChildren.forEach((child) => {
            this.#detailContentElem.appendChild(child.cloneNode(true));
        });

        this.#loadDetailTimeout = setTimeout(this.openDetail, 200);
    }

    /**
     * Shows the detail by adding a class to the root element
     */
    openDetail() {
        this.state = GlMap.STATES.DETAIL;
        this.#detailCloseElem.addEventListener('click', this.closeDetail, false);
    }

    /**
     * Closes the detail
     */
    closeDetail() {
        this.state = GlMap.STATES.DEFAULT;
        this.#glMap.closeDetail();
        this.#detailCloseElem.removeEventListener('click', this.closeDetail);
    }

    /**
     * Adds a marker to the map
     * @param {GlMarker} markerElem - The Gl Marker to add to the map
     */
    addMarker(markerElem) {
        this.#markerElems.push(markerElem);

        if (this.type === GlMap.TYPES.GOOGLE) {
            this.#glMap.markers = [...this.#markerElems];
        }
    }

    /**
     * Removes a marker from the map
     * @param {GlMarker|string} markerElem - Either the Gl Marker or id selector for a Gl Marker
     */
    removeMarker(markerElem) {
        let glMarker = markerElem;

        if (typeof glMarker === 'string') {
            const markerElemIndex = this.#markerElems.findIndex((m) => m.id === glMarker);

            if (markerElemIndex === -1) {
                console.warn(`Could not find a marker with the ID "${markerElem}"`);
            }

            glMarker = this.#markerElems.splice(markerElemIndex, 1)[0];
        }

        switch (this.type) {
            case GlMap.TYPES.GOOGLE:
                glMarker.mapMarker.setMap(null);
                break;
            default:
                break;
        }
    }

    onMutations(mutations) {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.tagName === 'GL-MARKER') {
                        this.addMarker(addedNode);
                    }
                }

                for (const removedNode of mutation.removedNodes) {
                    if (removedNode.tagName === 'GL-MARKER') {
                        this.removeMarker(removedNode);
                    }
                }
            }
        }
    }

    initializeObserver() {
        this.#mutationObserver = new MutationObserver(this.onMutations);
        this.#mutationObserver.observe(this, { childList: true });
    }

    switchStates() {
        // Cleanup
        this.#elem.classList.remove(this.#previousState);
        switch (this.#previousState) {
            case GlMap.STATES.LOADING:
                this.#loaderElem.classList.remove('loading');
                this.#loaderElem.classList.add('loaded');
                break;
            case GlMap.STATES.ADDING_MARKER:
                break;
            case GlMap.STATES.DETAIL:
                break;
            default:
                break;
        }

        this.#elem.classList.add(this.state);
        switch (this.state) {
            case GlMap.STATES.LOADING:
                this.#loaderElem.classList.add('loading');
                break;
            case GlMap.STATES.ADDING_MARKER:
                break;
            case GlMap.STATES.DETAIL:
                break;
            default:
                break;
        }
    }

    /**
     * LIFECYCLE HOOK ✨
     * Invoked when the element is appended to the document,
     * may get called before element's contents are fully parsed.
     */
    connectedCallback() {
        // Doublecheck that the element is in fact connected,
        // as this lifecycle hook may be called after the element is
        // no longer connected.
        if (this.isConnected) {
            this.#imageElem = this.querySelector('img');

            this.#markerElems = [...this.querySelectorAll('gl-marker')];
            this.#markerElems.forEach((glM) => glM.remove());
            this.#dialogElem = this.shadowRoot.querySelector('.gl-map__dialog');
            this.#dialogCloseElem = this.shadowRoot.querySelector('.gl-map__dialog-close');
            this.#dialogCancelElem = this.shadowRoot.querySelector('.gl-map__dialog-cancel');
            this.#detailElem = this.shadowRoot.querySelector('.gl-map__detail');
            this.#detailContentElem = this.shadowRoot.querySelector('.gl-map__detail-content');
            this.#detailCloseElem = this.shadowRoot.querySelector('.gl-map__detail-close');
            this.#legendElem = this.shadowRoot.querySelector('.gl-map__legend');
            this.#legendDrawerElem = this.shadowRoot.querySelector('.gl-map__legend-drawer');
            this.#legendToggleElem = this.shadowRoot.querySelector('.gl-map__legend-toggle');
            this.#loaderElem = this.shadowRoot.querySelector('.gl-map__loader');
            this.#progressElem = this.shadowRoot.querySelector('.gl-map__progress');
            this.#mapElem = this.shadowRoot.querySelector('.gl-map__map');
            this.#elem = this.shadowRoot.querySelector('.gl-map');

            if (this.#imageElem) {
                this.#imageElem.remove();
            }

            if (this.#legendElem) {
                this.#legendElem.remove();
            }

            this.#elem.setAttribute('id', `map_${this.#id}`);

            if (this.#legendElem) {
                this.#legendDrawerElem.id = `gl_legend_${this.#id}`;
                this.#legendToggleElem.id = `gl_legend_toggle_${this.#id}`;
                this.#legendToggleElem.setAttribute('aria-controls', this.#legendDrawerElem.id);
                this.#legendToggleElem.setAttribute('aria-expanded', false);
                this.#legendToggleElem.addEventListener('click', this.onLegendToggleElemClick, false);
            }
        }

        this.initializeObserver();
    }

    /**
     * LIFECYCLE HOOK ✨
     * Invoked each time the element is moved to a new document.
     */
    adoptedCallback() {

    }

    /**
     * LIFECYCLE HOOK ✨
     * Invoked when the element has an attribute added, removed or changed.
     * Only applies to attributes listed in `observedAttributes`.
     * @param {String} name
     * @param {String} oldValue
     * @param {String} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'key' && newValue) {
            this.key = newValue;
        }

        if (name === 'marker-color' && newValue) {
            console.log('changing the marker color to', newValue, 'for map', this.id);
        }

        if (name === 'map-tiles' && newValue) {
            console.log('map tiles changed to:', newValue, 'for map', this.id);
        }

        // Only tries the map api once per instance
        if (this.key && this.type && !GlMap.#isGoogleApiLoaded && !GlMap.#isGoogleApiLoading) {
            GlMap.loadMapApi(this.type, this.key);
        }
    }

    /**
     * LIFECYCLE HOOK ✨
     * Invoked when the element is disconnected from the document's DOM.
     * @todo prep for GC
     */
    disconnectedCallback() {
        this.#mutationObserver.disconnect();
        if (this.legendToggleElem) {
            this.glLegendToggle.removeEventListener('click', this.toggleLegend);
        }
        if (this.#loadDetailTimeout) {
            clearTimeout(this.#loadDetailTimeout);
        }
    }

    get key() {
        let key = 'unknown';

        switch (this.type) {
            case 'google': return GlMap.#googleApiKey;
            case 'mapbox': return GlMap.#mapboxApiKey;
            default: return 'unknown';
        }
    }

    set key(val) {
        let key = '';

        switch (this.type) {
            case 'google':
                GlMap.#googleApiKey = val;
                break;
            case 'mapbox':
                GlMap.#mapboxApiKey = val;
                break;
            default:
                console.warn('GLMap attempted to set an api key before the map type was known');
                break;
        }

        if (this.hasAttribute('key')) {
            this.removeAttribute('key');
        }
    }

    /**
     * Type of map ("google", "mapbox")
     * @type {String}
     */
    get type() { return this.getAttribute('type'); }

    /**
     * Gets the current mode of the GlGoogleMap instance.
     * @returns {string} The current mode
     */
    get mode() { return this.#currentMode; }

    /**
     * Sets the current mode of the GlGoogleMap instance, if the provided mode is valid.
     * @param {string} newMode - The new mode to set.
     */
    set mode(newMode) {
        if (!newMode || newMode === this.#currentMode) return;
        if (Object.values(GlMap.MODES).includes(newMode)) {
            this.#previousMode = this.#currentMode;
            this.#currentMode = newMode;
            switch (this.type) {
                case 'google':
                    this.#glMap.mode = newMode;
                    break;
                case 'mapbox':
                    break;
                default:
                    console.warn('GlMap attempted to set a mode for a map without a known type:', this.type);
                    break;
            }
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

    get isAdmin() { return this.#isAdmin; }

    set isAdmin(val) {
        if (val) {
            this.setAttribute('is-admin', val);
        } else if (this.hasAttribute) {
            this.removeAttribute('is-admin');
        }
        this.#isAdmin = val;

        if (this.glGoogleMap) {
            this.glGoogleMap.isAdmin = val;
        }
    }

    get map() { return this.#glMap.map; }

    get latitude() {
        const latitude = parseFloat(this.hasAttribute('latitude') ? this.getAttribute('latitude') : '0');
        return  isNaN(latitude) ? 0 : latitude;
    }

    set latitude(newLatitude) { this.setAttribute('latitude', newLatitude); }

    get longitude() {
        const longitude = parseFloat(this.hasAttribute('longitude') ? this.getAttribute('longitude') : '0');
        return  isNaN(longitude) ? 0 : longitude;
    }

    set longitude(newLongitude) { this.setAttribute('longitude', newLongitude); }

    get mapTiles() { return this.getAttribute('map-tiles'); }

    set mapTiles(newMapTiles) { this.setAttribute('map-tiles', newMapTiles); }

    get mapStyle() { return this.getAttribute('map-style'); }

    /**
     * Sets the default map style for this map instance
     * @param {string} newMapStyle - The path to the JSON map styles
     */
    set mapStyle(newMapStyle) {
        if (newMapStyle) {
            this.setAttribute('map-style', newMapStyle);
        } else if (this.hasAttribute('map-style')) {
            this.removeAttribute('map-style');
        }
    }

    /**
     * Gets the defeault marker color for this map instance
     * @returns {string} - The current hex color if it exists
     */
    get markerColor() { return this.getAttribute('marker-color'); }

    /**
     * Sets the default marker color for this map instance
     * @param {string} newMarkerColor - The new hex color
     */
    set markerColor(newMarkerColor) { this.setAttribute('marker-color', newMarkerColor); }
}

if (!window.customElements.get('gl-map')) {
    window.customElements.define('gl-map', GlMap);
}
