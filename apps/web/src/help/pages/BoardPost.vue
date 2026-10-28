<script setup lang="ts">
import { POST_MAX_LENGTH } from '@bg-tracker/shared'
import { useI18n } from 'vue-i18n'
import DemoStage from '../DemoStage.vue'
import DemoCursor from '../DemoCursor.vue'
import DemoPost from '../DemoPost.vue'
import HelpTips from '../HelpTips.vue'
import TypedText from '../TypedText.vue'
import { SAMPLE_NICKNAME } from '../samples.ts'

const { t } = useI18n()

interface SamplePost {
  number: number
  author: string
  time: string
  text: string
  replyTo?: number
}

/** 留言，新的在前：#1 別人的；第 2 步送出 #2；第 4 步送出回覆 #1 的 #3 */
function posts(done: (i: number) => boolean) {
  const list: SamplePost[] = [
    { number: 1, author: 'Mia', time: '19:02', text: t('help.pages.board.post.sample.first') },
  ]
  if (done(1)) {
    list.unshift({
      number: 2,
      author: SAMPLE_NICKNAME,
      time: '20:15',
      text: t('help.pages.board.post.sample.mine'),
    })
  }
  if (done(3)) {
    list.unshift({
      number: 3,
      author: SAMPLE_NICKNAME,
      time: '20:16',
      text: t('help.pages.board.post.sample.reply'),
      replyTo: 1,
    })
  }
  return list
}

/** 輸入框裡正在寫的：第 1 步寫新留言、第 3 步寫回覆；送出後清空 */
function draft(step: number, done: (i: number) => boolean) {
  if (done(0) && !done(1))
    return { text: t('help.pages.board.post.sample.mine'), typing: step === 0 }
  if (done(2) && !done(3))
    return { text: t('help.pages.board.post.sample.reply'), typing: step === 2 }
  return null
}
const TARGETS = [
  '[data-composer]',
  '[data-submit]',
  '[data-post="1"] [data-reply]',
  '[data-submit]',
  '[data-post="3"] [data-reply-link]',
]
</script>

<template>
  <p>{{ $t('help.pages.board.post.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.board.post.steps.write'),
      $t('help.pages.board.post.steps.submit'),
      $t('help.pages.board.post.steps.reply'),
      $t('help.pages.board.post.steps.submitReply'),
      $t('help.pages.board.post.steps.jump'),
    ]"
    :durations="[3000, 2200, 3000, 2200, 2800]"
  >
    <template #default="{ step, acted, done }">
      <div class="mx-auto grid h-[22.5rem] max-w-md content-start gap-3">
        <div class="grid gap-1.5 rounded-2xl bg-card p-3 shadow-card">
          <span v-if="done(2) && !done(3)" class="animate-demo-in text-xs text-accent">
            {{ $t('board.replyTo', { n: 1 }) }} <span class="text-muted">✕</span>
          </span>
          <span
            data-composer
            class="h-12 rounded-xl border bg-bg px-3 py-1.5 text-sm"
            :class="draft(step, done)?.typing ? 'border-accent' : 'border-line'"
          >
            <TypedText
              :key="draft(step, done)?.text"
              :text="draft(step, done)?.text ?? ''"
              :mode="!draft(step, done) ? 'empty' : draft(step, done)!.typing ? 'typing' : 'full'"
              :placeholder="$t('board.placeholder')"
            />
          </span>
          <div class="flex items-center justify-between text-xs text-muted">
            <span class="tabular-nums">0 / {{ POST_MAX_LENGTH }}</span>
            <span
              data-submit
              class="rounded-lg bg-accent px-3 py-1 text-sm font-bold text-accent-ink"
              :class="{ 'opacity-50': !draft(step, done) }"
              >{{ $t('board.submit') }}</span
            >
          </div>
        </div>

        <TransitionGroup tag="div" name="post" class="grid gap-2">
          <DemoPost
            v-for="p in posts(done)"
            :key="p.number"
            :data-post="p.number"
            :number="p.number"
            :author="p.author"
            :time="p.time"
            :reply-to="p.replyTo"
            :highlighted="p.number === 1 && done(4)"
          >
            <p class="text-sm">{{ p.text }}</p>
            <span data-reply class="justify-self-start text-xs text-accent">{{
              $t('post.reply')
            }}</span>
          </DemoPost>
        </TransitionGroup>
      </div>
      <DemoCursor :target="TARGETS[step] ?? null" :at="{ x: 0.4 }" :press="acted && step !== 0" />
    </template>
  </DemoStage>

  <HelpTips
    :tips="[
      $t('help.pages.board.post.tips.length'),
      $t('help.pages.board.post.tips.order'),
      $t('help.pages.board.post.tips.jump'),
    ]"
  />
</template>

<style scoped>
.post-enter-active,
.post-move {
  transition:
    transform 400ms ease-out,
    opacity 400ms ease-out;
}
.post-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
@media (prefers-reduced-motion: reduce) {
  .post-enter-active,
  .post-move {
    transition: none;
  }
}
</style>
