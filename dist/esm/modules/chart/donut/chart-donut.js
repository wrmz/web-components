class ChartDonut extends HTMLElement{static get observedAttributes(){return["colors","values","labels"]}static degreesToRadians(t){return t*(Math.PI/180)}constructor(){super(),this.attachShadow({mode:"open"});const t=document.createElement("template");t.innerHTML='<style>.donut circle{cursor:pointer;pointer-events:stroke;transition:filter .2s linear,transform .2s linear}.donut circle:focus{outline:0}.donut circle:focus,.donut circle:hover{filter:brightness(80%)}</style><div class="chart chart--donut"><svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events" width="160" height="160" viewBox="0 0 160 160" class="donut"></svg></div>',this.shadowRoot.appendChild(t.content.cloneNode(!0)),this.gap=2,this.cx=80,this.cy=80,this.radius=60,this.angleOffset=-90,this.chartData=[],this.segmentElems=[],this.isLoaded=!1,this.svg=this.shadowRoot.querySelector("svg"),this.generateSegment=this.generateSegment.bind(this),this.updateSegment=this.updateSegment.bind(this)}get currencyFormat(){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:0}).format}set colors(t){this.setAttribute("colors",JSON.stringify(t))}get colors(){const t=(this.getAttribute("colors")||"").replace(/'/g,'"');return t?JSON.parse(t):["red","green","blue"]}set labels(t){this.setAttribute("labels",JSON.stringify(t))}get labels(){const t=(this.getAttribute("labels")||"").replace(/'/g,'"');return t?JSON.parse(t):[]}set values(t){this.setAttribute("values",JSON.stringify(t))}get values(){const t=(this.getAttribute("values")||"").replace(/'/g,'"');return t?JSON.parse(t):[]}get total(){return this.values.length?this.values.reduce(((t,e)=>t+e)):0}get circumference(){return 2*Math.PI*this.radius}get adjustedCircumference(){return this.circumference-this.gap}generateSegments(){this.values.forEach(this.generateSegment)}generateSegment(t,e){const s=document.createElementNS("http://www.w3.org/2000/svg","circle"),r=document.createElementNS("http://www.w3.org/2000/svg","title"),i={degrees:this.angleOffset};this.angleOffset+=360*this.dataPercentage(this.values[e]),this.chartData.push(i),s.setAttribute("tabindex","0"),s.setAttribute("cx",this.cx),s.setAttribute("cy",this.cy),s.setAttribute("r",this.radius),s.setAttribute("fill","transparent"),s.setAttribute("stroke",this.colors[e]),s.setAttribute("stroke-width",30),s.setAttribute("stroke-dasharray",this.adjustedCircumference),s.setAttribute("stroke-dashoffset",this.calculateStrokeDashOffset(this.values[e])),s.setAttribute("transform",this.calculateTransform(e)),s.appendChild(r),r.textContent=`${this.labels[e]}: ${this.currencyFormat(t)}`,this.segmentElems.push(s),this.svg.appendChild(s)}updateSegments(){this.angleOffset=-90,this.chartData=[],this.values.forEach(this.updateSegment)}updateSegment(t,e){const s=this.segmentElems[e],r=s.querySelector("title"),i={degrees:this.angleOffset};this.angleOffset+=360*this.dataPercentage(this.values[e]),this.chartData.push(i),r.textContent=`${this.labels[e]}: ${this.currencyFormat(t)}`,s.setAttribute("stroke-dasharray",this.adjustedCircumference),s.setAttribute("stroke-dashoffset",this.calculateStrokeDashOffset(this.values[e])),s.setAttribute("transform",this.calculateTransform(e))}calculateStrokeDashOffset(t){const e=this.dataPercentage(t)*this.circumference;return this.circumference-e}calculateTransform(t){return`rotate(${this.chartData[t].degrees}, ${this.cx}, ${this.cy})`}dataPercentage(t){return this.total&&t?t/this.total:0}destroySegments(){for(;this.svg.firstChild;)this.svg.removeChild(this.svg.firstChild),this.segmentElems.shift(),this.chartData.shift();this.angleOffset=-90}connectedCallback(){this.generateSegments(),this.isLoaded=!0}attributeChangedCallback(){this.isLoaded&&this.colors&&this.values&&this.total&&this.updateSegments()}}window.customElements.get("chart-donut")||window.customElements.define("chart-donut",ChartDonut);export{ChartDonut};
//# sourceMappingURL=chart-donut.js.map
