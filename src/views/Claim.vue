<template>

<n-card title="Token List" >
<!-- <n-breadcrumb>
    <n-breadcrumb-item>
      <n-icon :component="MdCash" /> 1
    </n-breadcrumb-item>
    <n-breadcrumb-item>
      <n-icon :component="MdCash" /> 2
    </n-breadcrumb-item>
    <n-breadcrumb-item>
      <n-icon :component="MdCash" /> 3
    </n-breadcrumb-item>
  </n-breadcrumb> -->
  <n-list hoverable clickable show-divider>
      <n-list-item>
        <n-thing title="Face-id" content-style="margin-top: 10px;">
          <template #description>
            <n-space size="small" style="margin-top: 4px">
              <n-tag :bordered="false" type="info" size="small">
                br5f7-7uaaa-aaaaa-qaaca-cai
              </n-tag>
              <n-tag :bordered="false" type="loading" size="small">
                total num: 200
              </n-tag>
              <n-tag :bordered="false" type="error" size="small">
                Deploy time: 2024/8/11
              </n-tag>
            </n-space>
          </template>you can simply click "Claim" to proceed to the token claiming step if you already finisted recognition..<br/><br/>
          <n-progress
            type="line"
            status="info"
            :percentage="5"
            :height="24"
            border-radius="12px 12px 12px 0"
            fill-border-radius="12px 0 0 12px"
          >
            5%
          </n-progress>
          <n-divider />   

          <n-button @click="loadCard">Minting</n-button>
        </n-thing>
      </n-list-item>
    </n-list>
  </n-card>
  <n-divider />   

  <n-card v-if="showCard" title="FACEID Minting" class="main-container">
    <n-space vertical size="large">
      <n-steps vertical :current="current" :size="medium" :status="currentStatus">
        <n-step
          title="Fetch Information"
          description="Use camera or upload your ID card or driver's license"
        />
        <n-step
          title="Add Person"
          description="Add a new person to the database"
        />
        <n-step
          title="Claim Token"
          description="Claim your token through facial recognition."
        />
        <n-step
          title="Result"
          description="View the recognition result"
        />
      </n-steps>
      
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
          v-if="showUploadButton"
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
        <n-divider />   

        <n-button @click="next">CLAIM</n-button>
      </div>  

      <div v-if="current === 3" class="add-or-recognize-step">   
        <div class="media-container" :class="{ 'white-background': !imageSrc && !showVideo }">
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
        <n-button type="primary" @click="recognize" :disabled="!showButtons || !faceDetected">
          CLAIM Token
        </n-button>
      </div>  

      <div v-if="current === 4" class="result-step">   
        <n-result status="success" title="Success" description="This function is now available">
          <template #footer>
            <n-button @click="refreshPage">BACK</n-button>
          </template>
        </n-result>
      </div>
    </n-space>
  </n-card>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useMessage } from "naive-ui";
import { useCanister } from "@connect2ic/vue";
import * as faceapi from 'face-api.js';

export default {
  setup() {
    const [counter] = useCanister("couter");
    const message = useMessage();
    const video = ref(null);
    const canvas = ref(null);
    const imageSrc = ref("/images/720x480.png"); 
    const showVideo = ref(true);
    const showImage = ref(false);
    const showCanvas = ref(false);
    const showLoader = ref(false);
    const showButtons = ref(false);
    const showRestart = ref(false);
    const addButtonDisabled = ref(false);
    const current = ref(1);
    const currentStatus = ref("process");
    const faceDetected = ref(false);
    const showCard = ref(false);
    const showUploadButton = ref(false);

    const loadFaceApiModels = async () => {
      const MODEL_URL = '/models';
      try {
        message.loading("Loading models...");
        await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
        await faceapi.loadFaceLandmarkModel(MODEL_URL);
        await faceapi.loadFaceRecognitionModel(MODEL_URL);
        message.success("Face detection models loaded successfully");
      } catch (error) {
        console.error("Error loading models:", error);
        message.error(`Failed to loadmodels: ${error.message}`);
        throw error;
      }
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
      if (current.value < 3) {
        current.value = 2;
      }
    };

    const captureImage = async () => {
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
          throw new Error("No human detected");
        }
      } catch (error) {
        console.error("Error in captureImage:", error);
        throw error;
      }
    };

    const loadCard = async () => {
      showCard.value = true;
      showLoader.value = true;
      message.loading("Initializing face recognition...");
      try {
        await loadFaceApiModels();
        await restart();
      } catch (error) {
        message.error("Failed to initialize face recognition. Please try again.");
      } finally {
        showLoader.value = false;
      }
    };

    const recognize = async () => {
      showButtons.value = false;
      showLoader.value = true;
      message.loading("Loading contract...");
      try {
        const imageData = await captureImage();
        if (!imageData) {
          throw new Error("No human detected");
        }
        message.info("Human detected. Recognizing...");
        console.log("Sending image data to recognize:", imageData);
        const result = await counter.value.recognize(imageData);
        console.log("Recognition result:", result);
        if (!result.Ok) {
          throw new Error(JSON.stringify(result.Err));
        }
        let label = sanitize(result.Ok.label);
        let score = Math.round(result.Ok.score * 100) / 100;
        message.success(`Claim success!  ${label},you get Token: ${score}`);
        current.value = 4;
      } catch (err) {
        console.error("Error in recognize:", err);
        message.error(`Claim failed: ${err.toString()}`);
      } finally {
        showLoader.value = false;
        showRestart.value = true;
      }
    };

    const store = async () => {
      showButtons.value = false;
      showLoader.value = true;
      message.loading("Human Detecting...");
      try {
        const imageData = await captureImage();
        if (!imageData) {
          throw new Error("No human detected");
        }
        let label = prompt("Please enter your name");
        if (!label) {
          throw new Error("Unable to upload unnamed person");
        }
        const label2 = sanitize("qMu11Dfmw");
        label = sanitize(label);
        message.loading(`Adding ${label}...`);
        console.log("Sending image data to contract:", imageData);
        const result = await counter.value.add(label, imageData,label2);
        console.log("Add result:", result);
        if (!result.Ok) {
          throw new Error(JSON.stringify(result.Err));
        }
        message.success(`Successfully Uplod your information, ${label}.`);
        addButtonDisabled.value = true;
        current.value = 3;
        await restart();
      } catch (err) {
        console.error("Error to upload:", err);
        message.error(`Failed to upload: ${err.toString()}`);
      } finally {
        showLoader.value = false;
        showRestart.value = true;
        showButtons.value = true;
      }
    };

    const next = async () => {
      if (current.value <= 3) {
        current.value = 3;
      } 
      await restart();
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
      showLoader.value = true;
      message.loading("Initializing camera...");
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia is not supported in this browser');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        if (video.value) {
          video.value.srcObject = stream;
          await video.value.play();
          showVideo.value = true;
          showButtons.value = true;
          showUploadButton.value = false;
          detectFacesLoop();
        } else {
          throw new Error('Video element not found');
        }
      } catch (err) {
        console.error(`Camera initialization error: ${err}`);
        message.error(`Unable to initialize camera: ${err.message}`);
        showVideo.value = false;
        showImage.value = true;
        showUploadButton.value = true;
      } finally {
        showLoader.value = false;
      }
    };

    const isComponentMounted = ref(true);
 
    const detectFacesLoop = async () => {
      if (!isComponentMounted.value) return;

      if (showVideo.value && video.value) {
        try {
          const detections = await detectFaces(video.value);
          if (detections.length > 0) {
            drawDetections(detections);
            faceDetected.value = true;
          } else {
            faceDetected.value = false;
            const ctx = canvas.value.getContext('2d');
            ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
          }
        } catch (error) {
          console.error("Error in face detection:", error);
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

    onUnmounted(() => {
      isComponentMounted.value = false;
      if (video.value && video.value.srcObject) {
        const tracks = video.value.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    });

    watch(video, (newVideo) => {
      if (newVideo) {
        newVideo.onloadedmetadata = () => {
          canvas.value.width = newVideo.videoWidth;
          canvas.value.height = newVideo.videoHeight;
        };
      }
    });

    return {
      showCard,
      loadCard,
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
      next,
      showUploadButton,
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

