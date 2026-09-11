/** DashScope keys look like sk- plus alphanumeric characters. Does not contact the network. */
export function looksLikeApiKey(value: string): boolean {
  const key = value.trim()
  return /^sk-[A-Za-z0-9]{8,}$/.test(key)
}
