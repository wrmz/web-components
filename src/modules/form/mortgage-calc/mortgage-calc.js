import { registerComponents } from '../../common/register-components.js';
import { MortgageCalcInput } from '../mortgage-calc-input/mortgage-calc-input.js';
import { RadioGroup } from '../radio-group/radio-group.js';

/**
 * @injectHTML
 */
export class MortgageCalc extends HTMLElement {
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
        super();

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

    get interest() { return this.elements.interest.floated; }
    set interest(v) { this.elements.interest.value = v; }

    get taxes() { return this.elements.taxes.floated; }
    set taxes(v) { this.elements.taxes.value = v;}

    // get term() { return this.elements.term.floated; }
    // set term(v) { this.elements.term.value = v; }

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
