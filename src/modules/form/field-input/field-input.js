import { FormElement } from '../common/FormElement';
import { registerComponents } from '../../common/register-components';

/**
 * @injectHTML
 */
export class FieldInput extends FormElement {

    constructor() {
        super();
        this.handleSlotChange = this.handleSlotChange.bind(this);
        this.input = undefined;
        this.shadowInput = this.shadowRoot.querySelector('slot[name="input"]');
        this.shadowInput.addEventListener('slotchange', this.handleSlotChange, false);
    }

    get value() { return this.getAttribute('value'); }
    set value(v) { this.setAttribute('value', v); }


    handleSlotChange(e) {
        this.input = [...e.target.assignedElements()].find(el => el.tagName === 'INPUT');
        if (this.input) {
            this.input.value = this.value || '';
            this.registerElementForValidation(this.input);
        }
    }

    disconnectedCallback() {
        this.shadowInput.removeEventListener('slotchange', this.handleSlotChange);
    }
}

if (!window.customElements.get('field-input')) {
    window.customElements.define('field-input', FieldInput);
}
