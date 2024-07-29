<template>
<n-config-provider :theme="currentTheme">
<n-message-provider>
  <n-dialog-provider>

<div class="background">
<div class="app-container" :class="{ 'dark-theme': isDarkTheme }">
<n-layout class="layout">
<!-- <n-layout-header class="header">
<n-h3>FACEID -- the fairest token distribution</n-h3>
<n-tabs
type="segment"
animated
v-model:value="activeTab"
@update:value="handleTabChange"
>
<n-tab-pane name="Home" tab="Home" />
<n-tab-pane name="Upload" tab="Upload" />
<n-tab-pane name="About" tab="About" />
<n-tab-pane name="test" tab="test" />

</n-tabs>
</n-layout-header> -->



<n-layout-header class="header">
    <div class="header-content">
      <div class="title-section">
      <n-gradient-text
       class="main-title"
        :size="28"
        :gradient="{
         from: 'rgb(128, 0, 128)',
         to: 'rgb(0, 255, 0)',
        }"
      >
        FACEID
      </n-gradient-text>
      <n-text class="subtitle" :depth="3">
        the fairest token distribution
      </n-text>
    </div>
    <n-tabs
      type="segment"
      animated
      :value="activeTab"
      @update:value="handleTabChange"
      class="nav-tabs"
    >
      <n-tab-pane name="Home" tab="Home" />
      <n-tab-pane name="Upload" tab="Upload" />
      <n-tab-pane name="About" tab="About" />
      <n-tab-pane name="test" tab="Test" />
    </n-tabs>
    </div>
  </n-layout-header>



<n-layout-content class="main-content">
    <div class="content-wrapper">
      <connect-button class="large-button" />
      <connect-dialog />
      
      <template v-if="isConnected">
        <div class="connected-content">
          <p>Connected with principal: {{ principal }}</p>
          <p>Active provider: {{ activeProvider?.meta.name }}</p>
        </div>
        <router-view></router-view>
      </template>
      
      <div v-else class="disconnected-message">
        <n-result
    status="info"
    title="Login"
    description="Please connect to use the app"
  >
  </n-result>
      </div>
      <n-divider />   
      <n-card title="Tips">
  <n-collapse>
    <n-collapse-item title="What should I do?" name="1">
  <div>
    1. Click on the Claim option.<br/>
    2. Upload your face data and information. Note that once uploaded, you cannot add new information agein. <br/>
    3. You can view your status in the About section.
  </div>
</n-collapse-item>

<n-collapse-item title="When can I check my tokens?" name="2">
  <div>
    1. Claiming consists of two parts. After uploading your data, you need to use the recognition feature to claim your face ID.<br/>
    2. Once successfully claimed, you cannt useing recognition again. Each person has up to 3 attempts.<br/>
    3. Your token allocation depends on your score. Higher differences means more tokens! but a very high difference may lead to recognition failure.<br/>
    4. When the process is complete and the number of claimed ppl reaches the target, the canisters will automatically distribute the faceid token balance.
  </div>
</n-collapse-item>

<n-collapse-item title="What is the total amount of tokens and how are they distributed?" name="3">
  <div>
    1. The total amount of Face ID tokens is unlimited but depends on the number of test users.<br/>
    2. All tokens are distributed to test users, approximately 500 people.<br/>
    3. We are exploring a new anti-bot minting methods. This is just a test, so there may be issues. Do not deposit any balance into your account.
  </div>
</n-collapse-item>

<n-collapse-item title="Is my data secure?" name="4">
  <div>
    Yes, your information is securely stored in the ICP canister. No one can access it, and it is only used wen verifying your information.
  </div>
</n-collapse-item>

<n-collapse-item title="What are the next steps?" name="5">
  <div>
    We plan to implement a new distribution method that uses face recognition to ensure fair access to tokens for more ppl.
  </div>
</n-collapse-item>

  </n-collapse>
</n-card>
    </div>
  </n-layout-content>




</n-layout>
<footer class="footer">
<p>@2024 && Build in the internet computer</p>
</footer>
</div>
</div>
<div class="theme-switcher">
<n-switch
v-model:value="isDarkTheme"
@update:value="handleThemeChange"
>
<template #checked>Dark</template>
<template #unchecked>Light</template>
</n-switch>
</div>
</n-dialog-provider>
</n-message-provider>
</n-config-provider>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
NConfigProvider,
NMessageProvider,
NLayout,
NLayoutHeader,
NLayoutContent,
NTabs,
NTabPane,
NH3,
NSwitch,
darkTheme as naiveDarkTheme,
} from "naive-ui";

import { ConnectButton, ConnectDialog, useConnect } from "@connect2ic/vue";
require('@connect2ic/core/style.css');
const { isConnected, principal, activeProvider } = useConnect({
  onConnect: () => {
    console.log("Signed in");
  },
  onDisconnect: () => {
    console.log("Signed out");
  }
});



const router = useRouter();
const route = useRoute();
const currentTheme = ref(naiveDarkTheme);
const isDarkTheme = ref(true);
const activeTab = ref(route.name);



watch(() => route.name, (newRouteName) => {
activeTab.value = newRouteName;
});

const handleTabChange = (tabName) => {
router.push({ name: tabName });
};

const handleThemeChange = (value) => {
currentTheme.value = value ? naiveDarkTheme : null;
};
</script>

<style scoped>
.background {
background-image: url("assets/background.jpg");
background-size: cover;
background-position: center;
background-attachment: fixed;
min-height: 100vh;
display: flex;
justify-content: center;
align-items: center;
padding: 20px;
}

.app-container {
width: 100%;
max-width: 1200px;
min-height: 80vh;
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(10px);
border-radius: 20px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
display: flex;
flex-direction: column;
overflow: hidden;
transition: all 0.3s ease;
}

.layout {
flex: 1;
display: flex;
flex-direction: column;
}

.header {
padding: 20px;
text-align: center;
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(5px);
transition: all 0.3s ease;
}

.main-content {
flex: 1;
display: flex;
justify-content: center;
align-items: center;
padding: 20px;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  background-color: #282c34;
  color: white;
  padding: 0 20px;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
}


.theme-switcher {
position: fixed;
right: 20px;
bottom: 20px;
background-color: rgba(255, 255, 255, 0.3);
padding: 10px;
border-radius: 20px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
z-index: 1000;
transition: all 0.3s ease;
}

.dark-theme {
background: rgba(0, 0, 0, 0.5);
}

.dark-theme .header,
.dark-theme .footer {
background: rgba(0, 0, 0, 0.2);
border-color: rgba(255, 255, 255, 0.05);
}


.dark-theme .footer {
  background: rgba(113, 114, 140, 0.532);
}

.dark-theme .theme-switcher {
background-color: rgba(0, 0, 0, 0.3);
}

:deep(.n-tabs-nav) {
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(5px);
border-radius: 20px;
padding: 5px;
transition: all 0.3s ease;
}

:deep(.n-tabs-nav .n-tabs-tab) {
color: inherit;
transition: all 0.3s ease;
}

:deep(.n-tabs-nav .n-tabs-tab:hover),
:deep(.n-tabs-nav .n-tabs-tab.n-tabs-tab--active) {
color: #36ad6a;
}

:deep(.n-tabs-nav .n-tabs-tab.n-tabs-tab--active) {
font-weight: bold;
}

.dark-theme :deep(.n-tabs-nav) {
background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 768px) {
.background {
padding: 10px;
}

.app-container {
min-height: 95vh;
}

.header {
padding: 10px;
}

:deep(.n-tabs) {
font-size: 14px;
}
}

.main-content {
display: flex;
justify-content: center;
align-items: center; /* 改为 center 实现垂直居中 /
min-height: 100vh; / 使用 100vh 确保至少占满整个视口高度 */
padding: 20px;
}

.content-wrapper {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
text-align: center;
width: 100%;
max-width: 600px;
height: 100%; /* 确保wrapper占据全部可用高度 */
}

.connected-content,
.disconnected-message {
margin-top: 20px;
}

:deep(.large-button button) {
display: flex;
justify-content: center;
align-items: center;
width: 100%;
height: 100%;
}

.main-title {
  font-size: 28px;
  font-weight: bold;
  margin-right: 5px; /* 增加 FACEID 和副标题之间的间距 */
}

.subtitle {
  font-size: 20px;
  color: #666666;
}
.title-section {
  align-items: baseline;
  gap: 211px; /* 增加标题和副标题之间的间距 */
}
</style>