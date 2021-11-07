import { registerComponents } from '../../common/register-components.js';
import { FieldInput } from '../field-input/field-input.js';
import { RadioGroup } from '../radio-group/radio-group.js';

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

export { MortgageCalc };
//# sourceMappingURL=mortgage-calc.js.map
