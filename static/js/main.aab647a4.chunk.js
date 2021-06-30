(this.webpackJsonpplaylister=this.webpackJsonpplaylister||[]).push([[0],{86:function(e,t,n){},87:function(e,t,n){"use strict";n.r(t);var r=n(0),c=n.n(r),a=n(14),s=n.n(a),i=n(8),j=n(102),o=n(104),d=n(12),l=n(53),u=n(101),b=n(88),O=n(17),h=n(54),f=n(28),x=n(15),m=n(1),v=function(e){var t=e.className;return Object(m.jsxs)("div",{className:t,id:"about",children:[Object(m.jsxs)("h1",{children:[Object(m.jsx)(d.a,{icon:f.a})," about"]}),Object(m.jsxs)("p",{children:[Object(m.jsx)("strong",{children:"mediainfo.js"})," can analyze all kinds of media files for you. It shows technical details and metadata."]}),Object(m.jsxs)("h2",{children:[Object(m.jsx)(d.a,{icon:x.d})," thanks"]}),Object(m.jsxs)("p",{children:["- ",Object(m.jsx)("a",{href:"https://mediaarea.net/en/MediaInfo",children:"mediainfo"})," -"," ",Object(m.jsx)("a",{href:"https://react-dropzone.js.org/",children:"react-dropzone"})," -"," ",Object(m.jsx)("a",{href:"https://fontawesome.com/",children:"font awesome"})]}),Object(m.jsxs)("h2",{children:[Object(m.jsx)(d.a,{icon:x.b})," contact"]}),Object(m.jsxs)("p",{children:["Get in touch on ",Object(m.jsx)("a",{href:"https://github.com/buzz/mediainfo.js",children:"GitHub"}),"."]})]})},p=n(38),g=n.n(p),y=n(42),S=n(43),k=n(20),z=n(11),N=function(e){var t=e.key,n=e.onRestore,c=void 0===n?function(e){return e}:n,a=e.setState,s=e.state;Object(r.useEffect)((function(){a(c(function(e){var t=window.localStorage.getItem(e);if(t)try{return JSON.parse(t)}catch(n){return window.localStorage.setItem(e,JSON.stringify({})),{}}return{}}(t)))}),[t,c,a]),Object(r.useEffect)((function(){!function(e,t){window.localStorage.setItem(e,JSON.stringify(t))}(t,s)}),[t,s])},T=n(44),w=n.n(T),E=n(55),I=function(e){var t=e.analyzing,n=e.onDrop,r=Object(E.a)({disabled:t,onDrop:n}),c=r.getRootProps,a=r.getInputProps,s=r.isDragActive;return Object(m.jsx)("div",Object(z.a)(Object(z.a)({id:"dropzone",className:w()("big","center",{dragover:s})},c()),{},{children:t?Object(m.jsxs)("div",{id:"status",className:"hidden",children:[Object(m.jsx)(d.a,{icon:x.a,size:"lg",spin:!0})," Analyzing \u2026"]}):Object(m.jsxs)("div",{id:"dropcontrols",children:[Object(m.jsxs)("div",{id:"dropcontrolstext",children:[Object(m.jsx)(d.a,{icon:f.b,size:"lg"})," Drop media files here",Object(m.jsx)("br",{}),Object(m.jsx)("span",{className:"small",children:"(or click)"})]}),Object(m.jsx)("input",Object(z.a)({id:"fileinput",type:"file"},a()))]})}))},D=window.MediaInfo,C=function(){return Math.random().toString(36).substr(2,9)},M=function(e){return Object.entries(e).reduce((function(e,t){var n=Object(i.a)(t,2),r=n[0],c=n[1];return Object(z.a)(Object(z.a)({},e),{},Object(k.a)({},r,Object(z.a)({},c)))}),{})},R=function(e){var t=e.results,n=e.setResults,c=Object(r.useState)(!1),a=Object(i.a)(c,2),s=a[0],j=a[1];N({key:"results",onRestore:M,setState:n,state:t});var o=Object(r.useCallback)((function(e){var t=function(e,t){return e.analyzeData((function(){return t.size}),function(e){return function(t,n){return new Promise((function(r,c){var a=new FileReader;a.onload=function(e){e.target.error&&c(e.target.error),r(new Uint8Array(e.target.result))},a.readAsArrayBuffer(e.slice(n,n+t))}))}}(t)).then((function(e){n((function(n){return Object(z.a)(Object(k.a)({},C(),Object(z.a)(Object(z.a)({},function(e){var t=e.media.track.filter((function(e){return"General"===e["@type"]}))[0];return{format:t.Format,duration:t.Duration,startTime:t.Encoded_Date}}(e)),{},{name:t.name})),n)}))})).catch((function(e){return n((function(n){return Object(z.a)(Object(k.a)({},C(),{name:t.name,error:e.stack}),n)}))})).finally((function(){return j(!1)}))};e&&(j(!0),D().then(function(){var n=Object(S.a)(g.a.mark((function n(r){var c,a,s;return g.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:c=Object(y.a)(e),n.prev=1,c.s();case 3:if((a=c.n()).done){n.next=10;break}if(!(s=a.value)){n.next=8;break}return n.next=8,t(r,s);case 8:n.next=3;break;case 10:n.next=15;break;case 12:n.prev=12,n.t0=n.catch(1),c.e(n.t0);case 15:return n.prev=15,c.f(),n.finish(15);case 18:case"end":return n.stop()}}),n,null,[[1,12,15,18]])})));return function(e){return n.apply(this,arguments)}}()))}),[n]);return Object(m.jsx)(I,{analyzing:s,onDrop:o})},A=n(57),Y=n(56),F=function(e){return e.error?Object(m.jsx)("td",{colSpan:"3",className:"result-error",children:e.error}):Object(m.jsxs)(c.a.Fragment,{children:[Object(m.jsx)("td",{children:e.format}),Object(m.jsx)("td",{children:e.startTime}),Object(m.jsx)("td",{children:e.duration})]})},J=function(e){var t=e.id,n=e.result,r=e.onRemove;return Object(m.jsxs)("tr",{children:[Object(m.jsx)("td",{children:n.name}),F(n),Object(m.jsx)("td",{className:"delete-button",children:Object(m.jsx)("button",{className:"remove",onClick:function(e){e.stopPropagation(),r(t)},tabIndex:0,title:"Remove from list",type:"button",children:Object(m.jsx)(d.a,{icon:x.c,size:"lg"})})})]})},U=function(e){var t=e.values,n=e.setValues,c=Object(r.useCallback)((function(e){return n((function(t){t[e];return Object(A.a)(t,[e].map(Y.a))}))}),[n]),a=Object.entries(t).map((function(e){var t=Object(i.a)(e,2),n=t[0],r=t[1];return Object(m.jsx)(J,{id:n,onRemove:c,result:r},n)}));return Object(m.jsx)("div",{id:"results",children:Object(m.jsxs)("table",{className:"file-list",children:[Object(m.jsx)("thead",{children:Object(m.jsxs)("tr",{children:[Object(m.jsx)("th",{children:"Name"}),Object(m.jsx)("th",{children:"Format"}),Object(m.jsx)("th",{children:"Start Time"}),Object(m.jsx)("th",{children:"Duration"}),Object(m.jsx)("th",{className:"delete-button"})]})}),Object(m.jsx)("tbody",{children:a})]})})},G=n(103),H=n(100),L=n(106),P=n(7),V=n.n(P),Z=n(29),B=n.n(Z),_=n(30),q=n.n(_);V.a.extend(B.a),V.a.extend(q.a);var K=function(e){var t=e.value,n=e.setValue,c=e.override,a=e.setOverride;return Object(r.useEffect)((function(){if(""===t){var e=V.a.tz.guess();n(e)}}),[n,t]),Object(m.jsxs)("div",{id:"timezonefix",children:[Object(m.jsx)(L.a,{checked:c,onChange:function(e){return a(e.target.checked)},children:"Are start times above actually in local time zone?"}),Object(m.jsx)("div",{style:{display:"none"},children:Object(m.jsx)(G.a,{value:t,size:H.a.default,onChange:function(e){var t=e.id;n(t)},disabled:!c,className:"picker"})})]})},Q=n(49),W=n.n(Q),X=n(50),$=n.n(X),ee=n(51),te=n.n(ee);V.a.extend(W.a),V.a.extend($.a),V.a.extend(te.a),V.a.extend(q.a),V.a.extend(B.a);var ne=function(e){var t=e.fileInfo,n=e.overrideTimeZone,c=e.startEndList,a=e.setStartEndList;Object(r.useEffect)((function(){var e=function(e,t){var r=function(e){if(n){var t=e.replace("UTC ","");return V()(t).local()}if(e.match("^UTC ")){var r=e.replace("UTC ","")+" +00:00";return V()(r,"YYYY-MM-DD HH:mm:ss Z").tz("UTC")}return V()(e)}(t.startTime),c=r.add(t.duration,"second");return{id:e,name:t.name,startTime:r.toISOString(),endTime:c.toISOString()}},r=Object.entries(t).flatMap((function(t){var n=Object(i.a)(t,2),r=n[0],c=n[1];return c.startTime?[e(r,c)]:[]})).sort((function(e,t){return e.startTime>t.startTime?1:-1}));a(r)}),[t,n,a]);var s="ddd MMM D h:mm:ss A z YYYY";return Object(m.jsx)("div",{id:"start-end",children:Object(m.jsxs)("table",{className:"file-list",children:[Object(m.jsx)("thead",{children:Object(m.jsxs)("tr",{children:[Object(m.jsx)("th",{children:"Name"}),Object(m.jsx)("th",{children:"Start Time"}),Object(m.jsx)("th",{children:"End Time"})]})}),Object(m.jsx)("tbody",{children:c.map((function(e){return Object(m.jsxs)("tr",{children:[Object(m.jsx)("td",{children:e.name}),Object(m.jsx)("td",{children:V()(e.startTime).format(s)}),Object(m.jsx)("td",{children:V()(e.endTime).format(s)})]},e.id)}))})]})})},re=n(105),ce=n(4),ae=function(e){var t=e.className,n=Object(r.useState)({}),a=Object(i.a)(n,2),s=a[0],j=a[1],o=Object(r.useState)(""),d=Object(i.a)(o,2),l=d[0],u=d[1],b=Object(r.useState)(!1),O=Object(i.a)(b,2),h=O[0],f=O[1],x=Object(r.useState)([]),v=Object(i.a)(x,2),p=v[0],g=v[1];return Object(m.jsxs)("div",{className:t,children:[Object(m.jsx)(R,{results:s,setResults:j}),Object.keys(s).length>0?function(e){return Object(m.jsxs)(c.a.Fragment,{children:[Object(m.jsxs)("div",{id:"file-metadata",children:[Object(m.jsx)("h3",{children:"File Metadata"}),Object(m.jsx)("div",{style:{float:"right"},children:Object(m.jsx)(re.a,{size:ce.c.mini,onClick:function(){return j({})},children:"Clear All"})})]}),Object(m.jsx)(U,{values:e,setValues:j}),Object(m.jsx)("hr",{}),Object(m.jsx)(K,{value:l,setValue:u,override:h,setOverride:f}),Object(m.jsx)("h3",{children:"Start and End Times"}),Object(m.jsx)(ne,{fileInfo:e,overrideTimeZone:h,startEndList:p,setStartEndList:g})]})}(s):null]})},se=new h.a;var ie=function(){var e=Object(r.useState)("mediapage"),t=Object(i.a)(e,1)[0];return Object(m.jsx)(O.a,{value:se,children:Object(m.jsxs)(u.a,{theme:b.a,children:[Object(m.jsx)("section",{id:"page",children:Object(m.jsx)(j.a,{children:Object(m.jsx)(o.a,{classNames:"page",mountOnEnter:!0,timeout:400,children:"mediapage"===t?Object(m.jsx)(ae,{}):Object(m.jsx)(v,{})},t)})}),Object(m.jsx)("footer",{children:Object(m.jsx)("p",{children:Object(m.jsxs)("a",{href:"https://github.com/kamatsuoka/playlister",children:[Object(m.jsx)(d.a,{className:"fa-padded",icon:l.a,size:"lg"}),"GitHub"]})})})]})})};n(86);s.a.render(Object(m.jsx)(ie,{}),document.getElementById("root"))}},[[87,1,2]]]);
//# sourceMappingURL=main.aab647a4.chunk.js.map