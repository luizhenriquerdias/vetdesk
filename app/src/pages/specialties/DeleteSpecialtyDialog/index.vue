<template>
  <Dialog
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Excluir Especialidade</DialogTitle>
        <DialogDescription>
          Tem certeza que deseja excluir {{ specialty?.name }}? A especialidade será excluída de forma suave e poderá ser restaurada posteriormente.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          @click="handleCancel"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="destructive"
          :disabled="loading"
          @click="handleConfirm"
        >
          {{ loading ? 'Excluindo...' : 'Excluir' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { SpecialtyResponse } from '@shared/types/specialty';

interface Props {
  open: boolean
  specialty?: SpecialtyResponse | null
}

withDefaults(defineProps<Props>(), {
  specialty: null,
});

const emits = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>();

const loading = ref(false);

const handleCancel = () => {
  emits('update:open', false);
};

const handleConfirm = () => {
  loading.value = true;
  try {
    emits('confirm');
  } finally {
    loading.value = false;
  }
};
</script>

