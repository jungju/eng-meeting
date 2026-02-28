# eng-meeting

실생활 영어 학습 웹앱 — 문장 반복, 플래시 퀴즈, 빈칸 채우기, 대화 연습

Live: **https://study.jjgo.io**

---

## 무엇을 하는 앱인가

직장·일상에서 실제 쓰는 영어 문장을 **듣고, 반복하고, 테스트**하는 개인 학습 도구입니다.

- 문장 카드를 넘기며 영어/한국어 음성 반복 재생
- 플래시 퀴즈로 랜덤 출제 + 힌트 마스킹
- 빈칸 채우기로 능동적 문장 완성 연습
- 대화 시뮬레이션으로 롤플레이 학습
- 시제별 집중 훈련 모드

딸의 영어 공부에도 함께 쓰고 있어서, UX를 단순하게 유지합니다.

---

## 학습 모드

| 모드 | 경로 | 설명 |
|---|---|---|
| **Sentence** | `/sentence/[id]` | 영어·한국어 문장 카드, 음성 반복 재생, 표시 토글 |
| **Flash** | `/flash/[id]` | 랜덤 출제, 시간 카운트다운, 결과 리스트 |
| **Flash+** | `/flash2/[id]` | 힌트 마스킹(5단계), 언어·문장 숨김 토글 |
| **Blank** | `/blank/[id]` | 빈칸 채우기, 10지선다, 점수 계산 |
| **Dialogue** | `/dialogue/[id]` | 대화 시뮬레이션, 화자별 음성 재생 |
| **Tense** | `/tense` | 시제별 문장 테이블, 빈칸·추측 모드 |
| **Sentence MD** | `/sentencemd/[id]` | 마크다운 기반 문장 + 음성 연동 |

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | SvelteKit 2 + Svelte 5 |
| 스타일링 | Tailwind CSS 4 |
| 빌드 | Vite 7 |
| 언어 | TypeScript |
| 배포 | GitHub Pages (Static Adapter) |
| 유닛 테스트 | Vitest |
| E2E 테스트 | Playwright |
| 음성 | ElevenLabs TTS (Go 스크립트로 생성) |

---

## 프로젝트 구조

```
src/
├── lib/
│   ├── engine/              ← 비즈니스 로직 (순수 함수)
│   │   ├── sentence.ts      ← 문장 재생 엔진
│   │   ├── flash.ts         ← 플래시 퀴즈 엔진
│   │   ├── blank.ts         ← 빈칸 채우기 엔진
│   │   ├── navigation.ts    ← 내비게이션/그룹 로직
│   │   ├── *.spec.ts        ← 각 모듈의 스펙 테스트
│   │   └── index.ts         ← 배럴 export
│   └── components/          ← 공용 컴포넌트 (ControlBar 등)
├── routes/                  ← 페이지 (engine을 import해서 사용)
│   ├── +page.svelte         ← 홈 (학습 세트 목록)
│   ├── sentence/[id]/       ← 문장 반복 학습
│   ├── flash/[id]/          ← 플래시 퀴즈
│   ├── flash2/[id]/         ← 플래시+ (힌트 마스킹)
│   ├── blank/[id]/          ← 빈칸 채우기
│   ├── dialogue/[id]/       ← 대화 롤플레이
│   └── tense/               ← 시제 훈련
├── test/                    ← Vitest 설정 & $app 모킹
e2e/                         ← Playwright E2E 테스트
static/assets/               ← 학습 데이터 (JSON + MP3)
utils/                       ← Go 기반 음성 생성 도구
```

---

## 시작하기

```bash
# 의존성 설치
yarn install

# 개발 서버 (http://localhost:8088)
yarn dev

# 빌드
yarn build

# 배포
yarn deploy
```

---

## 테스트

Spec 주도 개발을 따릅니다. 자세한 가이드는 [AGENTS.md](AGENTS.md)를 참고하세요.

```bash
# 유닛 테스트
yarn test

# 감시 모드 (파일 변경 시 자동 실행)
yarn test:watch

# E2E 테스트
yarn test:e2e

# 전체 테스트 (유닛 + E2E)
yarn test:all
```

현재 **71개 유닛 테스트**, **4개 E2E 시나리오**가 있습니다.

---

## 개발 원칙

1. **Spec First** — 기능 구현 전에 테스트를 먼저 작성
2. **Engine 분리** — 비즈니스 로직은 `src/lib/engine/`에 순수 함수로 작성
3. **컴포넌트는 UI만** — Svelte 파일에 알고리즘/계산 로직을 넣지 않음
4. **Red → Green → Refactor** — 실패 → 통과 → 개선 순서

---

## 콘텐츠 추가

### 새 문장 세트 추가

1. `static/assets/sentence/새세트/sentences.json` 작성:
   ```json
   { "sentences": ["Hello.", "How are you?"], "korean": ["안녕.", "어떻게 지내?"] }
   ```
2. `utils/`의 Go 스크립트로 음성 파일 생성
3. `src/routes/+page.svelte`의 `itemsList`에 항목 추가

### 새 학습 모드 추가

1. `src/lib/engine/새모드.spec.ts` — 테스트 먼저 작성
2. `src/lib/engine/새모드.ts` — 순수 함수 구현
3. `src/lib/engine/index.ts` — re-export 추가
4. `src/routes/새모드/[id]/+page.svelte` — UI 연결
5. `e2e/새모드.spec.ts` — E2E 테스트 추가

---

## Author

**Jungju Lee** — Medical AI / Platform / DevOps Engineer

---

## License

Personal project. License TBD.
