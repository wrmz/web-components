import{registerComponents as e}from"../../common/register-components.js";import{FormElement as t}from"../common/FormElement.js";import{InfoMessage as s}from"../info-message/info-message.js";class RadioGroup extends t{static sanitize(e){return(e+"").trim().replace(/[^0-9.]*/g,"")}constructor(){super();const t=document.createElement("template");t.innerHTML='<style>:host{display:grid;appearance:none}:host fieldset{position:relative;display:grid;margin:0;padding:0;border:0}:host .radio-group__options{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:20px}</style><fieldset class="radio-group"><legend class="radio-group__legend"><slot name="label"></slot></legend><div class="radio-group__options"><slot></slot></div><info-message role="status"><slot name="info-message"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></fieldset>',this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(t.content.cloneNode(!0)),e(s),this.radios=null,this.handleSlotChange=this.handleSlotChange.bind(this),this.shadowRadios=this.shadowRoot.querySelector(".radio-group__options slot"),this.shadowRadios.addEventListener("slotchange",this.handleSlotChange,!1)}get value(){return this.getAttribute("value")||""}set value(e){this.setAttribute("value",e)}get numeric(){const e=RadioGroup.sanitize(this.value);return isNaN(e)?0:e}get selectedRadio(){return this.radios&&this.value?this.radios.find((e=>e.checked)):null}set selectedRadio(e){if(e&&this.radios){const t=this.radios.find((t=>t.value===e));t&&(t.checked=!0)}}handleSlotChange(e){this.radios=[...e.target.assignedElements()].flatMap((e=>[e,...e.children])).filter((e=>"INPUT"===e.tagName)),this.value&&(this.selectedRadio=this.value),this.addEventListener("input",this.handleInput,!1)}handleInput(e){this.value=e.target.value}attributeChangedCallback(e,t,s){this.handleChanged(),"value"===e&&(this._value=s)}detachedCallback(){this.removeEventListener("input",this.handleInput)}}window.customElements.get("radio-group")||window.customElements.define("radio-group",RadioGroup);export{RadioGroup};
//# sourceMappingURL=radio-group.js.map
