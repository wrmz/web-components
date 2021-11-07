import { registerComponents } from '../../common/register-components.js';
import { FieldInput } from '../field-input/field-input.js';
import { RadioGroup } from '../radio-group/radio-group.js';

/**
 * @injectHTML
 */
export class MortgageCalc extends HTMLElement {
    constructor() {
        super();
        registerComponents(FieldInput, RadioGroup);

        const slottedInputs = {};
    }
};

if (!window.customElements.get('mortgage-calc')) {
    window.customElements.define('mortgage-calc', MortgageCalc);
}
