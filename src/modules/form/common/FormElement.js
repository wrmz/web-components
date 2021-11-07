export class FormElement extends HTMLElement {
    static get observedAttributes() {
        return ['invalid', 'value'];
    }

    constructor() {
        super();
        this.input = null;
        this.handleInvalid = this.handleInvalid.bind(this);
        this.handleFormInput = this.handleFormInput.bind(this);
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
        element.addEventListener('invalid', this.handleInvalid, false);
        element.addEventListener('input', this.handleFormInput, false);
    }

    handleInvalid(e) {
        this.valid = false;
        this.toggleInvalidAttribute(e.target);
    }

    handleFormInput(e) {
        const element = e.target;
        this.valid = element.checkValidity();
        this.toggleInvalidAttribute(element);
    }

    toggleInvalidAttribute(element) {
        const errorMsg = this.shadowRoot.querySelector('info[role="alert"]');
        element.validity.valid ? errorMsg.removeAttribute('invalid') : errorMsg.setAttribute('invalid', '');
    }

    handleChanged() {
        const errorMsg = this.shadowRoot.querySelector('info[role="alert"]');
        this.hasAttribute('invalid') ? errorMsg.setAttribute('invalid', '') : errorMsg.removeAttribute('invalid');
    }

    attributeChangedCallback() {
        this.handleChanged();
    }
}
