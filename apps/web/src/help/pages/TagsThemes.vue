<script setup lang="ts">
import DemoStage from '../DemoStage.vue'
import HelpTips from '../HelpTips.vue'
import TagTrailDemo from '../TagTrailDemo.vue'
import { SAMPLE_THEMES } from '../samples.ts'
</script>

<template>
  <p>{{ $t('help.pages.tags.themes.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.tags.themes.steps.list'),
      $t('help.pages.tags.themes.steps.game'),
      $t('help.pages.tags.themes.steps.back'),
    ]"
  >
    <template #default="slot">
      <TagTrailDemo
        v-bind="slot"
        kind="theme"
        :tags="SAMPLE_THEMES"
        :trail="['renaissance', 'azul', 'renaissance']"
        :list-title="$t('themes.title')"
        :games-title="$t('themes.games')"
        :game-tags-title="$t('game.themes')"
      />
    </template>
  </DemoStage>

  <HelpTips
    :tips="[
      $t('help.pages.tags.themes.tips.notAppearance'),
      $t('help.pages.tags.themes.tips.source'),
      $t('help.pages.tags.themes.tips.many'),
    ]"
  />
</template>
