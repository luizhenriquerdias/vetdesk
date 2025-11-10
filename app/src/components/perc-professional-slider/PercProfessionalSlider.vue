<template>
  <div class="space-y-2">
    <Label :for="id">Percentual de Pagamento</Label>
    <div class="space-y-2">
      <Slider
        :id="id"
        v-model="sliderValue"
        :min="0"
        :max="100"
        :step="1"
        :required="required"
      />
      <div class="flex justify-between text-sm text-muted-foreground">
        <span>Médico ({{ (modelValue ?? 0).toFixed(0) }}%)</span>
        <span class="flex-1" />
        <span>Clínica ({{ (100 - (modelValue ?? 0)).toFixed(0) }}%)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

withDefaults(defineProps<{
  id?: string
  required?: boolean
}>(), {
  id: 'percProfessional',
  required: false,
});

const modelValue = defineModel<number>({ default: 0 });

const sliderValue = ref([modelValue.value]);

watch(modelValue, (value) => {
  sliderValue.value = [value];
});

watch(sliderValue, (value) => {
  modelValue.value = value[0] ?? 0;
}, { immediate: true });
</script>

