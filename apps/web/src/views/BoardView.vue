<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { POST_MAX_LENGTH } from '@bg-tracker/shared'
import PostItem from '../components/PostItem.vue'
import { useCreatePost, usePosts } from '../composables/board.ts'
import { errorMessage } from '../lib/form.ts'
import { useSessionStore } from '../stores/session.ts'

const session = useSessionStore()
const route = useRoute()
const { data: posts, isPending, isError } = usePosts()
const create = useCreatePost()

/** 未登入不跳轉：留在這頁顯示提示；按鈕直接走 Discord 授權，登入後回到這裡 */
const loginHref = computed(
  () => `/auth/discord/login?returnTo=${encodeURIComponent(route.fullPath)}`,
)

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

/** 點「回覆 #N」：捲到那則並短暫標示 */
const highlighted = ref<number | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | undefined
function jumpTo(number: number) {
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
    <h1 class="text-2xl font-black">留言板</h1>

    <div v-if="!session.me" class="grid gap-3 rounded-2xl bg-card p-6 shadow-card">
      <p class="font-bold">留言板只給登入的成員使用。</p>
      <p class="text-sm text-muted">登入後就能看留言、留言和回覆。</p>
      <a
        :href="loginHref"
        class="justify-self-start rounded-xl bg-accent px-4 py-2 font-bold text-accent-ink"
      >
        用 Discord 登入
      </a>
    </div>

    <template v-else>
      <p v-if="isPending" class="text-muted">載入中…</p>
      <p v-else-if="isError" class="text-danger">載入失敗，請重新整理。</p>
      <p v-else-if="!posts?.length" class="text-muted">還沒有留言，來寫第一則吧。</p>
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
      </div>

      <form class="grid gap-2 rounded-2xl bg-card p-4 shadow-card" @submit.prevent="submit">
        <div v-if="replyTo" class="flex items-center gap-2 text-sm">
          <button type="button" class="text-accent hover:underline" @click="jumpTo(replyTo)">
            回覆 #{{ replyTo }}
          </button>
          <button
            type="button"
            class="text-muted hover:text-ink"
            aria-label="取消回覆"
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
          placeholder="寫點什麼…"
          aria-label="留言內容"
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
            {{ create.isPending.value ? '送出中…' : '送出' }}
          </button>
        </div>
      </form>
    </template>
  </section>
</template>
