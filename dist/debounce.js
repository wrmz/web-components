var e;(e={}).debounce=function(e,t){let n;return function(){const u=()=>{n=null,e.apply(this,arguments)};clearTimeout(n),n=setTimeout(u,t),n||e.apply(this,arguments)}},Object.defineProperty(e,"__esModule",{value:!0});
