# Tracker Health

Tracker Health — open-source плагин для Яндекс Трекера, который анализирует качество оформления задачи, рассчитывает Health Score и показывает конкретные рекомендации по улучшению задачи.

## 1. Цель v0.1

Первая версия должна решать одну задачу хорошо:

> При открытии задачи пользователь сразу видит, насколько задача готова к работе и какие проблемы в её оформлении необходимо исправить.

На данном этапе не нужны:

* AI;
* собственный backend;
* PostgreSQL;
* Redis;
* аналитика по всей очереди;
* интеграции с GitLab/Sentry;
* автоматическое изменение задачи;
* сложный конструктор правил.

`v0.1` должен быть маленьким, стабильным и хорошо протестированным.

---

# 2. Основной пользовательский сценарий

Пользователь открывает задачу в Яндекс Трекере.

Tracker Health получает данные задачи и отображает блок:

```text
Tracker Health

76 / 100
Есть рекомендации

✓ Исполнитель назначен
✓ Приоритет указан
✓ Описание заполнено
✓ Тип задачи указан

⚠ Не указана оценка
✕ Нет критериев приёмки

2 рекомендации
```

При раскрытии блока:

```text
Проверки

Исполнитель
✓ Назначен Alexander

Приоритет
✓ Normal

Описание
✓ 427 символов

Оценка
⚠ Оценка задачи не указана

Критерии приёмки
✕ В описании не найден раздел
  "Критерии приёмки"

Рекомендация:
Добавьте условия, при которых задача
может считаться выполненной.
```

---

# 3. Health Score

Health Score находится в диапазоне:

```text
0..100
```

Расчёт:

```ts
score =
  Math.round(
    passedWeight /
    applicableWeight *
    100
  );
```

Правила со статусом `skipped` не участвуют в знаменателе.

Пример:

```text
Rule                    Weight   Result

Assignee                  15     passed
Priority                  10     passed
Description               20     passed
Issue type                10     passed
Estimate                   15     failed
Acceptance Criteria        30     failed

---------------------------------------
Passed                    55
Possible                 100

Health Score              55
```

---

# 4. Статусы Health Score

```ts
export type HealthLevel =
  | 'healthy'
  | 'warning'
  | 'critical';
```

Границы:

```text
90–100       healthy
70–89        warning
0–69         critical
```

Важно: цвет не должен быть единственным способом определения статуса.

UI всегда показывает текст:

```text
Healthy
Есть рекомендации
Требует внимания
```

---

# 5. Правила v0.1

В первой версии реализуем 6 правил.

| Rule ID               | Проверка                             | Weight |
| --------------------- | ------------------------------------ | -----: |
| `assignee`            | назначен исполнитель                 |     15 |
| `priority`            | указан приоритет                     |     10 |
| `description`         | описание не пустое и >= 100 символов |     20 |
| `issue-type`          | указан тип задачи                    |     10 |
| `estimate`            | указана оценка                       |     15 |
| `acceptance-criteria` | есть секция критериев приёмки        |     30 |

Итого:

```text
100 points
```

---

# 6. Acceptance Criteria

На первой версии не пытаемся анализировать смысл текста.

Проверяем наличие одного из заголовков:

```text
Acceptance Criteria
Acceptance criteria
Критерии приёмки
Критерии приемки
Критерии готовности
```

Проверка должна быть case-insensitive.

Допускаются варианты Markdown:

```md
## Acceptance Criteria
```

```md
### Критерии приёмки
```

```md
Критерии приёмки:
```

Не считать достаточным просто случайное употребление слов внутри предложения.

---

# 7. Domain model

Основная модель правила:

```ts
export interface HealthRule {
  id: HealthRuleId;
  name: string;
  description: string;
  weight: number;

  evaluate(context: IssueHealthContext): RuleResult;
}
```

Идентификаторы:

```ts
export type HealthRuleId =
  | 'assignee'
  | 'priority'
  | 'description'
  | 'issue-type'
  | 'estimate'
  | 'acceptance-criteria';
```

Результат проверки:

```ts
export type RuleStatus =
  | 'passed'
  | 'failed'
  | 'skipped';

export interface RuleResult {
  ruleId: HealthRuleId;

  status: RuleStatus;

  weight: number;

  title: string;

  message: string;

  recommendation?: string;
}
```

---

# 8. IssueHealthContext

Health Engine не должен работать напрямую с API Яндекс Трекера.

Сначала данные Tracker преобразуются в нашу domain model.

```ts
export interface IssueHealthContext {
  id: string;

  key: string;

  summary: string;

  description?: string | null;

  assignee?: {
    id: string;
    displayName: string;
  } | null;

  priority?: {
    id: string;
    name: string;
  } | null;

  issueType?: {
    id: string;
    name: string;
  } | null;

  estimation?: number | null;
}
```

Это принципиально важно.

Не должно быть:

```ts
evaluate(trackerIssue)
```

Должно быть:

```ts
const context =
  mapTrackerIssueToHealthContext(issue);

evaluateIssueHealth(context);
```

---

# 9. Итог анализа

```ts
export interface IssueHealthResult {
  score: number;

  level: HealthLevel;

  passedWeight: number;

  totalWeight: number;

  passedRules: number;

  failedRules: number;

  skippedRules: number;

  results: RuleResult[];
}
```

Пример:

```ts
{
  score: 70,

  level: 'warning',

  passedWeight: 70,
  totalWeight: 100,

  passedRules: 4,
  failedRules: 2,
  skippedRules: 0,

  results: [...]
}
```

---

# 10. Health Engine

Основная функция:

```ts
export function evaluateIssueHealth(
  context: IssueHealthContext,
  rules: HealthRule[] = defaultRules,
): IssueHealthResult
```

Алгоритм:

```text
IssueHealthContext
        ↓
     Rules
        ↓
evaluate each rule
        ↓
 RuleResult[]
        ↓
calculate weights
        ↓
calculate score
        ↓
determine level
        ↓
IssueHealthResult
```

Health Engine:

* не импортирует React;
* не импортирует Tracker SDK;
* не работает со storage;
* не делает HTTP-запросов;
* не имеет side effects.

Это чистая domain logic.

---

# 11. Пример правила

```ts
export const assigneeRule: HealthRule = {
  id: 'assignee',

  name: 'Исполнитель',

  description:
    'У задачи должен быть назначен исполнитель.',

  weight: 15,

  evaluate(context) {
    if (context.assignee) {
      return {
        ruleId: 'assignee',
        status: 'passed',
        weight: 15,
        title: 'Исполнитель назначен',
        message: context.assignee.displayName,
      };
    }

    return {
      ruleId: 'assignee',
      status: 'failed',
      weight: 15,
      title: 'Исполнитель не назначен',
      message:
        'У задачи отсутствует исполнитель.',
      recommendation:
        'Назначьте ответственного за выполнение задачи.',
    };
  },
};
```

---

# 12. Структура приложения

```text
src/
├── app/
│   ├── App.tsx
│   └── providers/
│
├── slots/
│   └── issue-block/
│       ├── IssueHealthBlock.tsx
│       ├── IssueHealthBlock.module.css
│       └── index.ts
│
├── domain/
│   └── health/
│       ├── types.ts
│       ├── evaluateIssueHealth.ts
│       ├── getHealthLevel.ts
│       │
│       └── rules/
│           ├── index.ts
│           ├── assignee.rule.ts
│           ├── priority.rule.ts
│           ├── description.rule.ts
│           ├── issue-type.rule.ts
│           ├── estimate.rule.ts
│           └── acceptance-criteria.rule.ts
│
├── infrastructure/
│   └── tracker/
│       ├── tracker.types.ts
│       ├── issue.mapper.ts
│       └── getCurrentIssue.ts
│
├── components/
│   ├── HealthScore/
│   ├── HealthProgress/
│   ├── HealthRuleItem/
│   ├── HealthRulesList/
│   └── HealthSummary/
│
├── shared/
│   ├── constants/
│   ├── utils/
│   └── types/
│
└── main.tsx
```

Тесты:

```text
tests/
└── domain/
    └── health/
        ├── evaluateIssueHealth.test.ts
        └── rules/
            ├── assignee.test.ts
            ├── description.test.ts
            └── acceptance-criteria.test.ts
```

---

# 13. UI architecture

Основной компонент:

```tsx
<IssueHealthBlock>
  <HealthSummary />

  <HealthProgress />

  <HealthRulesList>
    <HealthRuleItem />
    <HealthRuleItem />
    <HealthRuleItem />
  </HealthRulesList>
</IssueHealthBlock>
```

---

# 14. HealthSummary

Пример:

```text
Tracker Health

76 / 100
Есть рекомендации
```

Props:

```ts
interface HealthSummaryProps {
  score: number;
  level: HealthLevel;
}
```

Компонент ничего самостоятельно не рассчитывает.

---

# 15. HealthRuleItem

Состояние passed:

```text
✓ Исполнитель
  Alexander
```

Failed:

```text
✕ Критерии приёмки

В описании не найдены
критерии приёмки.

Добавьте условия, при которых
задача считается выполненной.
```

Props:

```ts
interface HealthRuleItemProps {
  result: RuleResult;
}
```

---

# 16. Loading / Error states

Loading:

```text
Tracker Health

Анализируем задачу…
```

Ошибка:

```text
Tracker Health

Не удалось проанализировать задачу.

[Повторить]
```

Плагин не должен ломать интерфейс Tracker при ошибке SDK.

Любая ошибка должна обрабатываться внутри plugin boundary.

---

# 17. Tracker infrastructure layer

Отдельный mapper:

```ts
export function mapTrackerIssueToHealthContext(
  issue: TrackerIssue,
): IssueHealthContext
```

Это позволит в будущем менять Tracker API, не затрагивая Health Engine.

Например:

```text
Tracker SDK
    ↓
TrackerIssue
    ↓
mapper
    ↓
IssueHealthContext
    ↓
Health Engine
```

---

# 18. Требования к коду

Используем:

```text
TypeScript
React
Gravity UI
Tracker Plugin SDK
Vitest
ESLint
Prettier
```

Правила TypeScript:

```text
strict: true
```

Не использовать:

```ts
any
```

без объективной необходимости.

Все public domain types должны быть явно типизированы.

---

# 19. Тестирование

Особенно хорошо покрываем domain layer.

Минимум:

```text
Health Engine                   100%
Rules                           100%
Mapper                          >= 90%
UI                              основные состояния
```

Обязательные случаи:

```text
все правила passed       → 100

нет assignee             → 85

нет acceptance criteria  → 70

ничего не заполнено      → минимальный score

skipped rule             → исключается из denominator
```

Для description:

```text
null
""
"test"
99 chars
100 chars
500 chars
```

Для Acceptance Criteria:

```text
## Acceptance Criteria

## acceptance criteria

## Критерии приёмки

КРИТЕРИИ ПРИЕМКИ:

"нам нужны хорошие критерии приёмки"
```

Последний пример не должен считаться валидной секцией.

---

# 20. README

README должен сразу объяснять проблему.

```text
# Tracker Health

Quality gate for Yandex Tracker issues.

Tracker Health analyzes issue completeness,
calculates a Health Score and provides
actionable recommendations before work starts.
```

Далее:

```text
Screenshot

Features

How it works

Installation

Development

Architecture

Roadmap

Contributing

License
```

---

# 21. Roadmap

После `v0.1`:

```text
v0.2
Queue-specific rules

v0.3
Custom fields and required description sections

v0.4
Presets by issue type

v0.5
Queue Health dashboard

v0.6
Stale / blocked issue analytics

v0.7
Configuration import/export

v0.8
Localization

v0.9
Marketplace preparation

v1.0
Public release
```

Не реализовывать функции следующих версий заранее.

---

# 22. Definition of Done v0.1

Версия считается завершённой, когда:

```text
□ plugin открывается через issue.block

□ данные текущей задачи получаются через Tracker SDK

□ TrackerIssue преобразуется в IssueHealthContext

□ работают все 6 правил

□ Health Score считается корректно

□ отображается Health Level

□ пользователь видит причину каждого failed rule

□ пользователь видит recommendation

□ есть loading state

□ есть error state

□ domain layer не зависит от React/Tracker SDK

□ unit tests проходят

□ ESLint проходит

□ TypeScript typecheck проходит

□ production build проходит

□ README заполнен

□ GitHub Actions настроен
```

---

# 23. CI

На каждый Pull Request:

```text
install
   ↓
lint
   ↓
typecheck
   ↓
test
   ↓
build
```

Пример scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint src tests",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

# 24. GitHub Issues

Создать milestones:

```text
v0.1 MVP
v0.2 Configuration
v0.5 Analytics
v1.0 Marketplace
```

Issues для `v0.1`:

```text
TH-1 Bootstrap plugin project

TH-2 Add project architecture

TH-3 Implement domain types

TH-4 Implement Health Engine

TH-5 Implement assignee rule

TH-6 Implement priority rule

TH-7 Implement description rule

TH-8 Implement issue type rule

TH-9 Implement estimation rule

TH-10 Implement acceptance criteria rule

TH-11 Implement Tracker issue mapper

TH-12 Implement Health Summary UI

TH-13 Implement rules list

TH-14 Add loading/error states

TH-15 Add unit tests

TH-16 Configure CI

TH-17 Prepare README

TH-18 Release v0.1.0
```

---

# 25. Prompts для Codex

## Prompt 1 — bootstrap

```text
We are building an open-source Yandex Tracker plugin called Tracker Health.

The plugin analyzes the currently opened Tracker issue and displays a Health Score based on issue quality rules.

Tech stack:
- React
- TypeScript strict mode
- Gravity UI
- Yandex Tracker Plugin SDK
- Vitest
- ESLint
- Prettier

Do not implement business functionality yet.

First:

1. Inspect the existing repository.
2. Preserve the structure generated by the official Yandex Tracker plugin tooling where required.
3. Configure TypeScript strict mode.
4. Configure ESLint and Prettier.
5. Add Vitest.
6. Create the following high-level directories:

src/app
src/slots
src/domain/health
src/infrastructure/tracker
src/components
src/shared
tests/domain/health

7. Configure npm scripts:
   lint
   typecheck
   test
   test:watch
   build

8. Do not use `any`.
9. Do not introduce a backend.
10. Do not implement future features.

After making changes, run:
- lint
- typecheck
- tests
- build

Explain briefly what was changed.
```

---

## Prompt 2 — domain model

```text
Implement the domain model for Tracker Health.

The domain layer must not depend on React, Yandex Tracker SDK, browser APIs or network APIs.

Create:

HealthRuleId
RuleStatus
HealthLevel
IssueHealthContext
RuleResult
HealthRule
IssueHealthResult

HealthRuleId values:

assignee
priority
description
issue-type
estimate
acceptance-criteria

RuleStatus:

passed
failed
skipped

HealthLevel:

healthy
warning
critical

IssueHealthContext must contain:

id
key
summary
description
assignee
priority
issueType
estimation

Use explicit TypeScript interfaces/types.

Do not implement rule logic yet.

Add tests/type-level usage where useful.

Run typecheck and tests after implementation.
```

---

## Prompt 3 — scoring engine

```text
Implement the core Tracker Health scoring engine.

Create:

evaluateIssueHealth(
  context: IssueHealthContext,
  rules: HealthRule[]
): IssueHealthResult

Rules with status `skipped` must not contribute to totalWeight.

Score:

Math.round(
  passedWeight / totalWeight * 100
)

Prevent division by zero.

Health levels:

90-100 => healthy
70-89 => warning
0-69 => critical

The engine must be a pure function.

No React.
No Tracker SDK.
No storage.
No fetch.
No side effects.

Add comprehensive Vitest tests covering:

100 score
partial score
0 score
skipped rules
all rules skipped
health level boundaries:
69
70
89
90
100
```

---

## Prompt 4 — rules

```text
Implement the six default Tracker Health rules.

Weights:

assignee             15
priority             10
description          20
issue-type           10
estimate              15
acceptance-criteria   30

Requirements:

Assignee:
passed when assignee exists.

Priority:
passed when priority exists.

Description:
passed when trimmed description length >= 100.

Issue Type:
passed when issueType exists.

Estimate:
passed when estimation exists and is greater than zero.

Acceptance Criteria:
detect a description section with one of these headings:

Acceptance Criteria
Критерии приёмки
Критерии приемки
Критерии готовности

Case-insensitive.

Markdown headings such as:

## Acceptance Criteria
### Критерии приёмки

must work.

Text such as:

"нам нужны хорошие критерии приёмки"

must NOT pass.

Each failed result must contain:
title
message
recommendation

Add unit tests for every rule.

Do not implement UI.
```

---

## Prompt 5 — Tracker adapter

```text
Implement the Yandex Tracker infrastructure adapter.

Goal:

Tracker SDK
→ TrackerIssue
→ mapper
→ IssueHealthContext

Create a TrackerIssue type representing only the fields actually required by Tracker Health.

Implement:

mapTrackerIssueToHealthContext()

Keep all Tracker-specific knowledge inside:

src/infrastructure/tracker

The domain layer must not import anything from this directory.

Handle nullable/missing Tracker fields safely.

Do not use `any`.

Add mapper tests.
```

---

## Prompt 6 — UI

```text
Implement the Tracker Health issue block UI.

Use Gravity UI components where appropriate.

Components:

IssueHealthBlock
HealthSummary
HealthProgress
HealthRulesList
HealthRuleItem

The UI receives IssueHealthResult from the domain layer.

HealthSummary displays:

Tracker Health
{score} / 100
health level text

Translations:

healthy:
"Задача готова"

warning:
"Есть рекомендации"

critical:
"Требует внимания"

Each rule must display:
status
title
message
recommendation when failed

Do not put scoring logic in React components.

Support:
loading state
error state
success state

Keep the interface compact because it is rendered inside an issue.

Make sure the state is understandable without relying only on colors.
```

---

## Prompt 7 — integration

```text
Integrate Tracker Health with the current Yandex Tracker issue.block slot.

Flow:

1. Plugin opens inside the issue.
2. Read current issue data using the official Tracker Plugin SDK.
3. Convert Tracker issue using mapTrackerIssueToHealthContext().
4. Run evaluateIssueHealth().
5. Render IssueHealthBlock.

Architecture must remain:

Tracker SDK
→ infrastructure adapter
→ domain
→ UI

Handle SDK errors gracefully.

The plugin must never crash the containing Tracker UI.

Do not add storage yet.
Do not add settings.
Do not add analytics.
Do not add backend.
```

---

## Prompt 8 — final engineering pass

```text
Perform a complete engineering review of Tracker Health v0.1.

Check:

- architecture boundaries
- TypeScript strictness
- accidental any usage
- unused dependencies
- duplication
- error handling
- React component responsibilities
- accessibility
- test quality
- test edge cases
- build configuration
- lint configuration
- README
- GitHub Actions

Do not add new product features.

Fix only bugs, maintainability issues and technical debt that affect v0.1.

Finally run:

npm run lint
npm run typecheck
npm run test
npm run build

Provide a concise report of changes and any remaining risks.
```

---

# 26. Главное архитектурное правило

Tracker Health должен строиться так:

```text
             Yandex Tracker
                   │
                   ▼
           infrastructure
                   │
                   ▼
              domain
                   │
                   ▼
                  UI
```

Но никогда:

```text
domain → Tracker SDK
domain → React
domain → API
```

Это позволит в дальнейшем использовать тот же Health Engine:

```text
issue.block
queue dashboard
CLI
backend worker
API
tests
```

без переписывания business logic.

---

# 27. Первый релиз

Название git tag:

```text
v0.1.0
```

Release name:

```text
Tracker Health v0.1 — Issue Health Score
```

Основная цель релиза:

> Validate the core concept: can Tracker Health reliably identify poorly prepared issues and provide useful, understandable feedback directly inside Yandex Tracker?
