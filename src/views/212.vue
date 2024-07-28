<template>
    <div class="component-box" style="overflow: auto">
      <n-timeline horizontal>
        <n-timeline-item content="啊" />
        <n-timeline-item
          type="success"
          title="成功"
          content="哪里成功"
          time="2018-04-03 20:46"
        />
        <n-timeline-item
          type="error"
          content="哪里失败"
          time="2018-04-03 20:46"
        />
        <n-timeline-item
          type="warning"
          title="警告"
          content="哪里警告"
          time="2018-04-03 20:46"
        />
        <n-timeline-item
          type="info"
          title="信息"
          content="是的"
          time="2018-04-03 20:46"
        />
      </n-timeline>
  
    <n-progress
      type="line"
      :percentage="20"
      indicator-placement="outside"
      processing
    />
  
    <div>
        <button @click="connectPlug" :disabled="walletState.isConnected">Connect Plug</button>
        <p v-if="walletState.isConnected">Connected: {{ walletState.principalId }}</p>
      </div>
  
      <div v-if="walletState.isConnected">
        <h3>Canister Methods</h3>
        <div v-for="method in canisterMethods" :key="method">
          <button @click="callCanisterMethod(method)">Call {{ method }}</button>
        </div>
      </div>
  
      <div v-if="canisterState.result">
        <h4>Result:</h4>
        <pre>{{ canisterState.result }}</pre>
      </div>
  
      <n-space vertical>
      <n-spin :show="show">
        <n-alert title="啦啦啦" type="success">
          明天再打开行李箱。宝贝，挂电话啦。
        </n-alert>
        <template #description>
          你不知道你有多幸运
        </template>
      </n-spin>
      <n-button @click="show = !show">
        点击来转圈
      </n-button>
    </n-space>
  
  
  
  
  
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue';
  import { idlFactory } from "../../../declarations/yinru/backend/backend.did.js";
  
  export default {
    setup() {
      const walletState = reactive({
        isConnected: false,
        principalId: null,
      });
  
      const canisterState = reactive({
        actor: null,
        result: null
      });
      // 替换为您的 canister ID
      const canisterId = 'br5f7-7uaaa-aaaaa-qaaca-cai';
  
      // 替换为您的 canister 方法列表
      const canisterMethods = ['get_all_recognition_results'];
  
      const connectPlug = async () => {
        try {
          const whitelist = [canisterId];
          await window?.ic?.plug?.requestConnect({ whitelist });
  
          const principalId = await window.ic.plug.agent.getPrincipal();
          walletState.isConnected = true;
          walletState.principalId = principalId.toString();
  
          console.log(`Connected. Principal ID: ${walletState.principalId}`);
  
          // 创建 actor
          canisterState.actor = await window.ic.plug.createActor({
            canisterId: canisterId,
            interfaceFactory: idlFactory,
          });
  
          console.log("Actor created for canister:", canisterId);
        } catch (error) {
          console.error("Error connecting to Plug or creating actor:", error);
        }
      };
  
      const callCanisterMethod = async (methodName) => {
        if (!canisterState.actor) {
          console.error("Actor not created. Please connect to Plug first.");
          return;
        }
  
        try {
          // 这里我们假设方法不需要参数，如果需要参数，您需要相应地修改
          const result = await canisterState.actor[methodName]();
          canisterState.result = JSON.stringify(result, null, 2);
          console.log(`Method ${methodName} call result:`, result);
        } catch (error) {
          console.error(`Error calling method ${methodName}:`, error);
          canisterState.result = `Error: ${error.message}`;
        }
      };
  
      return {
        walletState,
        canisterState,
        canisterMethods,
        connectPlug,
        callCanisterMethod,
        show: ref(false)
  
      };
    }
  }
      // const getFile = async () => {
      //   try {
      //     const bytes = await backend.getFile(fileState.name);
      //     const bytesAsBuffer = new Uint8Array(bytes[0]);
      //     const blob = new Blob([bytesAsBuffer], {'type': 'image/png'});
      //     const fileURL = URL.createObjectURL(blob);
      //     imgRef.value.src = fileURL;
      //   } catch (error) {
      //     console.error("Error getting file:", error);
      //   }
      // };
  
      // const uploadFile = async (event) => {
      //   const fileList = event.target.files;
      //   for (let i = 0; i < fileList.length; i++) {
      //     const file = fileList[i];
      //     try {
      //       let fileSliceBuffer = await file.arrayBuffer();
      //       await backend.uplodaFile(file.name, Array.from(new Uint8Array(fileSliceBuffer)));
      //       console.log(`File ${file.name} uploaded successfully`);
      //     } catch (error) {
      //       console.error(`Error uploading file ${file.name}:`, error);
      //     }
      //   }
      // };
  </script>
  