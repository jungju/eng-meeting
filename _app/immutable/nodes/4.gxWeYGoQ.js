import{t as q,e as x,a as S,s as w,c as at}from"../chunks/CEmPIxNJ.js";import"../chunks/By0_FFSG.js";import{h as F,a3 as st,a8 as L,a9 as rt,a5 as P,t as R,a6 as ot,a4 as A,c as p,g as t,o as v,q as r,r as f,aa as nt,F as it}from"../chunks/DKVBVOUy.js";import{i as lt}from"../chunks/DVrbH2wj.js";import{e as ct,i as pt}from"../chunks/C6EYMggD.js";import{s as vt}from"../chunks/BnVpz-va.js";import{a as ft}from"../chunks/DkPbIObf.js";import{i as ut}from"../chunks/DaaNtiuP.js";import{s as mt,a as dt}from"../chunks/CWYHwTbz.js";import{o as gt}from"../chunks/0jm4Ivcg.js";import{p as _t}from"../chunks/BvBRHewf.js";import{b as bt}from"../chunks/BXBc73YQ.js";function V(i,B,g,E,u,s){var m=i.__className;if(F||m!==g||m===void 0){var o=ft(g,E,s);(!F||o!==i.getAttribute("class"))&&(o==null?i.removeAttribute("class"):i.className=o),i.__className=g}else if(s&&u!==s)for(var n in s){var a=!!s[n];(u==null||a!==!!u[n])&&i.classList.toggle(n,a)}return s}var ht=q('<div><div class="idx svelte-te8rp3"></div> <div> </div></div>'),$t=q('<p class="loading svelte-te8rp3">문장 데이터를 불러오는 중입니다...</p>'),yt=q('<div class="list svelte-te8rp3"><!></div> <div class="controls svelte-te8rp3"><button class="svelte-te8rp3"> </button> <button class="svelte-te8rp3"> </button> <button class="svelte-te8rp3"> </button></div>',1);function Mt(i,B){st(B,!1);const[g,E]=mt(),u=()=>dt(_t,"$page",g),s=v(),m=v();let o=v([]),n=v(-1),a,_=v(!1),l=v("none"),h=v(!1);gt(async()=>{if(!t(s))return;const e=await fetch(`${t(m)}/sentences.json`);e.ok&&r(o,(await e.json()).sentences)});async function b(e){var c;e<0||e>=t(o).length||(r(n,e),await nt(),(c=document.getElementById(`s-${e}`))==null||c.scrollIntoView({behavior:"smooth",block:"center"}),a==null||a.pause(),a=new Audio(`${t(m)}/audio/${String(e+1).padStart(2,"0")}.mp3`),a.onended=()=>t(l)==="one"?b(t(n)):t(n)<t(o).length-1?b(t(n)+1):t(l)==="all"?b(0):r(_,!1),r(_,!0),a.play())}function D(){a?a.paused?(a.play(),r(_,!0)):(a.pause(),r(_,!1)):b(0)}function G(){r(l,t(l)==="none"?"one":t(l)==="one"?"all":"none")}function H(){r(h,!t(h))}L(()=>u(),()=>{var e;r(s,((e=u().url.pathname.match(/\/sentence\/([^\/]+)/))==null?void 0:e[1])||"")}),L(()=>t(s),()=>{r(m,`${bt}/assets/sentence/${t(s)}`)}),rt(),ut();var I=yt(),N=P(I),J=p(N);{var K=e=>{var c=at(),X=P(c);ct(X,1,()=>t(o),pt,(Y,Z,k)=>{var d=ht();vt(d,"id",`s-${k}`);var z=p(d);z.textContent=k+1;var j=A(z,2);let C;var tt=p(j,!0);f(j),f(d),R(et=>{V(d,1,`sent ${k===t(n)?"active":""}`,"svelte-te8rp3"),C=V(j,1,"text svelte-te8rp3",null,C,et),w(tt,t(Z))},[()=>({large:t(h)})],it),x("click",d,()=>b(k)),S(Y,d)}),S(e,c)},O=e=>{var c=$t();S(e,c)};lt(J,e=>{t(o).length?e(K):e(O,!1)})}f(N);var M=A(N,2),$=p(M),Q=p($,!0);f($);var y=A($,2),U=p(y);f(y);var T=A(y,2),W=p(T,!0);f(T),f(M),R(()=>{w(Q,t(_)?"⏸":"▶"),w(U,`반복:${t(l)==="none"?"없음":t(l)==="one"?"한 문장":"전체"}`),w(W,t(h)?"기본크기":"글자 크게")}),x("click",$,D),x("click",y,G),x("click",T,H),S(i,I),ot(),E()}export{Mt as component};
