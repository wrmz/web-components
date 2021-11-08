import { registerComponents } from '../../common/register-components.js';
import { FormElement } from '../common/FormElement.js';
import { InfoMessage } from '../info-message/info-message.js';

/**
 * @injectHTML
 */
class RadioGroup extends FormElement {
    static sanitize(v) { return (v + '').trim().replace(/[^0-9.]*/g, ''); }

    constructor() {
        super();this.attachShadow({mode:'open'}).innerHTML=`<style>:host{display:grid;appearance:none}:host fieldset{position:relative;display:grid;margin:0;padding:0;border:0}:host .radio-group__options{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:20px}</style><fieldset class="radio-group"><legend class="radio-group__legend"><slot name="label"></slot></legend><div class="radio-group__options"><slot></slot></div><info-message role="status"><slot name="info-message"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></fieldset>`;
        registerComponents(InfoMessage);
        this.radios = null;
        this.handleSlotChange = this.handleSlotChange.bind(this);
        this.shadowRadios = this.shadowRoot.querySelector('.radio-group__options slot');
        this.shadowRadios.addEventListener('slotchange', this.handleSlotChange, false);
    }

    get value() { return this.getAttribute('value') || ''; }
    set value(v) { this.setAttribute('value', v); }

    get numeric() {
        const sanitized = RadioGroup.sanitize(this.value);
        return isNaN(sanitized) ? 0 : sanitized;
    }

    get selectedRadio() {
        return this.radios && this.value
            ? this.radios.find(el => el.checked)
            : null;
    }
    set selectedRadio(v) {
        if (v && this.radios) {
            const radio = this.radios.find(el => el.value === v);
            if (radio) {
                radio.checked = true;
            }
        }
    }

    handleSlotChange(e) {
        this.radios = [...e.target.assignedElements()]
            .flatMap(el => ([el, ...el.children]))
            .filter(el => el.tagName === 'INPUT');

        if (this.value) {
            this.selectedRadio = this.value;
        }

        this.addEventListener('input', this.handleInput, false);
    }

    handleInput(e) {
        this.value = e.target.value;
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        this.handleChanged();
        if (attr === 'value') {
            this._value = newVal;
        }
    }

    detachedCallback() {
        this.removeEventListener('input', this.handleInput);
    }
}

if (!window.customElements.get('radio-group')) {
    window.customElements.define('radio-group', RadioGroup);
}

export { RadioGroup };
//# sourceMappingURL=radio-group.js.map
