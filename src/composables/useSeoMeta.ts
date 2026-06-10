import { onUnmounted, watchEffect, type Ref } from 'vue'

const DEFAULT_TITLE = 'NTI Portal'

export function useSeoMeta(title: Ref<string | null | undefined>, description: Ref<string | null | undefined>) {
  watchEffect(() => {
    document.title = title.value ? `${title.value} | ${DEFAULT_TITLE}` : DEFAULT_TITLE

    let tag = document.querySelector('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', description.value ?? '')
  })

  onUnmounted(() => {
    document.title = DEFAULT_TITLE
    document.querySelector('meta[name="description"]')?.remove()
  })
}
