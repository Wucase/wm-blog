<script setup lang="ts">
import { computed, ref } from 'vue'
import type { HomePageData } from '../../types/home'

const props = defineProps<{
  hero: HomePageData['hero']
}>()

// 通过轻量鼠标视差增强首屏层次感，不引入额外动画库。
const pointerX = ref(0)
const pointerY = ref(0)

const stageStyle = computed(() => ({
  '--hero-pointer-x': `${pointerX.value}px`,
  '--hero-pointer-y': `${pointerY.value}px`,
}))

function splitTitleTokens(title: string) {
  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    return []
  }

  if (/\s/.test(trimmedTitle)) {
    return trimmedTitle.split(/\s+/)
  }

  const chars = Array.from(trimmedTitle)
  const tokens: string[] = []

  for (let index = 0; index < chars.length; index += 2) {
    tokens.push(chars.slice(index, index + 2).join(''))
  }

  return tokens
}

const titleTokens = computed(() => splitTitleTokens(props.hero.title))

function handlePointerMove(event: MouseEvent) {
  const currentTarget = event.currentTarget as HTMLElement
  const rect = currentTarget.getBoundingClientRect()

  pointerX.value = ((event.clientX - rect.left) / rect.width - 0.5) * 24
  pointerY.value = ((event.clientY - rect.top) / rect.height - 0.5) * 24
}

function resetPointer() {
  pointerX.value = 0
  pointerY.value = 0
}
</script>

<template>
  <section
    class="hero"
    @mousemove="handlePointerMove"
    @mouseleave="resetPointer"
  >
    <div class="hero__copy">
      <p class="hero__eyebrow hero__copy-item">{{ hero.eyebrow }}</p>
      <h1 class="hero__title hero__copy-item" :aria-label="hero.title">
        <span
          v-for="(token, index) in titleTokens"
          :key="`${token}-${index}`"
          class="hero__title-token"
          :style="{ '--token-delay': `${220 + index * 90}ms` }"
        >
          {{ token }}
        </span>
      </h1>
      <p class="hero__description hero__copy-item">{{ hero.description }}</p>

      <div class="hero__actions hero__copy-item">
        <a
          v-for="action in hero.actions"
          :key="action.label"
          :href="action.href"
          class="hero__action"
          :class="`hero__action--${action.variant}`"
        >
          {{ action.label }}
        </a>
      </div>
    </div>

    <div class="hero__stage" :style="stageStyle" aria-hidden="true">
      <div class="hero__orb hero__orb--gold"></div>
      <div class="hero__orb hero__orb--cyan"></div>
      <div class="hero__ring hero__ring--outer"></div>
      <div class="hero__ring hero__ring--inner"></div>

      <article class="media-card media-card--main">
        <div class="media-card__badge">{{ hero.stage.badge }}</div>
        <h2>{{ hero.stage.title }}</h2>
        <p>{{ hero.stage.description }}</p>
      </article>

      <article class="media-card media-card--visual media-card--left">
        <img :src="hero.stage.leftCardImage" :alt="hero.stage.leftCardAlt" />
      </article>

      <article class="media-card media-card--visual media-card--right">
        <img :src="hero.stage.rightCardImage" :alt="hero.stage.rightCardAlt" />
      </article>

      <article class="media-card media-card--note">
        <span>{{ hero.stage.noteLabel }}</span>
        <strong>{{ hero.stage.noteValue }}</strong>
      </article>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.92fr);
  gap: var(--space-2xl);
  padding: var(--space-4xl);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-3xl);
  background:
    radial-gradient(circle at 16% 18%, rgba(240, 179, 91, 0.22), transparent 0 26%),
    radial-gradient(circle at 78% 20%, rgba(115, 216, 231, 0.16), transparent 0 28%),
    linear-gradient(135deg, rgba(8, 16, 28, 0.98), rgba(15, 28, 45, 0.96) 50%, rgba(10, 24, 38, 0.98));
  box-shadow: var(--shadow-hero);
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.72), transparent 90%);
  pointer-events: none;
}

.hero__copy,
.hero__stage {
  position: relative;
  z-index: 1;
}

.hero__copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero__copy-item {
  opacity: 0;
  animation: revealUp 700ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.hero__copy-item:nth-child(1) {
  animation-delay: 90ms;
}

.hero__copy-item:nth-child(2) {
  animation-delay: 180ms;
}

.hero__copy-item:nth-child(3) {
  animation-delay: 280ms;
}

.hero__copy-item:nth-child(4) {
  animation-delay: 380ms;
}

.hero__eyebrow {
  margin: 0 0 var(--space-md);
  color: var(--color-accent);
  font-size: var(--font-size-caption);
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.hero__title {
  margin: 0;
  color: var(--color-surface);
  font-family: var(--font-family-display);
  font-size: var(--font-size-display);
  line-height: 0.92;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.hero__title-token {
  display: inline-block;
  margin-right: 0.2em;
  opacity: 0;
  transform: translateY(1.2rem) rotateX(-14deg);
  transform-origin: 50% 100%;
  animation: titleTokenReveal 820ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--token-delay, 240ms);
}

.hero__title-token:last-child {
  margin-right: 0;
}

.hero__description {
  max-width: 34rem;
  margin-top: var(--space-lg);
  color: var(--color-text-inverse-soft);
  font-size: var(--font-size-lg);
  line-height: 1.9;
}

.hero__actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-2xl);
  flex-wrap: wrap;
}

.hero__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 9rem;
  padding: 0.95rem 1.5rem;
  border-radius: var(--radius-full);
  border: 1px solid transparent;
  font-weight: 700;
  transition:
    transform var(--motion-base) ease,
    border-color var(--motion-base) ease,
    background-color var(--motion-base) ease,
    box-shadow var(--motion-base) ease;
}

.hero__action:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.24);
}

.hero__action--primary {
  background: linear-gradient(145deg, rgba(240, 179, 91, 0.98), rgba(214, 139, 42, 0.96));
  color: var(--color-primary-deep);
  box-shadow: 0 16px 34px rgba(214, 139, 42, 0.26);
}

.hero__action--secondary {
  border-color: rgba(245, 241, 232, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-surface);
}

.hero__stage {
  position: relative;
  min-height: 36rem;
  transform: perspective(1400px) rotateX(2deg) rotateY(-3deg);
  animation: stageReveal 1s cubic-bezier(0.16, 1, 0.3, 1) both 220ms;
}

.hero__orb,
.hero__ring,
.media-card {
  transform:
    translate3d(
      calc(var(--hero-pointer-x, 0px) * 1),
      calc(var(--hero-pointer-y, 0px) * 1),
      0
    );
}

.hero__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(22px);
  opacity: 0.78;
  animation: floatOrb 12s ease-in-out infinite;
}

.hero__orb--gold {
  top: 1rem;
  right: 1rem;
  width: 8.6rem;
  height: 8.6rem;
  background: radial-gradient(circle, rgba(240, 179, 91, 0.82), transparent 72%);
}

.hero__orb--cyan {
  left: 0;
  bottom: 2rem;
  width: 10rem;
  height: 10rem;
  background: radial-gradient(circle, rgba(115, 216, 231, 0.58), transparent 72%);
  animation-duration: 14s;
}

.hero__ring {
  position: absolute;
  inset: 50% auto auto 50%;
  border-radius: 50%;
  border: 1px solid rgba(245, 241, 232, 0.14);
  transform-style: preserve-3d;
  animation: spinRing 22s linear infinite;
}

.hero__ring--outer {
  width: 24rem;
  height: 24rem;
  margin-top: -12rem;
  margin-left: -12rem;
}

.hero__ring--inner {
  width: 16rem;
  height: 16rem;
  margin-top: -8rem;
  margin-left: -8rem;
  animation-direction: reverse;
  animation-duration: 16s;
}

.media-card {
  position: absolute;
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(245, 241, 232, 0.09);
  background: rgba(16, 28, 44, 0.58);
  backdrop-filter: blur(18px) saturate(130%);
  box-shadow: var(--shadow-card-dark);
  animation: floatCard 8s ease-in-out infinite;
}

.media-card--main {
  top: 5rem;
  left: 50%;
  width: min(100%, 22rem);
  padding: 1.4rem;
  transform:
    translateX(-52%)
    translateY(calc(var(--hero-pointer-y, 0px) * -0.35))
    translateX(calc(var(--hero-pointer-x, 0px) * 0.2));
}

.media-card--main h2 {
  margin: 0.55rem 0 0.8rem;
  color: var(--color-surface);
  font-family: var(--font-family-display);
  font-size: 1.75rem;
  line-height: 1.08;
}

.media-card--main p {
  margin: 0;
  color: var(--color-text-inverse-soft);
  line-height: 1.7;
}

.media-card__badge {
  display: inline-flex;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  background: rgba(240, 179, 91, 0.14);
  color: var(--color-accent);
  font-size: var(--font-size-caption);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.media-card--visual {
  overflow: hidden;
}

.media-card--visual img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 900ms ease,
    filter 600ms ease;
}

.media-card--visual:hover img {
  transform: scale(1.06);
  filter: saturate(1.12);
}

.media-card--left {
  bottom: 4rem;
  left: 0.8rem;
  width: 12rem;
  height: 15rem;
  transform:
    rotate(-10deg)
    translateX(calc(var(--hero-pointer-x, 0px) * -0.26))
    translateY(calc(var(--hero-pointer-y, 0px) * 0.26));
  animation-delay: -2s;
}

.media-card--right {
  top: 9rem;
  right: 1rem;
  width: 10.8rem;
  height: 13.6rem;
  transform:
    rotate(10deg)
    translateX(calc(var(--hero-pointer-x, 0px) * 0.24))
    translateY(calc(var(--hero-pointer-y, 0px) * -0.18));
  animation-delay: -4s;
}

.media-card--note {
  right: 3.5rem;
  bottom: 4rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.2rem;
  color: var(--color-surface);
  transform:
    translateX(calc(var(--hero-pointer-x, 0px) * 0.12))
    translateY(calc(var(--hero-pointer-y, 0px) * 0.12));
  animation-delay: -1s;
}

.media-card--note span {
  color: var(--color-text-inverse-soft);
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.media-card--note strong {
  font-size: 1.15rem;
}

@media (max-width: 1200px) {
  .hero {
    grid-template-columns: minmax(0, 0.96fr) minmax(320px, 1.04fr);
    gap: var(--space-xl);
    padding: var(--space-2xl);
  }

  .hero__stage {
    min-height: 31rem;
  }

  .media-card--main {
    top: 4rem;
    width: min(100%, 20rem);
  }
}

@keyframes spinRing {
  from {
    transform: rotate(0deg) rotateX(68deg);
  }

  to {
    transform: rotate(360deg) rotateX(68deg);
  }
}

@keyframes floatOrb {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-1rem);
  }
}

@keyframes floatCard {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: 0 -0.75rem;
  }
}

@keyframes revealUp {
  from {
    opacity: 0;
    transform: translateY(26px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes stageReveal {
  from {
    opacity: 0;
    transform: perspective(1400px) rotateX(8deg) rotateY(-8deg) translateY(28px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: perspective(1400px) rotateX(2deg) rotateY(-3deg) translateY(0) scale(1);
  }
}

@keyframes titleTokenReveal {
  from {
    opacity: 0;
    transform: translateY(1.2rem) rotateX(-14deg);
    filter: blur(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
    filter: blur(0);
  }
}

@media (max-width: 1080px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero__copy {
    max-width: 44rem;
  }

  .hero__stage {
    min-height: 30rem;
    margin-top: var(--space-sm);
  }
}

@media (max-width: 720px) {
  .hero {
    padding: var(--space-2xl);
  }

  .hero__stage {
    min-height: 24rem;
  }

  .hero__description {
    max-width: none;
    font-size: 1rem;
    line-height: 1.75;
  }

  .hero__actions {
    gap: 0.75rem;
  }

  .hero__action {
    flex: 1 1 10rem;
    min-width: 0;
    padding-inline: 1rem;
  }

  .media-card--main {
    left: 1rem;
    top: 1rem;
    width: calc(100% - 7rem);
    transform: translateY(calc(var(--hero-pointer-y, 0px) * -0.1));
  }

  .media-card--right {
    top: auto;
    right: 0.4rem;
    bottom: 5rem;
    width: 8.5rem;
    height: 10.8rem;
  }

  .media-card--left {
    width: 8rem;
    height: 10.5rem;
  }

  .media-card--note {
    right: 1rem;
    bottom: 0.5rem;
  }
}

@media (max-width: 560px) {
  .hero {
    padding: 1.25rem;
    border-radius: 1.5rem;
  }

  .hero::before {
    background-size: 44px 44px;
  }

  .hero__eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.12em;
  }

  .hero__title {
    font-size: clamp(2.35rem, 14vw, 3.35rem);
    line-height: 1;
  }

  .hero__stage {
    min-height: 21.5rem;
  }

  .hero__ring--outer {
    width: 18rem;
    height: 18rem;
    margin-top: -9rem;
    margin-left: -9rem;
  }

  .hero__ring--inner {
    width: 11rem;
    height: 11rem;
    margin-top: -5.5rem;
    margin-left: -5.5rem;
  }

  .media-card {
    border-radius: 1.1rem;
  }

  .media-card--main {
    left: 0.75rem;
    width: calc(100% - 5.8rem);
    padding: 1rem;
  }

  .media-card--main h2 {
    font-size: 1.2rem;
  }

  .media-card--main p {
    font-size: 0.92rem;
    line-height: 1.6;
  }

  .media-card--left {
    left: 0.15rem;
    bottom: 3.6rem;
    width: 6.4rem;
    height: 8.8rem;
  }

  .media-card--right {
    right: 0.1rem;
    bottom: 4.3rem;
    width: 6.8rem;
    height: 8.8rem;
  }

  .media-card--note {
    right: 0.55rem;
    left: 0.55rem;
    bottom: 0.55rem;
    padding: 0.8rem 0.95rem;
  }

  .hero__orb--gold {
    width: 6rem;
    height: 6rem;
  }

  .hero__orb--cyan {
    width: 7rem;
    height: 7rem;
  }
}

@media (hover: none) and (pointer: coarse) {
  .hero__action:hover {
    transform: none;
  }

  .hero__stage,
  .hero__orb,
  .hero__ring,
  .media-card,
  .media-card--main,
  .media-card--left,
  .media-card--right,
  .media-card--note {
    transform: none;
  }
}
</style>
