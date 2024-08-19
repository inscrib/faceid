<template>
  <div class="query-dashboard">


          <!-- <n-statistic label="Total Supply" tabular-nums> -->
            <!-- <n-number-animation ref="numberAnimationInstRef" :from="0" :to="1000000000000" /></n-statistic> -->
  


      <n-page-header subtitle="br5f7-7uaaa-aaaaa-qaaca-cai" @back="handleBack">
    <n-grid :cols="4">
      <n-gi>
        <n-statistic label="Supply" value="100b" />
      </n-gi>
      <n-gi>
        <n-statistic label="Progress" :value="`${progressPercentage}%`" />
      </n-gi>
      <n-gi>
        <n-statistic label="holder" :value="`${progressPercentage}`" />
      </n-gi>
      <n-gi>
        <n-statistic label="deployid" value="1" />
      </n-gi>
    </n-grid>
    <template #title>
      <a href="/" style="text-decoration: none; color: inherit">face-id</a>
    </template>

    <template #avatar>
      <n-avatar  :size="48" src="https://inscrib.github.io/picx-images-hosting/images.7egp8bww3i.webp" />
    </template>
    <template #extra>
      <n-space>
        <n-button @click="handleClick">Claim</n-button> 
      </n-space>
    </template>

  </n-page-header>

  <n-divider />   
      <n-card title="Your Assets">

  <n-spin :show="loading">
      <n-space vertical>
        <pre>{{ debugInfo }}</pre>
    <n-button @click="fetchBalance" :loading="loading">
      Fetch Balance
    </n-button>

      </n-space>
    </n-spin>
</n-card>
    <h1> Query Dashboard</h1>
    <n-card title="All user in the database" class="mt-4">
      <n-space vertical>
        <n-statistic label="Total num">
          {{ totalUsers }}
        </n-statistic>
        <n-button @click="getAuthorizedUsers" :loading="loadingUsers">
          Get all use inthe database
        </n-button>
        <n-list bordered v-if="users.length">
          <n-list-item v-for="user in users" :key="user">
            {{ user }}
          </n-list-item>
        </n-list>
      </n-space>
    </n-card>

    <n-card title="Deploy Token Ledger" class="mt-4">
      <n-space vertical>
        <n-button @click="getRecognitionResults" :loading="loadingResults">
          Get Recognition Results
        </n-button>

    <n-list hoverable clickable show-divider	>
    <n-list-item>
      <n-thing title="Face-id" content-style="margin-top: 10px;">
        <template #description>
          <n-progress
          color="green"
      type="line"
      :percentage="progressPercentage"
      :height="24"
      :border-radius="4"
      :fill-border-radius="0"
    />
          <n-space size="small" style="margin-top: 4px">
            <n-tag :bordered="false" type="info" size="small">
              br5f7-7uaaa-aaaaa-qaaca-cai
            </n-tag>
            <n-tag :bordered="false" type="loading" size="small">
              pending...
            </n-tag>
      <n-data-table
          :columns="columns"
          :data="results"
          :bordered="true"
          v-if="results.length"
        />

          </n-space>
        </template>
      </n-thing>
    </n-list-item>

  </n-list>

      </n-space>
    </n-card>


    <n-card title="Cycles Information">
      <n-space vertical>
        <n-statistic label="Current Cycles">
          {{ cycles }}
        </n-statistic>
        <n-button @click="getCycles" :loading="loadingCycles">
          Get Cycles
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { ref,onMounted,computed  } from 'vue'
import { useCanister ,useBalance,useConnect  } from '@connect2ic/vue'
import { useDialog } from 'naive-ui'

const [canister] = useCanister("couter", { mode: "anonymous" })

const loading = ref(false)
const debugInfo = ref({})

const { isConnected, connect } = useConnect()
const [assets, { refetch, error }] = useBalance()

const fetchBalance = async () => {
  loading.value = true
  try {
    if (!isConnected.value) {
      await connect()
    }
    await refetch()
    debugInfo.value = {
      isConnected: isConnected.value,
      assets: assets.value,
      error: error.value
    }
  } catch (e) {
    debugInfo.value = {
      error: e.message,
      stack: e.stack
    }
  } finally {
    loading.value = false
  }
}


// Cycles
const cycles = ref(0)
const loadingCycles = ref(false)

const getCycles = async () => {
  loadingCycles.value = true
  try {
    cycles.value = await canister.value.get_cycles()
  } catch (error) {
    console.error('Error getting cycles:', error)
  } finally {
    loadingCycles.value = false
  }
}

// Authorized Users
const totalUsers = ref(0)
const users = ref([])
const loadingUsers = ref(false)

const getAuthorizedUsers = async () => {
  loadingUsers.value = true
  try {
    const [count, principals] = await canister.value.get_add_callers()
    totalUsers.value = count
    users.value = principals
  } catch (error) {
    console.error('Error getting authorized users:', error)
  } finally {
    loadingUsers.value = false
  }
}

// Recognition Results
const results = ref([])
const loadingResults = ref(false)
const totalResults = ref(0)

const columns = [
  { title: 'Address', key: 'pid' },
  { title: 'Name', key: 'label' },
  { title: 'Token', key: 'score' }
]

const progressPercentage = computed(() => {
  return Math.min(Math.round((totalResults.value / 100) * 100), 100)
})


const getRecognitionResults = async () => {
  loadingResults.value = true
  try {
    const rawResults = await canister.value.get_all_recognition_results()
    console.log('Raw results:', rawResults) // 添加这行来查看原始数据
    totalResults.value = rawResults.length
    results.value = rawResults.map(result => {
      const [pidPart, labelPart, scorePart] = result.split(', ')

      const pid = pidPart.replace('principal:', '').trim()
      const label = labelPart.replace('Name:', '').trim()
      
      // 正确处理 Token 部分
      const scoreMatch = scorePart.match(/Token:\s*([\d.]+)/)
      let score = scoreMatch ? parseFloat(scoreMatch[1]) : 0

      // 保留4位小数
      score = score.toFixed(5)*10000

      console.log(`Processed result: pid=${pid}, label=${label}, score=${score}`) // 添加这行来查看处理后的数据

      return { pid, label, score }
    })
  } catch (error) {
    console.error('Error getting recognition results:', error)
  } finally {
    loadingResults.value = false
  }
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
      onMounted(async () => {
        await fetchBalance();
  await getCycles(); 
  await getRecognitionResults();
  await getAuthorizedUsers();
      });

</script>

<style scoped>
.query-dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.mt-4 {
  margin-top: 1rem;
}
</style>
