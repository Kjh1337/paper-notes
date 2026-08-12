import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../quartz/components/types"
import { classNames } from "../quartz/util/lang"
import { FullSlug, pathToRoot, resolveRelative } from "../quartz/util/path"
import { FIELD_TAGS, displayTag } from "./tagNames"

// ────────────────────────────────────────────────────────────────
//  왼쪽 사이드바의 목차.
//
//    전체 글        12
//    ──────────────────
//    Agent           4
//    Architecture    2
//    Alignment       2
//
//  태그를 전부 세어 나열하지 않습니다. custom/tagNames.ts 의 FIELD_TAGS 에
//  적어 둔 것만, 적어 둔 순서로 나옵니다. 글이 하나도 없는 항목은 숨깁니다.
//  개념 태그(Attention, DPO …)는 글 아래 태그 줄에만 남습니다.
// ────────────────────────────────────────────────────────────────

/** 목록에 셀 글인지 — 404, 폴더 대문, 태그 페이지, .base 는 글이 아닙니다. */
function isPost(slug: string, unlisted: unknown): boolean {
  if (unlisted === true) return false
  if (slug === "404" || slug === "index") return false
  if (slug.endsWith("/index") || slug.endsWith(".base")) return false
  if (slug.startsWith("tags/")) return false
  return true
}

const TagNav: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
  const counts = new Map<string, number>()
  let total = 0

  for (const file of allFiles) {
    if (!isPost(file.slug ?? "", file.unlisted)) continue
    total += 1
    for (const tag of file.frontmatter?.tags ?? []) {
      const key = tag.toLowerCase()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  // FIELD_TAGS 순서를 그대로 씁니다 (개수 순 정렬 안 함 — 순서도 사람이 정하는 게 맞습니다)
  const fields = FIELD_TAGS.map((tag) => [tag, counts.get(tag.toLowerCase()) ?? 0] as const).filter(
    ([, count]) => count > 0,
  )

  const home = pathToRoot(fileData.slug!)
  const currentTag = fileData.slug?.startsWith("tags/")
    ? fileData.slug.slice("tags/".length).toLowerCase()
    : null
  const isHome = fileData.slug === "index"

  return (
    <nav class={classNames(displayClass, "tag-nav")} aria-label="분야">
      <ul class="tag-nav-list">
        <li class="tag-nav-all">
          <a href={home} class={isHome ? "internal active" : "internal"}>
            <span class="tag-nav-name">전체 글</span>
            <span class="tag-nav-count">{total}</span>
          </a>
        </li>
        {fields.map(([tag, count]) => (
          <li>
            <a
              href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
              class={tag.toLowerCase() === currentTag ? "internal active" : "internal"}
            >
              <span class="tag-nav-name">{displayTag(tag)}</span>
              <span class="tag-nav-count">{count}</span>
            </a>
          </li>
        ))}
        {/* 사이드바에 안 올린 세부 태그(Attention, DPO …)는 여기서 전부 볼 수 있습니다 */}
        <li class="tag-nav-more">
          <a
            href={resolveRelative(fileData.slug!, "tags/index" as FullSlug)}
            class={fileData.slug === "tags/index" ? "internal active" : "internal"}
          >
            <span class="tag-nav-name">태그 전체 보기</span>
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default (() => TagNav) satisfies QuartzComponentConstructor
