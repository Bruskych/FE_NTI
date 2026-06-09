export function getCookie(name: string): string | null {
  const match = document.cookie.split('; ').find(row => row.startsWith(name + '='))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}

export function setCookie(name: string, value: string, maxAgeSecs = 31_536_000) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSecs}; path=/; SameSite=Lax`
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; max-age=0; path=/`
}
