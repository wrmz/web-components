/*global google*/
export default class GlGoogleImageFactory {
    static create(map, bounds, imageElem) {
        if (!google || !google.maps) {
            throw new Error('GlGoogleImageFactory: Google Maps API was not loaded.');
        }

        const GlGoogleImage = function(map, bounds, imageElem) {
            this._bounds = bounds;
            this._map = map;
            this._imageElem = imageElem;
            this._div = null;
            this._isAdmin = false;

            this.setMap(this._map);
        };
        GlGoogleImage.prototype = new google.maps.OverlayView();
        GlGoogleImage.prototype.setAdminMode = function(adminMode) {
            this._isAdmin = adminMode;
            if (this._div) {
                if (adminMode) {
                    this._div.style.boxShadow = '0 0 0 2px #0388d1';
                } else {
                    this._div.style.boxShadow = 'none';
                }
            }
        };
        GlGoogleImage.prototype.onAdd = function() {
            if (this._imageElem) {
                const panes = this.getPanes();
                this._div = document.createElement('div');

                this._div.style.position = 'absolute';
                this._div.style.userSelect = 'none';
                this._imageElem.style.width = '100%';
                this._imageElem.style.height = '100%';
                this._imageElem.style.position = 'absolute';
                this._imageElem.style.display = 'block';
                this._div.appendChild(this._imageElem);
                // Use `floatPane` instead of `overlayLayer`?
                panes.overlayLayer.appendChild(this._div);
            }
        };
        GlGoogleImage.prototype.draw = function(bounds) {
            const overlayProjection = this.getProjection();
            const _bounds = bounds || this._bounds;
            const boundsNE = _bounds.getNorthEast();
            const boundsSW = _bounds.getSouthWest();
            const ne = overlayProjection.fromLatLngToDivPixel(boundsNE);
            const sw = overlayProjection.fromLatLngToDivPixel(boundsSW);
            if (this._div) {
                this._div.style.top = `${sw.y}px`;
                this._div.style.left = `${ne.x}px`;
                this._div.style.width = `${sw.x - ne.x}px`;
                this._div.style.height = `${ne.y - sw.y}px`;
            }
            if (this._isAdmin !== this._map.isAdmin) {
                this.setAdminMode(this._map.isAdmin);
            }
            if (_bounds) {
                this._bounds = _bounds;
            }
        };
        GlGoogleImage.prototype.onRemove = function() {
            if (this._div) {
                this._div.parentNode.removeChild(this._div);
                this._div = null;
                this._imageElem = null;
            }
        };
        Object.freeze(GlGoogleImage.prototype);

        return new GlGoogleImage(map, bounds, imageElem);
    }
}
