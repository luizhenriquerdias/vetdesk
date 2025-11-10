<template>
  <Dialog
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Appointment</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this appointment? The appointment will be soft deleted and can be restored later.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          @click="handleCancel"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          :disabled="loading"
          @click="handleConfirm"
        >
          {{ loading ? 'Deleting...' : 'Delete' }}
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
import type { AppointmentResponse } from '@shared/types/appointment';

interface Props {
  open: boolean
  appointment?: AppointmentResponse | null
}

withDefaults(defineProps<Props>(), {
  appointment: null,
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

