import{n as l,y as m,ab as q,x as k,w as v,u as y,ac as z}from"./BPJHTBRA.js";function A(e){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function h(e,n,s){if(e==null)return n(void 0),s&&s(void 0),l;const r=m(()=>e.subscribe(n,s));return r.unsubscribe?()=>r.unsubscribe():r}const f=[];function E(e,n){return{subscribe:B(e,n).subscribe}}function B(e,n=l){let s=null;const r=new Set;function c(u){if(q(e,u)&&(e=u,s)){const o=!f.length;for(const t of r)t[1](),f.push(t,e);if(o){for(let t=0;t<f.length;t+=2)f[t][0](f[t+1]);f.length=0}}}function a(u){c(u(e))}function b(u,o=l){const t=[u,o];return r.add(t),r.size===1&&(s=n(c,a)||l),u(e),()=>{r.delete(t),r.size===0&&s&&(s(),s=null)}}return{set:c,update:a,subscribe:b}}function j(e,n,s){const r=!Array.isArray(e),c=r?[e]:e;if(!c.every(Boolean))throw new Error("derived() expects stores as input, got a falsy value");const a=n.length<2;return E(s,(b,u)=>{let o=!1;const t=[];let p=0,d=l;const g=()=>{if(p)return;d();const i=n(r?t[0]:t,b,u);a?b(i):d=typeof i=="function"?i:l},w=c.map((i,_)=>h(i,x=>{t[_]=x,p&=~(1<<_),o&&g()},()=>{p|=1<<_}));return o=!0,g(),function(){k(w),d(),o=!1}})}function C(e){let n;return h(e,s=>n=s)(),n}function D(e){y===null&&A(),z&&y.l!==null?M(y).m.push(e):v(()=>{const n=m(e);if(typeof n=="function")return n})}function M(e){var n=e.l;return n.u??(n.u={a:[],b:[],m:[]})}export{j as d,C as g,D as o,h as s,B as w};
