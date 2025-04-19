import{t as q,e as x,a as N,s as m}from"../chunks/CEmPIxNJ.js";import"../chunks/By0_FFSG.js";import{h as Q,a3 as dt,a8 as U,a9 as ft,t as T,a6 as vt,a4 as f,c as l,g as t,o as p,q as o,r,aa as ct}from"../chunks/DKVBVOUy.js";import{i as W}from"../chunks/DVrbH2wj.js";import{e as mt,i as ut}from"../chunks/C6EYMggD.js";import{s as Y}from"../chunks/BnVpz-va.js";import{t as gt}from"../chunks/DkPbIObf.js";import{i as bt}from"../chunks/DaaNtiuP.js";import{s as xt,a as ht}from"../chunks/PMqurswi.js";import{o as _t,a as yt}from"../chunks/DxGEdkc3.js";import{p as $t}from"../chunks/DsOKrBI6.js";import{b as wt}from"../chunks/D-ezZbvC.js";function X(u,w,C,D){var z=u.__style;if(Q||z!==w){var v=gt(w);(!Q||v!==u.getAttribute("style"))&&(v==null?u.removeAttribute("style"):u.style.cssText=v),u.__style=w}return D}var kt=q('<div style="width:40%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;position:relative;"><div style="position:absolute;top:10px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.3);color:#fff;padding:5px 10px;border-radius:5px;font-weight:bold;"> </div> <img style="max-width:90%;max-height:90%;border-radius:10px;"></div>'),zt=q("<div> </div>"),St=q('<div><div style="color:#2a3d66;font-weight:bold;margin-bottom:5px;font-size:1.2em;"> </div> <div> </div> <!></div>'),At=q('<div style="position:absolute;top:50px;left:0;right:0;bottom:0;display:flex;flex-direction:column;overflow:hidden;"><div style="flex:1;display:flex;overflow:hidden;"><!> <div style="flex:1;overflow-y:auto;padding:20px;"></div></div> <div style="background:#fff;padding:10px;border-top:1px solid #ccc;display:flex;justify-content:center;gap:8px;"><button style="width:110px;height:48px;font-size:0.8em;"> </button> <button style="width:110px;height:48px;font-size:0.8em;"> </button> <button style="width:110px;height:48px;font-size:0.8em;"> </button> <button style="width:110px;height:48px;font-size:0.8em;">크기</button> <button style="width:110px;height:48px;font-size:0.8em;"> </button></div></div>');function Kt(u,w){dt(w,!1);const[C,D]=xt(),z=()=>ht($t,"$page",C),v=p(),h=p();let c=p([]),d=p(0),a=null,_=p(!1),g=p("none"),S=p("1.2em"),A=p(!0),E=p(!0),j=p({});_t(async()=>{if(!t(v))return;const e=await fetch(`${t(h)}/dialogue.json`);if(e.ok){const i=await e.json();o(j,i.persons),o(c,i.conversation.map((s,n)=>({...s,filePath:`${t(h)}/audio/${String(n+1).padStart(2,"0")}.mp3`})))}}),yt(()=>{a==null||a.pause()});async function k(e){var s,n;if(e<0||e>=t(c).length){o(_,!1);return}a==null||a.pause(),o(d,e),await ct(),(s=document.getElementById(`segment-${e}`))==null||s.scrollIntoView({behavior:"smooth",block:"center"});const i=t(c)[e];a=new Audio(i.filePath),a.muted=(n=t(j)[i.speaker])==null?void 0:n.hideEnglish,a.onended=()=>{t(g)==="segment"?k(t(d)):t(d)<t(c).length-1?k(t(d)+1):t(g)==="all"?k(0):o(_,!1)},o(_,!0),a.play()}function Z(){a?a.paused?(a.play(),o(_,!0)):(a.pause(),o(_,!1)):k(0)}function tt(){o(g,t(g)==="none"?"all":t(g)==="all"?"segment":"none")}function et(e){e.target.src=`${t(h)}/ready.webp`}U(()=>z(),()=>{var e;o(v,((e=z().url.pathname.match(/\/dialogue\/([^\/]+)/))==null?void 0:e[1])||"")}),U(()=>t(v),()=>{o(h,`${wt}/assets/dialogue/${t(v)}`)}),ft(),bt();var K=At(),R=l(K),G=l(R);{var at=e=>{var i=kt(),s=l(i),n=l(s,!0);r(s);var y=f(s,2);r(i),T(()=>{var P,b,B;m(n,((b=t(j)[(P=t(c)[t(d)])==null?void 0:P.speaker])==null?void 0:b.name)||""),Y(y,"src",(B=t(c)[t(d)])!=null&&B.speaker?`${t(h)}/${t(c)[t(d)].speaker}.webp`:`${t(h)}/ready.webp`)}),x("error",y,et),N(e,i)};W(G,e=>{t(E)&&e(at)})}var H=f(G,2);mt(H,5,()=>t(c),ut,(e,i,s)=>{var n=St();Y(n,"id",`segment-${s}`);var y=l(n),P=l(y);r(y);var b=f(y,2),B=l(b,!0);r(b);var nt=f(b,2);{var lt=$=>{var M=zt(),pt=l(M,!0);r(M),T(()=>{X(M,`font-size:${t(S)??""};color:#555;`),m(pt,t(i).korean)}),N($,M)};W(nt,$=>{t(A)&&$(lt)})}r(n),T(()=>{var $;X(n,`margin-bottom:15px;padding:10px;cursor:pointer;border-bottom:1px solid #ddd;background:${s===t(d)?"#d0f0d0":"transparent"};font-weight:${s===t(d)?"bold":"normal"};`),m(P,`${(($=t(j)[t(i).speaker])==null?void 0:$.name)??""}:`),X(b,`font-size:${t(S)??""};margin-bottom:5px;`),m(B,t(i).text)}),x("click",n,()=>k(s)),N(e,n)}),r(H),r(R);var J=f(R,2),F=l(J),ot=l(F,!0);r(F);var O=f(F,2),rt=l(O);r(O);var I=f(O,2),it=l(I,!0);r(I);var L=f(I,2),V=f(L,2),st=l(V,!0);r(V),r(J),r(K),T(()=>{m(ot,t(_)?"⏸":"▶"),m(rt,`반복:${t(g)==="none"?"없음":t(g)==="all"?"전체":"구간"}`),m(it,t(A)?"한글 ON":"한글 OFF"),m(st,t(E)?"사진 ON":"사진 OFF")}),x("click",F,Z),x("click",O,tt),x("click",I,()=>o(A,!t(A))),x("click",L,()=>o(S,t(S)==="1.2em"?"2em":"1.2em")),x("click",V,()=>o(E,!t(E))),N(u,K),vt(),D()}export{Kt as component};
