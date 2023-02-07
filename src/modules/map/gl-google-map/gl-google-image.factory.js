export default class GlGoogleImageFactory {
    static create(bounds, map, imageElem) {
        if (!google || !google.maps) {
            throw new Error('GlGoogleImageFactory: Google Maps API was not loaded.');
        }

        const GlGoogleImage = function(bounds, map, imageElem) {
            this._bounds = bounds;
            this._map = map;
            this._imageElem = imageElem;
            this._div = null;

            this.setMap(this._map);
        };
        GlGoogleImage.prototype = new google.maps.OverlayView();
        GlGoogleImage.prototype.setBounds = function(bounds) {
            this._bounds = bounds;
        };
        GlGoogleImage.prototype.onAdd = function() {
            if (this._imageElem) {
                const panes = this.getPanes();
                this._div = document.createElement('div');
                this._div.style.border = '2px solid red';
                this._div.style.position = 'absolute';
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
            const boundsNE = bounds ? bounds.getNorthEast() : this._bounds.getNorthEast();
            const boundsSW = bounds ? bounds.getSouthWest() : this._bounds.getSouthWest();
            const ne = overlayProjection.fromLatLngToDivPixel(boundsNE);
            const sw = overlayProjection.fromLatLngToDivPixel(boundsSW);
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
                this._imageElem = null;
            }
        };
        Object.freeze(GlGoogleImage.prototype);

        return new GlGoogleImage(bounds, map, imageElem);
    }
}
