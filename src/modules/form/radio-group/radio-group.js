import { registerComponents } from '../../common/register-components.js';
import { FormElement } from '../common/FormElement.js';
import { FieldRadio } from '../field-radio/field-radio.js';
import { InfoMessage } from '../info-message/info-message.js';

/**
 * @injectHTML
 */
export class RadioGroup extends FormElement {
    constructor() {
        super();
        registerComponents(InfoMessage, FieldRadio);
        this.shadowRoot.querySelector('.radio-group slot').addEventListener('slotchange', this.handleSlotChange, false);
    }

    handleSlotChange(e) {
        e.target.assignedElements().forEach(e => e.tagName === 'INPUT' && this.registerElementForValidation(e));
    }
}

if (!window.customElements.get('radio-group')) {
    window.customElements.define('radio-group', RadioGroup);
}
