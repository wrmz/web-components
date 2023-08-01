class GlGoogleOverlay extends HTMLElement {



    constructor(bounds, image, googleMapsApi) {
        this._bounds = bounds;
        this._image = image;
        this._map = map;
        this._elem = null;
        Object.assign(GlGoogleOverlay.prototype, new googleMapsApi.OverlayView());
        this._init();
    }

    _init() {

        this.setMap(this._map);
    }
}

export { GlGoogleOverlay };
//# sourceMappingURL=gl-google-overlay.js.map
