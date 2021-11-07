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
            this.handleInvalid = this.handleInvalid.bind(this);
            this.handleFormInput = this.handleFormInput.bind(this);
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
            element.addEventListener('invalid', this.handleInvalid, false);
            element.addEventListener('input', this.handleFormInput, false);
        }

        handleInvalid(e) {
            this.valid = false;
            this.toggleInvalidAttribute(e.target);
        }

        handleFormInput(e) {
            const element = e.target;
            this.valid = element.checkValidity();
            this.toggleInvalidAttribute(element);
        }

        toggleInvalidAttribute(element) {
            const errorMsg = this.shadowRoot.querySelector('info[role="alert"]');
            element.validity.valid ? errorMsg.removeAttribute('invalid') : errorMsg.setAttribute('invalid', '');
        }

        handleChanged() {
            const errorMsg = this.shadowRoot.querySelector('info[role="alert"]');
            this.hasAttribute('invalid') ? errorMsg.setAttribute('invalid', '') : errorMsg.removeAttribute('invalid');
        }

        attributeChangedCallback() {
            this.handleChanged();
        }
    }

    /**
     * @injectHTML
     */
    class FieldInput extends FormElement {

        static get readableFormat() { return new Intl.NumberFormat('en-US').format; }
        static get currencyFormat() {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format;
        }
        static sanitizedFormat(v) {
            return v.trim().replace(/[^0-9.]/g, '');
        }

        constructor() {
            super();this.attachShadow({mode:'open'}).innerHTML=`<style>:host{display:grid;grid-gap:3px;width:100%;height:max-content;box-sizing:border-box}::slotted(input),::slotted(textarea){width:100%;font-size:14px;line-height:20px;padding:13px 15px;margin:0;border:1px solid var(--primary-light);border-radius:5px;color:#555;outline:0;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis}:host([invalid]) ::slotted(input),:host([invalid]) ::slotted(textarea){border:2px solid var(--warning-mid);padding:12px 14px}::slotted(input::placeholder),::slotted(textarea::placeholder){color:#767676}::slotted(input:focus),::slotted(textarea:focus){border:2px solid #555;padding:12px 14px}</style><div class="field"><slot name="label"></slot><slot name="input"></slot><info-message role="status"><slot name="info"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></div>`;
            this.handleSlotChange = this.handleSlotChange.bind(this);
            this.input = undefined;
            this.shadowInput = this.shadowRoot.querySelector('slot[name="input"]');
            this.shadowInput.addEventListener('slotchange', this.handleSlotChange, false);
        }

        get value() { return FieldInput.sanitizedFormat(this.getAttribute('value') || ''); }
        set value(v) {
            const sanitized = FieldInput.sanitizedFormat(v);
            const readable = FieldInput.readableFormat(sanitized);

            this.setAttribute('value', readable);
        }


        handleSlotChange(e) {
            this.input = [...e.target.assignedElements()].find(el => el.tagName === 'INPUT');

            if (this.input) {
                this.input.value = this.value ? FieldInput.readableFormat(this.value) : '';
                this.registerElementForValidation(this.input);
                this.addEventListener('input', this.handleInput, false);
            }
        }

        handleInput(e) {
            this.value = e.target.value;
            e.target.value = FieldInput.readableFormat(this.value);
        }

        disconnectedCallback() {
            this.removeEventListener('input', this.handleInput);
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
        // static observedAttributes = ['value'];

        constructor() {
            super();this.attachShadow({mode:'open'}).innerHTML=`<style>:host{display:grid;appearance:none}:host fieldset{position:relative;display:grid;margin:0;padding:0;border:0}:host .radio-group__options{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:20px}</style><fieldset class="radio-group"><legend class="radio-group__legend"><slot name="label"></slot></legend><div class="radio-group__options"><slot></slot></div><info-message role="status"><slot name="info-message"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></fieldset>`;
            registerComponents(InfoMessage);
            this.radios = null;
            this.handleSlotChange = this.handleSlotChange.bind(this);
            this.shadowRadios = this.shadowRoot.querySelector('.radio-group__options slot');
            this.shadowRadios.addEventListener('slotchange', this.handleSlotChange, false);
        }

        get value() { return this.getAttribute('value'); }
        set value(v) { this.setAttribute('value', v); }

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
    class MortgageCalc extends HTMLElement {
        static get observedAttributes() { return ['price', 'downpayment', 'interest', 'taxes', 'term']; }

        constructor() {
            super();this.attachShadow({mode:'open'}).innerHTML=`<style>:host{display:grid;grid-template-columns:50% 50%;gap:50px;--box-shadow-color:var(--primary-light);--box-shadow-width:1px;--box-shadow-color2:transparent;--box-shadow-width2:1px}:host .mortgage-calc__form{display:grid;grid-template-columns:50% 50%;gap:20px}radio-group{grid-column:1/span 2}:host .mortgage-calc__radio{position:relative;display:flex}:host .mortgage-calc__radio input{cursor:pointer;position:absolute;top:0;left:0;min-width:15px;height:15px;border-radius:50%;margin:22px 15px;padding:0;background-clip:content-box;appearance:none;outline:0;box-shadow:inset 0 0 0 var(--box-shadow-width) var(--box-shadow-color),inset 0 0 0 var(--box-shadow-width2) var(--box-shadow-color2)}:host .mortgage-calc__radio input:checked{background-color:var(--primary-mid);--box-shadow-color:var(--primary-mid);--box-shadow-width:2px;--box-shadow-width2:4px;--box-shadow-color2:white}:host .mortgage-calc__radio label{cursor:pointer;display:block;width:100%;padding:15px 20px 15px 40px;border:1px solid var(--primary-light);border-radius:5px}</style><div class="mortgage-calc__form"><field-input name="price"><label for="price" slot="label">Price</label> <input type="text" id="price" slot="input" placeholder="123,456" pattern="[0-9,]+" maxlength="8"><!-- <span slot="info">The price of the home</span>
        <span slot="error">Only numbers are permitted</span> --></field-input><field-input name="downpayment"><label for="downpayment" slot="label">Downpayment</label> <input type="text" id="downpayment" slot="input" placeholder="123,456" pattern="[0-9,]+" maxlength="8"><!-- <span slot="info">How much you can put down</span>
        <span slot="error">Only numbers are permitted</span> --></field-input><field-input name="interest"><label for="interest" slot="label">Interest Rate</label> <input type="text" id="interest" slot="input" placeholder="3.5" pattern="[0-9,]+" maxlength="4"><!-- <span slot="info">How much you can put down</span>
        <span slot="error">Only numbers are permitted</span> --></field-input><field-input name="taxes"><label for="taxes" slot="label">Est. Monthly Property Taxes</label> <input type="text" id="taxes" slot="input" placeholder="1.4" pattern="[0-9,]+" maxlength="4"><!-- <span slot="info">How much you can put down</span>
        <span slot="error">Only numbers are permitted</span> --></field-input><radio-group name="term"><span slot="label">Choose a Term</span><div class="mortgage-calc__radio"><input id="term-15" type="radio" value="15" name="term"> <label for="term-15">15 Year Mortgage</label></div><div class="mortgage-calc__radio"><input id="term-30" type="radio" value="30" name="term"> <label for="term-30">30 Year Mortgage</label></div></radio-group></div><div class="mortgage-calc__results"><div class="mortgage-calc__chart">Chart</div><div class="mortgage-calc__data"><div class="mortgage-calc__principal">Principal + Interest {{ principal }}</div><div class="mortgage-calc__taxes">Taxes {{ taxes }}</div><div class="mortgage-calc__total">Amount Per Month: {{ perMonth }}</div></div></div>`;
            registerComponents(FieldInput, RadioGroup);

            this.elements = {
                price: this.shadowRoot.querySelector('field-input[name="price"]'),
                downpayment: this.shadowRoot.querySelector('field-input[name="downpayment"]'),
                interest: this.shadowRoot.querySelector('field-input[name="interest"]'),
                taxes: this.shadowRoot.querySelector('field-input[name="taxes"]'),
                term: this.shadowRoot.querySelector('radio-group[name="term"]')
            };
        }

        get price() { return this.elements.price.value; }
        set price(v) { this.elements.price.value = v; }

        get downpayment() { return this.elements.downpayment.value; }
        set downpayment(v) { this.elements.downpayment.value = v; }

        get interest() { return this.elements.interest.value; }
        set interest(v) { this.elements.interest.value = v; }

        get taxes() { return this.elements.taxes.value; }
        set taxes(v) { this.elements.taxes.value = v;}

        get term() { return this.elements.term.value; }
        set term(v) { this.elements.term.value = v; }

        get mortgagePrincipal() {
            return 'no';
        }

        attributeChangedCallback(attr, oldVal, newVal) {
            if (attr === 'price') {
                this.price = newVal;
            }
            if (attr === 'downpayment') {
                this.downpayment = newVal;
            }
            if (attr === 'interest') {
                this.interest = newVal;
            }
            if (attr === 'taxes') {
                this.taxes = newVal;
            }
            if (attr === 'term') {
                this.term = newVal;
            }
            // const errorMsg = this.shadowRoot.querySelector('info[role="alert"]');
            // if (attr === 'value' && oldVal !== newVal) {
            //     console.log('setting value:', attr, oldVal, newVal);
            // }
            // this.hasAttribute('invalid') ? errorMsg.setAttribute('invalid', '') : errorMsg.removeAttribute('invalid');
        }
    }

    if (!window.customElements.get('mortgage-calc')) {
        window.customElements.define('mortgage-calc', MortgageCalc);
    }

    exports.ChevronIcon = ChevronIcon;
    exports.FieldInput = FieldInput;
    exports.InfoMessage = InfoMessage;
    exports.MortgageCalc = MortgageCalc;
    exports.RadioGroup = RadioGroup;
    exports.registerComponents = registerComponents;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=web-components.js.map
