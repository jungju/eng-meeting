import{t as w,e as S,a as y,s as A,c as X}from"../chunks/C--qEYXp.js";import"../chunks/CNfL1SfP.js";import{h as M,a3 as Y,a8 as Z,a9 as tt,a5 as q,t as z,a6 as et,a4 as E,c as f,s as c,m,g as t,r as p,aa as at,F as st}from"../chunks/nPPMgSCh.js";import{i as rt}from"../chunks/1C6Tm1kB.js";import{e as ot,i as it}from"../chunks/Jt_3sPAJ.js";import{s as nt}from"../chunks/CfRKib8b.js";import{a as lt}from"../chunks/DkPbIObf.js";import{i as ct}from"../chunks/A3L5Ns7h.js";import{o as vt}from"../chunks/DaPebjpO.js";import{p as dt}from"../chunks/YG4qZTpG.js";import{b as C}from"../chunks/BpE8h4Gf.js";function F(n,T,o,v,a,s){var r=n.__className;if(M||r!==o||r===void 0){var l=lt(o,v,s);(!M||l!==n.getAttribute("class"))&&(l==null?n.removeAttribute("class"):n.className=l),n.__className=o}else if(s&&a!==s)for(var i in s){var g=!!s[i];(a==null||g!==!!a[i])&&n.classList.toggle(i,g)}return s}var ft=w('<div><div class="idx svelte-t9isrd"></div><div> </div></div>'),pt=w('<p class="loading svelte-t9isrd">문장 데이터를 불러오는 중입니다...</p>'),ut=w('<div class="sentences svelte-t9isrd"><!></div> <div class="controls svelte-t9isrd"><button class="svelte-t9isrd"> </button> <button class="svelte-t9isrd"> </button> <button class="svelte-t9isrd"> </button></div>',1);function xt(n,T){Y(T,!1);let o=m([]),v=m(-1),a,s=m(!1),r=m("none"),l=m(!1);vt(async()=>{if(!id)return;const e=await fetch(`${ASSET_BASE}/sentences.json`);e.ok&&c(o,(await e.json()).sentences)});const i=async e=>{var d;e<0||e>=t(o).length||(c(v,e),await at(),(d=document.getElementById(`s-${e}`))==null||d.scrollIntoView({behavior:"smooth",block:"center"}),a==null||a.pause(),a=new Audio(`${ASSET_BASE}/audio/${String(e+1).padStart(2,"0")}.mp3`),a.onended=()=>{t(r)==="one"?i(t(v)):t(v)<t(o).length-1?i(t(v)+1):t(r)==="all"?i(0):c(s,!1)},c(s,!0),a.play())},g=()=>a?a.paused?(a.play(),c(s,!0)):(a.pause(),c(s,!1)):i(0),L=()=>c(r,t(r)==="none"?"one":t(r)==="one"?"all":"none"),P=()=>c(l,!t(l));Z(()=>C,()=>{var e;id=((e=dt.url.pathname.match(/\/sentence\/([^\/]+)/))==null?void 0:e[1])||"",ASSET_BASE=`${C}/assets/sentence/${id}`}),tt(),ct();var B=ut(),$=q(B),R=f($);{var V=e=>{var d=X(),K=q(d);ot(K,1,()=>t(o),it,(O,Q,h)=>{var u=ft();nt(u,"id",`s-${h}`);var j=f(u);j.textContent=h+1;var x=E(j);let I;var U=f(x,!0);p(x),p(u),z(W=>{F(u,1,`sent ${h===t(v)?"active":""}`,"svelte-t9isrd"),I=F(x,1,"text svelte-t9isrd",null,I,W),A(U,t(Q))},[()=>({large:t(l)})],st),S("click",u,()=>i(h)),y(O,u)}),y(e,d)},D=e=>{var d=pt();y(e,d)};rt(R,e=>{t(o).length?e(V):e(D,!1)})}p($);var N=E($,2),_=f(N),G=f(_,!0);p(_);var b=E(_,2),H=f(b);p(b);var k=E(b,2),J=f(k,!0);p(k),p(N),z(()=>{A(G,t(s)?"⏸":"▶"),A(H,`반복:${t(r)==="none"?"없음":t(r)==="one"?"한 문장":"전체"}`),A(J,t(l)?"기본크기":"글자 크게")}),S("click",_,g),S("click",b,L),S("click",k,P),y(n,B),et()}export{xt as component};
