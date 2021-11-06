export class FormElement extends HTMLElement {
    constructor() {
        super();
        this.handleInvalid = this.handleInvalid.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    static get observedAttributes() {
        return ['invalid'];
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
        element.addEventListener('input', this.handleInput, false);
    }

    handleInvalid(e) {
        this.valid = false;
        this.toggleInvalidAttribute(e.target);
    }

    handleInput(e) {
        const element = e.target;
        this.valid = element.checkValidity();
        this.toggleInvalidAttribute(element);
    }

    toggleInvalidAttribute(element) {
        console.log('toggling invalid');
        const errorMsg = this.shadowRoot.querySelector('info[role="alert"]');
        element.validity.valid ? errorMsg.removeAttribute('invalid') : errorMsg.setAttribute('invalid', '');
    }

    attributeChangedCallback() {
        const errorMsg = this.shadowRoot.querySelector('info[role="alert"]');
        this.hasAttribute('invalid') ? errorMsg.setAttribute('invalid', '') : errorMsg.removeAttribute('invalid');
    }
}
