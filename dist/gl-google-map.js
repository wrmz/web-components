!function(e){class GlGoogleMap extends HTMLElement{static get observedAttributes(){return["key"]}constructor(){super(),this.attachShadow({mode:"open"}).innerHTML='<style>:host{position:relative;display:block;width:100%;min-height:300px}:host .map{position:absolute;top:0;left:0;width:100%;height:100%}</style><div class="map"></div>',this.errors=[],this.utilTimeout=void 0,this.key="",this.id=crypto.randomUUID?crypto.randomUUID().split("-").pop():Math.round(9999*Math.random()),this.apiLoadedCBName=`gl_cb_${this.id}`,this.map=void 0,this.elem=this.shadowRoot.querySelector(".map"),this.elem.setAttribute("id",`map_${this.id}`)}handleApiLoaded(){this.map=new google.maps.Map(this.elem,{center:{lat:-34.397,lng:150.644},zoom:8})}loadGoogleMapsApi(){const e=document.createElement("script");e.id=`map_script_${this.id}`,e.type="text/javascript",e.src=`https://maps.googleapis.com/maps/api/js?key=${this.key}&callback=${this.apiLoadedCBName}&v=weekly`,e.defer=!0,e.async=!0,window[this.apiLoadedCBName]=this.handleApiLoaded.bind(this),document.head.appendChild(e)}connectedCallback(){}attributeChangedCallback(e,t,i){"key"===e&&i&&(this.key=i,this.removeAttribute("key"),this.loadGoogleMapsApi())}}window.customElements.get("gl-google-map")||window.customElements.define("gl-google-map",GlGoogleMap),e.GlGoogleMap=GlGoogleMap,Object.defineProperty(e,"__esModule",{value:!0})}({});
