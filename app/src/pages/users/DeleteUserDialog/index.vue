<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete User</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {{ user?.firstName }} {{ user?.lastName }}? The user will be soft deleted and can be restored later.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button type="button" variant="outline" @click="handleCancel">
          Cancel
        </Button>
        <Button type="button" variant="destructive" @click="handleConfirm" :disabled="loading">
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
import type { UserResponse } from '@shared/types/user';

interface Props {
  open: boolean
  user?: UserResponse | null
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
});

const emits = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>();

const loading = ref(false);

const handleCancel = () => {
  emits('update:open', false);
};

const handleConfirm = async () => {
  loading.value = true;
  try {
    emits('confirm');
  } finally {
    loading.value = false;
  }
};
</script>

