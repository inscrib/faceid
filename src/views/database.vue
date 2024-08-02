<script setup>
import * as faceapi from "face-api.js";
import { onMounted, onUnmounted, reactive,ref  } from "vue";

/**属性状态 */
const state = reactive({
  netsLoadModel: true,
  netsType: "ssdMobilenetv1",
  netsOptions: {
    ssdMobilenetv1: undefined,
    tinyFaceDetector: undefined,
  },
  faceMatcher: {},
  /**目标图片元素 */
  targetImgEl: null,
  /**目标画布图层元素 */
  targetCanvasEl: null,
  /**识别视频元素 */
  discernVideoEl: null,
  /**识别画布图层元素 */
  discernCanvasEl: null,
  /**绘制定时器 */
  timer: 0,
});

const detectionResults = ref([]);


/**初始化模型加载 */
async function fnLoadModel() {
  // 模型文件访问路径
  const modelsPath = `/models`;
  // 面部轮廓模型
  await faceapi.nets.faceLandmark68Net.load(modelsPath);
  // 面部识别模型
  await faceapi.nets.faceRecognitionNet.load(modelsPath);

  // 模型参数-ssdMobilenetv1
  await faceapi.nets.ssdMobilenetv1.load(modelsPath);
  state.netsOptions.ssdMobilenetv1 = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.5, // 0 ~ 1
    maxResults: 50, // 0 ~ 100
  });
  // 模型参数-tinyFaceDetector
  await faceapi.nets.tinyFaceDetector.load(modelsPath);
  state.netsOptions.tinyFaceDetector = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416, // 160 224 320 416 512 608
    scoreThreshold: 0.5, // 0 ~ 1
  });

  // 输出库版本
  console.log(
    `FaceAPI Version: ${
      faceapi?.version || "(not loaded)"
    } \nTensorFlow/JS Version: ${
      faceapi.tf?.version_core || "(not loaded)"
    } \nBackend: ${
      faceapi.tf?.getBackend() || "(not loaded)"
    } \nModels loaded: ${faceapi.tf.engine().state.numTensors} tensors`
  );

  // 节点元素
  state.targetImgEl = document.getElementById("page_draw-img-target");
  state.targetCanvasEl = document.getElementById("page_draw-canvas-target");
  state.discernVideoEl = document.getElementById("page_draw-video");
  state.discernCanvasEl = document.getElementById("page_draw-video-canvas");



  
  // 关闭模型加载
  state.netsLoadModel = false;
}

/**根据模型参数识别绘制--目标图 */
async function fnRedrawTarget() {
  console.log("Run Redraw Target");
  const detect = await faceapi
    .detectAllFaces(state.targetImgEl, state.netsOptions[state.netsType])
    // 需引入面部轮廓模型
    .withFaceLandmarks()
    // 需引入面部识别模型
    .withFaceDescriptors();
  if (!detect.length) {
    state.faceMatcher = null;
    return;
  }

  // 原图人脸矩阵结果
  state.faceMatcher = new faceapi.FaceMatcher(detect);

  // 识别图像绘制
  const dims = faceapi.matchDimensions(state.targetCanvasEl, state.targetImgEl);
  const resizedResults = faceapi.resizeResults(detect, dims);
  resizedResults.forEach(({ detection, descriptor }) => {
    const best =  "Dom, \nPrincipal ID: \n4s4hz-og66m-hypzp-uxv6q-addgn-hshem-dnvln-uhy7t-h3hsc-pmajb-mqe	";

    // 目标原图绘制框
    new faceapi.draw.DrawBox(detection.box, {
      label: best,
      boxColor: "#55b81",
      drawLabelOptions: { 
          fontSize: 10, 
          fontStyle: 'bold',
          padding: 10  // 增加标签padding使其更明显
        }
    }).draw(state.targetCanvasEl);
  });
}

/**根据模型参数识别绘制 */
async function fnRedrawDiscern() {
  if (!state.faceMatcher) return;
  console.log("Run Redraw Discern");

  // 暂停视频时清除定时
  if (state.discernVideoEl.paused) {
    clearTimeout(state.timer);
    state.timer = 0;
    return;
  }

  // 识别绘制人脸信息
  const detect = await faceapi
    .detectAllFaces(state.discernVideoEl, state.netsOptions[state.netsType])
    // 需引入面部轮廓模型
    .withFaceLandmarks()
    // 需引入面部识别模型
    .withFaceDescriptors();

  // 无识别数据时，清除定时重新再次识别
  if (!detect) {
    clearTimeout(state.timer);
    state.timer = 0;
    fnRedrawDiscern();
    return;
  }

  // 匹配元素大小
  const dims = faceapi.matchDimensions(
    state.discernCanvasEl,
    state.discernVideoEl,
    true
  );
  const result = faceapi.resizeResults(detect, dims);

  state.discernCanvasEl.getContext('2d').clearRect(0, 0, state.discernCanvasEl.width, state.discernCanvasEl.height);
  // 更新检测结果
  detectionResults.value = result.map(({ detection, descriptor }, index) => {
    // const best = state.faceMatcher.findBestMatch(descriptor);
    const label = `Dom `;
    return {
      label,
      position: `X: ${Math.round(detection.box.x)}, Y: ${Math.round(detection.box.y)}`,
    };
  });
  
  result.forEach(({ detection, descriptor }) => {
    // 最佳匹配 distance越小越匹配
    const best = state.faceMatcher.findBestMatch(descriptor);

    const label = 'Dom';
    new faceapi.draw.DrawBox(detection.box, {
      label,
      drawLabelOptions: { 
          fontSize: 50, 
          fontStyle: 'bold',
          padding: 10  // 增加标签padding使其更明显
        }
     }).draw(
      state.discernCanvasEl
    );
  });

  // 定时器句柄
  state.timer = setTimeout(() => fnRedrawDiscern(), 0);
}

/**
 * 视频暂停播放
 *
 * 播放视频，开始识别绘制
 *
 * 暂停视频，不清除画布
 */
function fnVidelPaused() {
  if (state.discernVideoEl.paused) {
    state.discernVideoEl.play();
    setTimeout(() => fnRedrawDiscern(), 300);
  } else {
    state.discernVideoEl.pause();
  }
}



/**更换视频 */
function fnChangeDiscern(e) {
  if (!state.discernVideoEl || !state.discernCanvasEl) return;
  if (!e.target || !e.target.files.length) return;
  // 将文件显示为视频并识别
  state.discernVideoEl.pause();
  state.discernVideoEl.src = URL.createObjectURL(e.target.files[0]);
  clearTimeout(state.timer);
  state.timer = 0;

  setTimeout(() => {
    // 清空画布
    state.discernCanvasEl
      .getContext("2d")
      .clearRect(
        0,
        0,
        state.discernCanvasEl.width,
        state.discernCanvasEl.height
      );
  }, 300);
}





onMounted(() => {
  fnLoadModel().then(() => fnRedrawTarget());
});

onUnmounted(() => {
  clearTimeout(state.timer);
  state.timer = 0;
});
</script>


<template>
  <div class="page">
        <n-alert title="Tips" type="default">
      It is just a demo. All your information is securely stored in the ICP canister and will only be verified when checking consistency. 
          <br/>we will open database up in thenext so that you can take a photo of any person in real life and find out his information on web3
          <br/>1:1 mapping, and eternal soul binding...
    </n-alert>
    <n-divider /> 
    <NSpin :show="state.netsLoadModel">
    <div class="page_draw" v-show="!state.netsLoadModel">
      <section class="draw-section">
        <h3>Example:</h3>
        <div class="page_draw-target">
          <img id="page_draw-img-target" src="/images/images.png" alt="目标图像" />
          <canvas id="page_draw-canvas-target"></canvas>
        </div>
      </section>
      
      <NCard  class="draw-section">
        <h3>check:</h3>
        <div class="page_draw-discern">
          <video
            id="page_draw-video"
            poster="/images/720x480.png"
            src="/videos/test.mp4"
            muted
            playsinline
          ></video>
          <canvas id="page_draw-video-canvas"></canvas>
        </div>
      </NCard >
    </div>
    
    <NCard class="info-section">
        <NH3>info:</NH3>
        <NList>
          <NListItem v-for="(result, index) in detectionResults" :key="index">
            <NText>{{ result.label }} - {{ result.position }}</NText>
          </NListItem>
        </NList>
      </NCard>
  </NSpin> 
  
  <div class="page_option">

      <n-button  @click="fnVidelPaused()" type="tertiary">
        Start/Pause
    </n-button>

      <!-- <div class="option-item">
        <input
          id="discern-video"
          type="file"
          accept="video/mp4, video/ogg, video/webm"
          @change="fnChangeDiscern($event)"
        />
      </div> -->

       <div class="option-item">
        <label for="algorithm-model">Engine</label>
        <select id="algorithm-model" v-model="state.netsType" class="select">
          <option value="ssdMobilenetv1">Pro</option>
          <option value="tinyFaceDetector">Fast</option>
        </select>
      </div> 
    </div> 
  </div>
</template>

<style scoped>
:root {
  --background-color: #ffffff;
  --text-color: #333333;
  --border-color: #cccccc;
  --option-background: #f5f5f5;
  --btn-background: #4CAF50;
  --btn-color: white;
  --btn-hover-background: #45a049;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background-color: #1a1a1a;
    --text-color: #ffffff;
    --border-color: #444444;
    --option-background: #2a2a2a;
    --btn-background: #45a049;
    --btn-color: #ffffff;
    --btn-hover-background: #4CAF50;
    --shadow-color: rgba(255, 255, 255, 0.1);
  }
}

.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
}

.page_option {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: var(--option-background);
  border-radius: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

label {
  font-weight: bold;
}

input[type="file"],
.select,
.btn {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--background-color);
  color: var(--text-color);
}

.btn {
  background-color: var(--btn-background);
  color: var(--btn-color);
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: var(--btn-hover-background);
}

.page_load {
  text-align: center;
  font-size: 18px;
  margin: 20px 0;
}

.draw-section {
  margin-bottom: 30px;
}

h3 {
  margin-bottom: 15px;
  color: var(--text-color);
}

.page_draw-target,
.page_draw-discern {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 宽高比 */
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 6px var(--shadow-color);
}

#page_draw-img-target,
#page_draw-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .page_draw-target,
  .page_draw-discern {
    padding-bottom: 75%; /* 4:3 宽高比，适合移动设备 */
  }
}
</style>
