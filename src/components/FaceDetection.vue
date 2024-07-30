<template>
    <div>
      <video ref="video" width="720" height="560" autoplay muted></video>
      <canvas ref="canvas" width="720" height="560"></canvas>
    </div>
  </template>
  
  <script>
  import * as faceapi from 'face-api.js';
  
  export default {
    name: 'FaceDetection',
    data() {
      return {
        detectionInterval: null,
      };
    },
    async mounted() {
      await this.loadModels();
      await this.startVideo();
      this.startDetection();
    },
    beforeUnmount() {
      this.stopDetection();
    },
    methods: {
      async loadModels() {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      },
      async startVideo() {
        const video = this.$refs.video;
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
          video.srcObject = stream;
        } catch (err) {
          console.error('无法访问摄像头:', err);
        }
      },
      startDetection() {
        this.detectionInterval = setInterval(async () => {
          const detections = await faceapi.detectAllFaces(
            this.$refs.video,
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks();
  
          const canvas = this.$refs.canvas;
          const displaySize = { width: 720, height: 560 };
          faceapi.matchDimensions(canvas, displaySize);
  
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }, 100);
      },
      stopDetection() {
        clearInterval(this.detectionInterval);
      },
    },
  };
  </script>