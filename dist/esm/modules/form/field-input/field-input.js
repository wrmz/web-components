import{FormElement as t}from"../common/FormElement.js";class FieldInput extends t{constructor(){super(),this.attachShadow({mode:"open"}).innerHTML='<style>:host{display:grid;grid-gap:3px;width:100%;height:max-content;box-sizing:border-box}::slotted(input),::slotted(textarea){width:100%;font-size:14px;line-height:20px;padding:13px 15px;margin:0;border:1px solid var(--primary-light);border-radius:5px;color:#555;outline:0;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis}:host([invalid]) ::slotted(input),:host([invalid]) ::slotted(textarea){border:2px solid var(--warning-mid);padding:12px 14px}::slotted(input::placeholder),::slotted(textarea::placeholder){color:#767676}::slotted(input:focus),::slotted(textarea:focus){border:2px solid #555;padding:12px 14px}</style><div class="field"><slot name="label"></slot><slot name="input"></slot><info-message role="status"><slot name="info"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></div>',this.input=null,this.handleInput=this.handleInput.bind(this),this.handleKeyup=this.handleKeyup.bind(this),this.handleSlotChange=this.handleSlotChange.bind(this),this.shadowInput=this.shadowRoot.querySelector('slot[name="input"]'),this.shadowInput.addEventListener("slotchange",this.handleSlotChange,!1)}get value(){return this.getAttribute("value")||""}set value(t){this.setAttribute("value",t)}handleSlotChange(t){this.input=[...t.target.assignedElements()].find((t=>"INPUT"===t.tagName)),this.input&&(this.registerElementForValidation(this.input),this.input.value=this._value||this.getAttribute("value")||"",this.input.addEventListener("input",this.handleInput,!1),this.input.addEventListener("keyup",this.handleKeyup,!1))}handleInput(t){this.value=t.target.value}handleKeyup(){}disconnectedCallback(){this.input.removeEventListener("input",this.handleInput),this.input.removeEventListener("keyup",this.handleKeyup),this.shadowInput.removeEventListener("slotchange",this.handleSlotChange)}}window.customElements.get("field-input")||window.customElements.define("field-input",FieldInput);export{FieldInput};
//# sourceMappingURL=field-input.js.map
