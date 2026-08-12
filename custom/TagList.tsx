import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../quartz/components/types"
import { classNames } from "../quartz/util/lang"
import { FullSlug, resolveRelative } from "../quartz/util/path"
import { displayTag } from "./tagNames"

// 기본 tag-list 플러그인 대신 쓰는 태그 줄.
// 하는 일은 같고, 표시 글자만 custom/tagNames.ts 를 거칩니다. (gabm → GABM)

const TagList: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const tags = fileData.frontmatter?.tags ?? []
  if (tags.length === 0) return null

  return (
    <ul class={classNames(displayClass, "tags")}>
      {tags.map((tag) => (
        <li>
          <a
            href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
            class="internal tag-link"
          >
            {displayTag(tag)}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default (() => TagList) satisfies QuartzComponentConstructor
