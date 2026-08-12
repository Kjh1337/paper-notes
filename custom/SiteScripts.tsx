import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../quartz/components/types"
import { TAG_DISPLAY_NAMES } from "./tagNames"
import { paperListScript } from "./paperListView"

// ────────────────────────────────────────────────────────────────
//  화면에는 아무것도 그리지 않고, 사이트 전역 클라이언트 스크립트만 싣는 컴포넌트.
//
//  Quartz 코어나 플러그인이 그리는 부분은 서버에서 손댈 수 없어서
//  브라우저에서 후처리해야 하는 것들이 있습니다. 그런 스크립트를 여기 모읍니다.
// ────────────────────────────────────────────────────────────────

const SiteScripts: QuartzComponent = (_props: QuartzComponentProps) => null

// 태그 표시 이름 되돌리기 (gabm → GABM).
// Quartz가 태그를 소문자로 슬러그화하므로, 코어가 그리는 태그 페이지 제목과
// 목록 카드의 태그 칩을 custom/tagNames.ts 와 같은 규칙으로 다시 씁니다.
const tagDisplayScript = `
const TAG_DISPLAY_NAMES = ${JSON.stringify(TAG_DISPLAY_NAMES)}
function prettyTag(raw) {
  const key = raw.trim().toLowerCase()
  if (TAG_DISPLAY_NAMES[key]) return TAG_DISPLAY_NAMES[key]
  return key
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
document.addEventListener("nav", () => {
  document.querySelectorAll("a.tag-link").forEach((el) => {
    // 화면에 보이는 글자가 아니라 링크 주소(/tags/<슬러그>)에서 읽습니다.
    // 이미 변환된 글자를 다시 변환하면 "In-context Learning"이 망가집니다.
    const href = el.getAttribute("href") ?? ""
    const parts = href.split("#")[0].split("?")[0].split("/").filter(Boolean)
    const slug = decodeURIComponent(parts[parts.length - 1] ?? "")
    if (slug) el.textContent = prettyTag(slug)
  })
  const slug = document.body.dataset.slug ?? ""
  if (slug.startsWith("tags/") && slug !== "tags/index") {
    const heading = document.querySelector("h1.article-title")
    if (heading) heading.textContent = prettyTag(slug.slice("tags/".length))
  }
})
`

SiteScripts.afterDOMLoaded = `${tagDisplayScript}\n${paperListScript}`

export default (() => SiteScripts) satisfies QuartzComponentConstructor
