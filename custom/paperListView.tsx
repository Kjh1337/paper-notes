import { BasesEntry, ViewRendererProps } from "@quartz-community/bases-page"
import { FullSlug, joinSegments, pathToRoot, resolveRelative } from "../quartz/util/path"
import { displayTag } from "./tagNames"

// ────────────────────────────────────────────────────────────────
//  논문 목록 뷰 (.base 파일에서 `type: paperList` 로 사용)
//
//  한 항목이 이렇게 그려집니다 (박스 없이, 아래 얇은 구분선만):
//
//    [논문리뷰] 논문 원제                                     ┌────────┐
//    2017년 12월 6일 · NeurIPS 2017                          │ 썸네일  │
//    한 줄 요약 (3줄까지)                                      └────────┘
//    Attention, Architecture, LLM
//    ──────────────────────────────────────────────────────────────────
//
//  읽어들이는 frontmatter: title, venue, year, thumbnail,
//                         description, created(date), tags
//  스타일은 quartz/styles/custom.scss 의 "논문 목록" 절에 있습니다.
// ────────────────────────────────────────────────────────────────

const str = (value: unknown): string => (typeof value === "string" ? value.trim() : "")

/** "NeurIPS 2017" / "NeurIPS" / "2017" — 있는 것만 이어 붙입니다. */
function formatVenue(properties: Record<string, unknown>): string {
  const venue = str(properties.venue)
  const year = typeof properties.year === "number" ? String(properties.year) : str(properties.year)
  return [venue, year].filter(Boolean).join(" ")
}

function formatDate(entry: BasesEntry, locale: string): string {
  const raw = entry.properties.created ?? entry.properties.date ?? entry.fileProperties.created
  if (!raw) return ""
  const date = raw instanceof Date ? raw : new Date(raw as string)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })
}

/**
 * 썸네일 경로를 URL로 바꿉니다.
 * - http(s):// 로 시작하면 그대로
 * - 그 외에는 content 폴더 기준 경로로 봅니다. 예) images/attention.png
 */
function resolveThumbnail(entry: BasesEntry, slug: string): string {
  const raw = str(entry.properties.thumbnail ?? entry.properties.image)
  if (!raw) return ""
  if (/^https?:\/\//.test(raw)) return raw
  return joinSegments(pathToRoot(slug as FullSlug), raw.replace(/^\/+/, ""))
}

function collectTags(entry: BasesEntry): string[] {
  const raw = entry.properties.tags ?? entry.fileProperties.tags
  if (Array.isArray(raw)) return raw.map((tag) => String(tag)).filter(Boolean)
  return str(raw) ? [str(raw)] : []
}

/** 한 페이지에 보여 줄 글 수 */
const PER_PAGE = 10

export const paperListView = ({ entries, view, slug, locale }: ViewRendererProps) => {
  const limited = view.limit ? entries.slice(0, view.limit) : entries

  if (limited.length === 0) {
    return <p class="paper-list-empty">아직 정리된 리뷰가 없습니다.</p>
  }

  const pageCount = Math.ceil(limited.length / PER_PAGE)

  return (
    <>
      <ul class="paper-list">
        {limited.map((entry, index) => {
          const href = resolveRelative(slug as FullSlug, entry.slug as FullSlug)
          const description = str(entry.properties.description)
          const venue = formatVenue(entry.properties)
          const date = formatDate(entry, locale)
          const thumbnail = resolveThumbnail(entry, slug)
          const tags = collectTags(entry)
          // 날짜를 앞에 둡니다 — 목록에서 먼저 보고 싶은 건 언제 쓴 글인지입니다.
          // 저자는 여기 안 넣습니다. 글을 열면 제목 아래에 나옵니다.
          const meta = [date, venue].filter(Boolean)

          const page = Math.floor(index / PER_PAGE) + 1

          return (
            <li class="paper-item" data-page={page} hidden={page !== 1}>
              <div class="paper-item-main">
                <h3 class="paper-item-title">
                  <a href={href}>{entry.title}</a>
                </h3>
                {meta.length > 0 && (
                  <p class="paper-item-meta">
                    {meta.map((part, i) => (
                      <>
                        {i > 0 && <span class="paper-item-sep">·</span>}
                        <span>{part}</span>
                      </>
                    ))}
                  </p>
                )}
                {description && (
                  <a class="paper-item-desc-link" href={href} tabIndex={-1}>
                    <p class="paper-item-desc">{description}</p>
                  </a>
                )}
                {tags.length > 0 && (
                  <ul class="tags paper-item-tags">
                    {tags.map((tag) => (
                      <li>
                        <a
                          class="internal tag-link"
                          href={resolveRelative(slug as FullSlug, `tags/${tag}` as FullSlug)}
                        >
                          {displayTag(tag)}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {thumbnail && (
                <a class="paper-item-thumb" href={href} tabIndex={-1} aria-hidden="true">
                  <img src={thumbnail} alt="" loading="lazy" />
                </a>
              )}
            </li>
          )
        })}
      </ul>
      {pageCount > 1 && (
        <nav class="paper-pagination" aria-label="페이지 이동">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              type="button"
              class={i === 0 ? "paper-page-btn active" : "paper-page-btn"}
              data-page={i + 1}
              aria-current={i === 0 ? "page" : undefined}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      )}
    </>
  )
}

// 페이지 전환 스크립트.
// 글은 전부 HTML에 들어 있고(검색 엔진에도 다 잡힙니다), 현재 페이지만 보여 줍니다.
// 주소는 건드리지 않고 sessionStorage에 기억해 둡니다 — 글을 열었다 뒤로 가면 보던 페이지로 돌아옵니다.
export const paperListScript = `
document.addEventListener("nav", () => {
  const list = document.querySelector(".paper-list")
  const pager = document.querySelector(".paper-pagination")
  if (!list || !pager) return

  const items = Array.from(list.querySelectorAll(".paper-item"))
  const buttons = Array.from(pager.querySelectorAll(".paper-page-btn"))
  const pageCount = buttons.length

  const stored = parseInt(sessionStorage.getItem("paperListPage") ?? "1", 10)
  const start = Number.isNaN(stored) ? 1 : Math.min(Math.max(stored, 1), pageCount)

  const apply = (page, scroll) => {
    sessionStorage.setItem("paperListPage", String(page))
    for (const item of items) {
      item.hidden = Number(item.dataset.page) !== page
    }
    for (const button of buttons) {
      const isCurrent = Number(button.dataset.page) === page
      button.classList.toggle("active", isCurrent)
      if (isCurrent) button.setAttribute("aria-current", "page")
      else button.removeAttribute("aria-current")
    }
    if (scroll) window.scrollTo({ top: 0, behavior: "smooth" })
  }

  apply(start, false)
  for (const button of buttons) {
    button.addEventListener("click", () => apply(Number(button.dataset.page), true))
  }
})
`

export const paperListRegistration = {
  id: "paperList",
  name: "Paper Review",
  render: paperListView,
}
