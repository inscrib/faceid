<template>
<n-config-provider :theme="currentTheme">
<n-message-provider>
  <n-dialog-provider>

<div class="background">
<div class="app-container" :class="{ 'dark-theme': isDarkTheme }">
<n-layout class="layout">

<n-layout-header class="header">
    <div class="header-content">
      <div class="title-section">
      <n-gradient-text
       class="main-title"
        :size="28"
         type="success"
      >
        FACEID

      </n-gradient-text>
      <n-text class="subtitle" :depth="3">
        the fairest token distribution DID
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
      <n-tab-pane name="Claim" tab="Claim" />
      <n-tab-pane name="About" tab="About" />
      <n-tab-pane name="Deploy" tab="Deploy" />
      <n-tab-pane name="Database" tab="Database" />

  </n-tabs>

    </div>
  </n-layout-header>

  <n-alert title="Warning!" type="info" closable>
    It is still in testing pharase and the contract hasnt officially Claimed.<br/> pls do not transfer any assets to address.
    <br/>if you have face 403 error. click <n-button @click="clearAllSiteData">this </n-button>  </n-alert>

 </n-alert>

<n-layout-content class="main-content">
    <div class="content-wrapper">
      <template v-if="!isConnected">

        <n-result
    status="info"
    title="Login"
    description="Please connect to use the app"
  >
  </n-result>
  <n-divider />   
  <connect-button class="large-button" />
  <connect-dialog />

</template>
      
      <div v-else class="disconnected-message">
        <div class="connected-content">
          <p>Principal: {{ principal }}</p>
          <p>Wallet: {{ activeProvider?.meta.name }}</p>
          <n-divider />   
          <router-view></router-view>

        </div>

      </div>




      <n-divider />   
      <n-card title="Tips">
 
        <n-collapse>
  <n-collapse-item title="What should I do?" name="1">
    <div>
      1. Hit that shiny Claim Button like you re ringing a bell! 🛎️<br/>
      2. Look up, smile, and Claim your face data. Just remember, once its up there, its set in stone. So strike your best pose! 😎<br/>
      3. Check out your status on the About page and feel like the rockstar you are. 🎸
    </div>
  </n-collapse-item>

  <n-collapse-item title="When can I check my tokens?" name="2">
    <div>
      1. The claim process is a two-act show. First, Claim your data, then use the recognition feature to claim your Face ID. Its a VIP pass! You address will link with your face permently! 🎟️<br/>
      2. Once you ve claimed, you cant use recognition again. You ve got three shots at glory, so make them count! ⚡<br/>
      3. Your tokens are tied to your score. The higher the score, the more tokens you get! But dont go too far off the charts. accuracy is key! 🎯<br/>
      4. After the grand finale, and once we hit our target number of claims. the canisters will automatically dish out your "FaceID" token balance<br/>(tips of tip, we havent decide the name,so if u have any good idea,tell us! ). 🎉
    </div>
  </n-collapse-item>

  <n-collapse-item title="What is the total amount of tokens and how are they distributed?" name="3">
    <div>
      1. The total number of Face ID tokens is 100b, but it depends on the number of test users, your score is your share. 🌌<br/>
      2. All tokens go to our amazing test users, about 500 awesome folks. 🎉<br/>
      3. We re trying out new anti-bot minting methods. This is a test, so things might get a little wobbly. Dont put any real balance into your account; we re just here for the fun! 🤖
    </div>
  </n-collapse-item>

  <n-collapse-item title="Is my data secure?" name="4">
    <div>
      Absolutely! Your info is locked up tighter than a treasure chest in the ICP canister. No one can access it; it's only used for verifying your info. 🛡️
    </div>
  </n-collapse-item>

  <n-collapse-item title="What are the next steps?" name="5">
    <div>
      We're cooking up a fresh new distribution method using face recognition to ensure everyone gets a fair shot at the tokens. Stay tuned! 🍲
    </div>
  </n-collapse-item>
</n-collapse>


</n-card>
    </div>
  </n-layout-content>




</n-layout>
<footer class="footer">
<p>@2024 && Build On the internet computer && <a href="https://x.com/FaceidDid" style="color: aliceblue;">Twitter</a></p>
</footer>
</div>
</div>

  <div class="theme-switcher">
    <n-button
      @click="disconnect"
      round
      type="primary"
      size="small"
      ghost
      v-if="isConnected"
    >
      Disconnect
    </n-button>
    <n-switch
      v-model:value="isDarkTheme"
      @update:value="handleThemeChange"
      round
      size="large"
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
NSwitch,
darkTheme as naiveDarkTheme,
} from "naive-ui";

import { ConnectButton, ConnectDialog, useConnect } from "@connect2ic/vue";
require('@connect2ic/core/style.css');


const clearAllSiteData = () => {
  // 清除 localStorage
  localStorage.clear();

  // 清除 sessionStorage
  sessionStorage.clear();

  // 清除所有 cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });

  // 清除 IndexedDB
  const clearIndexedDB = async () => {
    const databases = await window.indexedDB.databases()
    databases.forEach(db => {
      window.indexedDB.deleteDatabase(db.name)
    })
  }
  clearIndexedDB();

  // 清除 Cache Storage
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }

  // 清除 Application Cache
  if (window.applicationCache) {
    window.applicationCache.abort();
  }

  // 清除 Service Workers
  if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }

  console.log("All site data cleared");
}


const { isConnected, disconnect, principal, activeProvider } = useConnect({
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
  gap: 16px; /* 间距 */
  right: 20px;
  bottom: 20px;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.theme-switcher n-button,
.theme-switcher n-switch {
  margin-right: 8px; /* 可选的额外间距 */
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
  max-height: 95vh;
overflow-y: auto; /* 允许垂直滚动 */
}

.header {
padding: 10px;
}

:deep(.n-tabs) {
font-size: 14px;
}
}

.main-content {
  flex: 1;
  overflow-y: auto; /* 允许垂直滚动 */
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
overflow-y: auto;
min-height: 100%; /* 确保wrapper占据全部可用高度 */
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
