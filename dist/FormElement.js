!function(t){class FormElement extends HTMLElement{static get observedAttributes(){return["invalid","value"]}constructor(){super(),this.input=null,this.radios=null,this.handleFormElementInvalid=this.handleFormElementInvalid.bind(this),this.handleFormElementInput=this.handleFormElementInput.bind(this)}get valid(){return!this.hasAttribute("invalid")&&!this.hasAttribute("aria-invalid")}set valid(t){t?(this.removeAttribute("invalid"),this.removeAttribute("aria-invalid")):(this.setAttribute("invalid",""),this.setAttribute("aria-invalid",""))}registerElementForValidation(t){t.addEventListener("invalid",this.handleFormElementInvalid,!1),t.addEventListener("input",this.handleFormElementInput,!1)}handleFormElementInvalid(t){this.valid=!1,this.toggleInvalidAttribute(t.target)}handleFormElementInput(t){const e=t.target;this.valid=e.checkValidity(),this.toggleInvalidAttribute(e)}toggleInvalidAttribute(t){const e=this.shadowRoot.querySelector('info-message[role="alert"]');e&&(t.validity.valid?e.removeAttribute("invalid"):e.setAttribute("invalid",""))}handleChanged(){const t=this.shadowRoot.querySelector('info-message[role="alert"]');t&&(this.hasAttribute("invalid")?t.setAttribute("invalid",""):t.removeAttribute("invalid"))}attributeChangedCallback(){this.handleChanged()}}t.FormElement=FormElement,Object.defineProperty(t,"__esModule",{value:!0})}({});
