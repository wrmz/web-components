import { registerComponents } from '../../common/register-components.js';
import { FieldInput } from '../field-input/field-input.js';
import { RadioGroup } from '../radio-group/radio-group.js';

/**
 * @injectHTML
 */
export class MortgageCalc extends HTMLElement {
    static get observedAttributes() { return ['price', 'downpayment', 'interest', 'taxes', 'term']; }

    constructor() {
        super();
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
        return
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
