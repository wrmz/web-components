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

        // attributeChangedCallback(attr, oldVal, newVal) {
        //     if (attr === 'value' && this.input) {
        //         this.input.value = this.value;
        //     }
        // }

        // get value() { return this.getAttribute('value') || ''; }
        // set value(v) {
        //     // const sanitized = FieldInput.sanitizedFormat(v);
        //     // const readable = FieldInput.readableFormat(sanitized);

        //     this.setAttribute('value', v);
        // }
        // get sanitized() { return FieldInput.sanitizedFormat(this.value); }
        // get floated() { return FieldInput.floatedFormat(this.value); }
        // get currency() { return FieldInput.currencyFormat(this.value); }


        // handleSlotChange(e) {
        //     this.input = [...e.target.assignedElements()].find(el => el.tagName === 'INPUT');

        //     if (this.input) {
        //         this.input.value = this.value ? FieldInput.readableFormat(this.value) : '';
        //         this.registerElementForValidation(this.input);
        //         this.addEventListener('input', this.handleInput, false);
        //     }
        // }

        // handleInput(e) {
        //     this.value = e.target.value;

        //     e.target.value = FieldInput.readableFormat(this.value);
        // }

        // disconnectedCallback() {
        //     this.removeEventListener('input', this.handleInput);
        //     this.shadowInput.removeEventListener('slotchange', this.handleSlotChange);
        // }
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

    class MortgageCalcInput extends FieldInput {
        static sanitize(v) { return (v + '').trim().replace(/[^0-9.]*/g, ''); }

        get type() { return this.getAttribute('type') || 'currency'; }
        get stylizedFormat() {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: this.type === 'percentage' ? 1 : 0,
                maximumFractionDigits: 2
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
            return isNaN(sanitized) ? 0 : sanitized;
        }
        get stylized() {
            const sanitized = this.numeric;
            return this.stylizedFormat(sanitized);
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
                e.target.value = this.numeric;
            }
        }

        attributeChangedCallback(attr) {
            this.handleChanged();
            if (attr === 'value') {
                if (this.type === 'currency') {
                    this._value = this.currency;
                } else if (this.type === 'percentage') {
                    this._value = this.numeric;
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
                'monthly-payment'
            ];
        }

        constructor() {
            super();this.attachShadow({mode:'open'}).innerHTML=`<style>:host{display:grid;grid-template-columns:50% 50%;gap:50px;--box-shadow-color:var(--primary-light);--box-shadow-width:1px;--box-shadow-color2:transparent;--box-shadow-width2:1px}:host .mortgage-calc__form{display:grid;grid-template-columns:50% 50%;gap:20px}radio-group{grid-column:1/span 2}:host .mortgage-calc__radio{position:relative;display:flex}:host .mortgage-calc__radio input{cursor:pointer;position:absolute;top:0;left:0;min-width:15px;height:15px;border-radius:50%;margin:22px 15px;padding:0;background-clip:content-box;appearance:none;outline:0;box-shadow:inset 0 0 0 var(--box-shadow-width) var(--box-shadow-color),inset 0 0 0 var(--box-shadow-width2) var(--box-shadow-color2)}:host .mortgage-calc__radio input:checked{background-color:var(--primary-mid);--box-shadow-color:var(--primary-mid);--box-shadow-width:2px;--box-shadow-width2:4px;--box-shadow-color2:white}:host .mortgage-calc__radio label{cursor:pointer;display:block;width:100%;padding:15px 20px 15px 40px;border:1px solid var(--primary-light);border-radius:5px}</style><div class="mortgage-calc__form"><mortgage-calc-input name="price" type="currency"><label for="price" slot="label">Price</label> <input type="text" id="price" slot="input" placeholder="123,456" pattern="[0-9$,]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="downpayment" type="currency"><label for="downpayment" slot="label">Downpayment</label> <input type="text" id="downpayment" slot="input" placeholder="123,456" pattern="[0-9$,]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="interest" type="percentage"><label for="interest" slot="label">Interest Rate</label> <input type="text" id="interest" slot="input" placeholder="3.5" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="taxes" type="percentage"><label for="taxes" slot="label">Est. Monthly Property Taxes</label> <input type="text" id="taxes" slot="input" placeholder="1.4" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><radio-group name="term"><span slot="label">Choose a Term</span><div class="mortgage-calc__radio"><input id="term-15" type="radio" value="15" name="term"> <label for="term-15">15 Year Mortgage</label></div><div class="mortgage-calc__radio"><input id="term-30" type="radio" value="30" name="term"> <label for="term-30">30 Year Mortgage</label></div></radio-group></div><div class="mortgage-calc__results"><div class="mortgage-calc__chart">Chart</div><div class="mortgage-calc__data"><div class="mortgage-calc__principal">Principal + Interest <span id="outputPrincipal"></span></div><div class="mortgage-calc__taxes">Taxes <span id="outputTaxes"></span></div><div class="mortgage-calc__total">Amount Per Month: <span id="outputPerMonth"></span></div></div></div>`;

            registerComponents(MortgageCalcInput, RadioGroup);

            this.elements = {
                price: this.shadowRoot.querySelector('mortgage-calc-input[name="price"]'),
                downpayment: this.shadowRoot.querySelector('mortgage-calc-input[name="downpayment"]'),
                interest: this.shadowRoot.querySelector('mortgage-calc-input[name="interest"]'),
                taxes: this.shadowRoot.querySelector('mortgage-calc-input[name="taxes"]'),
                term: this.shadowRoot.querySelector('radio-group[name="term"]'),
                // pmi: { floated: FieldInput.floatedFormat(this.getAttribute('pmi')) || 0.5 },
                // insurance: { floated: FieldInput.floatedFormat(this.getAttribute('insurance')) || 0.35 }
            };

            this.output = {
                principal: this.shadowRoot.querySelector('#outputPrincipal'), // will include interest
                taxes: this.shadowRoot.querySelector('#outputTaxes'),
                perMonth: this.shadowRoot.querySelector('#outputPerMonth'),
            };

            // this.addEventListener('input', this.handleInput, false);
        }

        get price() { return this.elements.price.numeric; }
        set price(v) { this.elements.price.value = v; }

        get downpayment() { return this.elements.downpayment.numeric; }
        set downpayment(v) { this.elements.downpayment.value = v; }

        get interest() { return this.elements.interest.numeric; }
        set interest(v) { this.elements.interest.value = v; }

        get taxes() { return this.elements.taxes.numeric; }
        set taxes(v) { this.elements.taxes.value = v;}

        get term() { return this.elements.term.numeric; }
        set term(v) { this.elements.term.value = v; }

        // get pmi() { return this.elements.pmi.floated; }
        // set pmi(v) { this.elements.pmi.value = v; }

        // get insurance() { console.log(this.elements.insurance.floated); return this.elements.insurance.floated; }
        // set insurance(v) { this.elements.insurance.value = v; }

        // /**
        //  * The mortgage principal is the initial loan amount.
        //  * It's the price minus the downpayment you make.
        //  * If a home is $500,000 and you put down $100,000,
        //  * you'll need to borrow $400,000 from the bank.
        //  */
        // get mortgagePrincipal() {
        //     return this.price - this.downpayment;
        // }

        // /**
        //  * The interest rate percentage is divided by 12 (months in a year)
        //  * to find the monthly interest rate.
        //  * If the annual interest rate is 4%, the monthly interest rate is 0.33%
        //  * or 0.0033.
        //  */
        // get monthlyInterestRate() {
        //     return (this.interest / 100) / 12;
        // }

        // /**
        //  * For a fixed-rate mortgage, the term is often 30 or 15 years.
        //  * The number of payments is the number of years multiplied by
        //  * 12 (months in a year). 30 years would be 360 monthly payments.
        //  */
        // get numberOfPayments() {
        //     console.log('term:', this.term);
        //     return this.term * 12;
        // }

        // /**
        //  * The monthly mortgage principal divided by the total number
        //  * of payments
        //  */
        // get monthlyMortgagePrincipal() {
        //     // console.log(this.numberOfPayments);
        //     return this.mortgagePrincipal / this.numberOfPayments;
        // }

        // /**
        //  * Private mortgage insurance (PMI) is required if you put
        //  * down less than 20% of the purchase price with a conventional mortgage.
        //  * It's typically between 0.2% and 2% of the mortgage principal.
        //  */
        // get pmiCost() {
        //     const lessThanTwentyPercent = (this.downpayment / this.price) < 0.2;
        //     return lessThanTwentyPercent
        //         ? ((this.pmi / 100) * this.mortgagePrincipal) / 12
        //         : 0;
        // }

        // /**
        //  * Property tax is a percentage of the price
        //  * split into 12 month payments
        //  */
        // get taxesCost() {
        //     return ((this.taxes / 100) * this.price) / 12;
        // }

        // /**
        //  * Home insurance is a percentage of the price
        //  * split into 12 month payments
        //  */
        // get insuranceCost() {
        //     const insuranceCost = ((this.insurance / 100) * this.price) / 12
        //     console.log('insurance cost', insuranceCost);
        //     return insuranceCost;
        // }

        // get monthlyPayment() {
        //     const monthlyPayment = this.monthlyMortgagePrincipal + this.taxesCost + this.insuranceCost + this.pmiCost
        //     // console.log(
        //     //     'monthlyMortgagePrincipal:', this.monthlyMortgagePrincipal,
        //     // );
        //     return monthlyPayment;
        // }

        // handleInput(e) {
        //     this.output.principal.textContent = FieldInput.currencyFormat(this.monthlyMortgagePrincipal + this.interest);
        //     this.output.taxes.textContent = FieldInput.currencyFormat(this.taxesCost);
        //     this.output.perMonth.textContent = FieldInput.currencyFormat(this.monthlyPayment);
        // }
        attributeChangedCallback(attr, oldVal, newVal) {
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
            }
        }

        // attributeChangedCallback(attr, oldVal, newVal) {
        //     if (attr === 'price') {
        //         console.log('new price');
        //         this.price = newVal;
        //     }
        //     if (attr === 'downpayment') {
        //         this.downpayment = newVal;
        //     }
        //     if (attr === 'interest') {
        //         this.interest = newVal;
        //     }
        //     if (attr === 'taxes') {
        //         this.taxes = newVal;
        //     }
        //     if (attr === 'term') {
        //         this.term = newVal;
        //     }

        //     this.output.principal.textContent = FieldInput.currencyFormat(this.monthlyMortgagePrincipal);
        //     this.output.taxes.textContent = FieldInput.currencyFormat(this.taxesCost);
        //     this.output.perMonth.textContent = FieldInput.currencyFormat(this.monthlyPayment);
        //     // console.log(this.output.principal);


        //     // const errorMsg = this.shadowRoot.querySelector('info[role="alert"]');
        //     // if (attr === 'value' && oldVal !== newVal) {
        //     //     console.log('setting value:', attr, oldVal, newVal);
        //     // }
        //     // this.hasAttribute('invalid') ? errorMsg.setAttribute('invalid', '') : errorMsg.removeAttribute('invalid');
        // }

        // disconnectedCallback() {
        //     this.removeEventListener('input', this.handleInput);
        // }
    }

    if (!window.customElements.get('mortgage-calc')) {
        window.customElements.define('mortgage-calc', MortgageCalc);
    }

    exports.ChevronIcon = ChevronIcon;
    exports.FieldInput = FieldInput;
    exports.InfoMessage = InfoMessage;
    exports.MortgageCalc = MortgageCalc;
    exports.MortgageCalcInput = MortgageCalcInput;
    exports.RadioGroup = RadioGroup;
    exports.registerComponents = registerComponents;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=web-components.js.map
