let persons={},conversation=[],audioBasePath="./meet1/";
fetch("meet1.json")
  .then(r=>r.json())
  .then(data=>{
    persons=data.persons, conversation=data.conversation;
    conversation.forEach((seg,i)=>seg.filePath=audioBasePath+String(i+1).padStart(2,"0")+".mp3");
    initApp()
  })
  .catch(err=>console.error("JSON 파일 로드 실패:",err));
function initApp(){
  const conv=document.getElementById("conversation");
  conversation.forEach((seg,i)=>{
    let segDiv=document.createElement("div");
    segDiv.classList.add("segment"), segDiv.id="segment-"+i;
    let nameDiv=document.createElement("div");
    nameDiv.classList.add("speaker-name"), nameDiv.textContent=persons[seg.speaker].name+":";
    let engDiv=document.createElement("div");
    engDiv.classList.add("dialogue-text"), engDiv.id="dialogueText-"+i, engDiv.textContent=seg.text;
    let korDiv=document.createElement("div");
    korDiv.classList.add("korean-text"), korDiv.textContent=seg.korean;
    segDiv.append(nameDiv,engDiv,korDiv);
    segDiv.addEventListener("click",()=>{globalAudio.pause(); playSegment(i)});
    conv.appendChild(segDiv)
  });
  const spkOpt=document.getElementById("speakerOptions");
  Object.entries(persons).forEach(([k,p])=>{
    let li=document.createElement("li"), label=document.createElement("label"), cb=document.createElement("input");
    cb.type="checkbox", cb.checked=false;
    cb.addEventListener("change",e=>{persons[k].hideEnglish=e.target.checked; updateDialogueVisibility()});
    label.append(cb,document.createTextNode(" "+p.name+" (음소거 및 영어 숨김)"));
    li.appendChild(label), spkOpt.appendChild(li)
  });
  document.getElementById("toggleGlobalText").addEventListener("change",updateDialogueVisibility);
  document.getElementById("toggleKoreanText").addEventListener("change",updateDialogueVisibility);
  document.getElementById("textSizeSelect").addEventListener("change",updateTextSize), updateTextSize();
  document.getElementById("toggleLeftPanel").addEventListener("change",e=>updateLeftPanelVisibility(e.target.checked));
  document.getElementById("playButton").addEventListener("click",playConversation);
  document.getElementById("pauseButton").addEventListener("click",pauseConversation);
  document.getElementById("restartButton").addEventListener("click",restartConversation);
  document.getElementById("settingsButton").addEventListener("click",openModal);
  document.getElementById("modalClose").addEventListener("click",closeModal);
  initPlayback()
}
function openModal(){document.getElementById("settingsModal").style.display="block"}
function closeModal(){document.getElementById("settingsModal").style.display="none"}
function updateLeftPanelVisibility(h){const lp=document.getElementById("leftPanel"),rp=document.querySelector(".right-panel");h?(lp.style.display="none", rp.style.width="100%"):(lp.style.display="flex", rp.style.width="60%")}
let currentSegmentIndex=0,isPlaying=false,globalAudio=new Audio();
function updateCurrentSegmentHighlight(){
  let dlg=document.getElementById("dialogueText-"+currentSegmentIndex);
  if(!globalAudio.duration)return;
  let cur=Math.min(globalAudio.currentTime+0.2,globalAudio.duration),
      frac=cur/globalAudio.duration,
      text=conversation[currentSegmentIndex].text,
      words=text.split(" "),
      cnt=Math.floor(words.length*frac),
      highlighted=words.slice(0,cnt).join(" "),
      remaining=words.slice(cnt).join(" ");
  dlg.innerHTML=persons[conversation[currentSegmentIndex].speaker].hideEnglish?"":`<span style="color: red;">${highlighted}</span> ${remaining}`
}
globalAudio.addEventListener("timeupdate",updateCurrentSegmentHighlight);
globalAudio.onended=()=>{
  if(document.getElementById("segmentRepeatCheckbox").checked){
    playSegment(currentSegmentIndex)
  } else if(currentSegmentIndex<conversation.length-1){
    playSegment(currentSegmentIndex+1)
  } else {
    if(document.getElementById("repeatCheckbox").checked){
      currentSegmentIndex=0, playSegment(0)
    } else {isPlaying=false, document.getElementById("playIndicator").style.display="none"}
  }
};
function playSegment(i){
  if(i>=conversation.length){isPlaying=false, document.getElementById("playIndicator").style.display="none"; return}
  currentSegmentIndex=i;
  let seg=conversation[i];
  updateConversationUI(i);
  document.getElementById("speakerImage").src=audioBasePath+seg.speaker+".webp";
  document.getElementById("speakerNameOverlay").textContent=persons[seg.speaker].name;
  let dlg=document.getElementById("dialogueText-"+i);
  dlg.textContent=seg.text;
  globalAudio.src=seg.filePath;
  globalAudio.muted=persons[seg.speaker].muted||persons[seg.speaker].hideEnglish;
  globalAudio.play();
  document.getElementById("playIndicator").style.display="inline"
}
function playConversation(){if(isPlaying)return; isPlaying=true, playSegment(currentSegmentIndex)}
function pauseConversation(){isPlaying=false, globalAudio.pause(), document.getElementById("playIndicator").style.display="none"}
function restartConversation(){globalAudio.pause(), currentSegmentIndex=0, playSegment(0)}
function updateConversationUI(active){
  conversation.forEach((seg,i)=>{
    let segDiv=document.getElementById("segment-"+i),
        dlg=document.getElementById("dialogueText-"+i);
    i===active?(segDiv.classList.add("active"), segDiv.scrollIntoView({behavior:"smooth",block:"center"})):
      (segDiv.classList.remove("active"), dlg.textContent=seg.text)
  })
}
function updateDialogueVisibility(){
  let showGlobal=document.getElementById("toggleGlobalText").checked,
      showKorean=document.getElementById("toggleKoreanText").checked;
  conversation.forEach((seg,i)=>{
    let segDiv=document.getElementById("segment-"+i),
        eng=segDiv.querySelector(".dialogue-text"),
        kor=segDiv.querySelector(".korean-text");
    if(!showGlobal||!persons[seg.speaker].showText){
      eng.style.visibility="hidden", kor.style.visibility="hidden"
    } else {
      persons[seg.speaker].hideEnglish?(eng.style.visibility="hidden", kor.style.visibility="hidden"):
      (eng.style.visibility="visible", kor.style.visibility=showKorean?"visible":"hidden")
    }
  })
}
function updateTextSize(){
  let sel=document.getElementById("textSizeSelect"),
      fs=sel.value==="veryLarge"?"2em":"1.2em";
  document.querySelectorAll(".dialogue-text").forEach(el=>el.style.fontSize=fs);
  document.querySelectorAll(".korean-text").forEach(el=>el.style.fontSize=fs)
}
function initPlayback(){currentSegmentIndex=0,isPlaying=false}
