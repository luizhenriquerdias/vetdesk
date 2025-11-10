<template>
  <div class="flex flex-col gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Receitas e Despesas do Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          v-if="loading"
          class="flex items-center justify-center h-64"
        >
          <p class="text-muted-foreground">
            Carregando...
          </p>
        </div>
        <div
          v-else-if="error"
          class="flex items-center justify-center h-64"
        >
          <p class="text-destructive">
            {{ error }}
          </p>
        </div>
        <div
          v-else
          class="h-64 relative"
        >
          <canvas
            ref="chartCanvas"
            class="w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { Chart, CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMonthlyIncomeOutcome } from '@/api/reports';

Chart.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend);

const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<Chart | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const chartData = ref<{ income: number; outcome: number } | null>(null);

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await getMonthlyIncomeOutcome();
    chartData.value = data;
  } catch (err) {
    error.value = 'Erro ao carregar dados';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const updateChart = async (data: { income: number; outcome: number }) => {
  await nextTick();

  if (!chartCanvas.value) {
    console.error('Canvas element not found');
    return;
  }

  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  chartInstance.value = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: ['Receitas', 'Despesas'],
      datasets: [
        {
          label: 'Valor',
          data: [data.income, data.outcome],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `R$ ${context.parsed.y.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              return `R$ ${Number(value).toFixed(2)}`;
            },
          },
        },
      },
    },
  });
};

watch([chartCanvas, chartData, loading, error], async ([canvas, data, isLoading, hasError]) => {
  if (canvas && data && !isLoading && !hasError) {
    await updateChart(data);
  }
});

onMounted(() => {
  fetchData();
});

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
});
</script>
