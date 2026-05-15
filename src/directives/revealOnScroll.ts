import type { Directive, DirectiveBinding } from 'vue'

type RevealBinding = number | { delay?: number; y?: number; threshold?: number; once?: boolean }

type RevealElement = HTMLElement & {
  __wmRevealObserver?: IntersectionObserver
}

function resolveRevealOptions(binding: DirectiveBinding<RevealBinding>) {
  const value = binding.value

  if (typeof value === 'number') {
    return {
      delay: value,
      y: 24,
      threshold: 0.18,
      once: true,
    }
  }

  return {
    delay: value?.delay ?? 0,
    y: value?.y ?? 24,
    threshold: value?.threshold ?? 0.18,
    once: value?.once ?? true,
  }
}

function cleanupObserver(el: RevealElement) {
  el.__wmRevealObserver?.disconnect()
  delete el.__wmRevealObserver
}

// 统一处理滚动到视口时的显现动效，避免各组件重复写观察逻辑。
export const revealOnScrollDirective: Directive<RevealElement, RevealBinding> = {
  mounted(el, binding) {
    const options = resolveRevealOptions(binding)

    el.classList.add('reveal-on-scroll')
    el.style.setProperty('--reveal-delay', `${options.delay}ms`)
    el.style.setProperty('--reveal-offset-y', `${options.y}px`)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('is-visible')

            if (options.once) {
              cleanupObserver(el)
            }
          } else if (!options.once) {
            el.classList.remove('is-visible')
          }
        })
      },
      {
        threshold: options.threshold,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    el.__wmRevealObserver = observer
    observer.observe(el)
  },
  updated(el, binding) {
    const options = resolveRevealOptions(binding)
    el.style.setProperty('--reveal-delay', `${options.delay}ms`)
    el.style.setProperty('--reveal-offset-y', `${options.y}px`)
  },
  unmounted(el) {
    cleanupObserver(el)
  },
}

export default revealOnScrollDirective
