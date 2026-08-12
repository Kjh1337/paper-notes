// ────────────────────────────────────────────────────────────────
//  태그 표시 이름
//
//  Quartz는 frontmatter의 태그를 전부 소문자로 슬러그화합니다.
//  (`GABM` → `gabm`, `In-context Learning` → `in-context-learning`)
//  URL은 그대로 두고 화면에 보이는 글자만 여기서 되돌립니다.
//
//  새 약어 태그를 쓰기 시작하면 아래에 한 줄 추가하세요.
//  등록하지 않은 태그는 하이픈을 띄어쓰기로 바꾸고 각 단어를 대문자로 시작합니다.
//  (`in-context-learning` → `In Context Learning`)
// ────────────────────────────────────────────────────────────────

export const TAG_DISPLAY_NAMES: Record<string, string> = {
  // 분야
  gabm: "GABM",
  lpr: "LPR",
  llm: "LLM",
  nlp: "NLP",
  cv: "CV",
  rl: "RL",
  rlhf: "RLHF",
  abm: "ABM",
  hci: "HCI",

  // 자주 쓰는 개념
  // (하이픈이 살아 있어야 하는 태그는 이렇게 직접 적어 주세요.
  //  등록하지 않으면 "In Context Learning"처럼 하이픈이 띄어쓰기로 바뀝니다.)
  "in-context-learning": "In-context Learning",
  "chain-of-thought": "Chain-of-Thought",
  "fine-tuning": "Fine-tuning",
  moe: "MoE",
  rag: "RAG",
  lora: "LoRA",
  sft: "SFT",
  dpo: "DPO",
  ppo: "PPO",
  vlm: "VLM",

  // 학회
  neurips: "NeurIPS",
  icml: "ICML",
  iclr: "ICLR",
  aaai: "AAAI",
  ijcai: "IJCAI",
  acl: "ACL",
  emnlp: "EMNLP",
  naacl: "NAACL",
  cvpr: "CVPR",
  eccv: "ECCV",
  iccv: "ICCV",
  uist: "UIST",
  chi: "CHI",
  cscw: "CSCW",
  siggraph: "SIGGRAPH",
  arxiv: "arXiv",
}

/**
 * 왼쪽 사이드바에 "분야"로 올릴 태그 — 여기 적은 것만, 여기 적은 순서로 나옵니다.
 *
 * 사이드바는 태그 전체 목록이 아니라 **글의 목차**입니다.
 * 그래서 자동으로 다 세지 않고 손으로 고릅니다. 기준은 두 가지입니다.
 *
 *   1. 글을 갈라 주는 태그만. 모든 글에 붙는 태그(LLM 같은)는 눌러도 전체 목록이라 뺍니다.
 *   2. 개념 태그는 뺍니다. Attention, DPO, Prompting 처럼 한두 글에만 붙는 것들은
 *      글 아래 태그 줄과 /tags/… 페이지로 계속 쓸 수 있습니다. 사이드바에만 안 올립니다.
 *
 * 여기 적었는데 글이 하나도 없는 태그는 자동으로 숨겨지니, 미리 적어 둬도 괜찮습니다.
 */
export const FIELD_TAGS: string[] = [
  "architecture",
  "agent",
  "alignment",
  "reasoning",
  "rag",
  "efficiency",
]

/**
 * 학회 태그. 왼쪽 "분야" 메뉴에서는 빼고 보여 줍니다.
 * (태그 자체는 그대로 살아 있어서 글 아래 태그 줄이나 /tags/neurips 로는 계속 접근됩니다.)
 */
export const VENUE_TAGS = new Set([
  "neurips",
  "icml",
  "iclr",
  "aaai",
  "ijcai",
  "acl",
  "emnlp",
  "naacl",
  "cvpr",
  "eccv",
  "iccv",
  "uist",
  "chi",
  "cscw",
  "siggraph",
  "arxiv",
])

/** 태그 슬러그를 화면에 보여줄 글자로 바꿉니다. */
export function displayTag(tag: string): string {
  const key = tag.toLowerCase()
  if (TAG_DISPLAY_NAMES[key]) return TAG_DISPLAY_NAMES[key]
  return key
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
