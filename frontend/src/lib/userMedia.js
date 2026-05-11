import { placeholderAvatar } from './placeholders'

export function svgMarkupToDataUri(svgMarkup) {
  if (!svgMarkup || !svgMarkup.trim()) {
    return null
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup.trim())}`
}

export function userAvatarSrc(user) {
  return svgMarkupToDataUri(user?.profile_svg) || placeholderAvatar
}
