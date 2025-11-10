<template>
  <Dialog
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ specialty ? 'Editar Especialidade' : 'Criar Especialidade' }}
        </DialogTitle>
        <DialogDescription>
          {{ specialty ? 'Atualizar informações da especialidade' : 'Adicionar uma nova especialidade ao sistema' }}
        </DialogDescription>
      </DialogHeader>

      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <div class="space-y-2">
          <Label for="name">Nome</Label>
          <Input
            id="name"
            v-model="formData.name"
            :disabled="!!specialty"
            required
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            :disabled="saving"
          >
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSpecialtiesStore } from '@/stores/specialties';
import type { CreateSpecialtyDto, UpdateSpecialtyDto, SpecialtyResponse } from '@shared/types/specialty';

interface Props {
  open: boolean
  specialty?: SpecialtyResponse | null
}

const props = withDefaults(defineProps<Props>(), {
  specialty: null,
});

const emits = defineEmits<{
  'update:open': [value: boolean]
  save: []
}>();

const specialtiesStore = useSpecialtiesStore();

const saving = ref(false);

const formData = ref({
  name: '',
});

watch(() => props.specialty, (specialty) => {
  if (specialty) {
    formData.value = {
      name: specialty.name,
    };
  } else {
    formData.value = {
      name: '',
    };
  }
}, { immediate: true });

watch(() => props.open, (open) => {
  if (!open) {
    formData.value = {
      name: '',
    };
  }
});

const handleSubmit = async () => {
  saving.value = true;
  try {
    if (!props.specialty) {
      const data: CreateSpecialtyDto = {
        name: formData.value.name.trim(),
      };
      await specialtiesStore.createSpecialty(data);
    } else {
      const data: UpdateSpecialtyDto = {};
      await specialtiesStore.updateSpecialty(props.specialty.id, data);
    }

    emits('save');
  } catch (error) {
    console.error('Error saving specialty:', error);
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  emits('update:open', false);
};
</script>

