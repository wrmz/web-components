import { registerComponents } from '../../common/register-components.js';
import { MortgageCalcInput } from '../mortgage-calc-input/mortgage-calc-input.js';
import { RadioGroup } from '../radio-group/radio-group.js';
import { ChartDonut } from '../../chart/donut/chart-donut.js';

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
        super();this.attachShadow({mode:'open'}).innerHTML=`<style>:host{display:grid;grid-template-columns:50% 50%;gap:50px;--box-shadow-color:var(--primary-light);--box-shadow-width:1px;--box-shadow-color2:transparent;--box-shadow-width2:1px}:host .mortgage-calc__form{display:grid;grid-template-columns:50% 50%;gap:20px}radio-group{grid-column:1/span 2}:host .mortgage-calc__radio{position:relative;display:flex}:host .mortgage-calc__radio input{cursor:pointer;position:absolute;top:0;left:0;min-width:15px;height:15px;border-radius:50%;margin:22px 15px;padding:0;background-clip:content-box;appearance:none;outline:0;box-shadow:inset 0 0 0 var(--box-shadow-width) var(--box-shadow-color),inset 0 0 0 var(--box-shadow-width2) var(--box-shadow-color2)}:host .mortgage-calc__radio input:checked{background-color:var(--primary-mid);--box-shadow-color:var(--primary-mid);--box-shadow-width:2px;--box-shadow-width2:4px;--box-shadow-color2:white}:host .mortgage-calc__radio label{cursor:pointer;display:block;width:100%;padding:15px 20px 15px 40px;border:1px solid var(--primary-light);border-radius:5px}</style><div class="mortgage-calc__form"><mortgage-calc-input name="price" type="currency"><label for="price" slot="label">Price</label> <input type="text" id="price" slot="input" placeholder="123,456" pattern="[0-9$,]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="downpayment" type="currency"><label for="downpayment" slot="label">Downpayment</label> <input type="text" id="downpayment" slot="input" placeholder="123,456" pattern="[0-9$,]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="interest" type="percentage"><label for="interest" slot="label">Interest Rate</label> <input type="text" id="interest" slot="input" placeholder="3.5" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="taxes" type="percentage"><label for="taxes" slot="label">Est. Monthly Property Taxes</label> <input type="text" id="taxes" slot="input" placeholder="1.4" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="hoa" type="currency"><label for="hoa" slot="label">Monthly HOA Fees</label> <input type="text" id="hoa" slot="input" placeholder="200" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><radio-group name="term"><span slot="label">Choose a Term</span><div class="mortgage-calc__radio"><input id="term-15" type="radio" value="15" name="term"> <label for="term-15">15-Year Fixed</label></div><div class="mortgage-calc__radio"><input id="term-30" type="radio" value="30" name="term"> <label for="term-30">30-Year Fixed</label></div></radio-group></div><div class="mortgage-calc__results"><div class="mortgage-calc__chart"><!-- Chart is injected here --></div><div class="mortgage-calc__data"><div class="mortgage-calc__principal">Principal + Interest <span id="outputPrincipal"></span></div><div class="mortgage-calc__taxes">Taxes <span id="outputTaxes"></span></div><div class="mortgage-calc__total">Amount Per Month: <span id="outputPerMonth"></span></div></div></div>`;

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

export { MortgageCalc };
//# sourceMappingURL=mortgage-calc.js.map
