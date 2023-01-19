var webComponents = (function (exports) {
    'use strict';

    /**
     * @injectHTML
     */
    class ChevronIcon extends HTMLElement {
        constructor() {
            super();this.attachShadow({mode:'open'}).innerHTML=`<style>svg{display:flex;align-items:center;justify-content:center;width:var(--width,24px);height:var(--height,24px)}</style><svg width="17" height="9" viewBox="0 0 17 9" xmlns="http://www.w3.org/2000/svg" class="svg-chevron" fill="currentColor"><title>Chevron Icon</title><path d="M16.749.356l-.255-.255a.43.43 0 00-.61 0L8.878 7.113 1.866.1a.43.43 0 00-.61 0l-.255.255a.43.43 0 000 .61l7.568 7.57a.43.43 0 00.61 0l7.566-7.57a.428.428 0 00.004-.61z" fill-rule="nonzero"/></svg>`;
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
            super();this.attachShadow({mode:'open'}).innerHTML=`<style>:host{display:none;padding:2px;font-size:12px;line-height:16px;color:#555;align-items:center}:host([shown]){display:flex}:host([role=alert][shown]:not([invalid])){display:none}:host([role=alert][invalid][shown]){display:flex}</style><chevron-icon aria-hidden="true"></chevron-icon><slot></slot>`;
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
            super();this.attachShadow({mode:'open'}).innerHTML=`<style>:host{display:grid;grid-gap:3px;width:100%;height:max-content;box-sizing:border-box}::slotted(input),::slotted(textarea){width:100%;font-size:14px;line-height:20px;padding:13px 15px;margin:0;border:1px solid var(--primary-light);border-radius:5px;color:#555;outline:0;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis}:host([invalid]) ::slotted(input),:host([invalid]) ::slotted(textarea){border:2px solid var(--warning-mid);padding:12px 14px}::slotted(input::placeholder),::slotted(textarea::placeholder){color:#767676}::slotted(input:focus),::slotted(textarea:focus){border:2px solid #555;padding:12px 14px}</style><div class="field"><slot name="label"></slot><slot name="input"></slot><info-message role="status"><slot name="info"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></div>`;
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
            super();this.attachShadow({mode:'open'}).innerHTML=`<style>:host{display:grid;appearance:none}:host fieldset{position:relative;display:grid;margin:0;padding:0;border:0}:host .radio-group__options{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:20px}</style><fieldset class="radio-group"><legend class="radio-group__legend"><slot name="label"></slot></legend><div class="radio-group__options"><slot></slot></div><info-message role="status"><slot name="info-message"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></fieldset>`;
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

    // import { registerComponents  } from '../../common/register-components';

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
            super();this.attachShadow({mode:'open'}).innerHTML=`<style>.donut circle{cursor:pointer;pointer-events:stroke;transition:filter .2s linear,transform .2s linear}.donut circle:focus{outline:0}.donut circle:focus,.donut circle:hover{filter:brightness(80%)}</style><div class="chart chart--donut"><svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events" width="160" height="160" viewBox="0 0 160 160" class="donut"></svg></div>`;
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

    let google = null;

    /**
     * @injectHTML
     */
    class GlGoogleMap extends HTMLElement {
        static get observedAttributes() {
            return [
                'key',
            ];
        }

        constructor() {
            super();this.attachShadow({mode:'open'}).innerHTML=`<style>:host{position:relative;display:block;width:100%;min-height:300px}:host .map{position:absolute;top:0;left:0;width:100%;height:100%}</style><div class="map"></div>`;
            this.errors = [];
            this.utilTimeout = undefined;
            this.key = '';
            this.id = crypto.randomUUID ? crypto.randomUUID().split('-').pop() : (Math.random() * 1000);
            this.handleApiLoaded = `gl_cb_${this.id}`;
            this.map = undefined;
            this.elem = this.shadowRoot.querySelector('.map');
            this.elem.setAttribute('id', `map_${this.id}`);
        }

        handleApiLoaded() {
            this.map = new google.maps.Map(this.elem, {
                center: { lat: -34.397, lng: 150.644 },
                zoom: 8
            });
        }

        loadGoogleMapsApi() {
            const endpoint = 'https://maps.googleapis.com/maps/api/js';
            const script = document.createElement('script');
            script.id = `map_script_${this.id}`;
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
            super();this.attachShadow({mode:'open'}).innerHTML=`<style>:host{display:grid;grid-template-columns:50% 50%;gap:50px;--box-shadow-color:var(--primary-light);--box-shadow-width:1px;--box-shadow-color2:transparent;--box-shadow-width2:1px}:host .mortgage-calc__form{display:grid;grid-template-columns:50% 50%;gap:20px}radio-group{grid-column:1/span 2}:host .mortgage-calc__radio{position:relative;display:flex}:host .mortgage-calc__radio input{cursor:pointer;position:absolute;top:0;left:0;min-width:15px;height:15px;border-radius:50%;margin:22px 15px;padding:0;background-clip:content-box;appearance:none;outline:0;box-shadow:inset 0 0 0 var(--box-shadow-width) var(--box-shadow-color),inset 0 0 0 var(--box-shadow-width2) var(--box-shadow-color2)}:host .mortgage-calc__radio input:checked{background-color:var(--primary-mid);--box-shadow-color:var(--primary-mid);--box-shadow-width:2px;--box-shadow-width2:4px;--box-shadow-color2:white}:host .mortgage-calc__radio label{cursor:pointer;display:block;width:100%;padding:15px 20px 15px 40px;border:1px solid var(--primary-light);border-radius:5px}</style><div class="mortgage-calc__form"><mortgage-calc-input name="price" type="currency"><label for="price" slot="label">Price</label> <input type="text" id="price" slot="input" placeholder="123,456" pattern="[0-9$,]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="downpayment" type="currency"><label for="downpayment" slot="label">Downpayment</label> <input type="text" id="downpayment" slot="input" placeholder="123,456" pattern="[0-9$,]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="interest" type="percentage"><label for="interest" slot="label">Interest Rate</label> <input type="text" id="interest" slot="input" placeholder="3.5" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="taxes" type="percentage"><label for="taxes" slot="label">Est. Monthly Property Taxes</label> <input type="text" id="taxes" slot="input" placeholder="1.4" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="hoa" type="currency"><label for="hoa" slot="label">Monthly HOA Fees</label> <input type="text" id="hoa" slot="input" placeholder="200" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><radio-group name="term"><span slot="label">Choose a Term</span><div class="mortgage-calc__radio"><input id="term-15" type="radio" value="15" name="term"> <label for="term-15">15-Year Fixed</label></div><div class="mortgage-calc__radio"><input id="term-30" type="radio" value="30" name="term"> <label for="term-30">30-Year Fixed</label></div></radio-group></div><div class="mortgage-calc__results"><div class="mortgage-calc__chart"><!-- Chart is injected here --></div><div class="mortgage-calc__data"><div class="mortgage-calc__principal">Principal + Interest <span id="outputPrincipal"></span></div><div class="mortgage-calc__taxes">Taxes <span id="outputTaxes"></span></div><div class="mortgage-calc__taxes">Fees &amp; Dues: <span id="outputFees"></span></div><div class="mortgage-calc__total">Amount Per Month: <span id="outputPerMonth"></span></div></div></div>`;

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
    exports.InfoMessage = InfoMessage;
    exports.MortgageCalc = MortgageCalc;
    exports.MortgageCalcInput = MortgageCalcInput;
    exports.RadioGroup = RadioGroup;
    exports.registerComponents = registerComponents;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=web-components.js.map
