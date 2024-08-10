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
        <n-statistic label="Progress" value="5%" />
      </n-gi>
      <n-gi>
        <n-statistic label="Holder" value="null" />
      </n-gi>
      <n-gi>
        <n-statistic label="deployid" value="0" />
      </n-gi>
    </n-grid>
    <template #title>
      <a href="https://anyway.fm/" style="text-decoration: none; color: inherit">face-id</a>
    </template>

    <template #avatar>
      <n-avatar  :size="48" src="https://pbs.twimg.com/profile_images/1773015678758387712/XQIG1d9o_400x400.jpg" />
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
        <n-progress
      color="green"
      type="dashboard"
      :gap-offset-degree="0"
      :gap-degree="120"
      :percentage="5"
    />

    <n-list hoverable clickable show-divider	>
    <n-list-item>
      <n-thing title="Face-id" content-style="margin-top: 10px;">
        <template #description>
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
import { ref,onMounted  } from 'vue'
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

const columns = [
  { title: 'Address', key: 'pid' },
  { title: 'Name', key: 'label' },
  { title: 'Token', key: 'score' }
]


const getRecognitionResults = async () => {
  loadingResults.value = true
  try {
    const rawResults = await canister.value.get_all_recognition_results()
    results.value = rawResults.map(result => {
      const [pid, label, score] = result.split(',')

      // 处理 PID
      const processedPid = pid.replace('principal:', '').trim()

      // 处理 Label，去除 "Name:" 部分
      const processedLabel = label.replace('label:', '').replace('Name:', '').trim()

      // 处理 Score，乘以 10000，处理为0情况
      let processedScore = parseFloat(score.replace('score:', '').trim()) * 10000
      if (isNaN(processedScore) || processedScore === 0) {
        processedScore = "0.00"
      } else {
        processedScore = processedScore.toFixed(2)
      }

      return { 
        pid: processedPid, 
        label: processedLabel, 
        score: processedScore
      }
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
