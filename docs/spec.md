# eng-meeting Spec

## Document Role

This file is the stable Codex entrypoint for eng-meeting product scope and
document navigation. It describes product and content behavior. Test specs stay
in `*.spec.ts` files and are the executable checks for engine logic and E2E
behavior.

## Source Of Truth

- `README.md`: product overview, route types, terminology, content guide, and
  commands
- `AGENTS.md`: spec-first development workflow and validation rules
- `src/lib/engine/*.ts`: pure engine logic
- `src/lib/engine/*.spec.ts`: unit test specs for engine logic
- `e2e/*.spec.ts`: Playwright behavior specs
- `static/assets/`: learning content, audio, images, and data files

When these files disagree, use `README.md` for product terminology, `AGENTS.md`
for workflow, and the matching `*.spec.ts` file for executable behavior.

## Product Scope

eng-meeting is a SvelteKit learning app for practical workplace and everyday
English. It loads static JSON/audio/image assets and provides repeated practice,
display toggles, immediate quiz feedback, and result review across multiple page
types.

Current route families include Sentence, Flash, Flash+, Blank, Dialogue, Tense,
and Sentence MD.

## Naming Rule

- `docs/spec.md` is the product/document navigation entrypoint.
- `*.spec.ts` files are tests, not product SPEC documents.
- New product terminology should be reflected in `README.md`.

## Update Rules

- New route families or learning modes update this file and `README.md`.
- Engine behavior changes update the matching `src/lib/engine/*.spec.ts` before
  implementation.
- Browser/UI behavior changes add or update `e2e/*.spec.ts` when needed.
