var webComponents = (function (exports) {
    'use strict';

    /**
     * @injectHTML
     */
    class ChevronIcon extends HTMLElement {
        constructor() {
            super();const el = document.createElement('template');el.innerHTML = `<style>svg{display:flex;align-items:center;justify-content:center;width:var(--width,24px);height:var(--height,24px)}</style><svg width="17" height="9" viewBox="0 0 17 9" xmlns="http://www.w3.org/2000/svg" class="svg-chevron" fill="currentColor"><title>Chevron Icon</title><path d="M16.749.356l-.255-.255a.43.43 0 00-.61 0L8.878 7.113 1.866.1a.43.43 0 00-.61 0l-.255.255a.43.43 0 000 .61l7.568 7.57a.43.43 0 00.61 0l7.566-7.57a.428.428 0 00.004-.61z" fill-rule="nonzero"/></svg>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
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
            super();const el = document.createElement('template');el.innerHTML = `<style>:host{display:none;padding:2px;font-size:12px;line-height:16px;color:#555;align-items:center}:host([shown]){display:flex}:host([role=alert][shown]:not([invalid])){display:none}:host([role=alert][invalid][shown]){display:flex}</style><chevron-icon aria-hidden="true"></chevron-icon><slot></slot>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
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
            super();const el = document.createElement('template');el.innerHTML = `<style>:host{display:grid;grid-gap:3px;width:100%;height:max-content;box-sizing:border-box}::slotted(input),::slotted(textarea){width:100%;font-size:14px;line-height:20px;padding:13px 15px;margin:0;border:1px solid var(--primary-light);border-radius:5px;color:#555;outline:0;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis}:host([invalid]) ::slotted(input),:host([invalid]) ::slotted(textarea){border:2px solid var(--warning-mid);padding:12px 14px}::slotted(input::placeholder),::slotted(textarea::placeholder){color:#767676}::slotted(input:focus),::slotted(textarea:focus){border:2px solid #555;padding:12px 14px}</style><div class="field"><slot name="label"></slot><slot name="input"></slot><info-message role="status"><slot name="info"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></div>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
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
            super();const el = document.createElement('template');el.innerHTML = `<style>:host{display:grid;appearance:none}:host fieldset{position:relative;display:grid;margin:0;padding:0;border:0}:host .radio-group__options{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:20px}</style><fieldset class="radio-group"><legend class="radio-group__legend"><slot name="label"></slot></legend><div class="radio-group__options"><slot></slot></div><info-message role="status"><slot name="info-message"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></fieldset>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
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
            super();const el = document.createElement('template');el.innerHTML = `<style>.donut circle{cursor:pointer;pointer-events:stroke;transition:filter .2s linear,transform .2s linear}.donut circle:focus{outline:0}.donut circle:focus,.donut circle:hover{filter:brightness(80%)}</style><div class="chart chart--donut"><svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events" width="160" height="160" viewBox="0 0 160 160" class="donut"></svg></div>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
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

    class GlGoogleMarker extends HTMLElement {
        static get observedAttributes() {
            return [
                'latitude',
                'longitude',
                'status',
                'color',
            ];
        }

        constructor() {
            super();
        }

        get map() {
            return this.parentElement.map;
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
    }

    if (!window.customElements.get('gl-google-marker')) {
        window.customElements.define('gl-google-marker', GlGoogleMarker);
    }

    /*global google*/
    class GlGoogleImageFactory {
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
                this._rotate = 0;

                this.setMap(this._map);
            };
            GlGoogleImage.prototype = new google.maps.OverlayView();
            GlGoogleImage.prototype.getRotate = function() {
                return this._rotate;
            };
            GlGoogleImage.prototype.setRotate = function(val) {
                this._rotate = val;
                this._imageElem.style.transform = `rotate(${val}deg)`;
            };
            GlGoogleImage.prototype.getBounds = function() {
                return this._bounds;
            };
            GlGoogleImage.prototype.setAdminMode = function(adminMode) {
                this._isAdmin = adminMode;
                if (this._div) {
                    if (adminMode) {
                        this._div.style.boxShadow = '0 0 0 2px #0388d1';
                        this._imageElem.style.backdropFilter = 'blur(2px) brightness(1.3)';
                    } else {
                        this._div.style.boxShadow = 'none';
                        this._imageElem.style.backdropFilter = 'blur(0) brightness(1)';
                    }
                }
            };
            GlGoogleImage.prototype.onAdd = function() {
                if (this._imageElem) {
                    const panes = this.getPanes();
                    this._div = document.createElement('div');

                    this._div.style.position = 'absolute';
                    this._div.style.userSelect = 'none';
                    this._div.style.cursor = 'hand';
                    this._div.draggable = true;
                    this._imageElem.style.width = '100%';
                    this._imageElem.style.height = '100%';
                    this._imageElem.style.position = 'absolute';
                    this._imageElem.style.display = 'block';
                    this._imageElem.style.transition = 'all .2s ease-out';
                    this._div.appendChild(this._imageElem);

                    // Use `floatPane` instead of `overlayLayer`?
                    // panes.floatPane.appendChild(this._div);
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
            super();const el = document.createElement('template');el.innerHTML = `<style>.lot__content h3 span,.lot__cta{font-weight:300;text-transform:uppercase;color:#fff}:host{position:relative;display:block;width:100%;min-height:410px}:host .gl-map{display:flex;position:absolute;top:0;left:0;width:100%;height:100%;border-radius:4px;overflow:hidden}:host .gl-map__detail,:host .gl-map__map{position:absolute;top:0;height:100%}:host .gl-map__map{left:0;width:100%}:host .gm-style .gmnoprint.gm-bundled-control{margin:3px!important}:host .gl-map__detail{right:0;width:0;max-width:360px;overflow:hidden;box-sizing:border-box;transition:width .2s ease-out;will-change:width}:host .gl-map__detail::after{content:'';position:absolute;top:0;left:0;width:100%;mix-blend-mode:multiply}:host .gl-map.has-detail .gl-map__detail{width:50%}:host .gl-map__detail-close{cursor:pointer;position:absolute;display:flex;align-items:center;justify-content:center;top:9px;right:9px;width:30px;height:30px;margin:0;padding:0;font-size:30px;font-weight:300;color:#666;border:0;border-radius:4px;background:rgb(255 255 255 / 85%);backdrop-filter:brightness(140%) blur(10px);transition:color .2s ease-out,background .2s ease-out}:host .gl-map__detail-close:focus,:host .gl-map__detail-close:hover{color:#333;background:#fff}:host .gl-map__detail-content{position:relative;top:3px;width:calc(100% - 3px);height:calc(100% - 6px);overflow:auto;box-sizing:border-box}:host .gl__edit{cursor:pointer;display:flex;align-items:center;justify-content:center;width:40px;height:40px;color:#666;border:0;border-radius:4px;background:#fff;background:rgb(255 255 255 / 85%);backdrop-filter:blur(10px);transition:color .2s ease-out,background .2s ease-out}.lot__content,.lot__image{background:rgb(255 255 255 / 85%);backdrop-filter:brightness(140%) blur(10px)}:host .gl__edit:focus,:host .gl__edit:hover{color:#333;background:#fff}:host .gl-map__center-button{cursor:pointer;display:flex;align-items:center;justify-content:center;left:3px!important;top:87px!important;width:40px;height:40px;color:#666;border:0;border-radius:2px;background:rgb(255 255 255 / 85%);backdrop-filter:brightness(140%) blur(10px);transition:color .2s ease-out,background .2s ease-out}:host .gl-map__center-button:focus,:host .gl-map__center-button:hover{color:#333;background:#fff}:host .gl-map__legend{position:relative;height:80px;max-width:calc(100% - 49px);padding:0 33px 0 0;margin:3px;border-radius:2px;box-sizing:border-box}:host .gl-map__legend-toggle{cursor:pointer;position:absolute;top:0;right:0;width:80px;height:30px;font-size:20px;letter-spacing:2px;color:#666;border:0;border-radius:2px;box-sizing:border-box;background:rgb(255 255 255 / 85%);backdrop-filter:brightness(140%) blur(10px);transform-origin:top left;transform:rotate(90deg) translate(0,-80px);transition:color .2s ease-out,border-radius .2s ease-out,background .2s ease-out}:host .gl-map__legend-toggle:hover{color:#000;background:#fff}:host .gl-map__legend-drawer{position:absolute;top:0;left:auto;right:33px;height:100%;max-width:0;overflow:hidden;transition:max-width .3s ease-out}.lot,.lot__image{position:relative}:host .gl-map__legend-content{position:relative;display:grid;grid-auto-flow:column dense;grid-auto-columns:minmax(64px,1fr);gap:3px;height:100%;padding:3px;box-sizing:border-box;background:rgb(255 255 255 / 65%);backdrop-filter:brightness(140%) blur(6px)}:host .gl-map__legend-toggle[aria-expanded=true]{border-radius:0 3px 3px 0}:host .gl-map__legend-toggle[aria-expanded=true]+.gl-map__legend-drawer{max-width:2000px;transition:max-width .6s ease-in-out}.lot{display:grid;grid-template-rows:max-content 1fr;height:100%}.lot__image{width:100%;height:0;margin-bottom:3px;padding-top:calc(100% * (9 / 16));border-radius:0 4px 0 0}.lot__cta,.lot__img{width:calc(100% - 6px)}.lot__img{position:absolute;display:block;top:3px;left:3px;height:calc(100% - 6px);object-fit:cover;object-position:center;border-radius:2px 4px 2px 2px}.lot__content{position:relative;padding:17px;border-radius:0 0 4px}.lot__content h3{display:grid;grid-auto-flow:column;grid-auto-columns:max-content;gap:3px;margin:0 0 10px}.lot__content h3 span{display:inline-block;margin:0;padding:.25em .75em;font-size:12px;border-radius:2px;background:#333}.lot__content h3 .sold{background:#d72525}.lot__content h3 .model{background:#0089d1}.lot__content h3 .pending{background:#9d7f09}.lot__content p{margin:0;font-size:16px}.lot__snapshot{display:grid;grid-template-columns:repeat(3,max-content);gap:.75em;margin:10px 0;line-height:1}.lot__snapshot div:not(:first-child){padding-left:.75em;border-left:1px solid #666}.lot__cta{position:absolute;display:flex;align-items:center;justify-content:center;height:40px;right:3px;bottom:3px;padding:0 17px;font-size:14px;text-decoration:none;border-radius:2px 2px 4px;background:#1649c8;box-sizing:border-box;transition:background .2s ease-out}.lot__cta:focus,.lot__cta:hover{background:#142755}.legend-item{display:grid;align-items:center;justify-items:center;padding:10px;background:rgb(255 255 255 / 50%);box-sizing:border-box}.legend-item:first-child{border:3px}.legend-item.available svg{color:#666}.legend-item.pending svg{color:#9d7f09}.legend-item.model svg{color:#0089d1}.legend-item.sold svg{color:#d72525}</style><div class="gl gl-map"><div class="gl-map__map"></div></div>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));

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
            this.legendToggleElem = undefined;
            this.rotateButtonElem = undefined;
            this.imageNE = 0.0;
            this.imageNW = 0.0;
            this.imageSW = 0.0;
            this.imageSE = 0.0;
            this.kmlLayer = undefined;
            this.elem = this.shadowRoot.querySelector('.gl-map');
            this.mapElem = this.shadowRoot.querySelector('.gl-map__map');
            this.detailElem = null;

            this.elem.setAttribute('id', `map_${this._id}`);

            this.emitMarkerEvent = this.emitMarkerEvent.bind(this);
            this.generateLegend = this.generateLegend.bind(this);
            this.generateAdminMarker = this.generateAdminMarker.bind(this);
            this.generateMarker = this.generateMarker.bind(this);
            this.loadDetail = this.loadDetail.bind(this);
            this.showDetail = this.showDetail.bind(this);
            this.toggleLegend = this.toggleLegend.bind(this);
            this.recenterMap = this.recenterMap.bind(this);
            this.handleRotateButtonClick = this.handleRotateButtonClick.bind(this);

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
                mapTypeControl: true,
                scaleControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.TOP_LEFT
                },
                zoom: 8
            });


            this.setMapStyle();
            this.generateCenterMapControl();
            this.generateMapRotateControl();

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

        /**
         * Generates a KML layer on the map
         */
        generateKml() {
            this.kmlLayer = new google.maps.KmlLayer({
                url: this.overlay,
                map: this.map,
                suppressInfoWindows: true,
            });
        }

        /**
         * Generates an admin marker
         *
         * @param {Object} marker
         * @returns {google.maps.Marker}
         */
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

            adminMarker.addListener('dragend', this.handleMarkerDragend.bind(this, marker, adminMarker));
            adminMarker.addListener('dragstart', this.handleMarkerDragstart.bind(this, marker, adminMarker));
            adminMarker.addListener('drag', this.handleMarkerDrag.bind(this, marker, adminMarker));

            return adminMarker;
        }

        /**
         * Generates a marker
         *
         * @param {Object} marker
         * @returns {google.maps.Marker}
         */
        generateMarker(marker) {
            const mapMarker = new google.maps.Marker({
                map: this.map,
                id: marker.id,
                type: 'client',
                status: marker.status,
                color: marker.color,
                isSelected: false,
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

            mapMarker.addListener('mouseover', this.handleMarkerMouseover.bind(this, marker, mapMarker));
            mapMarker.addListener('mouseout', this.handleMarkerMouseout.bind(this, marker, mapMarker));
            mapMarker.addListener('dragend', this.handleMarkerDragend.bind(this, marker, mapMarker));
            mapMarker.addListener('click', this.handleMarkerClick.bind(this, marker, mapMarker));

            return mapMarker;
        }

        /**
         * Emits a marker event from GlGoogleMap
         *
         * @this GlGoogleMap
         * @param {string} eventType
         * @param {GlGoogleMarker} glMarker
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
         * Handles & dispatches from GlGoogleMap a marker click event
         *
         * @this GlGoogleMap
         * @param {GlGoogleMap} glMarker
         * @param {google.maps.Marker} marker
         * @param {google.maps.event} event
         * @emits GlGoogleMap#click
         */
        handleMarkerClick(glMarker, marker, event) {
            this.markers.forEach((m) => {
                if (m.type !== 'admin') {
                    if (m.id === marker.id) {
                        m.isSelected = true;
                        m.setIcon({
                            path: this._markerPath,
                            fillColor: 'white',
                            fillOpacity: 1,
                            strokeWeight: 0,
                            anchor: new google.maps.Point(10, 22)
                        });
                    } else {
                        m.isSelected = false;
                        m.setIcon({
                            path: this._markerPath,
                            fillColor: m.color,
                            fillOpacity: 1,
                            strokeWeight: 0,
                            anchor: new google.maps.Point(10, 22)
                        });
                    }
                }
            });

            this.loadDetail(marker);
            this.panToSelectedMarker(marker);
            this.emitMarkerEvent('click', glMarker, marker, event);
        }

        /**
         * Handles & dispatches from GlGoogleMap a marker drag event
         *
         * @this GlGoogleMap
         * @param {GlGoogleMarker} glMarker
         * @param {google.maps.Marker} marker
         * @param {google.maps.Event} event
         * @emits GlGoogleMap#drag
         */
        handleMarkerDrag(glMarker, marker, event) {
            if (marker.type === 'admin') {
                const label = glMarker.label;
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();

                this.imageElemPosition = {
                    neLatitude: (label === 'nw' || label === 'ne') ? lat : this.imageElemPosition.neLatitude,
                    neLongitude: (label === 'nw' || label === 'ne') ? lng : this.imageElemPosition.neLongitude,
                    swLatitude: (label === 'sw' || label == 'se') ? lat : this.imageElemPosition.swLatitude,
                    swLongitude: (label === 'sw' || label == 'se') ? lng : this.imageElemPosition.swLongitude,
                };
            }

            this.emitMarkerEvent('drag', glMarker, marker, event);
        }

        /**
         * Handles & dispatches from GlGoogleMap a marker dragend event
         *
         * @this GlGoogleMap
         * @param {GlGoogleMarker} glMarker
         * @param {google.maps.Marker} marker
         * @param {google.maps.Event} event
         * @emits GlGoogleMap#dragend
         */
        handleMarkerDragend(glMarker, marker, event) {
            this.emitMarkerEvent('dragend', glMarker, marker, event);
        }

        /**
         * Handles & dispatches from GlGoogleMap a marker dragstart event
         *
         * @this GlGoogleMap
         * @param {GlGoogleMarker} glMarker
         * @param {google.maps.Marker} marker
         * @param {google.maps.Event} event
         * @emits GlGoogleMap#dragstart
         */
        handleMarkerDragstart(glMarker, marker, event) {
            this.emitMarkerEvent('dragstart', glMarker, marker, event);
        }

        /**
         * Handles & dispatches from GlGoogleMap a marker mouseover event
         *
         * @this GlGoogleMap
         * @param {GlGoogleMarker} glMarker
         * @param {google.maps.Marker} marker
         * @param {google.maps.event} event
         * @emits GlGoogleMap#mouseover
         */
        handleMarkerMouseover(glMarker, marker, event) {
            if (!marker.isSelected) {
                marker.setIcon({
                    path: this._markerPath,
                    fillColor: 'white',
                    fillOpacity: 1,
                    strokeWeight: 0,
                    anchor: new google.maps.Point(10, 22)
                });
            }

            this.emitMarkerEvent('mouseover', glMarker, marker, event);
        }

        /**
         * Handles & dispatches from GlGoogleMap a marker mouseout event
         *
         * @this GlGoogleMap
         * @param {GlGoogleMarker} glMarker
         * @param {google.maps.Marker} marker
         * @param {google.maps.event} event
         * @emits GlGoogleMap#mouseout
         */
        handleMarkerMouseout(glMarker, marker, event) {
            if (!marker.isSelected) {
                marker.setIcon({
                    path: this._markerPath,
                    fillColor: marker.color,
                    fillOpacity: 1,
                    strokeWeight: 0,
                    anchor: new google.maps.Point(10, 22)
                });
            }

            this.emitMarkerEvent('mouseout', glMarker, marker, event);
        }

        handleRotateButtonClick() {
            const currentRotation = this.imageLayer.getRotate();
            this.imageLayer.setRotate(currentRotation + 15);
        }

        /**
         * Recenters the map
         */
        recenterMap() {
            const imageBounds = this.imageLayer.getBounds();
            const bounds = new google.maps.LatLngBounds();

            bounds.extend(imageBounds.getNorthEast());
            bounds.extend(imageBounds.getSouthWest());
            this.map.fitBounds(bounds);
        }

        /**
         * Toggles the legend visibility via CSS by changing the
         * `aria-expanded` attribute value
         */
        toggleLegend() {
            if (this.legendToggleElem.getAttribute('aria-expanded') === 'true') {
                this.legendToggleElem.setAttribute('aria-expanded', false);
            } else {
                this.legendToggleElem.setAttribute('aria-expanded', true);
            }
        }

        /**
         * Generates the legend container elements for a supplied
         * GlGoogleLegend element
         *
         * @todo This should be its own imported custom element
         */
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
            this.legendToggleElem = legendToggleElem;
            this.legendToggleElem.addEventListener('click', this.toggleLegend, false);

            legendElem.style.userSelect = 'none';
            legendElem.className = 'gl-map__legend';
            legendElem.appendChild(this.legendToggleElem);
            legendElem.appendChild(legendDrawerElem);

            this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(legendElem);
        }

        generateMapRotateControl() {
            this.rotateButtonElem = document.createElement('button');

            this.rotateButtonElem.type = 'button';
            this.rotateButtonElem.className = 'gl__edit gl__edit-rotate';
            this.rotateButtonElem.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M19.51613 0h-.40323c-.26721 0-.48387.21665-.48387.48387v4.46077C16.8923 1.98634 13.6784 0 10 0 4.64629 0 .27516 4.20718.0125 9.49569-.00117 9.7706.22077 10 .496 10h.40388c.25617 0 .4696-.19956.48294-.45536C1.61923 5.0087 5.36682 1.37097 10 1.37097c3.34121 0 6.2394 1.89826 7.67294 4.67742h-4.60842c-.26722 0-.48387.21665-.48387.48387v.40322c0 .26722.21665.48387.48387.48387h6.4516c.26723 0 .48388-.21665.48388-.48387V.48388C20 .21664 19.78335 0 19.51613 0Zm-.01214 10h-.40383c-.25613 0-.46964.19956-.48294.45536-.23653 4.55101-3.99843 8.17367-8.61722 8.17367-3.33097 0-6.23677-1.89322-7.67335-4.67742h4.60883c.26722 0 .48387-.21665.48387-.48387v-.40322c0-.26722-.21665-.48387-.48387-.48387H.48388c-.26723 0-.48388.21665-.48388.48387v6.4516C0 19.78336.21665 20 .48387 20H.8871c.26721 0 .48387-.21665.48387-.48387v-4.46077C3.1077 18.01366 6.32165 20 10 20c5.35375 0 9.72484-4.20718 9.9875-9.49569C20.00117 10.2294 19.77923 10 19.504 10Z"/></svg>';

            this.rotateButtonElem.addEventListener('click', this.handleRotateButtonClick, false);

            this.map.controls[google.maps.ControlPosition.CENTER].push(this.rotateButtonElem);
        }

        generateCenterMapControl() {
            const centerMapElem = document.createElement('button');

            centerMapElem.type = 'button';
            centerMapElem.title = 'Center the Map';
            centerMapElem.className = 'gl-map__center-button';

            centerMapElem.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M10 0c5.52285 0 10 4.47715 10 10s-4.47715 10-10 10S0 15.52285 0 10 4.47715 0 10 0ZM3.72462 10.63068h-2.4409c.30834 4.32356 3.76204 7.77726 8.0856 8.0856v-2.4409c-2.97945-.29584-5.34886-2.66525-5.6447-5.6447Zm14.99251-.01202-.04376.00775-.07354.00424-2.32445.00007c-.29584 2.97941-2.66525 5.34882-5.6447 5.64466v2.4409c4.32757-.30863 7.78366-3.76844 8.08645-8.09762Zm-8.08627-4.35022-.0002.89139c0 .3483-.28236.63065-.63066.63065-.32342 0-.58998-.24346-.62641-.5571l-.00424-.07355-.00021-.8914c-1.58435.2659-2.8348 1.51636-3.1007 3.1007l1.1959.00022c.3483 0 .63065.28235.63065.63065 0 .32342-.24345.58998-.5571.62641l-.07355.00424-1.1959.00021c.2659 1.58435 1.51635 2.8348 3.1007 3.1007l.0002-1.21748c0-.3483.28236-.63065.63066-.63065.32342 0 .58998.24346.62641.5571l.00424.07355.00021 1.21748c1.58435-.2659 2.8348-1.51635 3.1007-3.1007l-1.38427-.0002c-.3483 0-.63065-.28236-.63065-.63066 0-.32342.24346-.58998.5571-.62641l.07355-.00424 1.38427-.00021c-.2659-1.58435-1.51635-2.8348-3.1007-3.1007Zm-.00018-4.98472v2.4409c2.97945.29584 5.34886 2.66525 5.6447 5.64466l2.32445.00007a.6341.6341 0 0 1 .11726.01088c-.30275-4.32807-3.75884-7.78788-8.0864-8.09651Zm-9.34696 8.0856h2.4409c.29584-2.97945 2.66525-5.34886 5.6447-5.6447v-2.4409c-4.32356.30834-7.77726 3.76204-8.0856 8.0856Z"/></svg>';

            centerMapElem.addEventListener('click', this.recenterMap, false);

            this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(centerMapElem);
        }

        /**
         * Generates the detail container elements for marker details
         */
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

        /**
         * Loads the detail for a selected marker
         *
         * @param {google.maps.Marker} marker
         */
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

        /**
         * Shows the detail by adding a class name to
         * GlGoogleMap element
         */
        showDetail() {
            this.elem.classList.add('has-detail');
        }

        /**
         * Closes the detail
         */
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

        /**
         * Converts google latLng coordinates to div pixel coordinates
         *
         * @param {google.maps.LatLng} latLng
         * @returns {Object}
         */
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
            if (this.rotateButtonElem) {
                this.rotateButtonElem.style.display = isAdmin ? 'flex' : 'none';
            }

            this.markers.forEach((marker) => {
                marker.setDraggable(this.isAdmin);
                if (marker.type === 'admin') {
                    marker.setVisible(this.isAdmin && this.isImageVisible);
                }
            });
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
            const projection = this.imageLayer.getProjection();
            const pixelPosition = projection.fromLatLngToDivPixel(marker.getPosition());
            const newPixelPosition = {
                x: pixelPosition.x + offsetX,
                y: pixelPosition.y + offsetY
            };

            this.map.panTo(projection.fromDivPixelToLatLng(newPixelPosition));
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
            super();const el = document.createElement('template');el.innerHTML = `<style>:host{display:grid;gap:50px;--box-shadow-color:var(--primary-light);--box-shadow-width:1px;--box-shadow-color2:transparent;--box-shadow-width2:1px}:host .mortgage-calc__form{display:grid;gap:20px}@media screen and (min-width:978px){:host{grid-template-columns:50% 50%}:host .mortgage-calc__form{grid-template-columns:50% 50%}}radio-group{grid-column:1/span 2}:host .mortgage-calc__radio{position:relative;display:flex}:host .mortgage-calc__radio input{cursor:pointer;position:absolute;top:0;left:0;min-width:15px;height:15px;border-radius:50%;margin:22px 15px;padding:0;background-clip:content-box;appearance:none;outline:0;box-shadow:inset 0 0 0 var(--box-shadow-width) var(--box-shadow-color),inset 0 0 0 var(--box-shadow-width2) var(--box-shadow-color2)}:host .mortgage-calc__radio input:checked{background-color:var(--primary-mid);--box-shadow-color:var(--primary-mid);--box-shadow-width:2px;--box-shadow-width2:4px;--box-shadow-color2:white}:host .mortgage-calc__radio label{cursor:pointer;display:block;width:100%;padding:15px 20px 15px 40px;border:1px solid var(--primary-light);border-radius:5px}</style><div class="mortgage-calc__form"><mortgage-calc-input name="price" type="currency"><label for="price" slot="label">Price</label> <input type="text" id="price" slot="input" placeholder="123,456" pattern="[0-9$,]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="downpayment" type="currency"><label for="downpayment" slot="label">Downpayment</label> <input type="text" id="downpayment" slot="input" placeholder="123,456" pattern="[0-9$,]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="interest" type="percentage"><label for="interest" slot="label">Interest Rate</label> <input type="text" id="interest" slot="input" placeholder="3.5" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="taxes" type="percentage"><label for="taxes" slot="label">Est. Monthly Property Taxes</label> <input type="text" id="taxes" slot="input" placeholder="1.4" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="hoa" type="currency"><label for="hoa" slot="label">Monthly HOA Fees</label> <input type="text" id="hoa" slot="input" placeholder="200" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><radio-group name="term"><span slot="label">Choose a Term</span><div class="mortgage-calc__radio"><input id="term-15" type="radio" value="15" name="term"> <label for="term-15">15-Year Fixed</label></div><div class="mortgage-calc__radio"><input id="term-30" type="radio" value="30" name="term"> <label for="term-30">30-Year Fixed</label></div></radio-group></div><div class="mortgage-calc__results"><div class="mortgage-calc__chart"><!-- Chart is injected here --></div><div class="mortgage-calc__data"><div class="mortgage-calc__principal">Principal + Interest <span id="outputPrincipal"></span></div><div class="mortgage-calc__taxes">Taxes <span id="outputTaxes"></span></div><div class="mortgage-calc__taxes">Fees &amp; Dues: <span id="outputFees"></span></div><div class="mortgage-calc__total">Amount Per Month: <span id="outputPerMonth"></span></div></div></div>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));

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
    exports.GlGoogleMap = GlGoogleMap;
    exports.GlGoogleMarker = GlGoogleMarker;
    exports.InfoMessage = InfoMessage;
    exports.MortgageCalc = MortgageCalc;
    exports.MortgageCalcInput = MortgageCalcInput;
    exports.RadioGroup = RadioGroup;
    exports.registerComponents = registerComponents;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=web-components.js.map
