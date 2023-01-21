!function(e){function t(...e){!e&&console.error("Please register your components")}class FormElement extends HTMLElement{static get observedAttributes(){return["invalid","value"]}constructor(){super(),this.input=null,this.radios=null,this.handleFormElementInvalid=this.handleFormElementInvalid.bind(this),this.handleFormElementInput=this.handleFormElementInput.bind(this)}get valid(){return!this.hasAttribute("invalid")&&!this.hasAttribute("aria-invalid")}set valid(e){e?(this.removeAttribute("invalid"),this.removeAttribute("aria-invalid")):(this.setAttribute("invalid",""),this.setAttribute("aria-invalid",""))}registerElementForValidation(e){e.addEventListener("invalid",this.handleFormElementInvalid,!1),e.addEventListener("input",this.handleFormElementInput,!1)}handleFormElementInvalid(e){this.valid=!1,this.toggleInvalidAttribute(e.target)}handleFormElementInput(e){const t=e.target;this.valid=t.checkValidity(),this.toggleInvalidAttribute(t)}toggleInvalidAttribute(e){const t=this.shadowRoot.querySelector('info-message[role="alert"]');t&&(e.validity.valid?t.removeAttribute("invalid"):t.setAttribute("invalid",""))}handleChanged(){const e=this.shadowRoot.querySelector('info-message[role="alert"]');e&&(this.hasAttribute("invalid")?e.setAttribute("invalid",""):e.removeAttribute("invalid"))}attributeChangedCallback(){this.handleChanged()}}class ChevronIcon extends HTMLElement{constructor(){super();const e=document.createElement("template");e.innerHTML='<style>svg{display:flex;align-items:center;justify-content:center;width:var(--width,24px);height:var(--height,24px)}</style><svg width="17" height="9" viewBox="0 0 17 9" xmlns="http://www.w3.org/2000/svg" class="svg-chevron" fill="currentColor"><title>Chevron Icon</title><path d="M16.749.356l-.255-.255a.43.43 0 00-.61 0L8.878 7.113 1.866.1a.43.43 0 00-.61 0l-.255.255a.43.43 0 000 .61l7.568 7.57a.43.43 0 00.61 0l7.566-7.57a.428.428 0 00.004-.61z" fill-rule="nonzero"/></svg>',this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(e.content.cloneNode(!0))}static get observedAttributes(){return["title"]}attributeChangedCallback(e,t,i){this.shadowRoot.querySelector("svg title").textContent=i}}window.customElements.get("chevron-icon")||window.customElements.define("chevron-icon",ChevronIcon);class InfoMessage extends HTMLElement{constructor(){super();const e=document.createElement("template");e.innerHTML='<style>:host{display:none;padding:2px;font-size:12px;line-height:16px;color:#555;align-items:center}:host([shown]){display:flex}:host([role=alert][shown]:not([invalid])){display:none}:host([role=alert][invalid][shown]){display:flex}</style><chevron-icon aria-hidden="true"></chevron-icon><slot></slot>',this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(e.content.cloneNode(!0)),t(ChevronIcon),this.shadowRoot.querySelector("slot").addEventListener("slotchange",this.handleSlotChange,!1)}handleSlotChange(e){e.target.assignedElements({flatten:!0}).length>0?this.setAttribute("shown",""):this.removeAttribute("shown")}}window.customElements.get("info-message")||window.customElements.define("info-message",InfoMessage);class RadioGroup extends FormElement{static sanitize(e){return(e+"").trim().replace(/[^0-9.]*/g,"")}constructor(){super();const e=document.createElement("template");e.innerHTML='<style>:host{display:grid;appearance:none}:host fieldset{position:relative;display:grid;margin:0;padding:0;border:0}:host .radio-group__options{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:20px}</style><fieldset class="radio-group"><legend class="radio-group__legend"><slot name="label"></slot></legend><div class="radio-group__options"><slot></slot></div><info-message role="status"><slot name="info-message"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></fieldset>',this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(e.content.cloneNode(!0)),t(InfoMessage),this.radios=null,this.handleSlotChange=this.handleSlotChange.bind(this),this.shadowRadios=this.shadowRoot.querySelector(".radio-group__options slot"),this.shadowRadios.addEventListener("slotchange",this.handleSlotChange,!1)}get value(){return this.getAttribute("value")||""}set value(e){this.setAttribute("value",e)}get numeric(){const e=RadioGroup.sanitize(this.value);return isNaN(e)?0:e}get selectedRadio(){return this.radios&&this.value?this.radios.find((e=>e.checked)):null}set selectedRadio(e){if(e&&this.radios){const t=this.radios.find((t=>t.value===e));t&&(t.checked=!0)}}handleSlotChange(e){this.radios=[...e.target.assignedElements()].flatMap((e=>[e,...e.children])).filter((e=>"INPUT"===e.tagName)),this.value&&(this.selectedRadio=this.value),this.addEventListener("input",this.handleInput,!1)}handleInput(e){this.value=e.target.value}attributeChangedCallback(e,t,i){this.handleChanged(),"value"===e&&(this._value=i)}detachedCallback(){this.removeEventListener("input",this.handleInput)}}window.customElements.get("radio-group")||window.customElements.define("radio-group",RadioGroup),e.RadioGroup=RadioGroup,Object.defineProperty(e,"__esModule",{value:!0})}({});
