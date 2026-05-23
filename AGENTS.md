# AGENTS.md — Spec-Driven Development Guide

이 프로젝트는 **Spec(테스트) 주도 개발**을 따릅니다.
AI 에이전트든, 사람이든 아래 규칙을 반드시 지킵니다.

---

## 공통 운영 규칙

개발 변경을 마친 뒤에는 아래 순서를 지킵니다.

1. 관련 spec/test를 실행합니다.
2. 의도한 파일만 stage합니다.
3. `scripts/agent-commit.sh`로 마지막 커밋을 만듭니다.

사용자가 명시적으로 요청하지 않으면 push 또는 deploy를 실행하지 않습니다.

커밋 메시지는 Jungju 서비스 리포 공통 형식을 사용합니다.

```text
<type>(<scope>): <summary>
```

예시:

```sh
TYPE=feat SUMMARY="add dialogue replay control" scripts/agent-commit.sh
TYPE=test SUMMARY="cover blank quiz scoring" scripts/agent-commit.sh
```

기본 scope는 `eng-meeting`입니다. 허용 type은 `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, `build`, `deploy`, `content`입니다.

---

## 핵심 원칙

1. **Spec First** — 새 기능을 만들기 전에 `.spec.ts` 파일을 먼저 작성합니다.
2. **Engine Layer** — UI(Svelte 컴포넌트)에 비즈니스 로직을 넣지 않습니다. 순수 함수로 `src/lib/engine/`에 작성합니다.
3. **Red → Green → Refactor** — 실패하는 테스트 → 통과시키는 최소 구현 → 리팩터링 순서를 따릅니다.
4. **테스트 없는 PR 금지** — 로직 변경에는 반드시 대응하는 spec이 있어야 합니다.

---

## 프로젝트 구조

```
src/
├── lib/
│   ├── engine/              ← 비즈니스 로직 (순수 함수, 테스트 대상)
│   │   ├── sentence.ts      ← 문장 재생 엔진
│   │   ├── sentence.spec.ts
│   │   ├── flash.ts         ← 플래시 퀴즈 엔진
│   │   ├── flash.spec.ts
│   │   ├── blank.ts         ← 빈칸 채우기 엔진
│   │   ├── blank.spec.ts
│   │   ├── navigation.ts    ← 내비게이션/그룹 로직
│   │   ├── navigation.spec.ts
│   │   └── index.ts         ← 배럴 re-export
│   └── components/          ← 공용 Svelte 컴포넌트 (UI만)
├── routes/                  ← SvelteKit 페이지 (engine 함수를 import해서 사용)
├── test/
│   ├── setup.ts             ← Vitest 전역 설정
│   └── mocks/$app/          ← SvelteKit 모듈 스텁
e2e/                         ← Playwright E2E 테스트
```

---

## 개발 워크플로우

### 새 기능 추가 시

```bash
# 1. spec 파일 먼저 작성
#    src/lib/engine/새기능.spec.ts

# 2. 테스트 실행 → 빨간불 확인
yarn test

# 3. 엔진 함수 구현 → 초록불
#    src/lib/engine/새기능.ts

# 4. index.ts에 re-export 추가

# 5. 컴포넌트에서 import해서 UI 연결
#    src/routes/.../+page.svelte

# 6. 필요하면 E2E 테스트 추가
#    e2e/새기능.spec.ts

# 7. 전체 테스트 통과 확인
yarn test:all
```

### 기존 기능 수정 시

```bash
# 1. 기존 spec에 변경 사항 반영 (또는 새 케이스 추가)
# 2. 빨간불 확인
# 3. 엔진 코드 수정 → 초록불
# 4. 전체 테스트 통과 확인
yarn test
```

---

## 테스트 명령어

| 명령어 | 설명 |
|---|---|
| `yarn test` | 유닛 테스트 1회 실행 |
| `yarn test:watch` | 파일 변경 시 자동 재실행 |
| `yarn test:coverage` | 커버리지 리포트 포함 |
| `yarn test:ui` | Vitest UI 브라우저 |
| `yarn test:e2e` | Playwright E2E 테스트 |
| `yarn test:e2e:ui` | Playwright UI 모드 |
| `yarn test:all` | 유닛 + E2E 전체 |

또는 `make test`, `make test-watch`, `make test-e2e`, `make test-all`

---

## 코드 작성 규칙

### Engine 모듈 (`src/lib/engine/`)

- **순수 함수만** — DOM, `fetch`, `Audio`, Svelte store 등 사용 금지
- **의존성 주입** — 랜덤 함수 등 외부 의존은 매개변수로 주입 (`randomFn: () => number`)
- 타입은 같은 파일에 `export interface/type`으로 선언
- 배럴 파일 `index.ts`에 모든 public export 등록

### Spec 파일 (`*.spec.ts`)

- 엔진 파일과 **같은 디렉토리**, 같은 이름 (`sentence.ts` → `sentence.spec.ts`)
- `describe` 블록으로 함수별 그룹화
- 엣지 케이스(빈 배열, -1, 경계값) 반드시 테스트
- 랜덤 로직은 seeded random으로 결정적 테스트 작성

### Svelte 컴포넌트 (`src/routes/`)

- 엔진 함수를 import해서 사용, 자체 로직 최소화
- 컴포넌트 내부에 알고리즘/계산 로직을 작성하지 않음
- UI 동작은 E2E 테스트(`e2e/`)로 검증

---

## 엔진 모듈 현황

### `sentence.ts` — 문장 재생 엔진

| 함수 | 역할 |
|---|---|
| `buildAudioQueue(lang)` | 재생할 오디오 큐 생성 |
| `audioFilePath(base, folder, idx)` | 오디오 파일 경로 생성 |
| `cycleRepeat(mode)` | 반복 모드 순환 (none→one→all) |
| `cycleDisplay(mode)` | 표시 모드 순환 (both→hideKor→hideEng) |
| `cycleAudioLang(lang)` | 오디오 언어 순환 (eng→kor→both) |
| `nextPlaybackAction(state)` | 다음 재생 액션 결정 (play/stop) |
| `gapLabel`, `displayLabel`, `audioLabel`, `repeatLabel` | UI 라벨 생성 |

### `flash.ts` — 플래시 퀴즈 엔진

| 함수 | 역할 |
|---|---|
| `pickRandomIndex(state)` | 미출제 문장 랜덤 선택 |
| `isFlashDone(state)` | 퀴즈 완료 여부 판단 |
| `maskWord(word, level)` | 단어 마스킹 (힌트 레벨별) |
| `maskedSentence(sent, level)` | 문장 전체 마스킹 |
| `flashCountLabel`, `flashGapLabel` | UI 라벨 생성 |

### `blank.ts` — 빈칸 채우기 엔진

| 함수 | 역할 |
|---|---|
| `prepareBlanks(sentence, pool, randomFn)` | 빈칸 문제 생성 |
| `evaluateChoice(nodes, choices, ptr, answer)` | 선택 평가 |
| `buildWordPool(sentences)` | 단어 풀 구성 |
| `calcScore(correct, total)` | 점수 계산 |
| `cleanWord`, `shuffle` | 유틸리티 |

### `navigation.ts` — 내비게이션 로직

| 함수 | 역할 |
|---|---|
| `buildSections(items, info, order)` | 그룹별 섹션 구성 |
| `linkFor(item, basePath)` | 아이템 링크 생성 |
| `TYPE_META` | 타입별 메타 정보 (라벨, 배지 CSS) |

---

## 새 엔진 모듈 추가 가이드

```bash
# 1. spec 파일 생성
touch src/lib/engine/새모듈.spec.ts

# 2. 테스트 케이스 작성
cat > src/lib/engine/새모듈.spec.ts << 'EOF'
import { describe, it, expect } from 'vitest';
import { myFunction } from '$lib/engine/새모듈';

describe('myFunction', () => {
  it('기본 동작을 수행한다', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
EOF

# 3. yarn test → 빨간불 확인
# 4. 엔진 구현
# 5. index.ts에 re-export 추가
# 6. yarn test → 초록불 확인
```

---

## AI 에이전트를 위한 지침

- **코드를 수정하기 전에 항상 관련 spec 파일을 먼저 확인**합니다.
- 로직 변경 시 **spec을 먼저 업데이트**하고, 테스트가 실패하는 것을 확인한 후 구현합니다.
- 컴포넌트(`.svelte`)에 계산/판단 로직을 직접 작성하지 않습니다.
- `src/lib/engine/`의 순수 함수로 작성하고, 컴포넌트에서 import합니다.
- 새 기능 구현이 끝나면 반드시 `yarn test`로 전체 테스트를 실행합니다.
- DOM이나 브라우저 API에 의존하는 동작은 E2E 테스트(`e2e/`)로 검증합니다.
