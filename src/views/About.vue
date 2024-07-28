<template>
  <n-config-provider :theme="darkTheme">
    <n-layout>
      <n-layout-header bordered style="padding: 16px 24px;">
        <n-space align="center" justify="space-between">
          <n-space align="center">
            <n-avatar  :size="48" src="https://pbs.twimg.com/profile_images/1773015678758387712/XQIG1d9o_400x400.jpg" />
            <n-h2 style="margin: 0;">face-id</n-h2>
          </n-space>
          <n-statistic label="Total Supply" tabular-nums>
            <n-number-animation ref="numberAnimationInstRef" :from="0" :to="10000000" /></n-statistic>
            <n-button @click="handleClick">
    Claim
  </n-button>
        </n-space>
      </n-layout-header>
      <n-layout-content style="padding: 24px;">
        <div class="waterfall-container">
          <n-card 
            v-for="(item, index) in items" 
            :key="index"
            class="waterfall-item"
            :bordered="false"
            :segmented="{ content: true, footer: 'soft' }"
          >
            <template #header>
              <n-h3 style="margin: 0;">{{ item.title }}</n-h3>
            </template>
            <n-p style="margin: 16px 0;">{{ item.content }}</n-p>
            <template #footer>

              <n-space vertical size="large">
                <n-progress 
                  type="line" 
                  :percentage="item.progress" 
                  :color="getProgressColor(item.progress)"
                  :height="8"
                  :border-radius="4"
                >
                  Progress: {{ item.progress }}%

                </n-progress>
        
                <n-timeline >
                  <n-timeline-item 
                    v-for="event in item.timeline" 
                    :key="event.date" 
                    :type="event.type" 
                    :title="event.title" 
                    :content="event.date" 
                  />
                </n-timeline>
 
              </n-space>
            </template>
          </n-card>
        </div>
      </n-layout-content>
    </n-layout>
    <n-back-top :right="20" />
  </n-config-provider>
</template>

<script setup>
import { defineComponent,ref, computed } from 'vue'
import { darkTheme ,useDialog } from 'naive-ui'
const items = ref([
  {
    title: "FACEID",
    content: "The first fair distribution using face recognition MEME",
    progress: 1,
    timeline: [
      { type: "success", title: "Mint.." },
      { type: "error", title: "loading..." },
      { type: "info", title: "..." },
    ]
  },
  {
    title: "Other",
    content: "Upcoming",
    progress: 0,
    timeline: [
      { type: "success", title: "..." },
    ]
  },

])


const completedProjects = computed(() => {
  return items.value.filter(item => item.progress === 100).length
})

const getProgressColor = (progress) => {
  if (progress < 30) return '#ff4d4f'
  if (progress < 70) return '#faad14'
  return '#52c41a'
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const dialog = useDialog();

const handleClick = () => {
  const d = dialog.info({
    title: "Claim Request",
    content: "Are you sure you want to claim?",
    positiveText: "Confirm",
    negativeText: "Cancel",
    closable: false,
    maskClosable: false,
    onPositiveClick: async () => {
      d.loading = true;
      
      // Simulate asynchronous operation for 5 seconds
      await sleep(5000);
      
      // Update dialog content after 5 seconds
      d.loading = false;
      d.type = 'error';
      d.title = 'Error';
      d.content = "Function Not available";
      d.positiveText = "exit";
      d.negativeText = null;
      
      // Remove automatic closing and add manual close function
      d.onPositiveClick = () => {
        d.destroy();
      };
      return false;
    },
    onNegativeClick: () => {
      d.destroy();
    }
  });
};


</script>

<style scoped>
.waterfall-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 24px;
  grid-auto-flow: dense;
}

.waterfall-item {
  break-inside: avoid;
  transition: all 0.3s ease;
}

.waterfall-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style>