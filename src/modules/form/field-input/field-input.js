import { FormElement } from '../common/FormElement';

/**
 * @injectHTML
 */
export class FieldInput extends FormElement {

    constructor() {
        super();
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
