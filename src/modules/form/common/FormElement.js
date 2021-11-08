export class FormElement extends HTMLElement {
    static get observedAttributes() {
        return ['invalid', 'value'];
    }

    constructor() {
        super();
        this.input = null;
        this.radios = null;
        this.handleFormElementInvalid = this.handleFormElementInvalid.bind(this);
        this.handleFormElementInput = this.handleFormElementInput.bind(this);
    }

    get valid() { return !this.hasAttribute('invalid') && !this.hasAttribute('aria-invalid'); }
    set valid(v) {
        if (v) {
            this.removeAttribute('invalid');
            this.removeAttribute('aria-invalid');
        } else {
            this.setAttribute('invalid', '');
            this.setAttribute('aria-invalid', '');
        }
    }

    registerElementForValidation(element) {
        element.addEventListener('invalid', this.handleFormElementInvalid, false);
        element.addEventListener('input', this.handleFormElementInput, false);
    }

    handleFormElementInvalid(e) {
        this.valid = false;
        this.toggleInvalidAttribute(e.target);
    }

    handleFormElementInput(e) {
        const element = e.target;
        this.valid = element.checkValidity();
        this.toggleInvalidAttribute(element);
    }

    toggleInvalidAttribute(element) {
        const errorMsg = this.shadowRoot.querySelector('info-message[role="alert"]');
        if (errorMsg) {
            element.validity.valid ? errorMsg.removeAttribute('invalid') : errorMsg.setAttribute('invalid', '');
        }

    }

    handleChanged() {
        const errorMsg = this.shadowRoot.querySelector('info-message[role="alert"]');
        if (errorMsg) {
            this.hasAttribute('invalid') ? errorMsg.setAttribute('invalid', '') : errorMsg.removeAttribute('invalid');
        }
    }

    attributeChangedCallback() {
        this.handleChanged();
    }
}
