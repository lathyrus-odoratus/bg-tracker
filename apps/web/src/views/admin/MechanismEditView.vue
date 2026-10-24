<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, ensureOk, unwrap } from '../../lib/api.ts'
import { errorMessage } from '../../lib/form.ts'
import { useMechanism } from '../../composables/catalog.ts'
import { useInvalidateCatalog } from '../../composables/admin.ts'

const route = useRoute()
const router = useRouter()
const invalidate = useInvalidateCatalog()

/** /admin/mechanisms/new 新增；/admin/mechanisms/:id/edit 編輯 */
const id = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const isNew = computed(() => !id.value)
const { data: mechanism } = useMechanism(id)

const form = reactive({ name: '', description: '' })
watch(
  mechanism,
  (m) => {
    if (m) Object.assign(form, { name: m.name, description: m.description })
  },
  { immediate: true },
)

const saving = ref(false)
const error = ref('')

async function save() {
  saving.value = true
  error.value = ''
  try {
    const { id: savedId } = isNew.value
      ? await unwrap(api.admin.mechanisms.$post({ json: form }))
      : await unwrap(api.admin.mechanisms[':id'].$put({ param: { id: id.value }, json: form }))
    await invalidate()
    await router.push(`/mechanisms/${savedId}`)
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm(`確定刪除「${form.name}」？`)) return
  error.value = ''
  try {
    await ensureOk(api.admin.mechanisms[':id'].$delete({ param: { id: id.value } }))
    await invalidate()
    await router.push('/mechanisms')
  } catch (err) {
    error.value = errorMessage(err)
  }
}
</script>

<template>
  <section class="mx-auto grid max-w-2xl gap-6">
    <h1 class="text-2xl font-black">
      {{ isNew ? '新增機制' : `編輯：${mechanism?.name ?? '…'}` }}
    </h1>
    <form class="grid gap-5" @submit.prevent="save">
      <label class="grid gap-1">
        <span class="text-sm font-bold">名稱</span>
        <input v-model="form.name" required maxlength="100" class="field" />
      </label>
      <label class="grid gap-1">
        <span class="text-sm font-bold">說明</span>
        <textarea v-model="form.description" rows="4" maxlength="1000" class="field" />
      </label>
      <p v-if="!isNew && mechanism" class="text-sm text-muted">
        使用的遊戲在各遊戲的編輯頁勾選（目前 {{ mechanism.games.length }} 款）。
      </p>
      <p v-if="error" class="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
        {{ error }}
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          :disabled="saving"
          class="rounded-xl bg-accent px-5 py-2 font-bold text-accent-ink disabled:opacity-50"
        >
          {{ saving ? '儲存中…' : '儲存' }}
        </button>
        <RouterLink :to="isNew ? '/mechanisms' : `/mechanisms/${id}`" class="text-muted">
          取消
        </RouterLink>
        <button v-if="!isNew" type="button" class="ml-auto text-sm text-danger" @click="remove">
          刪除這個機制
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.field {
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--card);
  padding: 0.5rem 0.75rem;
}
</style>
