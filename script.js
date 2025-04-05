let persons = {};
let conversation = [];
// 음성 파일의 기본 경로 (변수로 설정)
const audioBasePath = "./meet1/"; // meet1.json일 때는 무조건 이 경로 사용

// meet1.json 파일에서 데이터를 불러옵니다.
fetch('meet1.json')
  .then(response => response.json())
  .then(data => {
      persons = data.persons;
      conversation = data.conversation;
      // 전역 순번(index+1)을 이용해 filePath 재할당: 예) "./meet1/01.mp3", "./meet1/02.mp3", ...
      conversation.forEach((seg, index) => {
        seg.filePath = audioBasePath + String(index + 1).padStart(2, '0') + ".mp3";
      });
      initApp();
  })
  .catch(err => console.error("JSON 파일 로드 실패:", err));

function initApp() {
  const conversationDiv = document.getElementById('conversation');
  conversation.forEach((segment, index) => {
    const segDiv = document.createElement('div');
    segDiv.classList.add('segment');
    segDiv.id = 'segment-' + index;

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('speaker-name');
    nameDiv.textContent = persons[segment.speaker].name + ':';

    const engDiv = document.createElement('div');
    engDiv.classList.add('dialogue-text');
    engDiv.id = 'dialogueText-' + index;
    engDiv.textContent = segment.text;

    const korDiv = document.createElement('div');
    korDiv.classList.add('korean-text');
    korDiv.textContent = segment.korean;

    segDiv.appendChild(nameDiv);
    segDiv.appendChild(engDiv);
    segDiv.appendChild(korDiv);

    segDiv.addEventListener('click', () => {
      globalAudio.pause();
      playSegment(index);
    });

    conversationDiv.appendChild(segDiv);
  });

  // 모달 내 대화자별 옵션 ("음소거 및 영어 숨김")
  const speakerOptionsDiv = document.getElementById('speakerOptions');
  Object.entries(persons).forEach(([key, person]) => {
    const li = document.createElement('li');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = false; // 기본값: 숨김 미적용
    checkbox.addEventListener('change', (e) => {
      persons[key].hideEnglish = e.target.checked;
      updateDialogueVisibility();
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + person.name + ' (음소거 및 영어 숨김)'));
    li.appendChild(label);
    speakerOptionsDiv.appendChild(li);
  });

  // 모달 내 옵션 이벤트 등록
  document.getElementById('toggleGlobalText').addEventListener('change', updateDialogueVisibility);
  document.getElementById('toggleKoreanText').addEventListener('change', updateDialogueVisibility);
  document.getElementById('textSizeSelect').addEventListener('change', updateTextSize);
  updateTextSize();

  // 레이아웃 옵션: 왼쪽 패널 숨김/보임
  document.getElementById('toggleLeftPanel').addEventListener('change', (e) => {
    updateLeftPanelVisibility(e.target.checked);
  });

  // 하단 컨트롤 이벤트 등록
  document.getElementById('playButton').addEventListener('click', playConversation);
  document.getElementById('pauseButton').addEventListener('click', pauseConversation);
  document.getElementById('restartButton').addEventListener('click', restartConversation);
  document.getElementById('settingsButton').addEventListener('click', openModal);
  document.getElementById('modalClose').addEventListener('click', closeModal);

  initPlayback();
}

// 모달 열기/닫기 함수
function openModal() {
  document.getElementById('settingsModal').style.display = 'block';
}
function closeModal() {
  document.getElementById('settingsModal').style.display = 'none';
}

// 왼쪽 패널 숨김/보임 업데이트: 숨기면 오른쪽 영역은 100%로 확장
function updateLeftPanelVisibility(hide) {
  const leftPanel = document.getElementById('leftPanel');
  const rightPanel = document.querySelector('.right-panel');
  if (hide) {
    leftPanel.style.display = 'none';
    rightPanel.style.width = '100%';
  } else {
    leftPanel.style.display = 'flex';
    rightPanel.style.width = '60%';
  }
}

let currentSegmentIndex = 0;
let isPlaying = false;
const globalAudio = new Audio();

// 실시간 하이라이트 업데이트 (0.2초 보정)
function updateCurrentSegmentHighlight() {
  const dialogueEl = document.getElementById("dialogueText-" + currentSegmentIndex);
  if (!globalAudio.duration || globalAudio.duration === 0) return;
  let current = Math.min(globalAudio.currentTime + 0.2, globalAudio.duration);
  let fraction = current / globalAudio.duration;
  let text = conversation[currentSegmentIndex].text;
  let words = text.split(" ");
  let highlightCount = Math.floor(words.length * fraction);
  let highlighted = words.slice(0, highlightCount).join(" ");
  let remaining = words.slice(highlightCount).join(" ");
  if (persons[conversation[currentSegmentIndex].speaker].hideEnglish) {
    dialogueEl.innerHTML = "";
  } else {
    dialogueEl.innerHTML = `<span style="color: red;">${highlighted}</span> ${remaining}`;
  }
}

globalAudio.addEventListener('timeupdate', updateCurrentSegmentHighlight);

// onended 이벤트에서 구간 반복과 전체 반복 옵션을 처리합니다.
globalAudio.onended = () => {
  if (document.getElementById('segmentRepeatCheckbox').checked) {
    // 구간 반복 활성화 시 현재 구간을 반복 재생
    playSegment(currentSegmentIndex);
  } else if (currentSegmentIndex < conversation.length - 1) {
    playSegment(currentSegmentIndex + 1);
  } else {
    if (document.getElementById('repeatCheckbox').checked) {
      currentSegmentIndex = 0;
      playSegment(0);
    } else {
      isPlaying = false;
      document.getElementById('playIndicator').style.display = 'none';
    }
  }
};

function playSegment(index) {
  if (index >= conversation.length) {
    isPlaying = false;
    document.getElementById('playIndicator').style.display = 'none';
    return;
  }
  currentSegmentIndex = index;
  const seg = conversation[index];

  updateConversationUI(index);
  // JSON의 키(예: "drlee")를 사용해 이미지 경로 설정, 기본 image는 ready.webp에서 덮어씁니다.
  document.getElementById('speakerImage').src = audioBasePath + seg.speaker + ".webp";
  document.getElementById('speakerNameOverlay').textContent = persons[seg.speaker].name;

  const dialogueEl = document.getElementById("dialogueText-" + index);
  dialogueEl.textContent = seg.text;

  globalAudio.src = seg.filePath;
  globalAudio.muted = persons[seg.speaker].muted || persons[seg.speaker].hideEnglish;
  globalAudio.play();
  document.getElementById('playIndicator').style.display = 'inline';
}

function playConversation() {
  if (isPlaying) return;
  isPlaying = true;
  playSegment(currentSegmentIndex);
}

function pauseConversation() {
  isPlaying = false;
  globalAudio.pause();
  document.getElementById('playIndicator').style.display = 'none';
}

function restartConversation() {
  globalAudio.pause();
  currentSegmentIndex = 0;
  playSegment(0);
}

// 업데이트된 대화 UI: 활성화된 대화는 그대로 두고, 나머지는 원래 텍스트로 복원합니다.
function updateConversationUI(activeIndex) {
  conversation.forEach((seg, index) => {
    const segDiv = document.getElementById('segment-' + index);
    const dialogueEl = document.getElementById('dialogueText-' + index);
    if (index === activeIndex) {
      segDiv.classList.add('active');
      segDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      segDiv.classList.remove('active');
      // 이전 대화의 하이라이트를 원래 텍스트로 복원
      dialogueEl.textContent = seg.text;
    }
  });
}

function updateDialogueVisibility() {
  const showGlobalText = document.getElementById('toggleGlobalText').checked;
  const showKoreanText = document.getElementById('toggleKoreanText').checked;
  conversation.forEach((segment, index) => {
    const segDiv = document.getElementById('segment-' + index);
    const engDiv = segDiv.querySelector('.dialogue-text');
    const korDiv = segDiv.querySelector('.korean-text');
    if (!showGlobalText || !persons[segment.speaker].showText) {
      engDiv.style.visibility = 'hidden';
      korDiv.style.visibility = 'hidden';
    } else {
      if (persons[segment.speaker].hideEnglish) {
        engDiv.style.visibility = 'hidden';
        korDiv.style.visibility = 'hidden';
      } else {
        engDiv.style.visibility = 'visible';
        korDiv.style.visibility = showKoreanText ? 'visible' : 'hidden';
      }
    }
  });
}

function updateTextSize() {
  const sizeSelect = document.getElementById('textSizeSelect');
  let fontSize = sizeSelect.value === 'veryLarge' ? '2em' : '1.2em';
  document.querySelectorAll('.dialogue-text').forEach(el => {
    el.style.fontSize = fontSize;
  });
  document.querySelectorAll('.korean-text').forEach(el => {
    el.style.fontSize = fontSize;
  });
}

function initPlayback() {
  currentSegmentIndex = 0;
  isPlaying = false;
}
