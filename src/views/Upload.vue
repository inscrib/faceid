<template>
    <n-card class="main-container">
      <n-space vertical size="large">
        <n-steps vertical :current="current" :size="medium" :status="currentStatus">
          <n-step
            title="Upload Image"
            description="Upload an image for face recognition or addition"
          />
          <n-step
            title="Add Person"
            description="Add a new person to the database"
          />
          <n-step
            title="Recognize"
            description="Recognize the person in the image"
          />
          <n-step
            title="Result"
            description="View the recognition result"
          />
        </n-steps>
  1
        <div v-if="current === 1 || current === 2" class="upload-and-process-step">   
          <div class="media-container" :class="{ 'white-background': !imageSrc && !showVideo }">
            <img
              v-if="showImage"
              :src="imageSrc"
              alt="UploadImg"
              class="media"
            />
            <video
              v-if="showVideo"
              ref="video"
              playsinline
              class="media"
            ></video>
            <canvas
              ref="canvas"
              :class="{ 'n-hidden': !showCanvas }"
              class="media"
            ></canvas>
            <div v-if="showLoader" class="loader-container">
              <n-spin size="large" />
            </div>
          </div>  
          <n-upload
            accept="image/*"
            :default-upload="false"
            @change="handleFileChange"
            :max="1"
          >
            <n-divider />
            <n-button>Upload Image</n-button>
          </n-upload>
          <div v-if="current === 2" class="process-step">   
            <n-button @click="store" :disabled="!showButtons || !faceDetected">
              ADD YOUR DATA
            </n-button>
          </div>  
        </div>  
  
        <div v-if="current === 3" class="add-or-recognize-step">   
          <div class="media-container">
            <img
              v-if="showImage"
              :src="imageSrc"
              alt="UploadImg"
              class="media"
            />
            <video
              v-if="showVideo"
              ref="video"
              playsinline
              class="media"
            ></video>
            <canvas
              ref="canvas"
              :class="{ 'n-hidden': !showCanvas }"
              class="media"
            ></canvas>
            <div v-if="showLoader" class="loader-container">
              <n-spin size="large" />
            </div>
          </div>  
          <n-divider />
          <n-upload
            accept="image/*"
            :default-upload="false"
            @change="handleFileChange"
            :max="1"
          >
            <n-button>Upload Image</n-button>
          </n-upload>
          <n-button type="primary" @click="recognize" :disabled="!showButtons || !faceDetected">
            Recognize
          </n-button>
        </div>  
  
        <div v-if="current === 4" class="result-step">   
          <n-result status="error" title="Fail" description="This function is not available">
            <template #footer>
              <n-button @click="refreshPage">BACK</n-button>
            </template>
          </n-result>
        </div>
      </n-space>
    </n-card>
  </template>
  
  <script>
  import { ref, onMounted, watch } from "vue";
  import { NSpace, NCard, NButton, NSpin, NUpload, NModal, useMessage, NSteps, NStep, NProgress, NText, NResult, NDivider } from "naive-ui";
  import { useCanister } from "@connect2ic/vue";
  import * as faceapi from 'face-api.js';
  
  export default {
    name: "FaceRecognition",
    components: {
      NSpace,
      NCard,
      NButton,
      NSpin,
      NUpload,
      NModal,
      NDivider,
      NSteps,
      NStep,
      NResult,
    },
    setup() {
      const [counter] = useCanister("couter", { mode: "anonymous" });
      const message = useMessage();
      const video = ref(null);
      const canvas = ref(null);
      const imageSrc = ref(""); 
      const showVideo = ref(false);
      const showImage = ref(true);
      const showCanvas = ref(false);
      const showLoader = ref(false);
      const showButtons = ref(false);
      const showRestart = ref(false);
      const addButtonDisabled = ref(false);
      const current = ref(1);
      const currentStatus = ref("process");
      const faceDetected = ref(false);
  
      const loadFaceApiModels = async () => {
        const MODEL_URL = '/models';
        await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
        await faceapi.loadFaceLandmarkModel(MODEL_URL);
        await faceapi.loadFaceRecognitionModel(MODEL_URL);
        message.success("Face detection models loaded successfully");
      };
  
      const detectFaces = async (image) => {
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks();
        return detections;
      };
  
      const drawDetections = (detections) => {
        const ctx = canvas.value.getContext('2d');
        ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
        faceapi.draw.drawDetections(canvas.value, detections);
        faceapi.draw.drawFaceLandmarks(canvas.value, detections);
      };
  
      const captureImage = async () => {
        if (current.value < 3) {
        current.value = 2;
      }
      try {
        let image = showVideo.value ? video.value : document.querySelector(".media");
        canvas.value.width = image.width || image.videoWidth;
        canvas.value.height = image.height || image.videoHeight;
        const context = canvas.value.getContext("2d");
        context.drawImage(image, 0, 0, canvas.value.width, canvas.value.height);

        const detections = await detectFaces(canvas.value);
        if (detections.length > 0) {
          drawDetections(detections);
          faceDetected.value = true;
          
          // Capture the face region
          const faceBox = detections[0].detection.box;
          const faceCanvas = document.createElement('canvas');
          faceCanvas.width = faceBox.width;
          faceCanvas.height = faceBox.height;
          const faceContext = faceCanvas.getContext('2d');
          faceContext.drawImage(canvas.value, faceBox.x, faceBox.y, faceBox.width, faceBox.height, 0, 0, faceBox.width, faceBox.height);
          
          // Convert to blob
          return new Promise(resolve => {
            faceCanvas.toBlob(blob => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(new Uint8Array(reader.result));
              reader.readAsArrayBuffer(blob);
            }, 'image/png');
          });
        } else {
          faceDetected.value = false;
          throw new Error("No face detected");
        }
      } catch (error) {
        console.error("Error in captureImage:", error);
        throw error;
      }
    };

    const recognize = async () => {
      showButtons.value = false;
      showLoader.value = true;
      message.info("Detecting faces...");
      try {
        const imageData = await captureImage();
        if (!imageData) {
          throw new Error("No face detected");
        }
        message.info("Face detected. Recognizing...");
        console.log("Sending image data to recognize:", imageData);
        const result = await counter.value.recognize(imageData);
        console.log("Recognition result:", result);
        if (!result.Ok) {
          throw new Error(JSON.stringify(result.Err));
        }
        let label = sanitize(result.Ok.label);
        let score = Math.round(result.Ok.score * 100) / 100;
        message.success(`Identification results: ${label}, similarity: ${score}`);
        current.value = 4;
      } catch (err) {
        console.error("Error in recognize:", err);
        message.error(`Recognition failed: ${err.toString()}`);
      } finally {
        showLoader.value = false;
        showRestart.value = true;
        showButtons.value = true;
      }
    };

    const store = async () => {
      showButtons.value = false;
      showLoader.value = true;
      message.info("Detecting faces...");
      try {
        const imageData = await captureImage();
        if (!imageData) {
          throw new Error("No face detected");
        }
        let label = prompt("Please enter your name");
        if (!label) {
          throw new Error("Unable to add unnamed person");
        }
        label = sanitize(label);
        message.info(`Adding ${label}...`);
        console.log("Sending image data to add:", imageData);
        const result = await counter.value.add(label, imageData);
        console.log("Add result:", result);
        if (!result.Ok) {
          throw new Error(JSON.stringify(result.Err));
        }
        message.success(`Successfully added ${label}.`);
        addButtonDisabled.value = true;
        current.value = 3;
      } catch (err) {
        console.error("Error in store:", err);
        message.error(`Failed to add face: ${err.toString()}`);
      } finally {
        showLoader.value = false;
        showRestart.value = true;
        showButtons.value = true;
      }
    };

    const handleFileChange = async (options) => {
      const { file } = options;
      const reader = new FileReader();
      reader.onload = async (e) => {
        imageSrc.value = e.target.result;
        showVideo.value = false;
        showCanvas.value = true;
        showImage.value = true;
        showButtons.value = true;
        addButtonDisabled.value = false;

        const img = new Image();
        img.onload = async () => {
          canvas.value.width = img.width;
          canvas.value.height = img.height;
          const ctx = canvas.value.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const detections = await detectFaces(canvas.value);
          if (detections.length > 0) {
            drawDetections(detections);
            faceDetected.value = true;
          } else {
            faceDetected.value = false;
            message.warning("No face detected in the uploaded image");
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file.file);
    };
  
      const restart = async () => {
        showRestart.value = false;
        showLoader.value = true;
  
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('getUserMedia is not supported in this browser');
          }
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }
          });
          stream = stream;

          if (!video.value) {
            throw new Error('Video element not found');
          }
  
          video.value.srcObject = stream;
          await video.value.play();
  
          showButtons.value = true;
          showVideo.value = true;
          showImage.value = false;
          showCanvas.value = true;
          addButtonDisabled.value = false;
  
          // Start face detection loop
          detectFacesLoop();
        } catch (err) {
          console.error(`An error occurred: ${err}`);
          showImage.value = false;
          showButtons.value = true;
          showVideo.value = false;
          showCanvas.value = false;
          message.warning("Unable to launch camera, but you can upload photos");
        } finally {
          showLoader.value = false;
        }
      };
  
      const detectFacesLoop = async () => {
        if (showVideo.value && video.value) {
          const detections = await detectFaces(video.value);
          if (detections.length > 0) {
            drawDetections(detections);
            faceDetected.value = true;
          } else {
            faceDetected.value = false;
            const ctx = canvas.value.getContext('2d');
            ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
          }
        }
        requestAnimationFrame(detectFacesLoop);
      };
  
      const sanitize = (name) => {
        return name.match(/[\p{L}\p{N}\s_-]/gu).join("");
      };
  
      const refreshPage = () => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        } else {
          console.error('window is not defined');
        }
      };
  
      onMounted(async () => {
        await loadFaceApiModels();
        restart();
      });
  
      watch(video, (newVideo) => {
        if (newVideo) {
          newVideo.oncanplay = () => {
            showVideo.value = true;
            showImage.value = false;
            showCanvas.value = true;
            canvas.value.width = newVideo.videoWidth;
            canvas.value.height = newVideo.videoHeight;
          };
        }
      });
  
      return {
        refreshPage,
        current,
        currentStatus,
        video,
        canvas,
        imageSrc,
        showVideo,
        showImage,
        showCanvas,
        showLoader,
        showButtons,
        showRestart,
        addButtonDisabled,
        recognize,
        store,
        handleFileChange,
        restart,
        faceDetected,
      };
    },
  };
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