<template>
  <div class="query-dashboard">

    <n-layout-header bordered style="padding: 16px 24px;">
        <n-space align="center" justify="space-between">
          <n-space align="center">
            <n-avatar  :size="48" src="https://pbs.twimg.com/profile_images/1773015678758387712/XQIG1d9o_400x400.jpg" />
            <n-h2 style="margin: 0;">face-id</n-h2>
          </n-space>
          <!-- <n-statistic label="Total Supply" tabular-nums> -->
            <!-- <n-number-animation ref="numberAnimationInstRef" :from="0" :to="1000000000000" /></n-statistic> -->
            <n-button @click="handleClick">Claim</n-button>
        </n-space>
      </n-layout-header>
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

    <n-card title="Authorized Users" class="mt-4">
      <n-space vertical>
        <n-statistic label="Total Authorized Users">
          {{ totalUsers }}
        </n-statistic>
        <n-progress
    type="line"
    :percentage="1"
    indicator-placement="inside"
    processing
  />

        <n-button @click="getAuthorizedUsers" :loading="loadingUsers">
          Get Authorized Users
        </n-button>
        <n-list bordered v-if="users.length">
          <n-list-item v-for="user in users" :key="user">
            {{ user }}
          </n-list-item>
        </n-list>
      </n-space>
    </n-card>

    <n-card title="Recognition Results" class="mt-4">
      <n-space vertical>
        <n-button @click="getRecognitionResults" :loading="loadingResults">
          Get Recognition Results
        </n-button>
        <n-data-table
          :columns="columns"
          :data="results"
          :bordered="false"
          v-if="results.length"
        />
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { ref ,computed } from 'vue'
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
  { title: 'PID', key: 'pid' },
  { title: 'Label', key: 'label' },
  { title: 'Score', key: 'score' }
]

const getRecognitionResults = async () => {
  loadingResults.value = true
  try {
    const rawResults = await canister.value.get_all_recognition_results()
    results.value = rawResults.map(result => {
      const [pid, label, score] = result.split(',')
      return { 
        pid: pid.replace('principal:', '').trim(), 
        label: label.replace('label:', '').trim(), 
        score: score.replace('score:', '').trim() 
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