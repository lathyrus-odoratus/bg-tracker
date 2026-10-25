<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, ensureOk } from '../../lib/api.ts'
import { errorMessage } from '../../lib/form.ts'
import { useMechanism } from '../../composables/catalog.ts'
import { useInvalidateCatalog } from '../../composables/admin.ts'
import { t } from '../../i18n/index.ts'

const route = useRoute()
const router = useRouter()
const invalidate = useInvalidateCatalog()

/** /admin/mechanisms/:id/edit：機制由 BGA 同步建立，這裡只改名稱與說明 */
const id = computed(() => String(route.params.id))
const { data: mechanism } = useMechanism(id)

const form = reactive({ name: '', nameEn: '', description: '' })
watch(
  mechanism,
  (m) => {
    if (m) Object.assign(form, { name: m.name, nameEn: m.nameEn ?? '', description: m.description })
  },
  { immediate: true },
)

const saving = ref(false)
const error = ref('')

async function save() {
  saving.value = true
  error.value = ''
  try {
    await ensureOk(
      api.admin.mechanisms[':id'].$put({
        param: { id: id.value },
        json: { ...form, nameEn: form.nameEn.trim() || null },
      }),
    )
    await invalidate()
    await router.push(`/mechanisms/${id.value}`)
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm(t('adminMechanism.confirmDelete', { name: form.name }))) return
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
      {{ $t('adminMechanism.title', { name: mechanism?.name ?? '…' }) }}
    </h1>
    <form class="grid gap-5" @submit.prevent="save">
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="grid gap-1">
          <span class="text-sm font-bold">{{ $t('adminMechanism.name') }}</span>
          <input v-model="form.name" required maxlength="100" class="field" />
        </label>
        <label class="grid gap-1">
          <span class="text-sm font-bold">{{ $t('adminMechanism.nameEn') }}</span>
          <input v-model="form.nameEn" maxlength="100" lang="en" class="field" />
        </label>
      </div>
      <label class="grid gap-1">
        <span class="text-sm font-bold">{{ $t('adminMechanism.description') }}</span>
        <textarea v-model="form.description" rows="4" maxlength="1000" class="field" />
      </label>
      <p v-if="mechanism" class="text-sm text-muted">
        {{ $t('adminMechanism.gamesNote', { n: mechanism.games.length }) }}
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
          {{ saving ? $t('common.saving') : $t('common.save') }}
        </button>
        <RouterLink :to="`/mechanisms/${id}`" class="text-muted">{{
          $t('common.cancel')
        }}</RouterLink>
        <button type="button" class="ml-auto text-sm text-danger" @click="remove">
          {{ $t('adminMechanism.delete') }}
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
