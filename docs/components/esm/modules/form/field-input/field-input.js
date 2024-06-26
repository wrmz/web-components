import { FormElement } from '../common/FormElement.js';

/**
 * @injectHTML
 */
class FieldInput extends FormElement {

    constructor() {
        super();const el=document.createElement('template');el.innerHTML=`<style>:host{display:grid;grid-gap:3px;width:100%;height:max-content;box-sizing:border-box}::slotted(input),::slotted(textarea){width:100%;font-size:14px;line-height:20px;padding:13px 15px;margin:0;border:1px solid var(--primary-light);border-radius:5px;color:#555;outline:0;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis}:host([invalid]) ::slotted(input),:host([invalid]) ::slotted(textarea){border:2px solid var(--warning-mid);padding:12px 14px}::slotted(input::placeholder),::slotted(textarea::placeholder){color:#767676}::slotted(input:focus),::slotted(textarea:focus){border:2px solid #555;padding:12px 14px}</style><div class="field"><slot name="label"></slot><slot name="input"></slot><info-message role="status"><slot name="info"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></div>`;this.attachShadow({mode:'open'});this.shadowRoot.appendChild(el.content.cloneNode(true));
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

export { FieldInput };
//# sourceMappingURL=field-input.js.map
