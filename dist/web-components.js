!function(t){class ChevronIcon extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}).innerHTML='<style>svg{display:flex;align-items:center;justify-content:center;width:var(--width,24px);height:var(--height,24px)}</style><svg width="17" height="9" viewBox="0 0 17 9" xmlns="http://www.w3.org/2000/svg" class="svg-chevron" fill="currentColor"><title>Chevron Icon</title><path d="M16.749.356l-.255-.255a.43.43 0 00-.61 0L8.878 7.113 1.866.1a.43.43 0 00-.61 0l-.255.255a.43.43 0 000 .61l7.568 7.57a.43.43 0 00.61 0l7.566-7.57a.428.428 0 00.004-.61z" fill-rule="nonzero"/></svg>'}static get observedAttributes(){return["title"]}attributeChangedCallback(t,e,s){this.shadowRoot.querySelector("svg title").textContent=s}}function e(...t){!t&&console.error("Please register your components")}window.customElements.get("chevron-icon")||window.customElements.define("chevron-icon",ChevronIcon);class InfoMessage extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}).innerHTML='<style>:host{display:none;padding:2px;font-size:12px;line-height:16px;color:#555;align-items:center}:host([shown]){display:flex}:host([role=alert][shown]:not([invalid])){display:none}:host([role=alert][invalid][shown]){display:flex}</style><chevron-icon aria-hidden="true"></chevron-icon><slot></slot>',e(ChevronIcon),this.shadowRoot.querySelector("slot").addEventListener("slotchange",this.handleSlotChange,!1)}handleSlotChange(t){t.target.assignedElements({flatten:!0}).length>0?this.setAttribute("shown",""):this.removeAttribute("shown")}}window.customElements.get("info-message")||window.customElements.define("info-message",InfoMessage);class FormElement extends HTMLElement{static get observedAttributes(){return["invalid","value"]}constructor(){super(),this.input=null,this.radios=null,this.handleFormElementInvalid=this.handleFormElementInvalid.bind(this),this.handleFormElementInput=this.handleFormElementInput.bind(this)}get valid(){return!this.hasAttribute("invalid")&&!this.hasAttribute("aria-invalid")}set valid(t){t?(this.removeAttribute("invalid"),this.removeAttribute("aria-invalid")):(this.setAttribute("invalid",""),this.setAttribute("aria-invalid",""))}registerElementForValidation(t){t.addEventListener("invalid",this.handleFormElementInvalid,!1),t.addEventListener("input",this.handleFormElementInput,!1)}handleFormElementInvalid(t){this.valid=!1,this.toggleInvalidAttribute(t.target)}handleFormElementInput(t){const e=t.target;this.valid=e.checkValidity(),this.toggleInvalidAttribute(e)}toggleInvalidAttribute(t){const e=this.shadowRoot.querySelector('info-message[role="alert"]');e&&(t.validity.valid?e.removeAttribute("invalid"):e.setAttribute("invalid",""))}handleChanged(){const t=this.shadowRoot.querySelector('info-message[role="alert"]');t&&(this.hasAttribute("invalid")?t.setAttribute("invalid",""):t.removeAttribute("invalid"))}attributeChangedCallback(){this.handleChanged()}}class FieldInput extends FormElement{constructor(){super(),this.attachShadow({mode:"open"}).innerHTML='<style>:host{display:grid;grid-gap:3px;width:100%;height:max-content;box-sizing:border-box}::slotted(input),::slotted(textarea){width:100%;font-size:14px;line-height:20px;padding:13px 15px;margin:0;border:1px solid var(--primary-light);border-radius:5px;color:#555;outline:0;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis}:host([invalid]) ::slotted(input),:host([invalid]) ::slotted(textarea){border:2px solid var(--warning-mid);padding:12px 14px}::slotted(input::placeholder),::slotted(textarea::placeholder){color:#767676}::slotted(input:focus),::slotted(textarea:focus){border:2px solid #555;padding:12px 14px}</style><div class="field"><slot name="label"></slot><slot name="input"></slot><info-message role="status"><slot name="info"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></div>',this.input=null,this.handleInput=this.handleInput.bind(this),this.handleKeyup=this.handleKeyup.bind(this),this.handleSlotChange=this.handleSlotChange.bind(this),this.shadowInput=this.shadowRoot.querySelector('slot[name="input"]'),this.shadowInput.addEventListener("slotchange",this.handleSlotChange,!1)}get value(){return this.getAttribute("value")||""}set value(t){this.setAttribute("value",t)}handleSlotChange(t){this.input=[...t.target.assignedElements()].find((t=>"INPUT"===t.tagName)),this.input&&(this.registerElementForValidation(this.input),this.input.value=this._value||this.getAttribute("value")||"",this.input.addEventListener("input",this.handleInput,!1),this.input.addEventListener("keyup",this.handleKeyup,!1))}handleInput(t){this.value=t.target.value}handleKeyup(){}disconnectedCallback(){this.input.removeEventListener("input",this.handleInput),this.input.removeEventListener("keyup",this.handleKeyup),this.shadowInput.removeEventListener("slotchange",this.handleSlotChange)}}window.customElements.get("field-input")||window.customElements.define("field-input",FieldInput);class RadioGroup extends FormElement{static sanitize(t){return(t+"").trim().replace(/[^0-9.]*/g,"")}constructor(){super(),this.attachShadow({mode:"open"}).innerHTML='<style>:host{display:grid;appearance:none}:host fieldset{position:relative;display:grid;margin:0;padding:0;border:0}:host .radio-group__options{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:20px}</style><fieldset class="radio-group"><legend class="radio-group__legend"><slot name="label"></slot></legend><div class="radio-group__options"><slot></slot></div><info-message role="status"><slot name="info-message"></slot></info-message><info-message role="alert"><slot name="error"></slot></info-message></fieldset>',e(InfoMessage),this.radios=null,this.handleSlotChange=this.handleSlotChange.bind(this),this.shadowRadios=this.shadowRoot.querySelector(".radio-group__options slot"),this.shadowRadios.addEventListener("slotchange",this.handleSlotChange,!1)}get value(){return this.getAttribute("value")||""}set value(t){this.setAttribute("value",t)}get numeric(){const t=RadioGroup.sanitize(this.value);return isNaN(t)?0:t}get selectedRadio(){return this.radios&&this.value?this.radios.find((t=>t.checked)):null}set selectedRadio(t){if(t&&this.radios){const e=this.radios.find((e=>e.value===t));e&&(e.checked=!0)}}handleSlotChange(t){this.radios=[...t.target.assignedElements()].flatMap((t=>[t,...t.children])).filter((t=>"INPUT"===t.tagName)),this.value&&(this.selectedRadio=this.value),this.addEventListener("input",this.handleInput,!1)}handleInput(t){this.value=t.target.value}attributeChangedCallback(t,e,s){this.handleChanged(),"value"===t&&(this._value=s)}detachedCallback(){this.removeEventListener("input",this.handleInput)}}window.customElements.get("radio-group")||window.customElements.define("radio-group",RadioGroup);class ChartDonut extends HTMLElement{static get observedAttributes(){return["colors","values","labels"]}static degreesToRadians(t){return t*(Math.PI/180)}constructor(){super(),this.attachShadow({mode:"open"}).innerHTML='<style>.donut circle{cursor:pointer;pointer-events:stroke;transition:filter .2s linear,transform .2s linear}.donut circle:focus{outline:0}.donut circle:focus,.donut circle:hover{filter:brightness(80%)}</style><div class="chart chart--donut"><svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events" width="160" height="160" viewBox="0 0 160 160" class="donut"></svg></div>',this.gap=2,this.cx=80,this.cy=80,this.radius=60,this.angleOffset=-90,this.chartData=[],this.segmentElems=[],this.isLoaded=!1,this.svg=this.shadowRoot.querySelector("svg"),this.generateSegment=this.generateSegment.bind(this),this.updateSegment=this.updateSegment.bind(this)}get currencyFormat(){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:0}).format}set colors(t){this.setAttribute("colors",JSON.stringify(t))}get colors(){const t=(this.getAttribute("colors")||"").replace(/'/g,'"');return t?JSON.parse(t):["red","green","blue"]}set labels(t){this.setAttribute("labels",JSON.stringify(t))}get labels(){const t=(this.getAttribute("labels")||"").replace(/'/g,'"');return t?JSON.parse(t):[]}set values(t){this.setAttribute("values",JSON.stringify(t))}get values(){const t=(this.getAttribute("values")||"").replace(/'/g,'"');return t?JSON.parse(t):[]}get total(){return this.values.length?this.values.reduce(((t,e)=>t+e)):0}get circumference(){return 2*Math.PI*this.radius}get adjustedCircumference(){return this.circumference-this.gap}generateSegments(){this.values.forEach(this.generateSegment)}generateSegment(t,e){const s=document.createElementNS("http://www.w3.org/2000/svg","circle"),i=document.createElementNS("http://www.w3.org/2000/svg","title"),a={degrees:this.angleOffset};this.angleOffset+=360*this.dataPercentage(this.values[e]),this.chartData.push(a),s.setAttribute("tabindex","0"),s.setAttribute("cx",this.cx),s.setAttribute("cy",this.cy),s.setAttribute("r",this.radius),s.setAttribute("fill","transparent"),s.setAttribute("stroke",this.colors[e]),s.setAttribute("stroke-width",30),s.setAttribute("stroke-dasharray",this.adjustedCircumference),s.setAttribute("stroke-dashoffset",this.calculateStrokeDashOffset(this.values[e])),s.setAttribute("transform",this.calculateTransform(e)),s.appendChild(i),i.textContent=`${this.labels[e]}: ${this.currencyFormat(t)}`,this.segmentElems.push(s),this.svg.appendChild(s)}updateSegments(){this.angleOffset=-90,this.chartData=[],this.values.forEach(this.updateSegment)}updateSegment(t,e){const s=this.segmentElems[e],i=s.querySelector("title"),a={degrees:this.angleOffset};this.angleOffset+=360*this.dataPercentage(this.values[e]),this.chartData.push(a),i.textContent=`${this.labels[e]}: ${this.currencyFormat(t)}`,s.setAttribute("stroke-dasharray",this.adjustedCircumference),s.setAttribute("stroke-dashoffset",this.calculateStrokeDashOffset(this.values[e])),s.setAttribute("transform",this.calculateTransform(e))}calculateStrokeDashOffset(t){const e=this.dataPercentage(t)*this.circumference;return this.circumference-e}calculateTransform(t){return`rotate(${this.chartData[t].degrees}, ${this.cx}, ${this.cy})`}dataPercentage(t){return this.total&&t?t/this.total:0}destroySegments(){for(;this.svg.firstChild;)this.svg.removeChild(this.svg.firstChild),this.segmentElems.shift(),this.chartData.shift();this.angleOffset=-90}connectedCallback(){this.generateSegments(),this.isLoaded=!0}attributeChangedCallback(){this.isLoaded&&this.colors&&this.values&&this.total&&this.updateSegments()}}window.customElements.get("chart-donut")||window.customElements.define("chart-donut",ChartDonut);class GlGoogleMap extends HTMLElement{static get observedAttributes(){return["key"]}constructor(){super(),this.attachShadow({mode:"open"}).innerHTML='<style>:host{position:relative;display:block;width:100%;min-height:300px}:host .map{position:absolute;top:0;left:0;width:100%;height:100%}</style><div class="map"></div>',this.errors=[],this.utilTimeout=void 0,this.key="",this.id=crypto.randomUUID?crypto.randomUUID().split("-").pop():Math.round(9999*Math.random()),this.apiLoadedCBName=`gl_cb_${this.id}`,this.map=void 0,this.elem=this.shadowRoot.querySelector(".map"),this.elem.setAttribute("id",`map_${this.id}`)}handleApiLoaded(){console.log("map loaded"),this.map=new google.maps.Map(this.elem,{center:{lat:-34.397,lng:150.644},zoom:8})}loadGoogleMapsApi(){const t=document.createElement("script");t.id=`map_script_${this.id}`,t.type="text/javascript",t.src=`https://maps.googleapis.com/maps/api/js?key=${this.key}&callback=${this.apiLoadedCBName}&v=weekly`,t.defer=!0,t.async=!0,window[this.apiLoadedCBName]=this.handleApiLoaded.bind(this),document.head.appendChild(t)}connectedCallback(){}attributeChangedCallback(t,e,s){"key"===t&&s&&(this.key=s,this.removeAttribute("key"),this.loadGoogleMapsApi())}}window.customElements.get("gl-google-map")||window.customElements.define("gl-google-map",GlGoogleMap);class MortgageCalcInput extends FieldInput{static sanitize(t){return(t+"").trim().replace(/[^0-9.]*/g,"")}get type(){return this.getAttribute("type")||"currency"}get name(){return this.getAttribute("name")||""}get stylizedFormat(){return new Intl.NumberFormat("en-US",{minimumFractionDigits:"percentage"===this.type?1:0,maximumFractionDigits:3}).format}get currencyFormat(){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:0}).format}get numeric(){const t=MortgageCalcInput.sanitize(this.value),e=!t||isNaN(t)?0:t;return Number.isInteger(e)?parseInt(e,10):parseFloat(e)}get stylized(){const t=this.stylizedFormat(this.numeric);return"percentage"===this.type?t+"%":t}get currency(){const t=this.numeric;return this.currencyFormat(t)}handleKeyup(t){const e=t.target.value;this.value="."===e?e.replace(".","0."):e,"currency"===this.type?t.target.value=this.currency:"percentage"===this.type&&(t.target.value=this.stylized)}attributeChangedCallback(t){this.handleChanged(),"value"===t&&("currency"===this.type?this._value=this.currency:"percentage"===this.type&&(this._value=this.stylized))}}window.customElements.get("mortgage-calc-input")||window.customElements.define("mortgage-calc-input",MortgageCalcInput);class MortgageCalc extends HTMLElement{static get observedAttributes(){return["price","downpayment","interest","taxes","term","pmi","hoa","monthly-payment","colors"]}constructor(){super(),this.attachShadow({mode:"open"}).innerHTML='<style>:host{display:grid;grid-template-columns:50% 50%;gap:50px;--box-shadow-color:var(--primary-light);--box-shadow-width:1px;--box-shadow-color2:transparent;--box-shadow-width2:1px}:host .mortgage-calc__form{display:grid;grid-template-columns:50% 50%;gap:20px}radio-group{grid-column:1/span 2}:host .mortgage-calc__radio{position:relative;display:flex}:host .mortgage-calc__radio input{cursor:pointer;position:absolute;top:0;left:0;min-width:15px;height:15px;border-radius:50%;margin:22px 15px;padding:0;background-clip:content-box;appearance:none;outline:0;box-shadow:inset 0 0 0 var(--box-shadow-width) var(--box-shadow-color),inset 0 0 0 var(--box-shadow-width2) var(--box-shadow-color2)}:host .mortgage-calc__radio input:checked{background-color:var(--primary-mid);--box-shadow-color:var(--primary-mid);--box-shadow-width:2px;--box-shadow-width2:4px;--box-shadow-color2:white}:host .mortgage-calc__radio label{cursor:pointer;display:block;width:100%;padding:15px 20px 15px 40px;border:1px solid var(--primary-light);border-radius:5px}</style><div class="mortgage-calc__form"><mortgage-calc-input name="price" type="currency"><label for="price" slot="label">Price</label> <input type="text" id="price" slot="input" placeholder="123,456" pattern="[0-9$,]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="downpayment" type="currency"><label for="downpayment" slot="label">Downpayment</label> <input type="text" id="downpayment" slot="input" placeholder="123,456" pattern="[0-9$,]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="interest" type="percentage"><label for="interest" slot="label">Interest Rate</label> <input type="text" id="interest" slot="input" placeholder="3.5" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="taxes" type="percentage"><label for="taxes" slot="label">Est. Monthly Property Taxes</label> <input type="text" id="taxes" slot="input" placeholder="1.4" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><mortgage-calc-input name="hoa" type="currency"><label for="hoa" slot="label">Monthly HOA Fees</label> <input type="text" id="hoa" slot="input" placeholder="200" pattern="[0-9.]+" maxlength="9"></mortgage-calc-input><radio-group name="term"><span slot="label">Choose a Term</span><div class="mortgage-calc__radio"><input id="term-15" type="radio" value="15" name="term"> <label for="term-15">15-Year Fixed</label></div><div class="mortgage-calc__radio"><input id="term-30" type="radio" value="30" name="term"> <label for="term-30">30-Year Fixed</label></div></radio-group></div><div class="mortgage-calc__results"><div class="mortgage-calc__chart">\x3c!-- Chart is injected here --\x3e</div><div class="mortgage-calc__data"><div class="mortgage-calc__principal">Principal + Interest <span id="outputPrincipal"></span></div><div class="mortgage-calc__taxes">Taxes <span id="outputTaxes"></span></div><div class="mortgage-calc__taxes">Fees &amp; Dues: <span id="outputFees"></span></div><div class="mortgage-calc__total">Amount Per Month: <span id="outputPerMonth"></span></div></div></div>',e(MortgageCalcInput,RadioGroup,ChartDonut),this.chartElement=void 0,this.elements={price:this.shadowRoot.querySelector('mortgage-calc-input[name="price"]'),downpayment:this.shadowRoot.querySelector('mortgage-calc-input[name="downpayment"]'),interest:this.shadowRoot.querySelector('mortgage-calc-input[name="interest"]'),taxes:this.shadowRoot.querySelector('mortgage-calc-input[name="taxes"]'),term:this.shadowRoot.querySelector('radio-group[name="term"]'),hoa:this.shadowRoot.querySelector('mortgage-calc-input[name="hoa"]')},this.output={principal:this.shadowRoot.querySelector("#outputPrincipal"),taxes:this.shadowRoot.querySelector("#outputTaxes"),fees:this.shadowRoot.querySelector("#outputFees"),perMonth:this.shadowRoot.querySelector("#outputPerMonth")},this.addEventListener("input",this.handleInput,!1)}get colors(){let t=this.getAttribute("colors")||"";return t=t.replace(/'/g,'"'),t?JSON.parse(t):[]}get currencyFormat(){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:0}).format}get price(){return this.elements?this.elements.price.numeric:0}set price(t){this.elements.price.value=t}get downpayment(){return this.elements?this.elements.downpayment.numeric:0}set downpayment(t){this.elements.downpayment.value=t}get interest(){return this.elements?this.elements.interest.numeric:0}set interest(t){this.elements.interest.value=t}get taxes(){return this.elements?this.elements.taxes.numeric:0}set taxes(t){this.elements.taxes.value=t}get hoa(){return this.elements?this.elements.hoa.numeric:0}set hoa(t){this.elements.hoa.value=t}get term(){return this.elements?this.elements.term.numeric:0}set term(t){this.elements.term.value=t}get pmi(){return this.getAttribute("pmi")||""}get insurance(){return this.getAttribute("insurance")||""}get mortgagePrincipal(){return this.price-this.downpayment}get monthlyInterestRate(){return this.interest/100/12}get numberOfPayments(){return 12*this.term}get monthlyPrincipalAndInterest(){return this.mortgagePrincipal&&this.monthlyInterestRate?this.mortgagePrincipal/((1-Math.pow(1+this.monthlyInterestRate,-this.numberOfPayments))/this.monthlyInterestRate):0}get monthlyMortgagePrincipal(){return this.monthlyPrincipalAndInterest-this.monthlyInterestCost}get monthlyInterestCost(){return this.mortgagePrincipal*this.monthlyInterestRate}get pmiCost(){return this.downpayment/this.price<.2?this.pmi/100*this.mortgagePrincipal/12:0}get taxesCost(){return this.taxes/100*this.price/12}get insuranceCost(){return this.insurance/100*this.price/12}get feesCost(){return this.hoa}get monthlyPayment(){return this.monthlyPrincipalAndInterest+this.taxesCost+this.insuranceCost+this.pmiCost+this.feesCost}generateChart(){const t=this.shadowRoot.querySelector(".mortgage-calc__chart");this.chartElement=document.createElement("chart-donut"),this.chartElement.colors=this.colors,this.chartElement.labels=["Principal + Interest","Taxes","Fees"],this.chartElement.values=[this.monthlyPrincipalAndInterest,this.taxesCost,this.feesCost],t.append(this.chartElement)}handleInput(){this.output.principal.textContent=this.currencyFormat(this.monthlyPrincipalAndInterest),this.output.taxes.textContent=this.currencyFormat(this.taxesCost),this.output.fees.textContent=this.currencyFormat(this.feesCost),this.output.perMonth.textContent=this.currencyFormat(this.monthlyPayment),this.chartElement&&(this.chartElement.values=[this.monthlyPrincipalAndInterest,this.taxesCost,this.feesCost])}connectedCallback(){this.generateChart()}attributeChangedCallback(t,e,s){"price"===t?this.price=s:"downpayment"===t?this.downpayment=s:"interest"===t?this.interest=s:"taxes"===t?this.taxes=s:"term"===t?this.term=s:"hoa"===t&&(this.hoa=s),this.output.principal.textContent=this.currencyFormat(this.monthlyMortgagePrincipal+this.monthlyInterestCost),this.output.taxes.textContent=this.currencyFormat(this.taxesCost),this.output.fees.textContent=this.currencyFormat(this.feesCost),this.output.perMonth.textContent=this.currencyFormat(this.monthlyPayment),this.chartElement&&(this.chartElement.values=[this.monthlyPrincipalAndInterest,this.taxesCost,this.feesCost])}}window.customElements.get("mortgage-calc")||window.customElements.define("mortgage-calc",MortgageCalc),t.ChartDonut=ChartDonut,t.ChevronIcon=ChevronIcon,t.FieldInput=FieldInput,t.GlGoogleMap=GlGoogleMap,t.InfoMessage=InfoMessage,t.MortgageCalc=MortgageCalc,t.MortgageCalcInput=MortgageCalcInput,t.RadioGroup=RadioGroup,t.registerComponents=e,Object.defineProperty(t,"__esModule",{value:!0})}({});
//# sourceMappingURL=web-components.js.map
