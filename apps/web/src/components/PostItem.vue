<script setup lang="ts">
import { computed, ref } from 'vue'
import { POST_MAX_LENGTH, type Post } from '@bg-tracker/shared'
import { formatDateTime } from '../lib/format.ts'
import { errorMessage } from '../lib/form.ts'
import { useEditPost, usePostRevisions } from '../composables/board.ts'

const props = defineProps<{ post: Post; mine: boolean; highlighted: boolean }>()
const emit = defineEmits<{ reply: [number]; jump: [number] }>()

const editing = ref(false)
const draft = ref('')
const error = ref('')
const edit = useEditPost()

function startEdit() {
  draft.value = props.post.content
  error.value = ''
  editing.value = true
}

async function save() {
  error.value = ''
  try {
    await edit.mutateAsync({ number: props.post.number, content: draft.value })
    editing.value = false
  } catch (err) {
    error.value = errorMessage(err)
  }
}

const showHistory = ref(false)
const revisions = usePostRevisions(
  () => props.post.number,
  () => showHistory.value,
)
const history = computed(() => revisions.data.value ?? [])
</script>

<template>
  <article
    :id="`post-${post.number}`"
    class="grid scroll-mt-20 gap-2 rounded-xl bg-card px-4 py-3 shadow-card transition-shadow"
    :class="{ 'ring-2 ring-accent': highlighted }"
  >
    <header class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
      <span class="font-bold tabular-nums">#{{ post.number }}</span>
      <span class="flex items-center gap-1.5">
        <img :src="post.author.avatarUrl" alt="" class="size-5 rounded-full" />
        {{ post.author.displayName }}
      </span>
      <time :datetime="post.createdAt" class="text-muted tabular-nums">
        {{ formatDateTime(post.createdAt) }}
      </time>
      <button
        v-if="post.replyTo"
        type="button"
        class="text-accent hover:underline"
        @click="emit('jump', post.replyTo)"
      >
        回覆 #{{ post.replyTo }}
      </button>
      <button
        v-if="post.editedAt"
        type="button"
        class="text-muted hover:text-ink"
        :aria-expanded="showHistory"
        @click="showHistory = !showHistory"
      >
        （已編輯 {{ post.editCount }} 次{{ showHistory ? '，收起紀錄' : '，看紀錄' }}）
      </button>
    </header>

    <form v-if="editing" class="grid gap-2" @submit.prevent="save">
      <textarea
        v-model="draft"
        rows="4"
        :maxlength="POST_MAX_LENGTH"
        required
        class="rounded-xl border border-line bg-bg px-3 py-2"
        aria-label="編輯內容"
      />
      <p v-if="error" class="text-sm text-danger" role="alert">{{ error }}</p>
      <div class="flex gap-3 text-sm">
        <button
          type="submit"
          :disabled="edit.isPending.value"
          class="rounded-lg bg-accent px-3 py-1 font-bold text-accent-ink disabled:opacity-50"
        >
          儲存
        </button>
        <button type="button" class="text-muted" @click="editing = false">取消</button>
      </div>
    </form>
    <p v-else class="break-words whitespace-pre-wrap">{{ post.content }}</p>

    <section v-if="showHistory" class="grid gap-2 border-t border-line pt-2" aria-label="編輯紀錄">
      <p v-if="revisions.isPending.value" class="text-sm text-muted">載入中…</p>
      <ol v-else class="grid gap-2">
        <li v-for="(rev, i) in history" :key="rev.createdAt + i" class="grid gap-0.5 text-sm">
          <span class="text-muted tabular-nums">
            {{ formatDateTime(rev.createdAt) }}
            {{ i === 0 ? '（目前）' : i === history.length - 1 ? '（原文）' : '' }}
          </span>
          <p class="break-words whitespace-pre-wrap" :class="{ 'text-muted': i > 0 }">
            {{ rev.content }}
          </p>
        </li>
      </ol>
    </section>

    <footer v-if="!editing" class="flex gap-4 text-sm">
      <button type="button" class="text-accent hover:underline" @click="emit('reply', post.number)">
        回覆
      </button>
      <button v-if="mine" type="button" class="text-muted hover:text-ink" @click="startEdit">
        編輯
      </button>
    </footer>
  </article>
</template>
