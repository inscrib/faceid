<template>
    <div class="page">
      <div class="page_load" v-show="state.netsLoadModel">Load Model...</div>
      <div class="page_draw" v-show="!state.netsLoadModel">
        <h3>人脸检测：</h3>
        <div class="page_draw-discern">
            <video
            id="page_draw-video"
            poster="/images/720x480.png"
            muted
              ref="video"
              playsinline
              class="media"
            ></video>
            <canvas
             id="page_draw-video-canvas"
              ref="canvas"
              class="media"
            ></canvas>
        </div>
    
      </div>
    </div>
  </template>
  
  <script setup>
  import * as faceapi from 'face-api.js';
  import { onMounted, onUnmounted, reactive } from "vue";
  
  const state = reactive({
    netsLoadModel: true,
    discernVideoEl: null,
    discernCanvasEl: null,
    timer: 0,
    stream: null,
  });
  
  async function fnLoadModel() {
    const modelsPath = '/models';
    await faceapi.nets.tinyFaceDetector.load(modelsPath);
    await faceapi.nets.faceLandmark68Net.load(modelsPath);
    await faceapi.nets.faceRecognitionNet.load(modelsPath);
  
    state.discernVideoEl = document.getElementById("page_draw-video");
    state.discernCanvasEl = document.getElementById("page_draw-video-canvas");
  
    state.netsLoadModel = false;
    await fnOpen();
    await fnRedrawDiscern();
  }
  
  async function fnRedrawDiscern() {
    if (state.discernVideoEl.paused) {
      clearTimeout(state.timer);
      state.timer = 0;
      return;
    }
  
    const detect = await faceapi
      .detectAllFaces(state.discernVideoEl, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
  
    if (!detect) {
      clearTimeout(state.timer);
      state.timer = 0;
      fnRedrawDiscern();
      return;
    }
  
    const dims = faceapi.matchDimensions(
      state.discernCanvasEl,
      state.discernVideoEl,
      true
    );
    const resizedResults = faceapi.resizeResults(detect, dims);
    
    faceapi.draw.drawDetections(state.discernCanvasEl, resizedResults);
    faceapi.draw.drawFaceLandmarks(state.discernCanvasEl, resizedResults);
  
    state.timer = setTimeout(() => fnRedrawDiscern(), 0);
  }
  
  async function fnOpen() {
    if (state.stream !== null) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      state.stream = stream;
      state.discernVideoEl.srcObject = stream;
      state.discernVideoEl.play();
      setTimeout(() => fnRedrawDiscern(), 300);
    } catch (error) {
      state.stream = null;
      console.error(error);
      alert("视频媒体流获取错误: " + error);
    }
  }
  
  function fnClose() {
    if (state.stream === null) return;
    state.discernVideoEl.pause();
    state.discernVideoEl.srcObject = null;
    state.stream.getTracks().forEach((track) => track.stop());
    state.stream = null;
    clearTimeout(state.timer);
    state.timer = 0;
  
    setTimeout(() => {
      state.discernCanvasEl
        .getContext("2d")
        .clearRect(
          0,
          0,
          state.discernCanvasEl.width,
          state.discernCanvasEl.height
        );
    }, 500);
  }
  
  onMounted(() => {
    fnLoadModel();
  });
  
  onUnmounted(() => {
    fnClose();
  });
  </script>
  
  <style scoped>
  .main-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .media-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 75%; /* 4:3 aspect ratio */
    overflow: hidden;
  }
  
  .media {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .loader-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .process-step {
    margin-top: 1rem;
  }

  .white-background {
  background-color: white;
  border: 1px solid #e0e0e0; /* Optional: adds a light border for better visibility */
}
  </style>
  