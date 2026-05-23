# eng-meeting

직장/일상 영어 실전 회화 학습을 위한 **SvelteKit 웹 앱**입니다.
각 페이지에서 학습 방식은 다르지만, 공통적으로 `static/assets`의 JSON/오디오 자원을 불러와 반복 학습과 즉시 판정 중심으로 동작합니다.

Live: **https://study.jjgo.io**

---

## 문서

- `docs/spec.md`: Codex가 먼저 읽는 제품 범위와 문서 우선순위
- `README.md`: 라우트, 용어, 프로젝트 구조, 콘텐츠 추가 가이드
- `AGENTS.md`: spec-first 개발 규칙과 검증 명령
- `*.spec.ts`: 제품 문서가 아니라 실행 가능한 테스트 spec

---

## 1) 프로젝트 한눈보기

- **홈 화면**: 학습 세트(아이템 묶음) 목록 표시 및 타입별 진입
- **공통 구조**: 화면은 Svelte, 핵심 로직은 `src/lib/engine/*`의 순수 함수
- **데이터 기반**: `static/assets`의 정적 자원(JSON/MP3/이미지)

### 페이지 타입(라우트)

| 타입 ID | 라우트 | 설명 |
|---|---|---|
| `sentence` | `/sentence/[id]` | 문장 반복 학습(영문/한글 표시 토글, 재생 제어) |
| `flash` | `/flash/[id]` | 랜덤 선택형 플래시(간격 조절) |
| `flash2` | `/flash2/[id]` | 힌트 레벨/숨김 토글이 있는 확장형 플래시 |
| `blank` | `/blank/[id]` | 빈칸 채우기 퀴즈(다지선다) |
| `dialogue` | `/dialogue/[id]` | 대화 음성 연습(화자/사진 포함) |
| `tense` | `/tense` | 시제 표 기반 연습(Q1/Q2 모드) |
| `sentencemd` | `/sentencemd/[id]` | 마크다운 기반 문서 + 라인별 음성 매칭 |

> 홈 화면 타입 라벨은 `src/lib/engine/navigation.ts`의 `TYPE_META`에서 관리합니다.

---

## 2) 용어 정리(권장 표기)

### 2-1. 학습 객체/흐름

- **세트(Set)**: 한 주제의 학습 묶음 (`ysword1`, `story_s1` 등)
- **항목(Item)**: 세트 내 하나의 문장/문항
- **카드(Card)**: 화면에서 보여지는 하나의 문장 블록
- **라운드(Round)**: 세트 내 출제 반복의 한 흐름 구간
- **세션(Session)**: 현재 플레이 상태(현재 인덱스, 반복 상태, 타이머 등)

### 2-2. 상태/모드 용어

- **표시 모드(Display)**
  - `both`: 영문+한글 모두 표시
  - `hideKor`: 한글 가림
  - `hideEng`: 영문 가림
- **음성 언어(Audio Language)**
  - `eng`: 영어 음성
  - `kor`: 한국어 음성
  - `both`: 영어→한국어 연속 재생
- **반복 모드(Repeat Mode)**
  - `none`: 현재 항목 1회
  - `one`: 항목 반복 횟수만큼 반복
  - `all`: 세트 전체 순환 반복
- **카운트 제한(Count)**: `10 / 20 / 50 / -1(전체)`
- **갭 간격(Gap)**: 다음 항목 시작 전 대기 초
- **타이머(Time Limit)**: 문제형에서 남은 시간
- **힌트(Hint)**: 가림/노출 단계(Flash+/빈칸 문제에서 사용)

### 2-3. 점검/결과 용어

- **빈칸(Blank)**: 답안 가림 표시 (`_`)
- **정답/오답(Correct/Wrong)**: 즉시 판정
- **점수(Score)**: `정답 수 / 전체 정답 수 * 100`
- **결과 목록(Result List)**: 종료 후 재복습 가능한 항목 목록

---

## 3) 페이지별 상세 용어 정리

### Sentence (`/sentence/[id]`)
- **용어**: 문장 반복, 표시 토글, 언어 토글, 반복 모드
- **컨트롤**: 재생, 반복, 횟수, 표시, 음성언어, 간격, 취침모드
- **특징**: 영문/한글 동시에 재생 큐 지원

### Flash (`/flash/[id]`)
- **용어**: 랜덤 출제, 재생 모드, 결과 복습
- **컨트롤**: 시작/정지, 표시(영/한/숨김), 갭 간격
- **특징**: `ALL` 진행 완료 후 결과 리스트

### Flash+ (`/flash2/[id]`)
- **용어**: 제한 개수(count), 힌트 레벨, 언어 모드, 문장 숨김
- **컨트롤**: 시작/정지, 개수, 힌트, 언어, 숨김, 갭
- **특징**: 같은 문장을 다양한 힌트 레벨로 반복 암기

### Blank (`/blank/[id]`)
- **용어**: 빈칸 생성, 보기 선택, 정답 판정, 정답률
- **컨트롤**: 시작/정지, 개수, 제한 시간
- **특징**: 문장 단위로 여러 빈칸을 순차 정답 처리

### Dialogue (`/dialogue/[id]`)
- **용어**: 대사 세그먼트, 연속 재생, 화자 사진
- **컨트롤**: 재생/일시정지, 반복(없음/전체/세그먼트), 한글 ON/OFF, 글자 크기, 사진 ON/OFF
- **특징**: 대사 클릭 재생 + 좌/우 연속 재생 흐름

### Tense (`/tense`)
- **용어**: 시제 훈련, Q1(빈칸), Q2(추측), 정보셋 전환
- **컨트롤**: 개별 재생, 전체 재생, 모드 전환(Q1/Q2), 정답 표시
- **특징**: 동사시제 표를 통한 구조적 반복 학습

### Sentence MD (`/sentencemd/[id]`)
- **용어**: 문서 라인, 라인 매칭 오디오, 한글 제거
- **컨트롤**: 재생, 반복(없음/전체/단일항목), 글자 크기, 한글 제거
- **특징**: 마크다운 라인을 음성과 연결한 텍스트-리스닝 연습

---

## 4) 코드 기준으로 읽는 실행 흐름(요약)

### 공통 엔진

- `sentence.ts`: 표시/언어/반복/타이밍 유틸
- `flash.ts`: 랜덤 출제, 마스킹, 완독 판단
- `blank.ts`: 빈칸 생성, 보기 생성, 채점, 점수 계산
- `navigation.ts`: 홈 리스트 데이터 구조(`TYPE_META`)와 그룹/타입 라우팅

### 홈/목록

`src/routes/+page.svelte`의 `itemsList`에서 세트 메타데이터를 관리합니다.
타입별로 `type` 값이 라우트와 연결되며, 그룹별 분류는 `group` 값으로 구분합니다.

---

## 5) 프로젝트 구조

```text
src/
├── lib/
│   ├── components/
│   └── engine/
│       ├── sentence.ts
│       ├── flash.ts
│       ├── blank.ts
│       ├── navigation.ts
│       ├── index.ts
│       └── *.spec.ts
├── routes/
│   ├── +page.svelte
│   ├── sentence/[id]/+page.svelte
│   ├── flash/[id]/+page.svelte
│   ├── flash2/[id]/+page.svelte
│   ├── blank/[id]/+page.svelte
│   ├── dialogue/[id]/+page.svelte
│   ├── tense/+page.svelte
│   └── sentencemd/[id]/+page.svelte

test/
├── e2e/
└── utils/

static/
└── assets/
    ├── sentence/
    ├── dialogue/
    ├── sentencemd/
    └── tense/
```

---

## 6) 실행 방법

```bash
npm install
npm run dev
npm run test
npm run test:watch
npm run test:e2e
npm run test:all
npm run build
```

현재 기준 테스트: 4개 엔진 spec + 71개 유닛 테스트(구성 변경 시 갱신).

## 배포

- `main` 브랜치 push 시 `.github/workflows/deploy-pages.yml`이 GitHub Pages에 배포합니다.
- 수동 재배포가 필요하면 `gh workflow run deploy-pages.yml --ref main`을 실행합니다.
- 로컬에서 `gh-pages` 브랜치로 직접 publish하지 않습니다.

---

## 7) 새 콘텐츠 추가 가이드(정리용)

### 문장/퀴즈형

1. `static/assets/sentence/<set-id>/sentences.json` 생성
2. `audio/` 및 필요 시 `audiok/` 업로드
3. 홈의 `itemsList`에 `type`(`sentence|flash|flash2|blank`)과 `group` 지정

### 대화형

1. `static/assets/dialogue/<set-id>/dialogue.json` 생성
2. `audio/`, 화자 이미지 추가
3. `itemsList`에 `type: "dialogue"` 지정

### 문서형

1. `static/assets/sentencemd/<set-id>/main.md` 및 `sentences.json` 생성
2. 라인 텍스트와 오디오 파일명 매핑 정리
3. `itemsList`에 `type: "sentencemd"` 지정

---

## 8) 추천 용어(문서 통일용)

- Blank: 빈칸 퀴즈
- Flash: 랜덤 반복 학습
- Flash+: 힌트 플래시 학습
- Sentence: 문장 반복 학습
- Tense: 시제 퀴즈
- Gap: 항목 간 간격
- Count: 출제 개수 제한(전체=-1)
- Hint: 힌트 레벨
- Result: 결과 목록

---

## Author

**Jungju Lee** — Medical AI / Platform / DevOps Engineer

## License

Personal project. License TBD.
