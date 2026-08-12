import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import { PageTypeDispatcher } from "./quartz/plugins/pageTypes"
import ProfileCard from "./custom/ProfileCard"
import PaperMeta from "./custom/PaperMeta"
import TagList from "./custom/TagList"
import TagNav from "./custom/TagNav"
import SiteScripts from "./custom/SiteScripts"
import { viewRegistry } from "@quartz-community/bases-page"
import { paperListRegistration } from "./custom/paperListView"
import { SummaryFromBody } from "./custom/summaryFromBody"

// YAML로 표현할 수 없는 콜백 옵션과 커스텀 컴포넌트만 여기에 둡니다.
// 나머지 설정은 전부 quartz.config.yaml 에 있습니다.
// (아래 setOptionOverrides 블록은 반드시 loadQuartzConfig() 보다 위에 있어야 적용됩니다.)

// ── "최근 리뷰" 목록에서 404 페이지와 폴더 대문(index) 페이지 제외 ──
componentRegistry.setOptionOverrides("@quartz-community/recent-notes", {
  filter: (page: { slug?: string }) => {
    const slug = page.slug ?? ""
    return slug !== "404" && slug !== "index" && !slug.endsWith("/index") && !slug.endsWith(".base")
  },
})

// ── .base 파일에서 쓸 수 있는 `type: paperList` 뷰 등록 ──
// (customViews 옵션은 렌더 함수만 받아서 페이지 전환 스크립트를 못 붙입니다.
//  registry에 직접 등록하면 afterDOMLoaded까지 같이 넘길 수 있습니다.)
viewRegistry.register(paperListRegistration)

const config = await loadQuartzConfig()

// ── 목록의 설명을 본문 "한 줄 요약" 콜아웃에서 가져오기 ──
// 프론트매터가 이미 읽힌 뒤에 돌아야 하므로 변환기 목록 맨 뒤에 붙입니다.
config.plugins.transformers.push(SummaryFromBody())

// ── 왼쪽 사이드바 맨 위에 프로필 카드(사진 + 사이트 이름 + 소개) 추가 ──
// loadQuartzConfig()가 내부적으로 만들어 둔 레이아웃은 이미 emitter 안에 갇혀 있으므로,
// 레이아웃을 다시 만들어 프로필 카드를 끼워 넣고 PageTypeDispatcher를 교체합니다.
const loadedLayout = await loadQuartzLayout()
const profileCard = ProfileCard()
const tagNav = TagNav()
const paperMeta = PaperMeta()
const tagList = TagList()
const siteScripts = SiteScripts()
for (const pageLayout of [loadedLayout.defaults, ...Object.values(loadedLayout.byPageType)]) {
  // 화면에는 안 보이지만 전역 스크립트를 싣기 위해 모든 페이지에 넣습니다.
  if (Array.isArray(pageLayout.afterBody)) {
    pageLayout.afterBody.push(siteScripts)
  }
  // left가 비어 있는 페이지(404 등)에는 넣지 않습니다.
  if (Array.isArray(pageLayout.left) && pageLayout.left.length > 0) {
    pageLayout.left.unshift(profileCard) // 맨 위: 프로필
    pageLayout.left.push(tagNav) // 맨 아래: 분야 목록
  }
  // beforeBody 순서는 [article-title, content-meta] 입니다.
  // 제목 바로 다음에 논문 정보 줄을, 맨 끝에 태그 줄을 끼웁니다.
  // (quartz.config.yaml에서 breadcrumbs를 다시 켜면 splice 위치를 2로 바꾸세요.)
  if (Array.isArray(pageLayout.beforeBody) && pageLayout.beforeBody.length >= 1) {
    pageLayout.beforeBody.splice(1, 0, paperMeta)
    pageLayout.beforeBody.push(tagList)
  }
}

const dispatcherIndex = config.plugins.emitters.findIndex((e) => e.name === "PageTypeDispatcher")
if (dispatcherIndex >= 0) {
  config.plugins.emitters[dispatcherIndex] = PageTypeDispatcher({
    defaults: loadedLayout.defaults,
    byPageType: loadedLayout.byPageType,
  })
}

export default config
export const layout = loadedLayout
