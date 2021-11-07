import { FormElement } from '../common/FormElement';
import { registerComponents } from '../../common/register-components';

/**
 * @injectHTML
 */
export class FieldInput extends FormElement {

    static readableFormat = new Intl.NumberFormat('en-US').format;
    static currencyFormat = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format;
    static sanitizedFormat = function (v) {
        return v.trim().replace(/[^0-9\.]/g, '');
    }
    constructor() {
        super();
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
