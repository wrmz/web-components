import { FieldInput } from '../field-input/field-input.js';

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

export { MortgageCalcInput };
//# sourceMappingURL=mortgage-calc-input.js.map
