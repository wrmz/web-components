export class FieldRadio extends HTMLElement {
    constructor() {
        super();
    }
};

if (!window.customElements.get('field-radio')) {
    window.customElements.define('field-radio', FieldRadio);
}
