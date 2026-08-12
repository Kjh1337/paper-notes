import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../quartz/components/types"
import { classNames } from "../quartz/util/lang"

// ────────────────────────────────────────────────────────────────
//  글 상단의 논문 정보 줄. frontmatter 에서 자동으로 만들어집니다.
//
//    Vaswani et al. · NeurIPS 2017 · 논문 ↗ · 코드 ↗
//
//  venue / authors / link 가 전부 없으면 아무것도 그리지 않으므로,
//  개념 노트처럼 논문이 아닌 글에는 영향을 주지 않습니다.
// ────────────────────────────────────────────────────────────────

const str = (value: unknown): string => (typeof value === "string" ? value.trim() : "")

const ExternalArrow = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
)

const PaperMeta: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const fm = (fileData.frontmatter ?? {}) as Record<string, unknown>
  const venue = str(fm.venue)
  const year = typeof fm.year === "number" ? String(fm.year) : str(fm.year)
  const authors = str(fm.authors)
  const link = str(fm.link)
  const code = str(fm.code)

  if (!venue && !authors && !link) return null

  const facts = [authors, [venue, year].filter(Boolean).join(" ")].filter(Boolean)

  return (
    <div class={classNames(displayClass, "paper-meta")}>
      <p class="paper-meta-facts">
        {facts.map((fact, i) => (
          <>
            {i > 0 && <span class="paper-meta-sep">·</span>}
            <span>{fact}</span>
          </>
        ))}
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer">
            논문 <ExternalArrow />
          </a>
        )}
        {code && (
          <a href={code} target="_blank" rel="noopener noreferrer">
            코드 <ExternalArrow />
          </a>
        )}
      </p>
    </div>
  )
}

export default (() => PaperMeta) satisfies QuartzComponentConstructor
