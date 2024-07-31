<script setup>
import * as faceapi from "face-api.js";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { NSelect, NInput, NButton, NSpace, NCard } from 'naive-ui';

const state = reactive({
  netsLoadModel: true,
  netsType: "ssdMobilenetv1",
  netsOptions: {
    ssdMobilenetv1: undefined,
    tinyFaceDetector: undefined,
  },
  faceMatcher: {},
  targetImgEl: null,
  targetCanvasEl: null,
  discernVideoEl: null,
  discernCanvasEl: null,
  timer: 0,
});

const errorMessage = ref("");
const targetInfo = ref("");
const videoStarted = ref(false);

// Debounce function to limit the rate of function calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function logElementDimensions(element, name) {
  if (element) {
    console.log(`${name} dimensions:`, 
      `width: ${element.width || element.clientWidth}, `,
      `height: ${element.height || element.clientHeight}, `,
      `offsetWidth: ${element.offsetWidth}, `,
      `offsetHeight: ${element.offsetHeight}`
    );
  } else {
    console.log(`${name} is null or undefined`);
  }
}

async function fnLoadModel() {
  try {
    const modelsPath = `/models`;
    await faceapi.nets.faceLandmark68Net.load(modelsPath);
    await faceapi.nets.faceRecognitionNet.load(modelsPath);
    await faceapi.nets.ssdMobilenetv1.load(modelsPath);
    state.netsOptions.ssdMobilenetv1 = new faceapi.SsdMobilenetv1Options({
      minConfidence: 0.5,
      maxResults: 50,
    });
    await faceapi.nets.tinyFaceDetector.load(modelsPath);
    state.netsOptions.tinyFaceDetector = new faceapi.TinyFaceDetectorOptions({
      inputSize: 416,
      scoreThreshold: 0.5,
    });

    console.log(`FaceAPI Version: ${faceapi?.version || "(not loaded)"} \nTensorFlow/JS Version: ${faceapi.tf?.version_core || "(not loaded)"} \nBackend: ${faceapi.tf?.getBackend() || "(not loaded)"} \nModels loaded: ${faceapi.tf.engine().state.numTensors} tensors`);

    state.targetImgEl = document.getElementById("page_draw-img-target");
    state.targetCanvasEl = document.getElementById("page_draw-canvas-target");
    state.discernVideoEl = document.getElementById("page_draw-video");
    state.discernCanvasEl = document.getElementById("page_draw-video-canvas");

    logElementDimensions(state.targetImgEl, "Target Image");
    logElementDimensions(state.targetCanvasEl, "Target Canvas");
    logElementDimensions(state.discernVideoEl, "Discern Video");
    logElementDimensions(state.discernCanvasEl, "Discern Canvas");

    state.netsLoadModel = false;
  } catch (error) {
    console.error("Error loading models:", error);
    errorMessage.value = "Failed to load face detection models. Please try refreshing the page.";
  }
}

function ensureCanvasSize(canvas, referenceElement) {
  const newWidth = referenceElement.offsetWidth || referenceElement.clientWidth || 300;
  const newHeight = referenceElement.offsetHeight || referenceElement.clientHeight || 150;
  
  if (newWidth === 0 || newHeight === 0) {
    console.error('Reference element has zero width or height');
    return false;
  }
  
  canvas.width = newWidth;
  canvas.height = newHeight;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  console.log(`Canvas resized to: ${canvas.width}x${canvas.height}`);
  return true;
}

const debouncedRedrawTarget = debounce(() => {
  if (state.targetImgEl && state.targetImgEl.complete) {
    fnRedrawTarget();
  }
}, 250);

const debouncedRedrawDiscern = debounce(() => {
  if (state.discernVideoEl && state.discernVideoEl.readyState >= 2) {
    fnRedrawDiscern();
  }
}, 250);

async function fnRedrawTarget() {
  console.log("Run Redraw Target");
  if (!state.targetImgEl || !state.targetImgEl.complete) {
    console.log("Image not yet loaded or null, waiting...");
    return;
  }
  
  if (!ensureCanvasSize(state.targetCanvasEl, state.targetImgEl)) {
    console.error("Failed to set canvas size");
    return;
  }
  
  ensureCanvasSize(state.targetCanvasEl, state.targetImgEl);
  logElementDimensions(state.targetImgEl, "Target Image before detection");
  logElementDimensions(state.targetCanvasEl, "Target Canvas before detection");

  try {
    const detect = await faceapi
      .detectAllFaces(state.targetImgEl, state.netsOptions[state.netsType])
      .withFaceLandmarks()
      .withFaceDescriptors();
    if (!detect.length) {
      console.log("No faces detected");
      state.faceMatcher = null;
      targetInfo.value = "No faces detected in the target image.";
      return;
    }

    state.faceMatcher = new faceapi.FaceMatcher(detect);
    console.log("Face matcher created:", state.faceMatcher); // 新增日志

    const dims = faceapi.matchDimensions(state.targetCanvasEl, state.targetImgEl, true);
    console.log("Matched dimensions:", dims);
    const resizedResults = faceapi.resizeResults(detect, dims);
    
    // Clear the canvas before drawing
    const ctx = state.targetCanvasEl.getContext('2d');
    ctx.clearRect(0, 0, state.targetCanvasEl.width, state.targetCanvasEl.height);

    resizedResults.forEach(({ detection, descriptor }, index) => {
      const label = "Dom, \nPrincipal ID: \nx44s4hz-og66m-hypzp-uxv6q-addgn-hshem-dnvln-uhy7t-h3hsc-pmajb-mqe	";
      new faceapi.draw.DrawBox(detection.box, {
        label,
        boxColor: "#55b881",
        drawLabelOptions: {
          fontSize: 10,
          fontStyle: 'bold'
        }
      }).draw(state.targetCanvasEl);

      targetInfo.value += 'Face1: Dom, Principal ID: \nx45u4-xv5e2-unwsr-ekdj2-4ilen-qw33g-popr3-7i6bf-ek3ug-m4y3a-iae\n'+`Face ${index + 1}: (x: ${Math.round(detection.box.x)}, y: ${Math.round(detection.box.y)})\n`;
    });

    if (detect.length === 0) {
      targetInfo.value = "No faces detected in the target image.";
    }
  } catch (error) {
    console.error("Error in face detection:", error);
    errorMessage.value = "Face detection failed. Please try a different image.";
  }
}

async function fnRedrawDiscern() {
  if (!state.faceMatcher) {
    console.log("Face matcher not initialized, skipping detection");
    return;
  }
  console.log("Run Redraw Discern");

  if (state.discernVideoEl.paused) {
    console.log("Video is paused, stopping detection");
    clearTimeout(state.timer);
    state.timer = 0;
    return;
  }
  
  if (!ensureCanvasSize(state.discernCanvasEl, state.discernVideoEl)) {
    console.error("Failed to set canvas size");
    state.timer = setTimeout(fnRedrawDiscern, 100);
    return;
  }

  logElementDimensions(state.discernVideoEl, "Discern Video before detection");
  logElementDimensions(state.discernCanvasEl, "Discern Canvas before detection");

  try {
    const detect = await faceapi
      .detectAllFaces(state.discernVideoEl, state.netsOptions[state.netsType])
      .withFaceLandmarks()
      .withFaceDescriptors();

    console.log("Detected faces:", detect.length);

    if (!detect.length) {
      console.log("No faces detected in video");
      state.timer = setTimeout(fnRedrawDiscern, 100);
      return;
    }

    const dims = faceapi.matchDimensions(state.discernCanvasEl, state.discernVideoEl, true);
    console.log("Matched video dimensions:", dims);
    const result = faceapi.resizeResults(detect, dims);

    // Clear the canvas before drawing
    const ctx = state.discernCanvasEl.getContext('2d');
    ctx.clearRect(0, 0, state.discernCanvasEl.width, state.discernCanvasEl.height);

    result.forEach(({ detection, descriptor }) => {
      const match = state.faceMatcher.findBestMatch(descriptor);
      const label = match.label === 'unknown' ? 'Unknown Person' : "Dom\nValied";
      new faceapi.draw.DrawBox(detection.box, { 
        label,
        drawLabelOptions: {
          fontSize: 50,
          fontStyle: 'bold'
        }
      }).draw(state.discernCanvasEl);
    });

    state.timer = setTimeout(fnRedrawDiscern, 100);
  } catch (error) {
    console.error("Error in video face detection:", error);
    errorMessage.value = "Face detection in video failed. Please try a different video.";
  }
}



function fnVidelPaused() {
  if (state.discernVideoEl.paused) {
    state.discernVideoEl.play().then(() => {
      console.log("Video playback started");
      videoStarted.value = true;
      fnRedrawDiscern(); // Start face detection when video plays
    }).catch(error => {
      console.error("Error playing video:", error);
      errorMessage.value = "Failed to start video playback.";
    });
  } else {
    state.discernVideoEl.pause();
    videoStarted.value = false;
    cancelAnimationFrame(state.timer);
    state.timer = 0;
  }
}

async function fnChangeTarget(e) {
  if (!state.targetImgEl || !state.targetCanvasEl) return;
  if (!e.target || !e.target.files.length) return;
  try {
    const file = e.target.files[0];
    const img = await faceapi.bufferToImage(file);
    state.targetImgEl.src = img.src;
    state.targetImgEl.onload = () => {
      logElementDimensions(state.targetImgEl, "Target Image after load");
      ensureCanvasSize(state.targetCanvasEl, state.targetImgEl);
      targetInfo.value = ""; // Clear previous target info
      fnRedrawTarget(); // Directly call fnRedrawTarget instead of using debounce
    };
  } catch (error) {
    console.error("Error changing target image:", error);
    errorMessage.value = "Failed to load the selected image. Please try a different one.";
  }
}

/**更换图片 */
async function fnChangeTarget(e) {
  if (!state.targetImgEl || !state.targetCanvasEl) return;
  if (!e.target || !e.target.files.length) return;
  // 将文件显示为图像并识别
  const img = await faceapi.bufferToImage(e.target.files[0]);
  state.targetImgEl.src = img.src;
  fnRedrawTarget();
}





function fnChangeDiscern(e) {
  if (!state.discernVideoEl || !state.discernCanvasEl) return;
  if (!e.target || !e.target.files.length) return;
  try {
    clearTimeout(state.timer);
    state.timer = 0;
    state.discernVideoEl.pause();
    const file = e.target.files[0];
    const videoURL = URL.createObjectURL(file);
    state.discernVideoEl.src = videoURL;

    state.discernVideoEl.onloadedmetadata = () => {
      logElementDimensions(state.discernVideoEl, "Discern Video after load");
      ensureCanvasSize(state.discernCanvasEl, state.discernVideoEl);
      console.log("Video metadata loaded, canvas size ensured");
    };

    state.discernVideoEl.oncanplay = () => {
      console.log("Video can play, ready for detection");
      // Clear the canvas
      const ctx = state.discernCanvasEl.getContext('2d');
      ctx.clearRect(0, 0, state.discernCanvasEl.width, state.discernCanvasEl.height);
      // Reset video state
      videoStarted.value = false;
    };

  } catch (error) {
    console.error("Error changing discern video:", error);
    errorMessage.value = "Failed to load the selected video. Please try a different one.";
  }
}


onMounted(() => {
  fnLoadModel().then(() => {
    if (state.targetImgEl) {
      state.targetImgEl.onload = debouncedRedrawTarget;
      if (state.targetImgEl.complete) {
        logElementDimensions(state.targetImgEl, "Target Image already loaded on mount");
        debouncedRedrawTarget();
      }
    }
    
    window.addEventListener('resize', () => {
      debouncedRedrawTarget();
      debouncedRedrawDiscern();
    });

    console.log("Component mounted, model loaded");
  });
});

onUnmounted(() => {
  clearTimeout(state.timer);
  state.timer = 0;
  window.removeEventListener('resize', debouncedRedrawTarget);
  window.removeEventListener('resize', debouncedRedrawDiscern);
  console.log("Component unmounted, cleanup done");
});
</script>

<template>
  <div class="page">
    <n-space vertical>
      <n-card v-if="errorMessage" title="Error" :bordered="false">
        {{ errorMessage }}
      </n-card>
      <n-card title="Controls" :bordered="false">
        <n-space vertical>
          <n-space align="center">
            <label>Target Image:</label>
            <n-input type="file" accept="image/png, image/jpeg" @change="fnChangeTarget($event)" />
          </n-space>
          <n-space align="center">
            <label>Video Source:</label>
            <n-input type="file" accept="video/mp4, video/ogg, video/webm" @change="fnChangeDiscern($event)" />
          </n-space>
          <n-space align="center">
            <label>Video Control:</label>
            <n-button @click="fnVidelPaused()">Play/Pause</n-button>
          </n-space>
          <n-space align="center">
            <label>Algorithm Model:</label>
            <n-select v-model:value="state.netsType" :options="[
              { label: 'SSD Mobilenet V1', value: 'ssdMobilenetv1' },
              { label: 'Tiny Face Detector', value: 'tinyFaceDetector' }
            ]" />
          </n-space>
        </n-space>
      </n-card>

      <n-card v-if="state.netsLoadModel" title="Status" :bordered="false">
        Loading Model...
      </n-card>

      <n-card v-show="!state.netsLoadModel" title="Face Recognition" :bordered="false">
        <n-space vertical>
          <h3>Target Image:</h3>
          <div class="page_draw-target">
            <img id="page_draw-img-target" src="/images/image.png" />
            <canvas id="page_draw-canvas-target"></canvas>
          </div>
          <n-card v-if="targetInfo" title="Detected Faces" :bordered="false">
            <pre>{{ targetInfo }}</pre>
          </n-card>
          <h3>Video Recognition:</h3>
          <div class="page_draw-discern">
            <video
              id="page_draw-video"
              poster="/images/logo_transparent.png"
              src="/videos/test.mp4"
              muted
              playsinline
            ></video>
            <canvas id="page_draw-video-canvas"></canvas>
          </div>
          <n-space justify="center">
          <n-button @click="fnVidelPaused">{{ videoStarted ? 'Pause' : 'Play' }}</n-button>
        </n-space>
        </n-space>
      </n-card>
    </n-space>
  </div>
</template>

<style scoped>
.page_draw-target, .page_draw-discern {
  position: relative;
  width: 100%;
  height: auto;
}
.page_draw-target img, .page_draw-discern video {
  width: 100%;
  height: auto;
}
.page_draw-target canvas, .page_draw-discern canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
