import { QuartzTransformerPlugin } from "../quartz/plugins/types"
import { VFile } from "vfile"
import { Root } from "mdast"

// ────────────────────────────────────────────────────────────────
//  목록에 나오는 설명을 본문의 "한 줄 요약"에서 가져옵니다.
//
//  글 맨 위에 이렇게 써 두면
//
//    > [!abstract] 한 줄 요약
//    > 순환과 합성곱을 걷어내고 **어텐션만으로** …
//
//  그 문장이 그대로 홈 목록의 제목 아래 설명이 됩니다.
//  요약을 두 군데(프론트매터 + 본문)에 따로 쓸 필요가 없습니다.
//
//  - [!abstract] 말고 [!summary], [!tldr] 로 써도 똑같이 잡습니다.
//  - 요약 콜아웃이 없는 글은 프론트매터의 description 을 그대로 씁니다.
//    (그것도 없으면 description 플러그인이 본문 앞부분으로 자동 생성합니다.)
// ────────────────────────────────────────────────────────────────

/** 요약으로 인정하는 콜아웃 종류 */
const SUMMARY_CALLOUT = /^>[ \t]*\[!(?:abstract|summary|tldr)\][^\n]*\n((?:^>.*(?:\n|$))*)/im

/** 마크다운 표시 문자를 걷어내고 읽을 수 있는 한 줄로 만듭니다. */
function toPlainText(markdown: string): string {
  return (
    markdown
      // 인용 부호(> )를 떼어 냅니다
      .replace(/^>[ \t]?/gm, "")
      // 코드: `foo` → foo
      .replace(/`([^`]+)`/g, "$1")
      // 이미지는 통째로 버립니다 (대체 텍스트만 남기면 문장이 이상해집니다)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      // 링크: [글자](주소) → 글자
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      // 위키링크: [[주소|글자]] → 글자, [[주소]] → 주소
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
      .replace(/\[\[([^\]]+)\]\]/g, "$1")
      // 강조: **굵게**, *기울임*, ==하이라이트==, ~~취소선~~
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/==([^=]+)==/g, "$1")
      .replace(/~~([^~]+)~~/g, "$1")
      // 줄바꿈과 연속 공백을 한 칸으로
      .replace(/\s+/g, " ")
      .trim()
  )
}

export const SummaryFromBody: QuartzTransformerPlugin = () => ({
  name: "SummaryFromBody",
  markdownPlugins() {
    return [
      () => (_tree: Root, file: VFile) => {
        // 트리가 아니라 원본 텍스트에서 찾습니다.
        // 콜아웃은 다른 플러그인이 모양을 바꿔 놓기 때문에 원본이 더 안정적입니다.
        const source = typeof file.value === "string" ? file.value : String(file.value ?? "")
        const match = SUMMARY_CALLOUT.exec(source)
        if (!match) return

        const summary = toPlainText(match[1] ?? "")
        if (!summary) return

        const data = file.data as { frontmatter?: Record<string, unknown> }
        if (!data.frontmatter) return
        data.frontmatter.description = summary
      },
    ]
  },
})
