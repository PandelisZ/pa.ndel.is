parcelRequire=function(e,r,n,t){var i="function"==typeof parcelRequire&&parcelRequire,o="function"==typeof require&&require;function u(n,t){if(!r[n]){if(!e[n]){var f="function"==typeof parcelRequire&&parcelRequire;if(!t&&f)return f(n,!0);if(i)return i(n,!0);if(o&&"string"==typeof n)return o(n);var c=new Error("Cannot find module '"+n+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[n][1][r]||r},p.cache={};var l=r[n]=new u.Module(n);e[n][0].call(l.exports,p,l,l.exports,this)}return r[n].exports;function p(e){return u(p.resolve(e))}}u.isParcelRequire=!0,u.Module=function(e){this.id=e,this.bundle=u,this.exports={}},u.modules=e,u.cache=r,u.parent=i,u.register=function(r,n){e[r]=[function(e,r){r.exports=n},{}]};for(var f=0;f<n.length;f++)u(n[f]);if(n.length){var c=u(n[n.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof define&&define.amd?define(function(){return c}):t&&(this[t]=c)}return u}({"epB2":[function(require,module,exports) {
var e=document.querySelector(".blade--left > h1"),t=document.querySelector(".blade--right > h1"),n=document.querySelector("#profile > h1"),r=document.querySelector("#projects > h1"),o=document.querySelectorAll(".visitorName"),a=document.querySelector("#social > h1"),s=function(o){e.style="transform: translateX(-".concat(7*o,"px)"),t.style="transform: translateX(".concat(2*o,"px)"),n.style="transform: translateX(-".concat(1.2*o,"px)"),r.style="transform: translateX(-".concat(1.2*o,"px)"),a.style="transform: translateX(-".concat(2*o,"px)")},c=!1;window.addEventListener("scroll",function(e){last_known_scroll_position=window.scrollY,c||(window.requestAnimationFrame(function(){s(last_known_scroll_position),c=!1}),c=!0)});var i=function(e){var t=e.target.innerHTML;t=t.replace("}","").replace("{",""),sessionStorage.setItem("visitorName",t)};o.forEach(function(e){var t=sessionStorage.getItem("visitorName");"string"==typeof t&&"undefined"!=t&&""!=t&&(e.innerHTML=t),e.addEventListener("blur",i),e.addEventListener("keyup",i),e.addEventListener("paste",i),e.addEventListener("copy",i),e.addEventListener("cut",i),e.addEventListener("delete",i),e.addEventListener("mouseup",i)});
},{}]},{},["epB2"], null)
//# sourceMappingURL=/main.391ee143.map