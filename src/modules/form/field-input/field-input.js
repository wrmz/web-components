import { FormElement } from '../common/FormElement';
import { registerComponents } from '../../common/register-components';

/**
 * @injectHTML
 */
export class FieldInput extends FormElement {
    constructor() {
        super();
        this.shadowRoot.querySelector('slot[name="input"]').addEventListener('slotchange', e => {
            let input = [...e.target.assignedElements()].find(el => el.tagName === 'INPUT');
            input && this.registerElementForValidation(input);
        });
    }
}

if (!window.customElements.get('field-input')) {
    window.customElements.define('field-input', FieldInput);
}
