<template>
    <div class="page">
      <div class="page_load" >Load Model...</div>
      <div class="page_draw" >
        <h3>check：</h3>
        <div class="media-container" >
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
  import { onMounted, onUnmounted } from "vue";
  
  let netsLoadModel = true;
  let discernVideoEl = null;
  let discernCanvasEl = null;
  let timer = 0;
  let stream = null;
  
  async function fnLoadModel() {
    const modelsPath = '/models';
    await faceapi.nets.tinyFaceDetector.load(modelsPath);
    await faceapi.nets.faceLandmark68Net.load(modelsPath);
    await faceapi.nets.faceRecognitionNet.load(modelsPath);
  
    discernVideoEl = document.getElementById("page_draw-video");
    discernCanvasEl = document.getElementById("page_draw-video-canvas");
  
    netsLoadModel = false;
    await fnOpen();
    await fnRedrawDiscern();
  }
  
  async function fnRedrawDiscern() {
    if (discernVideoEl.paused) {
      clearTimeout(timer);
      timer = 0;
      return;
    }
  
    const detect = await faceapi
      .detectAllFaces(discernVideoEl, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
  
    if (!detect) {
      clearTimeout(timer);
      timer = 0;
      fnRedrawDiscern();
      return;
    }
  
    const dims = faceapi.matchDimensions(
      discernCanvasEl,
      discernVideoEl,
      true
    );
    const resizedResults = faceapi.resizeResults(detect, dims);
  
    faceapi.draw.drawDetections(discernCanvasEl, resizedResults);
    faceapi.draw.drawFaceLandmarks(discernCanvasEl, resizedResults);
  
    timer = setTimeout(() => fnRedrawDiscern(), 0);
  }
  
  async function fnOpen() {
    if (stream !== null) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      stream = stream;
      discernVideoEl.srcObject = stream;
      discernVideoEl.play();
      setTimeout(() => fnRedrawDiscern(), 300);
    } catch (error) {
      stream = null;
      console.error(error);
      alert("Error: " + error);
    }
  }
  
  function fnClose() {
    if (stream === null) return;
    discernVideoEl.pause();
    discernVideoEl.srcObject = null;
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
    clearTimeout(timer);
    timer = 0;
  
    setTimeout(() => {
      discernCanvasEl
        .getContext("2d")
        .clearRect(
          0,
          0,
          discernCanvasEl.width,
          discernCanvasEl.height
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