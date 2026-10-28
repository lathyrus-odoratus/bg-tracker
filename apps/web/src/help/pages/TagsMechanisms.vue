<script setup lang="ts">
import DemoStage from '../DemoStage.vue'
import HelpTips from '../HelpTips.vue'
import TagTrailDemo from '../TagTrailDemo.vue'
import { helpPath } from '../registry.ts'
import { SAMPLE_GRAPH, sampleMechanismGames } from '../samples.ts'

const TAGS = SAMPLE_GRAPH.mechanisms.map((m) => ({
  ...m,
  games: sampleMechanismGames(m.id).map((g) => g.id),
}))
</script>

<template>
  <p>{{ $t('help.pages.tags.mechanisms.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.tags.mechanisms.steps.list'),
      $t('help.pages.tags.mechanisms.steps.game'),
      $t('help.pages.tags.mechanisms.steps.next'),
    ]"
  >
    <template #default="slot">
      <TagTrailDemo
        v-bind="slot"
        kind="mechanism"
        :tags="TAGS"
        :trail="['hand', 'hanabi', 'coop']"
        :list-title="$t('mechanisms.title')"
        :games-title="$t('mechanisms.games')"
        :game-tags-title="$t('game.mechanisms')"
      />
    </template>
  </DemoStage>

  <HelpTips
    :tips="[
      $t('help.pages.tags.mechanisms.tips.source'),
      $t('help.pages.tags.mechanisms.tips.description'),
      $t('help.pages.tags.mechanisms.tips.graph'),
    ]"
  />
  <RouterLink
    :to="helpPath({ module: 'graph', id: 'read' })"
    class="justify-self-start text-sm text-accent hover:underline"
  >
    {{ $t('help.pages.graph.read.title') }} →
  </RouterLink>
</template>
