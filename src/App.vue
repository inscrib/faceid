<template>
<n-config-provider :theme="currentTheme">
<n-message-provider>
  <n-dialog-provider>

<div class="background">
<div class="app-container" :class="{ 'dark-theme': isDarkTheme }">
<n-layout class="layout">
<n-layout-header class="header">
<n-h3>FACEID</n-h3>
<n-tabs
type="segment"
animated
v-model:value="activeTab"
@update:value="handleTabChange"
>
<n-tab-pane name="Home" tab="Home" />
<n-tab-pane name="Upload" tab="Upload" />
<n-tab-pane name="About" tab="About" />
</n-tabs>
</n-layout-header>

<n-layout-content class="main-content">
<div class="content-wrapper">
  
<connect-button class="large-button" />
<connect-dialog />
<div v-if="isConnected" class="connected-content">
<p>Connected with principal: {{ principal }}</p>
<p>Active provider: {{ activeProvider?.meta.name }}</p>
<router-view></router-view>

</div>
<div v-else class="disconnected-message">
<p>Please connect to use the app</p>
</div>


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



</style>