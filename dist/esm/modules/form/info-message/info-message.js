import{registerComponents as e}from"../../common/register-components.js";import{ChevronIcon as o}from"../../icon/chevron-icon/chevron-icon.js";class InfoMessage extends HTMLElement{constructor(){super();const t=document.createElement("template");t.innerHTML='<style>:host{display:none;padding:2px;font-size:12px;line-height:16px;color:#555;align-items:center}:host([shown]){display:flex}:host([role=alert][shown]:not([invalid])){display:none}:host([role=alert][invalid][shown]){display:flex}</style><chevron-icon aria-hidden="true"></chevron-icon><slot></slot>',this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(t.content.cloneNode(!0)),e(o),this.shadowRoot.querySelector("slot").addEventListener("slotchange",this.handleSlotChange,!1)}handleSlotChange(e){e.target.assignedElements({flatten:!0}).length>0?this.setAttribute("shown",""):this.removeAttribute("shown")}}window.customElements.get("info-message")||window.customElements.define("info-message",InfoMessage);export{InfoMessage};
//# sourceMappingURL=info-message.js.map