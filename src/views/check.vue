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
            playsinline
          ></video>
          <canvas id="page_draw-video-canvas"></canvas>
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
  .page_draw-discern {
    position: relative;
    width: 100%;
    max-width: 100%;
    height: auto;
    overflow: hidden;
  }
  
  #page_draw-video,
  #page_draw-video-canvas {
    position: absolute;
    width: 100%;
    height: auto;
    object-fit: contain; /* 保持视频内容不变形，并适应父容器 */
  }
  
  @media (max-width: 600px) {
    .page_draw-discern {
      width: 100%;
    }
  }
  </style>
  