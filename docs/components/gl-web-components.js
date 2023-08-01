var glWebComponents = (function (exports) {
    'use strict';

    /**
     * @injectHTML
     */
    class ChevronIcon extends HTMLElement {
        constructor() {
            super();const el=document.createElement('template');el.innerHTML=`<style>svg{display:flex;align-items:center;justify-content:center;width:var(--width,24px);height:var(--height,24px)}</style><svg width="17" height="9" viewBox="0 0 17 9" xmlns="http://www.w3.org/2000/svg" class="svg-chevron" fill="currentColor"><title>Chevron Icon</title><path d="M16.749.356l-.255-.255a.43.43 0 00-.61 0L8.878 7.113 1.866.1a.43.43 0 00-.61 0l-.255.255a.43.43 0 000 .61l7.568 7.57a.43.43 0 00.61 0l7.566-7.57a.428.428 0 00.004-.61z" fill-rule="nonzero"/></svg>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
        }

        static get observedAttributes() { return ['title']; }

        attributeChangedCallback(attrName, oldVal, newVal) {
            this.shadowRoot.querySelector('svg title').textContent = newVal;
        }
    }

    if (!window.customElements.get('chevron-icon')) {
        window.customElements.define('chevron-icon', ChevronIcon);
    }

    function registerComponents (...args) {
        args ? '' : console.error('Please register your components');
    }

    /**
     * @injectHTML
     */
    class InfoMessage extends HTMLElement {
        constructor() {
            super();const el=document.createElement('template');el.innerHTML=`<style>:host{display:none;padding:2px;font-size:12px;line-height:16px;color:#555;align-items:center}:host([shown]){display:flex}:host([role=alert][shown]:not([invalid])){display:none}:host([role=alert][invalid][shown]){display:flex}</style><chevron-icon aria-hidden="true"></chevron-icon><slot></slot>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
            registerComponents(ChevronIcon);
            this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.handleSlotChange, false);
        }

        handleSlotChange(e) {
            e.target.assignedElements({ flatten: true }).length > 0 ? this.setAttribute('shown', '') : this.removeAttribute('shown');
        }
    }

    if (!window.customElements.get('info-message')) {
        window.customElements.define('info-message', InfoMessage);
    }

    class FormElement extends HTMLElement {
        static get observedAttributes() {
            return ['invalid', 'value'];
        }

        constructor() {
            super();
            this.input = null;
            this.radios = null;
            this.handleFormElementInvalid = this.handleFormElementInvalid.bind(this);
            this.handleFormElementInput = this.handleFormElementInput.bind(this);
        }

        get valid() { return !this.hasAttribute('invalid') && !this.hasAttribute('aria-invalid'); }
        set valid(v) {
            if (v) {
                this.removeAttribute('invalid');
                this.removeAttribute('aria-invalid');
            } else {
                this.setAttribute('invalid', '');
                this.setAttribute('aria-invalid', '');
            }
        }

        registerElementForValidation(element) {
            element.addEventListener('invalid', this.handleFormElementInvalid, false);
            element.addEventListener('input', this.handleFormElementInput, false);
        }

        handleFormElementInvalid(e) {
            this.valid = false;
            this.toggleInvalidAttribute(e.target);
        }

        handleFormElementInput(e) {
            const element = e.target;
            this.valid = element.checkValidity();
            this.toggleInvalidAttribute(element);
        }

        toggleInvalidAttribute(element) {
            const errorMsg = this.shadowRoot.querySelector('info-message[role="alert"]');
            if (errorMsg) {
                element.validity.valid ? errorMsg.removeAttribute('invalid') : errorMsg.setAttribute('invalid', '');
            }

        }

        handleChanged() {
            const errorMsg = this.shadowRoot.querySelector('info-message[role="alert"]');
            if (errorMsg) {
                this.hasAttribute('invalid') ? errorMsg.setAttribute('invalid', '') : errorMsg.removeAttribute('invalid');
            }
        }

        attributeChangedCallback() {
            this.handleChanged();
        }
    }

    /**
     * @injectHTML
     */
    class FieldInput extends FormElement {

        constructor() {
            super();const el=document.createElement('template');el.innerHTML=`<style>:host{display:grid;grid-gap:3px;width:100%;height:max-content;box-sizing:border-box}::slotted(input),::slotted(textarea){width:100%;font-size:14px;line-height:20px;padding:13px 15px;margin:0;border:1px solid var(--primary-light);border-radius:5px;color:#555;outline:0;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis}:host([invalid]) ::slotted(input),:host([invalid]) ::slotted(textarea){border:2px solid var(--warning-mid);padding:12px 14px}::slotted(input::placeholder),::slotted(textarea::placeholder){color:#767676}::slotted(input:focus),::slotted(textarea:focus){border:2px solid #555;padding:12px 14px}</style><div class="field"><slot name="label"></slot><slot name="input"></slot><info-message role="status"><slot name="info"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></div>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
            this.input = null;
            this.handleInput = this.handleInput.bind(this);
            this.handleKeyup = this.handleKeyup.bind(this);
            this.handleSlotChange = this.handleSlotChange.bind(this);
            this.shadowInput = this.shadowRoot.querySelector('slot[name="input"]');
            this.shadowInput.addEventListener('slotchange', this.handleSlotChange, false);
        }

        get value() { return this.getAttribute('value') || ''; }
        set value(v) { this.setAttribute('value', v); }

        handleSlotChange(e) {
            this.input = [...e.target.assignedElements()].find(el => el.tagName === 'INPUT');
            if (this.input) {
                this.registerElementForValidation(this.input);
                this.input.value = this._value || this.getAttribute('value') || '';
                this.input.addEventListener('input', this.handleInput, false);
                this.input.addEventListener('keyup', this.handleKeyup, false);
            }
        }

        handleInput(e) {
            this.value = e.target.value;
        }

        handleKeyup() { }

        disconnectedCallback() {
            this.input.removeEventListener('input', this.handleInput);
            this.input.removeEventListener('keyup', this.handleKeyup);
            this.shadowInput.removeEventListener('slotchange', this.handleSlotChange);
        }
    }

    if (!window.customElements.get('field-input')) {
        window.customElements.define('field-input', FieldInput);
    }

    /**
     * @injectHTML
     */
    class RadioGroup extends FormElement {
        static sanitize(v) { return (v + '').trim().replace(/[^0-9.]*/g, ''); }

        constructor() {
            super();const el=document.createElement('template');el.innerHTML=`<style>:host{display:grid;appearance:none}:host fieldset{position:relative;display:grid;margin:0;padding:0;border:0}:host .radio-group__options{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:20px}</style><fieldset class="radio-group"><legend class="radio-group__legend"><slot name="label"></slot></legend><div class="radio-group__options"><slot></slot></div><info-message role="status"><slot name="info-message"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></fieldset>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
            registerComponents(InfoMessage);
            this.radios = null;
            this.handleSlotChange = this.handleSlotChange.bind(this);
            this.shadowRadios = this.shadowRoot.querySelector('.radio-group__options slot');
            this.shadowRadios.addEventListener('slotchange', this.handleSlotChange, false);
        }

        get value() { return this.getAttribute('value') || ''; }
        set value(v) { this.setAttribute('value', v); }

        get numeric() {
            const sanitized = RadioGroup.sanitize(this.value);
            return isNaN(sanitized) ? 0 : sanitized;
        }

        get selectedRadio() {
            return this.radios && this.value
                ? this.radios.find(el => el.checked)
                : null;
        }
        set selectedRadio(v) {
            if (v && this.radios) {
                const radio = this.radios.find(el => el.value === v);
                if (radio) {
                    radio.checked = true;
                }
            }
        }

        handleSlotChange(e) {
            this.radios = [...e.target.assignedElements()]
                .flatMap(el => ([el, ...el.children]))
                .filter(el => el.tagName === 'INPUT');

            if (this.value) {
                this.selectedRadio = this.value;
            }

            this.addEventListener('input', this.handleInput, false);
        }

        handleInput(e) {
            this.value = e.target.value;
        }

        attributeChangedCallback(attr, oldVal, newVal) {
            this.handleChanged();
            if (attr === 'value') {
                this._value = newVal;
            }
        }

        detachedCallback() {
            this.removeEventListener('input', this.handleInput);
        }
    }

    if (!window.customElements.get('radio-group')) {
        window.customElements.define('radio-group', RadioGroup);
    }

    /**
     * @injectHTML
     */
    class ChartDonut extends HTMLElement {
        static get observedAttributes() {
            return [
                'colors',
                'values',
                'labels',
            ];
        }

        static degreesToRadians(angle) {
            return angle * (Math.PI / 180);
        }

        constructor() {
            super();const el=document.createElement('template');el.innerHTML=`<style>.donut circle{cursor:pointer;pointer-events:stroke;transition:filter .2s linear,transform .2s linear}.donut circle:focus{outline:0}.donut circle:focus,.donut circle:hover{filter:brightness(80%)}</style><div class="chart chart--donut"><svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events" width="160" height="160" viewBox="0 0 160 160" class="donut"></svg></div>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
            this.gap = 2;
            this.cx = 80;
            this.cy = 80;
            this.radius = 60;
            this.angleOffset = -90;
            this.chartData = [];
            this.segmentElems = [];
            this.isLoaded = false;

            this.svg = this.shadowRoot.querySelector('svg');

            this.generateSegment = this.generateSegment.bind(this);
            this.updateSegment = this.updateSegment.bind(this);
        }

        get currencyFormat() {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format;
        }

        set colors(v) {
            this.setAttribute('colors', JSON.stringify(v));
        }

        get colors() {
            const colors = (this.getAttribute('colors') || '').replace(/'/g, '"');
            return colors ? JSON.parse(colors) : ['red', 'green', 'blue'];
        }

        set labels(v) {
            this.setAttribute('labels', JSON.stringify(v));
        }

        get labels() {
            const labels = (this.getAttribute('labels') || '').replace(/'/g, '"');
            return labels ? JSON.parse(labels) : [];
        }

        set values(v) {
            this.setAttribute('values', JSON.stringify(v));
        }

        get values() {
            const values = (this.getAttribute('values') || '').replace(/'/g, '"');
            return values ? JSON.parse(values) : [];
        }

        get total() {
            return this.values.length
                ? this.values.reduce((previous, current) => previous + current)
                : 0;
        }

        get circumference() {
            return 2 * Math.PI * this.radius;
        }

        get adjustedCircumference() {
            return this.circumference - this.gap;
        }

        /**
         * Loops through the values and generates a segment for each
         */
        generateSegments() {
            this.values.forEach(this.generateSegment);
        }

        /**
         * Generates an individual segment
         * @param {number} val - The amount this segmenet represents
         * @param {number} i - Index of this value in `this.values`
         */
        generateSegment(val, i) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            const data = {
                degrees: this.angleOffset,
            };

            this.angleOffset += this.dataPercentage(this.values[i]) * 360;
            this.chartData.push(data);

            circle.setAttribute('tabindex', '0');
            circle.setAttribute('cx', this.cx);
            circle.setAttribute('cy', this.cy);
            circle.setAttribute('r', this.radius);
            circle.setAttribute('fill', 'transparent');
            circle.setAttribute('stroke', this.colors[i]);
            circle.setAttribute('stroke-width', 30);
            circle.setAttribute('stroke-dasharray', this.adjustedCircumference);
            circle.setAttribute('stroke-dashoffset', this.calculateStrokeDashOffset(this.values[i]));
            circle.setAttribute('transform', this.calculateTransform(i));
            circle.appendChild(title);
            title.textContent = `${this.labels[i]}: ${this.currencyFormat(val)}`;

            this.segmentElems.push(circle);
            this.svg.appendChild(circle);
        }

        updateSegments() {
            this.angleOffset = -90;
            this.chartData = [];
            this.values.forEach(this.updateSegment);
        }

        updateSegment(val, i) {
            const circle = this.segmentElems[i];
            const title = circle.querySelector('title');
            const data = {
                degrees: this.angleOffset,
            };

            this.angleOffset += this.dataPercentage(this.values[i]) * 360;
            this.chartData.push(data);

            title.textContent = `${this.labels[i]}: ${this.currencyFormat(val)}`;
            circle.setAttribute('stroke-dasharray', this.adjustedCircumference);
            circle.setAttribute('stroke-dashoffset', this.calculateStrokeDashOffset(this.values[i]));
            circle.setAttribute('transform', this.calculateTransform(i));
        }

        calculateStrokeDashOffset(val) {
            const strokeDiff = this.dataPercentage(val) * this.circumference;
            return this.circumference - strokeDiff;
        }

        /**
         * Calculates the transform rotation the circle should be
         * attributed with
         * @param {Number} i - The index of chart data to use
         * @returns {String} - The rotation of the circle
         */
        calculateTransform(i) {
            return `rotate(${this.chartData[i].degrees}, ${this.cx}, ${this.cy})`;
        }

        /**
         * Gets the percentage a given value represents of the total
         * @param {Number} val - The divisor
         * @returns {Number} - The percentage
         */
        dataPercentage(val) {
            return (this.total && val) ? val / this.total : 0;
        }

        /**
         * Destroys the segments of the circle by removing the elements,
         * removing them from the `segmentElems` array and removing their
         * data from the `segmentElems` array.
         */
        destroySegments() {
            while (this.svg.firstChild) {
                this.svg.removeChild(this.svg.firstChild);
                this.segmentElems.shift();
                this.chartData.shift();
            }
            this.angleOffset = -90;
        }

        connectedCallback() {

            this.generateSegments();
            this.isLoaded = true;
        }

        /**
         * @param {string} attr - The attribute which changed
         * @param {string} oldVal - The old value
         * @param {string} newVal - The new value
         */
        attributeChangedCallback() {
            if (this.isLoaded && this.colors && this.values && this.total) {
                this.updateSegments();
            }
        }
    }

    if (!window.customElements.get('chart-donut')) {
        window.customElements.define('chart-donut', ChartDonut);
    }

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

    class GlMarker extends HTMLElement {
        static get observedAttributes() {
            return [
                'latitude',
                'longitude',
                'status',
                'color',
                'path',
                'is-admin',
            ];
        }

        static #defaultAdminPath = 'M10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10Z';
        static #defaultPath = 'M10 0c5.52285 0 10 4.47715 10 10 0 7.50794-5.59957 12.48988-10 12.48988S0 17.78101 0 10C0 4.47715 4.47715 0 10 0Zm0 3.4743c-3.60404 0-6.5257 2.92166-6.5257 6.5257 0 3.60404 2.92166 6.5257 6.5257 6.5257 3.60404 0 6.5257-2.92166 6.5257-6.5257 0-3.60404-2.92166-6.5257-6.5257-6.5257Zm0 3.0039c1.94504 0 3.5218 1.57676 3.5218 3.5218 0 1.94504-1.57676 3.5218-3.5218 3.5218-1.94504 0-3.5218-1.57676-3.5218-3.5218 0-1.94504 1.57676-3.5218 3.5218-3.5218Z';

        #id = `gl-marker-${crypto.randomUUID ? crypto.randomUUID().split('-').pop() : Math.round(Math.random() * 9999)}`;
        #marker;

        constructor() {
            super();
        }

        get id() { return this.hasAttribute('id') ? this.getAttribute('id') : this.#id; }

        get map() { return this.parentElement.map; }

        get mapMarker() {
            return this.#marker;
        }

        set mapMarker(newMapMarker) {
            this.#marker = newMapMarker;
        }

        get latitude() {
            const latitude = parseFloat(this.hasAttribute('latitude') ? this.getAttribute('latitude') : '0');
            return isNaN(latitude) ? 0 : latitude;
        }

        set latitude(val) {
            this.setAttribute('latitude', val);
        }

        get longitude() {
            const longitude = parseFloat(this.hasAttribute('longitude') ? this.getAttribute('longitude') : '0');
            return isNaN(longitude) ? 0 : longitude;
        }

        set longitude(val) {
            this.setAttribute('longitude', val);
        }

        get status() {
            return this.getAttribute('status');
        }

        set status(val) {
            this.setAttribute('status', val);
        }

        get color() {
            return this.getAttribute('color');
        }

        set color(val) {
            this.setAttribute('color', val);
        }

        get isAdmin() {
            return this.hasAttribute('is-admin') && this.getAttribute('is-admin') === 'true';    }

        set isAdmin(val) {
            if (val) {
                this.setAttribute('is-admin', true);
            } else if (this.hasAttribute('is-admin')) {
                this.removeAttribute('is-admin');
            }
        }

        get path() {
            if (this.hasAttribute('path')) {
                return this.getAttribute('path');
            } else {
                return GlMarker.#defaultPath;
            }
        }

        set path(val) {
            if (val) {
                this.setAttribute('path', val);
            } else if (this.hasAttribute('path')) {
                this.removeAttribute('path');
            }
        }
    }

    if (!window.customElements.get('gl-marker')) {
        window.customElements.define('gl-marker', GlMarker);
    }

    // https://www.ecisolutions.com/products/lotvue/
    // https://mandalayhomes.com/communities/jasper/

    /**
     * @injectHTML
     */
    class GlMap extends HTMLElement {
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
            GlMap.#isGoogleApiLoaded;

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
            super();const el=document.createElement('template');el.innerHTML=`<style>*,.lot__cta,::after,::before{box-sizing:border-box}:host{--brand-blue:#009ad0;--brand-dark-gray:#1e1e1e;--brand-light-gray:#c8c8c8;--brand-gray:#a5a5a5;--brand-white:#ffffff;--brand-red:#e74c3c;--brand-orange:#f39c12;--brand-blue-light:#33b1e4;--brand-blue-dark:#0074a8;--brand-dark-gray-light:#4a4a4a;--brand-dark-gray-dark:#0d0d0d;--brand-gray-light:#bfbfbf;--brand-gray-dark:#7b7b7b;--text-on-blue:#ffffff;--text-on-dark-gray:#ffffff;--text-on-gray:#1e1e1e;--text-on-white:#1e1e1e;--brand-blue-rgb:0,154,208;--brand-dark-gray-rgb:30,30,30;--brand-gray-rgb:165,165,165;--brand-white-rgb:255,255,255;--brand-red-rgb:231,76,60;--brand-orange-rgb:243,156,18;--ease-out-circ:cubic-bezier(0, 0.55, 0.45, 1);--ease-out-back:cubic-bezier(0.34, 1.56, 0.64, 1);--ease-in-out-back:cubic-bezier(0.68, -0.6, 0.32, 1.6);position:relative;display:flex;width:100%;max-width:100%;min-height:410px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif;font-size:16px;color:var(--brand-dark-gray);border-radius:4px;overflow:hidden}:host>img{display:block;width:100%;height:auto}:host .gl-map__loader{position:absolute;display:grid;align-items:center;justify-items:center;align-content:center;gap:40px;top:0;left:0;width:100%;height:100%;color:var(--brand-white);opacity:1s;box-shadow:inset 0 0 30px rgb(0 0 0 / .05);background:radial-gradient(circle at 50%,rgb(0 0 0 / 0) 70%,rgb(0 0 0 / .05)) #fff;z-index:1}:host .gl-map__loader svg{width:80px;height:auto}:host .gl-map__loader.loaded{pointer-events:none;animation:1s 1s forwards removeLoader}:host .gl-map__progressbar{position:relative;width:400px;height:5px;border-radius:5px;box-shadow:inset 0 0 3px rgb(0 0 0 / .1),0 0 5px rgb(255 255 255 / 1);overflow:hidden}:host .gl-map__progress{position:absolute;top:0;left:0;width:100%;height:100%;background:var(--brand-blue);transform:scaleX(0);transform-origin:left center;transition:transform 1s ease-in-out}:host .gl-map{position:absolute;top:0;left:0;width:100%;height:100%}:host .gl-map.adding_marker [aria-roledescription=map]{cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='23' viewBox='0 0 20 23'%3E%3Cpath fill='%23ffffff' fill-rule='nonzero' d='M10 .374c5.523 0 10 4.477 10 10 0 7.508-5.6 12.49-10 12.49S0 18.155 0 10.374c0-5.523 4.477-10 10-10Zm0 3.475A6.526 6.526 0 1 0 10 16.9 6.526 6.526 0 0 0 10 3.85Zm0 2.562c.314 0 .574.23.618.532l.007.093-.001 2.624h2.626a.625.625 0 0 1 .092 1.244l-.092.007-2.626-.001.001 2.626a.625.625 0 0 1-1.243.092l-.007-.092-.001-2.626H6.75a.625.625 0 0 1-.092-1.243l.092-.006 2.624-.001.001-2.624c0-.346.28-.625.625-.625Z'/%3E%3C/svg%3E") 10 22,pointer!important}:host .gl-map__detail,:host .gl-map__map{position:absolute;top:0;height:100%}:host .gl-map__map{left:0;width:100%}:host .gm-style .gmnoprint.gm-bundled-control{margin:3px!important}:host .gl-map__detail{right:0;width:0;max-width:360px;overflow:hidden;box-sizing:border-box;transition:width .2s ease-out;will-change:width}:host .gl-map__detail::after{content:'';position:absolute;top:0;left:0;width:100%;mix-blend-mode:multiply}:host .gl-map.detail .gl-map__detail{width:50%}:host .gl-map__detail-close{cursor:pointer;position:absolute;display:flex;align-items:center;justify-content:center;top:9px;right:9px;width:30px;height:30px;margin:0;padding:0;font-size:30px;font-weight:300;color:#666;border:0;border-radius:4px;background:rgba(var(--brand-white-rgb),.85);backdrop-filter:brightness(140%) blur(10px);transition:color .2s ease-out,background .2s ease-out}:host .gl-map__detail-close:focus,:host .gl-map__detail-close:hover{color:var(--brand-dark-gray);background:#fff}:host .gl-map__detail-content{position:relative;top:3px;width:calc(100% - 3px);height:calc(100% - 6px);overflow-y:scroll;-webkit-overflow-scrolling:touch}:host .gl__edit{cursor:pointer;display:flex;align-items:center;justify-content:center;width:40px;height:40px;color:#666;border:0;border-radius:4px;background:#fff;background:rgba(var(--brand-white-rgb),.85);backdrop-filter:blur(10px);transition:color .2s ease-out,background .2s ease-out}:host .gl__edit:focus,:host .gl__edit:hover{color:var(--brand-dark-gray);background:var(--brand-white)}:host .gl-map__button{cursor:pointer;display:flex;align-items:center;justify-content:center;width:40px;height:40px;color:var(--brand-dark-gray);border:0;border-radius:2px;background:rgba(var(--brand-white-rgb),.85);backdrop-filter:brightness(140%) blur(10px);transition:color .2s ease-out,background .2s ease-out}:host .gl-map__button:focus,:host .gl-map__button:hover{color:var(--brand-dark-gray);background:var(--brand-white)}:host .gl-map__button.active{color:var(--brand-blue);background:var(--brand-white)}:host .gl-map__recenter{left:3px!important;top:87px!important}:host .gl-map__resize{left:3px!important;top:130px!important}:host .gl-map__drag{left:3px!important;top:173px!important}:host .gl-map__add-marker{left:3px!important;top:216px!important}:host .gl-map__remove-marker{left:3px!important;top:259px!important}:host .gl-map__legend{position:relative;height:80px;max-width:calc(100% - 49px);padding:0 33px 0 0;margin:3px;border-radius:2px;box-sizing:border-box}:host .gl-map__legend-toggle{cursor:pointer;position:absolute;top:0;right:0;width:80px;height:30px;font-size:20px;letter-spacing:2px;color:var(--brand-dark-gray);border:0;border-radius:2px;box-sizing:border-box;background:rgba(var(--brand-white-rgb),.85);backdrop-filter:brightness(140%) blur(10px);transform-origin:top left;transform:rotate(90deg) translate(0,-80px);transition:color .2s ease-out,border-radius .2s ease-out,background .2s ease-out}:host .gl-map__legend-toggle:hover{color:var(--brand-dark-gray);background:var(--brand-white)}:host .gl-map__legend-drawer{position:absolute;top:0;left:auto;right:33px;height:100%;max-width:0;overflow:hidden;transition:max-width .3s ease-out}:host .gl-map__legend-content{position:relative;display:grid;grid-auto-flow:column dense;grid-auto-columns:minmax(64px,1fr);gap:3px;height:100%;padding:3px;box-sizing:border-box;background:rgba(var(--brand-white-rgb),.65);backdrop-filter:brightness(140%) blur(6px)}.gl-map__dialog,.gl-map__dialog::after{position:absolute;width:100%;height:100%}:host .gl-map__legend-toggle[aria-expanded=true]{border-radius:0 3px 3px 0}:host .gl-map__legend-toggle[aria-expanded=true]+.gl-map__legend-drawer{max-width:2000px;transition:max-width .6s ease-in-out}.gl-map__dialog::backdrop{position:absolute}.gl-map__dialog{pointer-events:none;display:flex;align-items:center;justify-content:center;border:0;opacity:0;background:0 0;perspective:1000px;perspective-origin:50% 50%;transition:opacity .1s ease-out .1s}.lot,.lot__image{position:relative}.gl-map__dialog-footer,.gl-map__dialog-header{grid-auto-flow:column dense;background:rgba(var(--brand-white-rgb),.65);padding:10px;display:grid;grid-auto-columns:max-content}.gl-map__dialog::after{content:'';top:0;left:0;backdrop-filter:grayscale(0) blur(0);transition:backdrop-filter .2s ease-out}.gl-map__dialog[open]{pointer-events:auto;opacity:1;transition:opacity .1s ease-out}.gl-map__dialog[open]::after{backdrop-filter:grayscale(100%) blur(3px)}.gl-map__dialog-form{display:grid;grid-template-rows:max-content 1fr max-content;border-radius:4px;overflow:hidden;opacity:0;backdrop-filter:blur(33px);box-shadow:0 0 30px rgb(0 0 0 / .1);z-index:1;transform:scale(.75) rotate3d(1,0,0,-45deg) translate3d(0,100px,200px);transition:opacity .1s,transform .2s var(--ease-out-circ)}.gl-map__dialog[open] .gl-map__dialog-form{opacity:1;transform:scale(1) rotate3d(0,0,0,0deg) translate3d(0,0,0);transition:opacity .1s,transform .3s var(--ease-out-back)}.gl-map__dialog-header{justify-content:space-between;align-items:flex-start;gap:inherit}.gl-map__dialog-footer{justify-content:flex-end;gap:10px}.gl-map__dialog-body{padding:40px;background:rgba(var(--brand-white-rgb),85%)}.gl-map__dialog-title{margin:7px 0;padding:0 0 0 1em;font-size:1.25em;font-weight:400;letter-spacing:.01em;line-height:1.3}.gl-map__dialog-cancel,.gl-map__dialog-close,.gl-map__dialog-confirm{cursor:pointer;min-width:35px;min-height:35px;padding:0 2em;border-radius:2px;border:0;color:var(--brand-white);background:var(--brand-dark-gray);mix-blend-mode:multiply;transition:background .2s ease-out,transform .2s ease-out}.gl-map__dialog-cancel:focus-visible,.gl-map__dialog-cancel:hover,.gl-map__dialog-close:focus-visible,.gl-map__dialog-close:hover{background-color:var(--brand-dark-gray-light);transform:translateY(-2px)}.gl-map__dialog-confirm{color:var(--brand-white);background:var(--brand-red);mix-blend-mode:normal}.lot__content,.lot__image{background:rgba(var(--brand-white-rgb),.85);backdrop-filter:brightness(140%) blur(10px)}.gl-map__dialog-confirm:focus-visible,.gl-map__dialog-confirm:hover{background:var(--brand-blue-dark);transform:translateY(-2px)}.gl-map__dialog-close{width:35px;height:35px;padding:0;font-size:2em;font-weight:300}.lot__content h3 span,.lot__cta{font-size:14px;font-weight:300;text-transform:uppercase;color:#fff}::slotted(.legend-item){display:grid;align-items:center;justify-items:center;padding:10px;background:rgba(var(--brand-white-rgb),.5);box-sizing:border-box}::slotted(.legend-item:first-child){border:3px}::slotted(.legend-item.available) svg{color:#666}::slotted(.legend-item.pendingsvg){color:#9d7f09}::slotted(.legend-item.modelsvg){color:#0089d1}::slotted(.legend-item.sold) svg{color:#d72525}::slotted .legend-item.sold svg{color:#d72525}.lot{display:grid;grid-template-rows:max-content 1fr;height:100%}.lot__image{width:100%;height:0;margin-bottom:3px;padding-top:calc(100% * (9 / 16));border-radius:0 4px 0 0}.lot__cta,.lot__img{width:calc(100% - 6px)}.lot__img{position:absolute;display:block;top:3px;left:3px;height:calc(100% - 6px);object-fit:cover;object-position:center;border-radius:2px 4px 2px 2px}.lot__content{position:relative;padding:17px;border-radius:0 0 4px}.lot__content h3{display:grid;grid-auto-flow:column;grid-auto-columns:max-content;gap:3px;margin:0 0 10px}.lot__content h3 span{display:inline-block;margin:0;padding:.25em .75em;border-radius:2px;background:#333}.lot__content h3 .sold{background:#d72525}.lot__content h3 .model{background:#0089d1}.lot__content h3 .pending{background:#9d7f09}.lot__content p{margin:0;font-size:16px;line-height:1.5}.lot__snapshot{display:grid;grid-template-columns:repeat(3,max-content);gap:.75em;margin:10px 0;line-height:1}.lot__snapshot div:not(:first-child){padding-left:.75em;border-left:1px solid #666}.lot__cta{position:absolute;display:flex;align-items:center;justify-content:center;height:40px;right:3px;bottom:3px;padding:0 17px;text-decoration:none;border-radius:2px 2px 4px;background:#1649c8;transition:background .2s ease-out}.lot__cta:focus-within,.lot__cta:hover{background:#142755}@keyframes removeLoader{0%{opacity:1}100%{opacity:0}}</style><slot></slot><div class="gl gl-map"><div class="gl-map__map"></div><div class="gl-map__detail"><div class="gl-map__detail-content"></div><button type="button" class="gl-map__detail-close" aria-label="Close detail panel.">&times;</button></div><dialog class="gl-map__dialog"><form method="dialog" class="gl-map__dialog-form"><div class="gl-map__dialog-header"><h3 class="gl-map__dialog-title">Please Confirm</h3><button type="reset" class="gl-map__dialog-close">&times;</button></div><div class="gl-map__dialog-body">Are you sure you want to delete this marker?<br>You will not be able to undo this action.</div><div class="gl-map__dialog-footer"><button type="reset" class="gl-map__dialog-cancel">Cancel</button> <button type="submit" class="gl-map__dialog-confirm">Yes</button></div></form></dialog><div class="gl-map__loader"><svg title="Graphic Language" viewBox="0 0 673 998.12" xmlns="http://www.w3.org/2000/svg"><path d="m673 0h-673v673h478.78l9.72 69.67 85.83-69.67h98.67z" fill="#009ad0"></path><path d="m334.65 132.13h-4.3c-37.91.84-67.25 8.31-88.08 22.32-3.31 1.54-7.77 5.49-13.46 11.83-13.86 14.25-20.73 31.37-20.73 51.31 0 22.37 9.5 41.42 28.6 57.2 14.45 11.18 32.32 19.4 53.59 24.64l-24.64 5.59c-16.87 4.41-29.59 9.65-38.15 15.79-9.25 6.58-13.81 14.7-13.81 24.35l.99 7.52c.55 1.53 1.29 3.07 2.23 4.5 12.22-4.6 25.83-9.45 40.77-14.5-1.29-1.83-1.93-3.96-1.93-6.43 0-5.05 3.07-9.3 9.21-12.82l6.58-3.27 3.96-1.34 23.65-5.89 31.23-6.58 6.28-.99c19.7-3.76 33.95-6.93 42.71-9.55 14.5-4.35 27.31-10.29 38.5-17.76 23.65-15.98 35.48-36.72 35.48-62.1 0-16.23-4.06-30.04-12.17-41.42-10.49-14.5-26.62-25.43-48.3-32.91-18.01-6.33-37.41-9.5-58.19-9.5zm-4.3 14.45h1.63c22.62 0 39.59 6.68 50.97 20.04 6.78 7.87 11.33 17.12 13.61 27.76 1.24 5.79 1.88 12.97 1.88 21.57 0 30.43-10.19 51.51-30.58 63.09-10.98 6.14-23.26 9.2-36.86 9.2h-.64c-18.8-.2-34.29-5.44-46.32-15.79-14.5-12.47-21.62-30.98-21.38-55.52 0-20.83 5.14-37.26 15.44-49.34 11.43-13.8 28.85-20.83 52.26-21.03z" fill="#fff"></path><path d="m392.56 360.03c-1.98-.3-18.48-1.98-22.6-2.31-17.48-1.49-35.07-1.73-39.27-1.73-25.63-.44-50.18 2.72-73.63 9.5-6.98 1.93-13.66 4.3-20.14 7.08.15.05.3.1.4.2l-7.87 3.61c-2.67 1.14-5.2 2.37-7.67 3.66l-2.43 1.39c-2.18 1.24-4.31 2.52-6.33 3.91l-.69.44c-.64.5-1.29.94-1.98 1.44-18.61 13.36-28.01 30.58-28.26 51.61-.24 29.15 15.49 52.25 47.01 69.38 28.31 15.09 62.06 22.37 101.25 21.67 28.06-.45 51.96-3.96 71.7-10.49 29.34-9.9 53.44-26.87 72.29-50.97 9.4-12.27 14.16-25.09 14.16-38.45 0-14.25-5.15-26.87-15.44-37.81-17.57-17.57-46.68-27.84-80.49-32.13zm44.32 63.65c4.35 3.96 6.88 10.79 7.52 20.44 0 16.18-9.06 29.1-27.27 38.74-10.93 5.69-22.47 9.45-34.49 11.18-16.23 3.51-32.91 5.3-49.98 5.3h-2.33c-15.34 0-31.13-1.44-47.31-4.3-27.22-5.05-47.01-13.46-59.53-25.29-7.87-7.72-11.83-16.48-11.83-26.33 0-15.34 9.85-27.32 29.59-35.83 19.5-8.37 46.91-12.52 82.19-12.52l6.88.35c56.36.64 91.84 10.1 106.54 28.26z" fill="#fff"></path><path d="m480.28 535.47c-3.51-15.34-.24-31.17 9.85-47.65-10.09 15.54-24.54 28.6-43.4 39.09-17.72 10.34-31.52 14.05-41.42 11.18 7.03 3.32 15.69 8.26 25.98 14.8 10.29 6.38 17.97 10.79 23.01 13.16 17.76 7.92 39.98 9.9 66.75 5.94-23.01-5.94-36.62-18.11-40.77-36.52z" fill="#fff"></path><g fill="#009ad0"><path d="m40.17 862.3c2.05 0 3.94-.1 5.65-.29 1.72-.19 3.34-.49 4.86-.88s2.96-.86 4.3-1.41 2.69-1.18 4.04-1.88v-16.78h-11.79c-.67 0-1.21-.19-1.62-.58s-.61-.87-.61-1.43v-5.84h23.36v29.2c-1.91 1.38-3.9 2.58-5.97 3.61s-4.28 1.88-6.64 2.58c-2.35.69-4.88 1.2-7.57 1.54s-5.61.5-8.76.5c-5.52 0-10.58-.95-15.19-2.84-4.6-1.89-8.57-4.55-11.89-7.96-3.33-3.42-5.92-7.51-7.78-12.29s-2.79-10.04-2.79-15.77.91-11.1 2.73-15.88 4.42-8.88 7.8-12.29c3.38-3.42 7.47-6.06 12.27-7.94s10.17-2.81 16.11-2.81c3.01 0 5.81.22 8.39.66s4.98 1.08 7.19 1.91 4.26 1.84 6.13 3.03c1.88 1.19 3.63 2.52 5.26 4.01l-2.92 4.67c-.6.96-1.38 1.43-2.34 1.43-.57 0-1.19-.19-1.86-.58-.89-.5-1.88-1.1-2.97-1.81-1.1-.71-2.43-1.39-4.01-2.04s-3.43-1.21-5.58-1.67c-2.14-.46-4.68-.69-7.62-.69-4.28 0-8.16.7-11.63 2.1s-6.42 3.4-8.87 6-4.32 5.75-5.63 9.45-1.96 7.85-1.96 12.45.68 9.11 2.04 12.88 3.28 6.96 5.76 9.58 5.42 4.62 8.81 6c3.4 1.38 7.15 2.07 11.26 2.07z"></path><path d="m130.53 838.04v31.75h-10.25v-76.09h21.5c4.81 0 8.97.49 12.48 1.46 3.5.97 6.4 2.38 8.68 4.22s3.97 4.06 5.07 6.66 1.65 5.51 1.65 8.73c0 2.69-.42 5.2-1.27 7.54s-2.08 4.43-3.69 6.29-3.58 3.44-5.89 4.75c-2.32 1.31-4.95 2.3-7.88 2.97 1.27.74 2.41 1.82 3.4 3.24l22.19 30.21h-9.13c-1.88 0-3.26-.72-4.14-2.18l-19.75-27.18c-.6-.85-1.26-1.46-1.96-1.83-.71-.37-1.77-.56-3.19-.56h-7.81zm0-7.49h10.78c3.01 0 5.65-.36 7.94-1.09 2.28-.72 4.19-1.75 5.73-3.08s2.7-2.91 3.48-4.75 1.17-3.88 1.17-6.11c0-4.53-1.5-7.95-4.49-10.25s-7.44-3.45-13.35-3.45h-11.26v28.72z"></path><path d="m285.25 869.79h-7.96c-.92 0-1.66-.23-2.23-.69s-.99-1.04-1.27-1.75l-7.11-18.37h-34.14l-7.11 18.37c-.25.64-.67 1.2-1.27 1.7s-1.35.74-2.23.74h-7.96l30.42-76.09h10.46l30.42 76.09zm-49.86-28.25h28.41l-11.95-30.95c-.78-1.91-1.54-4.3-2.28-7.17-.39 1.45-.77 2.79-1.14 4.01s-.74 2.29-1.09 3.21z"></path><path d="m341.22 841.33v28.46h-10.25v-76.09h22.46c4.81 0 9 .56 12.56 1.67 3.56 1.12 6.5 2.7 8.84 4.75s4.08 4.53 5.23 7.43 1.73 6.14 1.73 9.72-.62 6.78-1.86 9.72-3.05 5.47-5.44 7.59-5.35 3.78-8.89 4.96c-3.54 1.19-7.59 1.78-12.16 1.78h-12.21zm0-8.18h12.21c2.94 0 5.53-.39 7.78-1.17s4.13-1.87 5.66-3.27c1.52-1.4 2.67-3.07 3.45-5.02s1.17-4.09 1.17-6.42c0-4.85-1.5-8.64-4.49-11.36s-7.51-4.09-13.57-4.09h-12.21z"></path><path d="m491.53 869.79h-10.35v-34.62h-40.99v34.62h-10.35v-76.09h10.35v33.93h40.99v-33.93h10.35z"></path><path d="m557.37 869.79h-10.3v-76.09h10.3z"></path><path d="m666.42 854.07c.57 0 1.08.23 1.54.69l4.04 4.41c-3.11 3.61-6.89 6.42-11.33 8.44s-9.8 3.03-16.06 3.03c-5.49 0-10.46-.95-14.92-2.84s-8.27-4.55-11.42-7.96-5.59-7.51-7.33-12.29-2.6-10.04-2.6-15.77.93-10.99 2.79-15.77 4.47-8.88 7.83-12.32c3.36-3.43 7.39-6.1 12.08-7.99s9.87-2.84 15.53-2.84 10.42.87 14.47 2.6c4.05 1.74 7.65 4.09 10.8 7.06l-3.34 4.73c-.25.35-.53.65-.85.88s-.78.34-1.38.34c-.46 0-.95-.17-1.46-.5-.51-.34-1.12-.75-1.83-1.25s-1.54-1.03-2.5-1.59c-.96-.57-2.09-1.1-3.4-1.59-1.31-.5-2.83-.91-4.57-1.25s-3.74-.5-6-.5c-4.07 0-7.8.7-11.18 2.1s-6.29 3.39-8.73 5.97-4.34 5.73-5.71 9.45c-1.36 3.72-2.04 7.88-2.04 12.48s.68 8.97 2.04 12.69 3.22 6.86 5.58 9.42c2.35 2.57 5.14 4.52 8.36 5.87s6.69 2.02 10.41 2.02c2.26 0 4.3-.13 6.11-.4 1.8-.26 3.48-.68 5.02-1.25s2.97-1.28 4.3-2.15 2.66-1.9 4.01-3.11c.6-.53 1.19-.8 1.75-.8z"></path><path d="m16.54 988.56h32.92v8.65h-43.22v-76.09h10.3v67.43z"></path><path d="m139.35 997.22h-7.96c-.92 0-1.66-.23-2.23-.69s-.99-1.04-1.27-1.75l-7.11-18.37h-34.14l-7.11 18.37c-.25.64-.67 1.2-1.27 1.7s-1.35.74-2.23.74h-7.96l30.42-76.09h10.46l30.42 76.09zm-49.86-28.25h28.41l-11.95-30.95c-.78-1.91-1.54-4.3-2.28-7.17-.39 1.45-.77 2.79-1.14 4.01s-.74 2.29-1.09 3.21z"></path><path d="m172.24 921.48c.44.23.95.7 1.51 1.41l44.07 57.34c-.11-.92-.18-1.81-.21-2.68-.04-.87-.05-1.71-.05-2.52v-53.89h9.03v76.09h-5.2c-.81 0-1.5-.14-2.04-.42-.55-.28-1.09-.76-1.62-1.43l-44.02-57.29c.07.89.12 1.75.16 2.6.03.85.05 1.63.05 2.34v54.21h-9.03v-76.09h5.31c.92 0 1.6.12 2.04.35z"></path><path d="m295.02 989.73c2.05 0 3.94-.1 5.65-.29 1.72-.19 3.34-.49 4.86-.88s2.96-.86 4.3-1.41 2.69-1.18 4.04-1.88v-16.78h-11.79c-.67 0-1.21-.19-1.62-.58s-.61-.87-.61-1.43v-5.84h23.36v29.2c-1.91 1.38-3.9 2.58-5.97 3.61s-4.28 1.88-6.64 2.58c-2.35.69-4.88 1.2-7.57 1.54s-5.61.5-8.76.5c-5.52 0-10.58-.95-15.19-2.84-4.6-1.89-8.57-4.55-11.89-7.96-3.33-3.42-5.92-7.51-7.78-12.29s-2.79-10.04-2.79-15.77.91-11.1 2.73-15.88 4.42-8.88 7.8-12.29c3.38-3.42 7.47-6.06 12.27-7.94s10.17-2.81 16.11-2.81c3.01 0 5.81.22 8.39.66s4.98 1.08 7.19 1.91 4.26 1.84 6.13 3.03c1.88 1.19 3.63 2.52 5.26 4.01l-2.92 4.67c-.6.96-1.38 1.43-2.34 1.43-.57 0-1.19-.19-1.86-.58-.89-.5-1.88-1.1-2.97-1.81-1.1-.71-2.43-1.39-4.01-2.04s-3.43-1.21-5.58-1.67c-2.14-.46-4.68-.69-7.62-.69-4.28 0-8.16.7-11.63 2.1s-6.42 3.4-8.87 6-4.32 5.75-5.63 9.45-1.96 7.85-1.96 12.45.68 9.11 2.04 12.88 3.28 6.96 5.76 9.58 5.42 4.62 8.81 6c3.4 1.38 7.15 2.07 11.26 2.07z"></path><path d="m384.54 989.04c3.15 0 5.96-.53 8.44-1.59s4.57-2.55 6.29-4.46 3.03-4.19 3.93-6.85c.9-2.65 1.35-5.58 1.35-8.76v-46.25h10.25v46.25c0 4.39-.7 8.46-2.1 12.21s-3.4 7-6 9.74-5.78 4.89-9.53 6.45-7.96 2.34-12.64 2.34-8.88-.78-12.64-2.34-6.94-3.71-9.56-6.45-4.63-5.99-6.03-9.74-2.1-7.82-2.1-12.21v-46.25h10.25v46.19c0 3.19.45 6.11 1.35 8.76s2.21 4.94 3.93 6.85 3.82 3.41 6.32 4.49 5.32 1.62 8.47 1.62z"></path><path d="m508.04 997.22h-7.96c-.92 0-1.66-.23-2.23-.69s-.99-1.04-1.27-1.75l-7.11-18.37h-34.14l-7.11 18.37c-.25.64-.67 1.2-1.27 1.7s-1.35.74-2.23.74h-7.96l30.42-76.09h10.46l30.42 76.09zm-49.86-28.25h28.41l-11.95-30.95c-.78-1.91-1.54-4.3-2.28-7.17-.39 1.45-.77 2.79-1.14 4.01s-.74 2.29-1.09 3.21z"></path><path d="m565.28 989.73c2.05 0 3.94-.1 5.65-.29 1.72-.19 3.34-.49 4.86-.88s2.96-.86 4.3-1.41 2.69-1.18 4.04-1.88v-16.78h-11.79c-.67 0-1.21-.19-1.62-.58s-.61-.87-.61-1.43v-5.84h23.36v29.2c-1.91 1.38-3.9 2.58-5.97 3.61s-4.28 1.88-6.64 2.58c-2.35.69-4.88 1.2-7.57 1.54s-5.61.5-8.76.5c-5.52 0-10.58-.95-15.18-2.84s-8.57-4.55-11.89-7.96c-3.33-3.42-5.92-7.51-7.78-12.29s-2.79-10.04-2.79-15.77.91-11.1 2.73-15.88 4.42-8.88 7.81-12.29c3.38-3.42 7.47-6.06 12.26-7.94 4.8-1.88 10.17-2.81 16.11-2.81 3.01 0 5.8.22 8.39.66 2.58.44 4.98 1.08 7.19 1.91s4.26 1.84 6.13 3.03c1.88 1.19 3.63 2.52 5.26 4.01l-2.92 4.67c-.6.96-1.38 1.43-2.34 1.43-.57 0-1.19-.19-1.86-.58-.88-.5-1.88-1.1-2.97-1.81-1.1-.71-2.43-1.39-4.01-2.04s-3.43-1.21-5.58-1.67c-2.14-.46-4.68-.69-7.62-.69-4.28 0-8.16.7-11.63 2.1s-6.42 3.4-8.87 6-4.32 5.75-5.63 9.45-1.96 7.85-1.96 12.45.68 9.11 2.04 12.88 3.28 6.96 5.76 9.58 5.42 4.62 8.81 6c3.4 1.38 7.15 2.07 11.26 2.07z"></path><path d="m672.1 921.13v8.39h-36.53v25.27h29.57v8.07h-29.57v25.96h36.53v8.39h-46.88v-76.09h46.88z"></path></g></svg><div class="gl-map__progressbar"><div class="gl-map__progress"></div></div></div><div class="gl-map__legend"><button type="button" class="gl-map__legend-toggle" title="Show Map Legend" aria-expanded="false">•••</button><div class="gl-map__legend-drawer"><div class="gl-map__legend-content"><slot name="legend"></slot></div></div></div></div>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));

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
            if (!this.#dialogElem.returnValue) ; else {
                // The confirmation result depends on the state the component is in
                switch (this.state) {
                    case GlMap.STATES.REMOVING_MARKER:
                        this.removeMarker(this.#dialogElem.returnValue);
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

            switch (this.type) {
                case 'google': return GlMap.#googleApiKey;
                case 'mapbox': return GlMap.#mapboxApiKey;
                default: return 'unknown';
            }
        }

        set key(val) {

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

    /**
     * @injectHTML
     */
    class GlInfoWindow extends HTMLElement {
        constructor() {
            super();const el=document.createElement('template');el.innerHTML=`<article class="lot"><div class="lot__image"><img alt="" src="https://picsum.photos/id/237/320/240" width="320" height="240" loading="lazy" class="lot__img"></div><div class="lot__content"><h3><span contenteditable="true">Dog</span> <span class="model">Model</span></h3><p>Block 1, Homesite 1</p><p>Lot location, Orlando, FL 32837</p><div class="lot__snapshot"><div><strong>3</strong> bds</div><div><strong>2</strong> ba</div><div><strong>1,447</strong> sqft</div></div><a href="#google-map-code" class="lot__cta">Say More</a></div></article>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
        }
    }

    if (!window.customElements.get('gl-info-window')) {
        window.customElements.define('gl-info-window', GlInfoWindow);
    }

    class MortgageCalcInput extends FieldInput {
        static sanitize(v) { return (v + '').trim().replace(/[^0-9.]*/g, ''); }

        get type() { return this.getAttribute('type') || 'currency'; }
        get name() { return this.getAttribute('name') || ''; }
        get stylizedFormat() {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: this.type === 'percentage' ? 1 : 0,
                maximumFractionDigits: 3
            }).format;
        }
        get currencyFormat() {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format;
        }
        get numeric() {
            const sanitized = MortgageCalcInput.sanitize(this.value);
            const numeric = (!sanitized || isNaN(sanitized)) ? 0 : sanitized;
            return Number.isInteger(numeric) ? parseInt(numeric, 10) : parseFloat(numeric);
        }
        get stylized() {
            const stylized = this.stylizedFormat(this.numeric);
            return this.type === 'percentage' ? stylized + '%' : stylized;
        }
        get currency() {
            const sanitized = this.numeric;
            return this.currencyFormat(sanitized);
        }

        handleKeyup(e) {
            const val = e.target.value;
            this.value = val === '.' ? val.replace('.', '0.') : val;
            if (this.type === 'currency') {
                e.target.value = this.currency;
            } else if (this.type === 'percentage') {
                e.target.value = this.stylized;
            }
        }

        attributeChangedCallback(attr) {
            this.handleChanged();
            if (attr === 'value') {
                if (this.type === 'currency') {
                    this._value = this.currency;
                } else if (this.type === 'percentage') {
                    this._value = this.stylized;
                }
            }
        }
    }

    if (!window.customElements.get('mortgage-calc-input')) {
        window.customElements.define('mortgage-calc-input', MortgageCalcInput);
    }

    /**
     * @injectHTML
     */
    class MortgageCalc extends HTMLElement {
        static get observedAttributes() {
            return [
                'price',
                'downpayment',
                'interest',
                'taxes',
                'term',
                'pmi',
                'hoa',
                'monthly-payment',
                'colors',
            ];
        }

        constructor() {
            super();const el=document.createElement('template');el.innerHTML=`<style>:host{display:grid;gap:50px;--box-shadow-color:var(--primary-light);--box-shadow-width:1px;--box-shadow-color2:transparent;--box-shadow-width2:1px}:host .mortgage-calc__form{display:grid;gap:20px}@media screen and (min-width:978px){:host{grid-template-columns:50% 50%}:host .mortgage-calc__form{grid-template-columns:50% 50%}radio-group{grid-column:1/span 2}}:host .mortgage-calc__radio{position:relative;display:flex}:host .mortgage-calc__radio input{cursor:pointer;position:absolute;top:0;left:0;min-width:15px;height:15px;border-radius:50%;margin:22px 15px;padding:0;background-clip:content-box;appearance:none;outline:0;box-shadow:inset 0 0 0 var(--box-shadow-width) var(--box-shadow-color),inset 0 0 0 var(--box-shadow-width2) var(--box-shadow-color2)}:host .mortgage-calc__radio input:checked{background-color:var(--primary-mid);--box-shadow-color:var(--primary-mid);--box-shadow-width:2px;--box-shadow-width2:4px;--box-shadow-color2:white}:host .mortgage-calc__radio label{cursor:pointer;display:block;width:100%;padding:15px 20px 15px 40px;border:1px solid var(--primary-light);border-radius:5px}</style><div class="mortgage-calc__form"><mortgage-calc-input name="price" type="currency"><label for="price" slot="label">Price</label> <input type="text" id="price" slot="input" placeholder="123,456" pattern="[0-9$,]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="downpayment" type="currency"><label for="downpayment" slot="label">Downpayment</label> <input type="text" id="downpayment" slot="input" placeholder="123,456" pattern="[0-9$,]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="interest" type="percentage"><label for="interest" slot="label">Interest Rate</label> <input type="text" id="interest" slot="input" placeholder="3.5" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="taxes" type="percentage"><label for="taxes" slot="label">Est. Monthly Property Taxes</label> <input type="text" id="taxes" slot="input" placeholder="1.4" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="hoa" type="currency"><label for="hoa" slot="label">Monthly HOA Fees</label> <input type="text" id="hoa" slot="input" placeholder="200" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><radio-group name="term"><span slot="label">Choose a Term</span><div class="mortgage-calc__radio"><input id="term-15" type="radio" value="15" name="term"> <label for="term-15">15-Year Fixed</label></div><div class="mortgage-calc__radio"><input id="term-30" type="radio" value="30" name="term"> <label for="term-30">30-Year Fixed</label></div></radio-group></div><div class="mortgage-calc__results"><div class="mortgage-calc__chart"><!-- Chart is injected here --></div><div class="mortgage-calc__data"><div class="mortgage-calc__principal">Principal + Interest <span id="outputPrincipal"></span></div><div class="mortgage-calc__taxes">Taxes <span id="outputTaxes"></span></div><div class="mortgage-calc__taxes">Fees &amp; Dues: <span id="outputFees"></span></div><div class="mortgage-calc__total">Amount Per Month: <span id="outputPerMonth"></span></div></div></div>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));

            registerComponents(MortgageCalcInput, RadioGroup, ChartDonut);

            this.chartElement = undefined;

            this.elements = {
                price: this.shadowRoot.querySelector('mortgage-calc-input[name="price"]'),
                downpayment: this.shadowRoot.querySelector('mortgage-calc-input[name="downpayment"]'),
                interest: this.shadowRoot.querySelector('mortgage-calc-input[name="interest"]'),
                taxes: this.shadowRoot.querySelector('mortgage-calc-input[name="taxes"]'),
                term: this.shadowRoot.querySelector('radio-group[name="term"]'),
                hoa: this.shadowRoot.querySelector('mortgage-calc-input[name="hoa"]'),
            };

            this.output = {
                principal: this.shadowRoot.querySelector('#outputPrincipal'), // will include interest
                taxes: this.shadowRoot.querySelector('#outputTaxes'),
                fees: this.shadowRoot.querySelector('#outputFees'),
                perMonth: this.shadowRoot.querySelector('#outputPerMonth'),
            };

            this.addEventListener('input', this.handleInput, false);
        }

        get colors() {
            let colors = this.getAttribute('colors') || '';
            colors = colors.replace(/'/g, '"');
            return colors ? JSON.parse(colors) : [];
        }

        get currencyFormat() {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format;
        }

        get price() { return this.elements ? this.elements.price.numeric : 0; }
        set price(v) { this.elements.price.value = v; }

        get downpayment() { return this.elements ? this.elements.downpayment.numeric : 0; }
        set downpayment(v) { this.elements.downpayment.value = v; }

        get interest() { return this.elements ? this.elements.interest.numeric : 0; }
        set interest(v) { this.elements.interest.value = v; }

        get taxes() { return this.elements ? this.elements.taxes.numeric : 0; }
        set taxes(v) { this.elements.taxes.value = v;}

        get hoa() { return this.elements ? this.elements.hoa.numeric : 0; }
        set hoa(v) { this.elements.hoa.value = v; }

        get term() { return this.elements ? this.elements.term.numeric : 0; }
        set term(v) { this.elements.term.value = v; }

        get pmi() { return this.getAttribute('pmi') || ''; }

        get insurance() { return this.getAttribute('insurance') || ''; }

        /**
         * The mortgage principal is the initial loan amount.
         * It's the price minus the downpayment you make.
         * If a home is $500,000 and you put down $100,000,
         * you'll need to borrow $400,000 from the bank.
         */
        get mortgagePrincipal() { return this.price - this.downpayment; }

        /**
         * The interest rate percentage is divided by 12 (months in a year)
         * to find the monthly interest rate.
         * If the annual interest rate is 4%, the monthly interest rate is 0.33%
         * or 0.0033.
         */
        get monthlyInterestRate() { return this.interest / 100 / 12; }


        /**
         * For a fixed-rate mortgage, the term is often 30 or 15 years.
         * The number of payments is the number of years multiplied by
         * 12 (months in a year). 30 years would be 360 monthly payments.
         */
        get numberOfPayments() { return this.term * 12; }


        /**
         * Monthly principal and interest is calculated against the loan principal
         * and considers the monthly interest rate and total months in the loan term chosen
         * @returns {Number}
         */
        get monthlyPrincipalAndInterest() {
            const isCalculable = this.mortgagePrincipal && this.monthlyInterestRate;
            return isCalculable
                ? (this.mortgagePrincipal / ((1 - Math.pow(1 + this.monthlyInterestRate, -this.numberOfPayments)) / this.monthlyInterestRate))
                : 0;
        }


        /**
         * The monthly mortgage principal divided by the total number
         * of payments
         * @returns {Number}
         */
        get monthlyMortgagePrincipal() {
            const monthlyMortgagePrincipal = this.monthlyPrincipalAndInterest - this.monthlyInterestCost;
            return monthlyMortgagePrincipal;
        }

        /**
         * The interest cost is the mortgage principal multiplied by the monthly interest rate
         * @returns {Number}
         */
        get monthlyInterestCost() {
            const interestCost = this.mortgagePrincipal * this.monthlyInterestRate;
            return interestCost;
        }

        /**
         * Private mortgage insurance (PMI) is required if you put
         * down less than 20% of the purchase price with a conventional mortgage.
         * It's typically between 0.2% and 2% of the mortgage principal.
         */
        get pmiCost() {
            const lessThanTwentyPercent = (this.downpayment / this.price) < 0.2;
            return lessThanTwentyPercent
                ? ((this.pmi / 100) * this.mortgagePrincipal) / 12
                : 0;
        }

        /**
         * Property tax is a percentage of the price
         * split into 12 month payments
         */
        get taxesCost() {
            return ((this.taxes / 100) * this.price) / 12;
        }

        /**
         * Home insurance is a percentage of the price
         * split into 12 month payments
         * @returns {Number}
         */
        get insuranceCost() {
            const insuranceCost = ((this.insurance / 100) * this.price) / 12;
            return insuranceCost;
        }

        get feesCost() {
            const feesCost = this.hoa;
            return feesCost;
        }

        /**
         * Monthly payment adds all the monthly costs up into a single sum
         * @returns {Number}
         */
        get monthlyPayment() {
            const monthlyPayment = this.monthlyPrincipalAndInterest + this.taxesCost + this.insuranceCost + this.pmiCost + this.feesCost;
            return monthlyPayment;
        }

        generateChart() {
            const chartContainer = this.shadowRoot.querySelector('.mortgage-calc__chart');
            this.chartElement = document.createElement('chart-donut');
            this.chartElement.colors = this.colors;
            this.chartElement.labels = ['Principal + Interest', 'Taxes', 'Fees'];
            this.chartElement.values = [this.monthlyPrincipalAndInterest, this.taxesCost, this.feesCost];

            chartContainer.append(this.chartElement);
        }

        /**
         * Handles input events for the mortgage calc form
         */
        handleInput() {
            this.output.principal.textContent = this.currencyFormat(this.monthlyPrincipalAndInterest);
            this.output.taxes.textContent = this.currencyFormat(this.taxesCost);
            this.output.fees.textContent = this.currencyFormat(this.feesCost);
            this.output.perMonth.textContent = this.currencyFormat(this.monthlyPayment);
            if (this.chartElement) {
                this.chartElement.values = [this.monthlyPrincipalAndInterest, this.taxesCost, this.feesCost];
            }
        }

        connectedCallback() {
            this.generateChart();
        }

        /**
         * Handles changes to the component attributes
         * @param {String} attr - The attribute that changed
         * @param {*} oldVal - The old value
         * @param {*} newVal - The new value
         */
        attributeChangedCallback(attr, oldVal, newVal) {
            // Update attributes
            if (attr === 'price') {
                this.price = newVal;
            } else if (attr === 'downpayment') {
                this.downpayment = newVal;
            } else if (attr === 'interest') {
                this.interest = newVal;
            } else if (attr === 'taxes') {
                this.taxes = newVal;
            } else if (attr === 'term') {
                this.term = newVal;
            } else if (attr === 'hoa') {
                this.hoa = newVal;
            }

            // Update the outputs
            this.output.principal.textContent = this.currencyFormat(this.monthlyMortgagePrincipal + this.monthlyInterestCost);
            this.output.taxes.textContent = this.currencyFormat(this.taxesCost);
            this.output.fees.textContent = this.currencyFormat(this.feesCost);
            this.output.perMonth.textContent = this.currencyFormat(this.monthlyPayment);
            if (this.chartElement) {
                this.chartElement.values = [this.monthlyPrincipalAndInterest, this.taxesCost, this.feesCost];
            }
        }
    }

    // Define the component
    if (!window.customElements.get('mortgage-calc')) {
        window.customElements.define('mortgage-calc', MortgageCalc);
    }

    exports.ChartDonut = ChartDonut;
    exports.ChevronIcon = ChevronIcon;
    exports.FieldInput = FieldInput;
    exports.GlInfoWindow = GlInfoWindow;
    exports.GlMap = GlMap;
    exports.InfoMessage = InfoMessage;
    exports.MortgageCalc = MortgageCalc;
    exports.MortgageCalcInput = MortgageCalcInput;
    exports.RadioGroup = RadioGroup;
    exports.registerComponents = registerComponents;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=gl-web-components.js.map
