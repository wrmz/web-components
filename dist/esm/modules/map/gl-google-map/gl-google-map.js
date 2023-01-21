import{registerComponents as e}from"../../common/register-components.js";import{GlGoogleMarker as t}from"../gl-google-marker/gl-google-marker.js";class GlGoogleMap extends HTMLElement{static get observedAttributes(){return["key","latitude","longitude"]}constructor(){super();const a=document.createElement("template");a.innerHTML='<style>:host{position:relative;display:block;width:100%;min-height:300px}:host .map{position:absolute;top:0;left:0;width:100%;height:100%}</style><div class="map"></div>',this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(a.content.cloneNode(!0)),e(t),this.key="",this._id=crypto.randomUUID?crypto.randomUUID().split("-").pop():Math.round(9999*Math.random()),this._markerElems=this.querySelectorAll("gl-google-marker"),this._markers=[],this.apiLoadedCBName=`gl_cb_${this._id}`,this.map=void 0,this.elem=this.shadowRoot.querySelector(".map"),this.elem.setAttribute("id",`map_${this._id}`),this.generateMarker=this.generateMarker.bind(this)}get latitude(){const e=parseFloat(this.hasAttribute("latitude")?this.getAttribute("latitude"):"0");return isNaN(e)?0:e}get longitude(){const e=parseFloat(this.hasAttribute("longitude")?this.getAttribute("longitude"):"0");return isNaN(e)?0:e}get markerElems(){return[...this._markerElems]}get markers(){return this._markers}set markers(e){this.map&&google&&google.maps?this._markers=e.map(this.generateMarker):this._markers=[]}handleApiLoaded(){this.map=new google.maps.Map(this.elem,{center:{lat:this.latitude,lng:this.longitude},zoom:8}),this.markers=this.markerElems}generateMarker(e){const t=new google.maps.Marker({map:this.map,position:{lat:e.latitude,lng:e.longitude},draggable:!0});return t.addListener("dragend",(e=>{const a=new Event("dragend",{detail:{map:this.map,marker:t,position:{latitude:e.latLng.lat(),longitude:e.latLng.lng()}}});this.dispatchEvent(a)})),t}loadGoogleMapsApi(){console.log("loading api");const e=document.createElement("script");e.id=`map_script_${this._id}`,e.type="text/javascript",e.src=`https://maps.googleapis.com/maps/api/js?key=${this.key}&callback=${this.apiLoadedCBName}&v=weekly`,e.defer=!0,e.async=!0,window[this.apiLoadedCBName]=this.handleApiLoaded.bind(this),document.head.appendChild(e)}connectedCallback(){console.log("connected")}attributeChangedCallback(e,t,a){"key"===e&&a&&(this.key=a,this.removeAttribute("key"),this.loadGoogleMapsApi())}}window.customElements.get("gl-google-map")||window.customElements.define("gl-google-map",GlGoogleMap);export{GlGoogleMap};
//# sourceMappingURL=gl-google-map.js.map
