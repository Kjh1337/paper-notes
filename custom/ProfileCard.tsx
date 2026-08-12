import { JSX } from "preact"
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../quartz/components/types"
import { classNames } from "../quartz/util/lang"
import { joinSegments, pathToRoot } from "../quartz/util/path"

// ────────────────────────────────────────────────────────────────
//  프로필 정보 — 여기만 고치면 됩니다.
//  사진은 quartz/static/profile.jpg 파일을 덮어쓰면 바뀝니다.
//  (사진은 jpg가 png보다 3~4배 가볍습니다. 파일명을 바꾸려면 아래 image 값도 함께 수정)
//
//  화면에는 사이드바 폭을 꽉 채운 4:3 사각형(256×192)으로 나옵니다.
//  CSS가 가운데를 4:3으로 잘라 쓰므로, 보여 주고 싶은 대상이 사진 한가운데 있어야 합니다.
//  가로 512px 이상 권장 (레티나에서 두 배로 그려집니다).
// ────────────────────────────────────────────────────────────────
const PROFILE = {
  image: "static/profile.jpg",
  name: "Jihyun Ko",
  // 다른 후보들: "읽은 척 방지용" / "오늘도 abstract만 읽었다" / "제목만 보고 판단하지 않으려고"
  tagline: "그래서 이게 왜 되는데",
  location: "Ulsan, Korea",
  links: [
    { label: "GitHub", href: "https://github.com/Kjh1337", icon: "github" },
    { label: "Email", href: "mailto:da.laboratory2023@gmail.com", icon: "mail" },
  ],
}

// width/height 속성을 반드시 함께 둡니다.
// 속성이 없으면 CSS가 늦게 오거나 캐시된 경우 SVG가 화면 폭만큼 커집니다.
const ICONS: Record<string, JSX.Element> = {
  github: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.4 1.24-3.24-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.24a11.5 11.5 0 0 1 6.01 0c2.29-1.56 3.3-1.24 3.3-1.24.66 1.65.24 2.87.12 3.18.77.84 1.24 1.92 1.24 3.24 0 4.63-2.81 5.65-5.49 5.95.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  ),
  mail: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  ),
  pin: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
}

const ProfileCard: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const baseDir = pathToRoot(fileData.slug!)
  const imgPath = joinSegments(baseDir, PROFILE.image)

  return (
    <div class={classNames(displayClass, "profile-card")}>
      <a href={baseDir} class="profile-avatar" aria-label={cfg.pageTitle}>
        <img src={imgPath} alt={PROFILE.name} width="256" height="192" />
      </a>
      <h2 class="page-title">
        <a href={baseDir}>{cfg.pageTitle}</a>
      </h2>
      {PROFILE.name && <p class="profile-name">{PROFILE.name}</p>}
      {PROFILE.tagline && <p class="profile-tagline">{PROFILE.tagline}</p>}
      {PROFILE.location && (
        <p class="profile-location">
          {ICONS.pin}
          <span>{PROFILE.location}</span>
        </p>
      )}
      {PROFILE.links.length > 0 && (
        <ul class="profile-links">
          {PROFILE.links.map((link) => (
            <li>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {ICONS[link.icon]}
                <span>{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default (() => ProfileCard) satisfies QuartzComponentConstructor
