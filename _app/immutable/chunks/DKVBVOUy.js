var on=Array.isArray,_n=Array.prototype.indexOf,$n=Array.from,zn=Object.defineProperty,G=Object.getOwnPropertyDescriptor,cn=Object.getOwnPropertyDescriptors,vn=Object.prototype,hn=Array.prototype,Ct=Object.getPrototypeOf,It=Object.isExtensible;const Wn=()=>{};function Xn(t){return t()}function Ft(t){for(var e=0;e<t.length;e++)t[e]()}const R=2,Mt=4,it=8,Tt=16,S=32,B=64,nt=128,m=256,et=512,y=1024,O=2048,P=4096,j=8192,ut=16384,pn=32768,Lt=65536,Jn=1<<17,dn=1<<19,qt=1<<20,wt=1<<21,K=Symbol("$state"),Qn=Symbol("legacy props"),te=Symbol("");function Yt(t){return t===this.v}function wn(t,e){return t!=t?e==e:t!==e||t!==null&&typeof t=="object"||typeof t=="function"}function jt(t){return!wn(t,this.v)}function yn(t){throw new Error("https://svelte.dev/e/effect_in_teardown")}function En(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function gn(t){throw new Error("https://svelte.dev/e/effect_orphan")}function mn(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function ne(){throw new Error("https://svelte.dev/e/hydration_failed")}function ee(t){throw new Error("https://svelte.dev/e/props_invalid_value")}function Tn(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function An(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function xn(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}let ot=!1;function re(){ot=!0}const le=1,ae=2,se=4,fe=8,ie=16,ue=1,oe=2,_e=4,ce=8,ve=16,he=1,pe=2,Rn="[",Dn="[!",bn="]",Ht={},E=Symbol(),de="http://www.w3.org/1999/xhtml";let p=null;function Ot(t){p=t}function we(t,e=!1,n){var r=p={p,c:null,d:!1,e:null,m:!1,s:t,x:null,l:null};ot&&!e&&(p.l={s:null,u:null,r1:[],r2:xt(!1)}),kn(()=>{r.d=!0})}function ye(t){const e=p;if(e!==null){const u=e.e;if(u!==null){var n=h,r=v;e.e=null;try{for(var l=0;l<u.length;l++){var a=u[l];at(a.effect),H(a.reaction),Wt(a.fn)}}finally{at(n),H(r)}}p=e.p,e.m=!0}return{}}function _t(){return!ot||p!==null&&p.l===null}function q(t){if(typeof t!="object"||t===null||K in t)return t;const e=Ct(t);if(e!==vn&&e!==hn)return t;var n=new Map,r=on(t),l=N(0),a=v,u=i=>{var s=v;H(a);var f=i();return H(s),f};return r&&n.set("length",N(t.length)),new Proxy(t,{defineProperty(i,s,f){(!("value"in f)||f.configurable===!1||f.enumerable===!1||f.writable===!1)&&Tn();var _=n.get(s);return _===void 0?(_=u(()=>N(f.value)),n.set(s,_)):I(_,u(()=>q(f.value))),!0},deleteProperty(i,s){var f=n.get(s);if(f===void 0)s in i&&(n.set(s,u(()=>N(E))),dt(l));else{if(r&&typeof s=="string"){var _=n.get("length"),o=Number(s);Number.isInteger(o)&&o<_.v&&I(_,o)}I(f,E),dt(l)}return!0},get(i,s,f){var x;if(s===K)return t;var _=n.get(s),o=s in i;if(_===void 0&&(!o||(x=G(i,s))!=null&&x.writable)&&(_=u(()=>N(q(o?i[s]:E))),n.set(s,_)),_!==void 0){var c=Y(_);return c===E?void 0:c}return Reflect.get(i,s,f)},getOwnPropertyDescriptor(i,s){var f=Reflect.getOwnPropertyDescriptor(i,s);if(f&&"value"in f){var _=n.get(s);_&&(f.value=Y(_))}else if(f===void 0){var o=n.get(s),c=o==null?void 0:o.v;if(o!==void 0&&c!==E)return{enumerable:!0,configurable:!0,value:c,writable:!0}}return f},has(i,s){var c;if(s===K)return!0;var f=n.get(s),_=f!==void 0&&f.v!==E||Reflect.has(i,s);if(f!==void 0||h!==null&&(!_||(c=G(i,s))!=null&&c.writable)){f===void 0&&(f=u(()=>N(_?q(i[s]):E)),n.set(s,f));var o=Y(f);if(o===E)return!1}return _},set(i,s,f,_){var bt;var o=n.get(s),c=s in i;if(r&&s==="length")for(var x=f;x<o.v;x+=1){var J=n.get(x+"");J!==void 0?I(J,E):x in i&&(J=u(()=>N(E)),n.set(x+"",J))}o===void 0?(!c||(bt=G(i,s))!=null&&bt.writable)&&(o=u(()=>N(void 0)),I(o,u(()=>q(f))),n.set(s,o)):(c=o.v!==E,I(o,u(()=>q(f))));var Q=Reflect.getOwnPropertyDescriptor(i,s);if(Q!=null&&Q.set&&Q.set.call(_,f),!c){if(r&&typeof s=="string"){var Dt=n.get("length"),pt=Number(s);Number.isInteger(pt)&&pt>=Dt.v&&I(Dt,pt+1)}dt(l)}return!0},ownKeys(i){Y(l);var s=Reflect.ownKeys(i).filter(o=>{var c=n.get(o);return c===void 0||c.v!==E});for(var[f,_]of n)_.v!==E&&!(f in i)&&s.push(f);return s},setPrototypeOf(){An()}})}function dt(t,e=1){I(t,t.v+e)}function At(t){var e=R|O,n=v!==null&&(v.f&R)!==0?v:null;return h===null||n!==null&&(n.f&m)!==0?e|=m:h.f|=qt,{ctx:p,deps:null,effects:null,equals:Yt,f:e,fn:t,reactions:null,rv:0,v:null,wv:0,parent:n??h}}function Ee(t){const e=At(t);return rn(e),e}function ge(t){const e=At(t);return e.equals=jt,e}function Bt(t){var e=t.effects;if(e!==null){t.effects=null;for(var n=0;n<e.length;n+=1)M(e[n])}}function In(t){for(var e=t.parent;e!==null;){if((e.f&R)===0)return e;e=e.parent}return null}function Ut(t){var e,n=h;at(In(t));try{Bt(t),e=fn(t)}finally{at(n)}return e}function Vt(t){var e=Ut(t),n=(k||(t.f&m)!==0)&&t.deps!==null?P:y;A(t,n),t.equals(e)||(t.v=e,t.wv=an())}const $=new Map;function xt(t,e){var n={f:0,v:t,reactions:null,equals:Yt,rv:0,wv:0};return n}function N(t,e){const n=xt(t);return rn(n),n}function me(t,e=!1){var r;const n=xt(t);return e||(n.equals=jt),ot&&p!==null&&p.l!==null&&((r=p.l).s??(r.s=[])).push(n),n}function I(t,e,n=!1){v!==null&&!b&&_t()&&(v.f&(R|Tt))!==0&&!(w!=null&&w.includes(t))&&xn();let r=n?q(e):e;return On(t,r)}function On(t,e){if(!t.equals(e)){var n=t.v;X?$.set(t,e):$.set(t,n),t.v=e,(t.f&R)!==0&&((t.f&O)!==0&&Ut(t),A(t,(t.f&m)===0?y:P)),t.wv=an(),Gt(t,O),_t()&&h!==null&&(h.f&y)!==0&&(h.f&(S|B))===0&&(T===null?Yn([t]):T.push(t))}return e}function Gt(t,e){var n=t.reactions;if(n!==null)for(var r=_t(),l=n.length,a=0;a<l;a++){var u=n[a],i=u.f;(i&O)===0&&(!r&&u===h||(A(u,e),(i&(y|m))!==0&&((i&R)!==0?Gt(u,P):ht(u))))}}function Kt(t){console.warn("https://svelte.dev/e/hydration_mismatch")}let F=!1;function Te(t){F=t}let D;function z(t){if(t===null)throw Kt(),Ht;return D=t}function Ae(){return z(L(D))}function xe(t){if(F){if(L(D)!==null)throw Kt(),Ht;D=t}}function Re(t=1){if(F){for(var e=t,n=D;e--;)n=L(n);D=n}}function De(){for(var t=0,e=D;;){if(e.nodeType===8){var n=e.data;if(n===bn){if(t===0)return e;t-=1}else(n===Rn||n===Dn)&&(t+=1)}var r=L(e);e.remove(),e=r}}var St,Sn,Zt,$t;function be(){if(St===void 0){St=window,Sn=/Firefox/.test(navigator.userAgent);var t=Element.prototype,e=Node.prototype,n=Text.prototype;Zt=G(e,"firstChild").get,$t=G(e,"nextSibling").get,It(t)&&(t.__click=void 0,t.__className=void 0,t.__attributes=null,t.__style=void 0,t.__e=void 0),It(n)&&(n.__t=void 0)}}function yt(t=""){return document.createTextNode(t)}function Et(t){return Zt.call(t)}function L(t){return $t.call(t)}function Ie(t,e){if(!F)return Et(t);var n=Et(D);if(n===null)n=D.appendChild(yt());else if(e&&n.nodeType!==3){var r=yt();return n==null||n.before(r),z(r),r}return z(n),n}function Oe(t,e){if(!F){var n=Et(t);return n instanceof Comment&&n.data===""?L(n):n}return D}function Se(t,e=1,n=!1){let r=F?D:t;for(var l;e--;)l=r,r=L(r);if(!F)return r;var a=r==null?void 0:r.nodeType;if(n&&a!==3){var u=yt();return r===null?l==null||l.after(u):r.before(u),z(u),u}return z(r),r}function Ne(t){t.textContent=""}function zt(t){h===null&&v===null&&gn(),v!==null&&(v.f&m)!==0&&h===null&&En(),X&&yn()}function Nn(t,e){var n=e.last;n===null?e.last=e.first=t:(n.next=t,t.prev=n,e.last=t)}function U(t,e,n,r=!0){var l=h,a={ctx:p,deps:null,nodes_start:null,nodes_end:null,f:t|O,first:null,fn:e,last:null,next:null,parent:l,prev:null,teardown:null,transitions:null,wv:0};if(n)try{vt(a),a.f|=pn}catch(s){throw M(a),s}else e!==null&&ht(a);var u=n&&a.deps===null&&a.first===null&&a.nodes_start===null&&a.teardown===null&&(a.f&(qt|nt))===0;if(!u&&r&&(l!==null&&Nn(a,l),v!==null&&(v.f&R)!==0)){var i=v;(i.effects??(i.effects=[])).push(a)}return a}function kn(t){const e=U(it,null,!1);return A(e,y),e.teardown=t,e}function ke(t){zt();var e=h!==null&&(h.f&S)!==0&&p!==null&&!p.m;if(e){var n=p;(n.e??(n.e=[])).push({fn:t,effect:h,reaction:v})}else{var r=Wt(t);return r}}function Pe(t){return zt(),Rt(t)}function Ce(t){const e=U(B,t,!0);return(n={})=>new Promise(r=>{n.outro?Mn(e,()=>{M(e),r(void 0)}):(M(e),r(void 0))})}function Wt(t){return U(Mt,t,!1)}function Fe(t,e){var n=p,r={effect:null,ran:!1};n.l.r1.push(r),r.effect=Rt(()=>{t(),!r.ran&&(r.ran=!0,I(n.l.r2,!0),Kn(e))})}function Me(){var t=p;Rt(()=>{if(Y(t.l.r2)){for(var e of t.l.r1){var n=e.effect;(n.f&y)!==0&&A(n,P),V(n)&&vt(n),e.ran=!1}t.l.r2.v=!1}})}function Rt(t){return U(it,t,!0)}function Le(t,e=[],n=At){const r=e.map(n);return Pn(()=>t(...r.map(Y)))}function Pn(t,e=0){return U(it|Tt|e,t,!0)}function qe(t,e=!0){return U(it|S,t,!0,e)}function Xt(t){var e=t.teardown;if(e!==null){const n=X,r=v;kt(!0),H(null);try{e.call(null)}finally{kt(n),H(r)}}}function Jt(t,e=!1){var n=t.first;for(t.first=t.last=null;n!==null;){var r=n.next;(n.f&B)!==0?n.parent=null:M(n,e),n=r}}function Cn(t){for(var e=t.first;e!==null;){var n=e.next;(e.f&S)===0&&M(e),e=n}}function M(t,e=!0){var n=!1;(e||(t.f&dn)!==0)&&t.nodes_start!==null&&(Fn(t.nodes_start,t.nodes_end),n=!0),Jt(t,e&&!n),ft(t,0),A(t,ut);var r=t.transitions;if(r!==null)for(const a of r)a.stop();Xt(t);var l=t.parent;l!==null&&l.first!==null&&Qt(t),t.next=t.prev=t.teardown=t.ctx=t.deps=t.fn=t.nodes_start=t.nodes_end=null}function Fn(t,e){for(;t!==null;){var n=t===e?null:L(t);t.remove(),t=n}}function Qt(t){var e=t.parent,n=t.prev,r=t.next;n!==null&&(n.next=r),r!==null&&(r.prev=n),e!==null&&(e.first===t&&(e.first=r),e.last===t&&(e.last=n))}function Mn(t,e){var n=[];tn(t,n,!0),Ln(n,()=>{M(t),e&&e()})}function Ln(t,e){var n=t.length;if(n>0){var r=()=>--n||e();for(var l of t)l.out(r)}else e()}function tn(t,e,n){if((t.f&j)===0){if(t.f^=j,t.transitions!==null)for(const u of t.transitions)(u.is_global||n)&&e.push(u);for(var r=t.first;r!==null;){var l=r.next,a=(r.f&Lt)!==0||(r.f&S)!==0;tn(r,e,a?n:!1),r=l}}}function Ye(t){nn(t,!0)}function nn(t,e){if((t.f&j)!==0){t.f^=j,(t.f&y)===0&&(t.f^=y),V(t)&&(A(t,O),ht(t));for(var n=t.first;n!==null;){var r=n.next,l=(n.f&Lt)!==0||(n.f&S)!==0;nn(n,l?e:!1),n=r}if(t.transitions!==null)for(const a of t.transitions)(a.is_global||e)&&a.in()}}let W=[],gt=[];function en(){var t=W;W=[],Ft(t)}function qn(){var t=gt;gt=[],Ft(t)}function je(t){W.length===0&&queueMicrotask(en),W.push(t)}function Nt(){W.length>0&&en(),gt.length>0&&qn()}let tt=!1,rt=!1,lt=null,C=!1,X=!1;function kt(t){X=t}let Z=[];let v=null,b=!1;function H(t){v=t}let h=null;function at(t){h=t}let w=null;function rn(t){v!==null&&v.f&wt&&(w===null?w=[t]:w.push(t))}let d=null,g=0,T=null;function Yn(t){T=t}let ln=1,st=0,k=!1;function an(){return++ln}function V(t){var o;var e=t.f;if((e&O)!==0)return!0;if((e&P)!==0){var n=t.deps,r=(e&m)!==0;if(n!==null){var l,a,u=(e&et)!==0,i=r&&h!==null&&!k,s=n.length;if(u||i){var f=t,_=f.parent;for(l=0;l<s;l++)a=n[l],(u||!((o=a==null?void 0:a.reactions)!=null&&o.includes(f)))&&(a.reactions??(a.reactions=[])).push(f);u&&(f.f^=et),i&&_!==null&&(_.f&m)===0&&(f.f^=m)}for(l=0;l<s;l++)if(a=n[l],V(a)&&Vt(a),a.wv>t.wv)return!0}(!r||h!==null&&!k)&&A(t,y)}return!1}function jn(t,e){for(var n=e;n!==null;){if((n.f&nt)!==0)try{n.fn(t);return}catch{n.f^=nt}n=n.parent}throw tt=!1,t}function Pt(t){return(t.f&ut)===0&&(t.parent===null||(t.parent.f&nt)===0)}function ct(t,e,n,r){if(tt){if(n===null&&(tt=!1),Pt(e))throw t;return}if(n!==null&&(tt=!0),jn(t,e),Pt(e))throw t}function sn(t,e,n=!0){var r=t.reactions;if(r!==null)for(var l=0;l<r.length;l++){var a=r[l];w!=null&&w.includes(t)||((a.f&R)!==0?sn(a,e,!1):e===a&&(n?A(a,O):(a.f&y)!==0&&A(a,P),ht(a)))}}function fn(t){var x;var e=d,n=g,r=T,l=v,a=k,u=w,i=p,s=b,f=t.f;d=null,g=0,T=null,k=(f&m)!==0&&(b||!C||v===null),v=(f&(S|B))===0?t:null,w=null,Ot(t.ctx),b=!1,st++,t.f|=wt;try{var _=(0,t.fn)(),o=t.deps;if(d!==null){var c;if(ft(t,g),o!==null&&g>0)for(o.length=g+d.length,c=0;c<d.length;c++)o[g+c]=d[c];else t.deps=o=d;if(!k)for(c=g;c<o.length;c++)((x=o[c]).reactions??(x.reactions=[])).push(t)}else o!==null&&g<o.length&&(ft(t,g),o.length=g);if(_t()&&T!==null&&!b&&o!==null&&(t.f&(R|P|O))===0)for(c=0;c<T.length;c++)sn(T[c],t);return l!==null&&l!==t&&(st++,T!==null&&(r===null?r=T:r.push(...T))),_}finally{d=e,g=n,T=r,v=l,k=a,w=u,Ot(i),b=s,t.f^=wt}}function Hn(t,e){let n=e.reactions;if(n!==null){var r=_n.call(n,t);if(r!==-1){var l=n.length-1;l===0?n=e.reactions=null:(n[r]=n[l],n.pop())}}n===null&&(e.f&R)!==0&&(d===null||!d.includes(e))&&(A(e,P),(e.f&(m|et))===0&&(e.f^=et),Bt(e),ft(e,0))}function ft(t,e){var n=t.deps;if(n!==null)for(var r=e;r<n.length;r++)Hn(t,n[r])}function vt(t){var e=t.f;if((e&ut)===0){A(t,y);var n=h,r=p,l=C;h=t,C=!0;try{(e&Tt)!==0?Cn(t):Jt(t),Xt(t);var a=fn(t);t.teardown=typeof a=="function"?a:null,t.wv=ln;var u=t.deps,i}catch(s){ct(s,t,n,r||t.ctx)}finally{C=l,h=n}}}function Bn(){try{mn()}catch(t){if(lt!==null)ct(t,lt,null);else throw t}}function un(){var t=C;try{var e=0;for(C=!0;Z.length>0;){e++>1e3&&Bn();var n=Z,r=n.length;Z=[];for(var l=0;l<r;l++){var a=Vn(n[l]);Un(a)}$.clear()}}finally{rt=!1,C=t,lt=null}}function Un(t){var e=t.length;if(e!==0)for(var n=0;n<e;n++){var r=t[n];if((r.f&(ut|j))===0)try{V(r)&&(vt(r),r.deps===null&&r.first===null&&r.nodes_start===null&&(r.teardown===null?Qt(r):r.fn=null))}catch(l){ct(l,r,null,r.ctx)}}}function ht(t){rt||(rt=!0,queueMicrotask(un));for(var e=lt=t;e.parent!==null;){e=e.parent;var n=e.f;if((n&(B|S))!==0){if((n&y)===0)return;e.f^=y}}Z.push(e)}function Vn(t){for(var e=[],n=t;n!==null;){var r=n.f,l=(r&(S|B))!==0,a=l&&(r&y)!==0;if(!a&&(r&j)===0){if((r&Mt)!==0)e.push(n);else if(l)n.f^=y;else{var u=v;try{v=n,V(n)&&vt(n)}catch(f){ct(f,n,null,n.ctx)}finally{v=u}}var i=n.first;if(i!==null){n=i;continue}}var s=n.parent;for(n=n.next;n===null&&s!==null;)n=s.next,s=s.parent}return e}function Gn(t){var e;for(Nt();Z.length>0;)rt=!0,un(),Nt();return e}async function He(){await Promise.resolve(),Gn()}function Y(t){var e=t.f,n=(e&R)!==0;if(v!==null&&!b){if(!(w!=null&&w.includes(t))){var r=v.deps;t.rv<st&&(t.rv=st,d===null&&r!==null&&r[g]===t?g++:d===null?d=[t]:(!k||!d.includes(t))&&d.push(t))}}else if(n&&t.deps===null&&t.effects===null){var l=t,a=l.parent;a!==null&&(a.f&m)===0&&(l.f^=m)}return n&&(l=t,V(l)&&Vt(l)),X&&$.has(t)?$.get(t):t.v}function Kn(t){var e=b;try{return b=!0,t()}finally{b=e}}const Zn=-7169;function A(t,e){t.f=t.f&Zn|e}function Be(t){if(!(typeof t!="object"||!t||t instanceof EventTarget)){if(K in t)mt(t);else if(!Array.isArray(t))for(let e in t){const n=t[e];typeof n=="object"&&n&&K in n&&mt(n)}}}function mt(t,e=new Set){if(typeof t=="object"&&t!==null&&!(t instanceof EventTarget)&&!e.has(t)){e.add(t),t instanceof Date&&t.getTime();for(let r in t)try{mt(t[r],e)}catch{}const n=Ct(t);if(n!==Object.prototype&&n!==Array.prototype&&n!==Map.prototype&&n!==Set.prototype&&n!==Date.prototype){const r=cn(n);for(let l in r){const a=r[l].get;if(a)try{a.call(t)}catch{}}}}}export{Ct as $,Be as A,At as B,yt as C,Et as D,Lt as E,ge as F,bn as G,Rn as H,j as I,$n as J,h as K,On as L,xt as M,ae as N,tn as O,Ne as P,Ln as Q,M as R,le as S,ie as T,E as U,L as V,on as W,se as X,je as Y,fe as Z,de as _,Ae as a,cn as a0,te as a1,re as a2,we as a3,Se as a4,Oe as a5,ye as a6,Re as a7,Fe as a8,Me as a9,pe as aA,be as aB,Ht as aC,Kt as aD,ne as aE,Ce as aF,He as aa,wn as ab,ot as ac,Wt as ad,Rt as ae,K as af,G as ag,ee as ah,Jn as ai,_e as aj,jt as ak,q as al,ce as am,Qn as an,oe as ao,ue as ap,ve as aq,Gn as ar,N as as,Ee as at,H as au,at as av,v as aw,dn as ax,Sn as ay,he as az,Pn as b,Ie as c,Dn as d,De as e,Te as f,Y as g,F as h,Ye as i,qe as j,D as k,kn as l,zn as m,Wn as n,me as o,Mn as p,I as q,xe as r,z as s,Le as t,p as u,Pe as v,ke as w,Ft as x,Kn as y,Xn as z};
