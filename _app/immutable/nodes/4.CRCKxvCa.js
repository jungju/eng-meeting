import{t as j,e as k,a as x,s as S,c as te}from"../chunks/CEmPIxNJ.js";import"../chunks/By0_FFSG.js";import{h as F,a3 as ae,a8 as L,a9 as se,a5 as P,t as R,a6 as oe,a4 as A,c as g,g as e,o as f,q as o,r as m,aa as re,F as ne}from"../chunks/DKVBVOUy.js";import{i as ie}from"../chunks/DVrbH2wj.js";import{e as le,i as ce}from"../chunks/C6EYMggD.js";import{s as fe}from"../chunks/BnVpz-va.js";import{a as ve}from"../chunks/DkPbIObf.js";import{i as pe}from"../chunks/DaaNtiuP.js";import{s as ue,a as ge}from"../chunks/CWYHwTbz.js";import{o as me}from"../chunks/0jm4Ivcg.js";import{p as de}from"../chunks/C04mFnKt.js";import{b as _e}from"../chunks/CA10apPv.js";function V(l,q,d,E,v,s){var p=l.__className;if(F||p!==d||p===void 0){var r=ve(d,E,s);(!F||r!==l.getAttribute("class"))&&(r==null?l.removeAttribute("class"):l.className=r),l.__className=d}else if(s&&v!==s)for(var n in s){var a=!!s[n];(v==null||a!==!!v[n])&&l.classList.toggle(n,a)}return s}var be=j('<div><div class="idx svelte-1gcaw1i"></div> <div> </div></div>'),he=j('<p class="loading svelte-1gcaw1i">문장 데이터를 불러오는 중입니다...</p>'),we=j('<!> <div class="controls svelte-1gcaw1i"><button class="svelte-1gcaw1i"> </button> <button class="svelte-1gcaw1i"> </button> <button class="svelte-1gcaw1i"> </button></div>',1);function Ie(l,q){ae(q,!1);const[d,E]=ue(),v=()=>ge(de,"$page",d),s=f(),p=f();let r=f([]),n=f(-1),a=null,_=f(!1),c=f("none"),h=f(!1);me(async()=>{if(!e(s))return;const t=await fetch(`${e(p)}/sentences.json`);if(t.ok){const i=await t.json();o(r,i.sentences)}});async function b(t){var i;t<0||t>=e(r).length||(o(n,t),await re(),(i=document.getElementById(`s-${t}`))==null||i.scrollIntoView({behavior:"smooth",block:"center"}),a==null||a.pause(),a=new Audio(`${e(p)}/audio/${String(t+1).padStart(2,"0")}.mp3`),a.onended=()=>{e(c)==="one"?b(e(n)):e(n)<e(r).length-1?b(e(n)+1):e(c)==="all"?b(0):o(_,!1)},o(_,!0),a.play())}function D(){a?a.paused?(a.play(),o(_,!0)):(a.pause(),o(_,!1)):b(0)}function G(){o(c,e(c)==="none"?"one":e(c)==="one"?"all":"none")}function H(){o(h,!e(h))}L(()=>v(),()=>{var t;o(s,((t=v().url.pathname.match(/\/sentence\/([^\/]+)/))==null?void 0:t[1])||"")}),L(()=>e(s),()=>{o(p,`${_e}/assets/sentence/${e(s)}`)}),se(),pe();var B=we(),I=P(B);{var J=t=>{var i=te(),W=P(i);le(W,1,()=>e(r),ce,(X,Y,y)=>{var u=be();fe(u,"id",`s-${y}`);var z=g(u);z.textContent=y+1;var T=A(z,2);let C;var Z=g(T,!0);m(T),m(u),R(ee=>{V(u,1,`sent ${y===e(n)?"active":""}`,"svelte-1gcaw1i"),C=V(T,1,"text svelte-1gcaw1i",null,C,ee),S(Z,e(Y))},[()=>({large:e(h)})],ne),k("click",u,()=>b(y)),x(X,u)}),x(t,i)},K=t=>{var i=he();x(t,i)};ie(I,t=>{e(r).length?t(J):t(K,!1)})}var M=A(I,2),w=g(M),O=g(w,!0);m(w);var $=A(w,2),Q=g($);m($);var N=A($,2),U=g(N,!0);m(N),m(M),R(()=>{S(O,e(_)?"⏸":"▶"),S(Q,`반복: ${e(c)==="none"?"없음":e(c)==="one"?"한 문장":"전체"}`),S(U,e(h)?"기본크기":"글자 크게")}),k("click",w,D),k("click",$,G),k("click",N,H),x(l,B),oe(),E()}export{Ie as component};
