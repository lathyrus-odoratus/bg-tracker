<script setup lang="ts">
import DemoStage from '../DemoStage.vue'
import DemoCursor from '../DemoCursor.vue'
import DemoHeader from '../DemoHeader.vue'
import HelpTips from '../HelpTips.vue'
import { SAMPLE_DISCORD_NAME } from '../samples.ts'
import { helpPath } from '../registry.ts'

/** 畫面：登入頁 → Discord 授權 → 登入後的網站 */
function screen(done: (i: number) => boolean) {
  if (!done(0)) return 'login'
  return done(1) ? 'home' : 'discord'
}
const TARGETS = ['[data-login]', '[data-authorize]', '[data-avatar]']
</script>

<template>
  <p>{{ $t('help.pages.start.login.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.start.login.steps.button'),
      $t('help.pages.start.login.steps.authorize'),
      $t('help.pages.start.login.steps.done'),
    ]"
  >
    <template #default="{ step, acted, done }">
      <div class="mx-auto grid h-52 max-w-sm content-center">
        <div
          v-if="screen(done) === 'login'"
          class="animate-demo-in grid gap-3 rounded-2xl bg-card p-5 shadow-card"
        >
          <span class="text-xl font-black">{{ $t('login.title') }}</span>
          <span class="text-sm text-muted">{{ $t('login.intro') }}</span>
          <span
            data-login
            class="rounded-xl bg-accent px-4 py-2.5 text-center font-bold text-accent-ink"
            >{{ $t('login.button') }}</span
          >
        </div>

        <!-- Discord 的授權頁：只畫個大概，顏色用中性的深色卡片 -->
        <div
          v-else-if="screen(done) === 'discord'"
          class="animate-demo-in grid gap-3 rounded-2xl bg-ink p-5 text-bg shadow-card"
        >
          <span class="text-xs font-bold tracking-wide opacity-70">Discord</span>
          <span class="font-bold">{{ $t('help.pages.start.login.discordTitle') }}</span>
          <span class="text-sm opacity-80">{{ $t('help.pages.start.login.discordBody') }}</span>
          <span
            data-authorize
            class="justify-self-end rounded-lg bg-game px-4 py-1.5 text-sm font-bold text-white"
            >{{ $t('help.pages.start.login.discordAuthorize') }}</span
          >
        </div>

        <div v-else class="animate-demo-in grid gap-3">
          <DemoHeader :name="SAMPLE_DISCORD_NAME" />
          <div class="grid grid-cols-3 gap-2">
            <div v-for="n in 3" :key="n" class="h-16 rounded-xl bg-card shadow-card" />
          </div>
        </div>
      </div>
      <DemoCursor
        :target="TARGETS[step] ?? null"
        :at="{ x: 0.6, y: 0.65 }"
        :press="acted && step < 2"
      />
    </template>
  </DemoStage>

  <HelpTips
    :tips="[
      $t('help.pages.start.login.tips.returnTo'),
      $t('help.pages.start.login.tips.nickname'),
      $t('help.pages.start.login.tips.logout'),
    ]"
  />
  <RouterLink
    :to="helpPath({ module: 'account', id: 'nickname' })"
    class="justify-self-start text-sm text-accent hover:underline"
  >
    {{ $t('help.pages.account.nickname.title') }} →
  </RouterLink>
</template>
