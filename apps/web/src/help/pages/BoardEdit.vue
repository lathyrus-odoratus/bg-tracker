<script setup lang="ts">
import DemoStage from '../DemoStage.vue'
import DemoCursor from '../DemoCursor.vue'
import DemoPost from '../DemoPost.vue'
import HelpTips from '../HelpTips.vue'
import TypedText from '../TypedText.vue'
import { SAMPLE_NICKNAME } from '../samples.ts'

/** 編輯：第 1 步打開編輯框、第 2 步在後面補字、第 3 步儲存、第 4 步看紀錄 */
const TARGETS = ['[data-edit]', '[data-draft]', '[data-save]', '[data-history]']
</script>

<template>
  <p>{{ $t('help.pages.board.edit.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.board.edit.steps.open'),
      $t('help.pages.board.edit.steps.type'),
      $t('help.pages.board.edit.steps.save'),
      $t('help.pages.board.edit.steps.history'),
    ]"
    :durations="[2400, 3000, 2400, 3200]"
  >
    <template #default="{ step, acted, done }">
      <div class="mx-auto grid h-[19rem] max-w-md content-start gap-2">
        <DemoPost :number="2" :author="SAMPLE_NICKNAME" time="20:15">
          <template v-if="done(2)" #meta>
            <span data-history class="animate-demo-in text-muted">{{
              $t(done(3) ? 'post.editedOpen' : 'post.edited', 1)
            }}</span>
          </template>

          <template v-if="done(0) && !done(2)">
            <span
              data-draft
              class="animate-demo-in rounded-lg border bg-bg px-2 py-1 text-sm"
              :class="step === 1 ? 'border-accent' : 'border-line'"
            >
              {{ $t('help.pages.board.edit.sample.before')
              }}<TypedText
                :text="$t('help.pages.board.edit.sample.added')"
                :mode="!done(1) ? 'empty' : step === 1 ? 'typing' : 'full'"
              />
            </span>
            <span class="flex gap-3 text-xs">
              <span data-save class="rounded-md bg-accent px-2 py-0.5 font-bold text-accent-ink">{{
                $t('common.save')
              }}</span>
              <span class="text-muted">{{ $t('common.cancel') }}</span>
            </span>
          </template>
          <template v-else>
            <p class="text-sm">
              {{ $t('help.pages.board.edit.sample.before')
              }}{{ done(2) ? $t('help.pages.board.edit.sample.added') : '' }}
            </p>
            <ol
              v-if="done(3)"
              class="animate-demo-in grid gap-1 border-t border-line pt-1.5 text-xs"
            >
              <li class="grid">
                <span class="text-muted">20:31 {{ $t('post.current') }}</span>
                <span
                  >{{ $t('help.pages.board.edit.sample.before')
                  }}{{ $t('help.pages.board.edit.sample.added') }}</span
                >
              </li>
              <li class="grid">
                <span class="text-muted">20:15 {{ $t('post.original') }}</span>
                <span class="text-muted">{{ $t('help.pages.board.edit.sample.before') }}</span>
              </li>
            </ol>
            <span class="flex gap-3 text-xs">
              <span class="text-accent">{{ $t('post.reply') }}</span>
              <span data-edit class="text-muted">{{ $t('common.edit') }}</span>
            </span>
          </template>
        </DemoPost>

        <DemoPost :number="1" author="Mia" time="19:02">
          <p class="text-sm">{{ $t('help.pages.board.post.sample.first') }}</p>
          <span class="text-xs text-accent">{{ $t('post.reply') }}</span>
        </DemoPost>
      </div>
      <DemoCursor :target="TARGETS[step] ?? null" :at="{ x: 0.4 }" :press="acted && step !== 1" />
    </template>
  </DemoStage>

  <HelpTips
    :tips="[
      $t('help.pages.board.edit.tips.own'),
      $t('help.pages.board.edit.tips.history'),
      $t('help.pages.board.edit.tips.delete'),
    ]"
  />
</template>
