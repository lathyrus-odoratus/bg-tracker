<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue'
import { POST_MAX_LENGTH } from '@bg-tracker/shared'
import PostItem from '../components/PostItem.vue'
import { useCreatePost, usePosts } from '../composables/board.ts'
import { errorMessage } from '../lib/form.ts'
import { useSessionStore } from '../stores/session.ts'

const session = useSessionStore()
const { posts, isPending, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = usePosts()
const create = useCreatePost()

const content = ref('')
const replyTo = ref<number | null>(null)
const error = ref('')
const composer = useTemplateRef<HTMLTextAreaElement>('composer')

async function startReply(number: number) {
  replyTo.value = number
  await nextTick()
  composer.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  composer.value?.focus({ preventScroll: true })
}

/** 點「回覆 #N」：那則還沒載入就一頁頁往下載，找到後捲過去並短暫標示 */
const highlighted = ref<number | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | undefined
async function jumpTo(number: number) {
  while (!posts.value.some((p) => p.number === number) && hasNextPage.value) {
    await fetchNextPage()
  }
  await nextTick()
  document.getElementById(`post-${number}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  highlighted.value = number
  clearTimeout(highlightTimer)
  highlightTimer = setTimeout(() => (highlighted.value = null), 1600)
}

async function submit() {
  error.value = ''
  try {
    const post = await create.mutateAsync({ content: content.value, replyTo: replyTo.value })
    content.value = ''
    replyTo.value = null
    await nextTick()
    jumpTo(post.number)
  } catch (err) {
    error.value = errorMessage(err)
  }
}
</script>

<template>
  <section class="mx-auto grid max-w-2xl gap-4">
    <h1 class="text-2xl font-black">{{ $t('board.title') }}</h1>

    <template v-if="session.me">
      <form class="grid gap-2 rounded-2xl bg-card p-4 shadow-card" @submit.prevent="submit">
        <div v-if="replyTo" class="flex items-center gap-2 text-sm">
          <button type="button" class="text-accent hover:underline" @click="jumpTo(replyTo)">
            {{ $t('board.replyTo', { n: replyTo }) }}
          </button>
          <button
            type="button"
            class="text-muted hover:text-ink"
            :aria-label="$t('board.cancelReply')"
            @click="replyTo = null"
          >
            ✕
          </button>
        </div>
        <textarea
          ref="composer"
          v-model="content"
          rows="4"
          :maxlength="POST_MAX_LENGTH"
          required
          :placeholder="$t('board.placeholder')"
          :aria-label="$t('board.contentLabel')"
          class="rounded-xl border border-line bg-bg px-3 py-2"
        />
        <p v-if="error" class="text-sm text-danger" role="alert">{{ error }}</p>
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs text-muted tabular-nums">
            {{ content.length }} / {{ POST_MAX_LENGTH }}
          </span>
          <button
            type="submit"
            :disabled="create.isPending.value || !content.trim()"
            class="rounded-xl bg-accent px-5 py-2 font-bold text-accent-ink disabled:opacity-50"
          >
            {{ create.isPending.value ? $t('board.submitting') : $t('board.submit') }}
          </button>
        </div>
      </form>

      <p v-if="isPending" class="text-muted">{{ $t('common.loading') }}</p>
      <p v-else-if="isError" class="text-danger">{{ $t('common.loadFailedReload') }}</p>
      <p v-else-if="!posts.length" class="text-muted">{{ $t('board.empty') }}</p>
      <div v-else class="grid gap-3">
        <PostItem
          v-for="p in posts"
          :key="p.number"
          :post="p"
          :mine="p.author.id === session.me.id"
          :highlighted="highlighted === p.number"
          @reply="startReply"
          @jump="jumpTo"
        />
        <button
          v-if="hasNextPage"
          type="button"
          :disabled="isFetchingNextPage"
          class="justify-self-center rounded-xl border border-line px-5 py-2 text-sm font-medium text-muted hover:text-ink disabled:opacity-50"
          @click="fetchNextPage()"
        >
          {{ isFetchingNextPage ? $t('common.loading') : $t('board.loadMore') }}
        </button>
        <p v-else-if="posts.length > 0" class="text-center text-sm text-muted">
          {{ $t('board.earliest') }}
        </p>
      </div>
    </template>
  </section>
</template>
