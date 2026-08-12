# Paper Notes

논문 리뷰 블로그. 옵시디언에서 작성한 마크다운을 그대로 `content/`에 넣으면 정적 사이트로 발행됩니다.
[Quartz v5](https://quartz.jzhao.xyz) 기반이라 `[[위키링크]]`, `![[이미지]]`, `> [!note]` 콜아웃, `$수식$`이 변환 없이 그대로 렌더링됩니다.

## 글 쓰기

1. 옵시디언에서 리뷰를 작성합니다. (`content/templates/논문 리뷰 템플릿.md` 참고)
2. 완성된 `.md` 파일을 `content/papers/` 에 복사합니다. **하위 폴더는 만들지 않습니다** — 분류는 태그로 합니다.
3. 본문 이미지는 글과 같은 폴더에 두고 `![[그림.png]]`로 삽입합니다.
4. 목록 썸네일은 `content/images/` 에 넣고 frontmatter `thumbnail`에 경로를 씁니다.
5. 로컬에서 확인 → 커밋 & 푸시하면 자동 배포됩니다.

### frontmatter

```yaml
---
title: "[논문리뷰] Attention Is All You Need" # 제목 양식 — 반드시 이대로
authors: Vaswani et al.
venue: NeurIPS # 학회
year: 2017 # 발표 연도
link: https://arxiv.org/abs/1706.03762 # 논문 링크 (글 상단에 버튼으로)
code: https://github.com/... # 코드 링크 (없으면 생략)
thumbnail: images/attention.png # 목록 오른쪽 썸네일 (없으면 생략)
description: 목록에 보일 요약. 3줄까지 나오고 넘치면 말줄임. # 검색·SNS 미리보기에도 쓰임
created: 2026-08-12 # 작성일 (date: 로 써도 됨)
tags: # 분야 · 주제 · 학회를 전부 태그로
  - LLM
  - Attention
  - NeurIPS
aliases: # 다른 이름으로도 접근 가능하게
  - Transformer 논문
draft: true # 있으면 발행 안 됨. 완성 후 지우거나 false로
---
```

> [!important] 제목 양식
> `[논문리뷰] 논문 원제` — 한국어로 의역하지 말고 논문 원제를 그대로 씁니다.
> 이 값이 목록·브라우저 탭·breadcrumb·검색 결과에 전부 그대로 쓰이므로, 여기서 통일하면 사이트 전체가 통일됩니다.

`venue` / `year` / `authors` / `link` / `code` 는 글 상단 정보 줄이 **자동으로** 만들어 줍니다.
본문에 `| 항목 | 내용 |` 표를 손으로 그릴 필요가 없습니다.

### 태그 표시 이름

Quartz는 태그를 전부 소문자로 바꿉니다 (`GABM` → `gabm`).
화면에 보이는 글자는 [`custom/tagNames.ts`](./custom/tagNames.ts)에서 되돌립니다.
새로 쓰기 시작한 약어 태그는 여기에 한 줄 추가하세요. 등록하지 않으면 `In Context Learning`처럼 단어별 대문자로 표시됩니다.

## 로컬에서 보기

```bash
npm run quartz build -- --serve   # http://localhost:8080, 파일 저장 시 자동 새로고침
npx quartz build                  # public/ 에 정적 파일만 생성
```

Quartz 자체 문서를 로컬에서 읽으려면 `npm run docs` (http://localhost:8080).

## 폴더 구조

```
content/
├── index.md             홈 — Paper Review.base 를 그대로 띄웁니다
├── Paper Review.base    전체 논문 목록 (쿼리 정의)
├── papers/              논문 리뷰 — 하위 폴더 없이 전부 여기
├── images/              목록 썸네일
├── templates/           옵시디언 템플릿 (빌드 제외)
└── private/             비공개 노트 (빌드 제외 + git 제외)
```

실제로 만들어지는 페이지는 이게 전부입니다.

| URL                | 내용                     |
| ------------------ | ------------------------ |
| `/`                | 논문 목록 (이게 홈)      |
| `/papers/<파일명>` | 리뷰 본문                |
| `/tags/<태그>`     | 그 분야 논문만 모아 보기 |

- 분야를 나누는 수단은 **폴더가 아니라 태그**입니다. 폴더 목록 페이지와 breadcrumb은 꺼 뒀습니다.
- 왼쪽 사이드바의 **분야** 메뉴는 [`custom/TagNav.tsx`](./custom/TagNav.tsx)가 태그를 세어 자동으로 만듭니다.
  학회 태그(NeurIPS 등)는 `custom/tagNames.ts`의 `VENUE_TAGS`로 걸러 내서 여기 안 나옵니다.
- `private/`는 `.gitignore`와 `quartz.config.yaml`의 `ignorePatterns`에 모두 들어 있어, 실수로 공개되지 않습니다.

## 목록 화면 손보기

홈의 논문 목록은 [`custom/paperListView.tsx`](./custom/paperListView.tsx)가 그립니다.
`.base` 파일에서 `type: paperList` 로 불러 쓰는 커스텀 뷰입니다.

| 바꿀 것              | 위치                                          |
| -------------------- | --------------------------------------------- |
| 항목에 무엇을 넣을지 | `custom/paperListView.tsx`                    |
| 글자 크기 · 여백     | `quartz/styles/custom.scss` 의 "논문 목록" 절 |
| 목록에 넣을 글 조건  | `content/Paper Review.base` 의 `filters`      |
| 정렬                 | 같은 파일의 `sort`                            |

제목은 사이트 제목과 같은 명조(`--headerFont`)입니다. 본문 산세리프로 바꾸려면
`.paper-item-title` 의 `font-family`를 `var(--bodyFont)`로 바꾸세요.

## 프로필 (왼쪽 사이드바)

사진 · 이름 · 한 줄 소개 · 위치 · 링크는 [`custom/ProfileCard.tsx`](./custom/ProfileCard.tsx) 맨 위 `PROFILE` 상수에서 바꿉니다.

| 바꿀 것 | 방법                                                              |
| ------- | ----------------------------------------------------------------- |
| 사진    | `quartz/static/profile.png` 를 본인 사진으로 덮어쓰기 (정사각형)  |
| 이름    | `PROFILE.name`                                                    |
| 소개    | `PROFILE.tagline`                                                 |
| 링크    | `PROFILE.links` (GitHub / Email 아이콘 제공, `ICONS`에 추가 가능) |

## 홈 = 전체 논문 목록

[`content/Paper Review.base`](<./content/Paper Review.base>)는 옵시디언 [Bases](https://help.obsidian.md/bases) 파일입니다.
`papers/` 아래 모든 글을 작성일 내림차순으로 모읍니다. 옵시디언에서 그대로 열어 편집할 수 있습니다.

홈([`content/index.md`](./content/index.md))은 이 파일을 `![[Paper Review.base]]` 한 줄로 그대로 띄웁니다.
따라서 블로그에 들어오면 바로 전체 목록이 보이고, 탐색기 메뉴에는 중복으로 나타나지 않습니다.

## 설정

전부 [`quartz.config.yaml`](./quartz.config.yaml) 한 곳에 있습니다. 자주 건드릴 항목:

| 항목           | 위치                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| 사이트 제목    | `configuration.pageTitle`                                              |
| 배포 주소      | `configuration.baseUrl`                                                |
| 색상           | `configuration.theme.colors`                                           |
| 폰트           | `@quartz-community/quartz-fonts` (theme.typography와 값을 맞춰 주세요) |
| 그래프 뷰 켜기 | `@quartz-community/graph`                                              |
| 댓글 (giscus)  | `@quartz-community/comments`                                           |
| BibTeX 인용    | `@quartz-community/citations`                                          |

- 읽기 화면의 세부 스타일(줄 간격, 표, 카드, 프로필, 푸터 등)은 [`quartz/styles/custom.scss`](./quartz/styles/custom.scss)에 있습니다.
- YAML로 표현할 수 없는 것(탐색기 글 개수·필터, 프로필 카드 삽입)은 [`quartz.ts`](./quartz.ts)에 있습니다.

> [!note] 푸터의 "Created with Quartz"
> Quartz는 MIT 라이선스라 이 문구를 화면에 표시할 의무는 없습니다. 지금은 저작권 한 줄처럼 작게 줄여 뒀고,
> 통째로 없애려면 `@quartz-community/footer`를 `enabled: false`로 바꾸면 됩니다. (RSS 링크도 같이 사라집니다.)

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 빌드해서 GitHub Pages로 올립니다.
([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml))

최초 1회만 설정이 필요합니다.

1. GitHub에 저장소를 만들고 연결
   ```bash
   git remote add origin https://github.com/<사용자명>/<저장소명>.git
   git push -u origin main
   ```
2. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 변경
3. `quartz.config.yaml`의 `baseUrl`을 `<사용자명>.github.io/<저장소명>`으로 수정 후 다시 푸시

## Quartz 업데이트

```bash
npx quartz upgrade
```

업스트림(`jackyzha0/quartz`)은 `upstream` 리모트로 연결되어 있습니다.
