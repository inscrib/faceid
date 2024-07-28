<template>
  <n-card class="main-container">
    <n-space vertical size="large">
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
      
      <n-upload
        accept="image/*"
        :default-upload="false"
        @change="handleFileChange"
        :max="1"
      >
        <n-button>Upload Image</n-button>
      </n-upload>
      
      <n-space justify="center" :size="16">
        <n-button @click="store" :disabled="!showButtons || addButtonDisabled">
          ADD YOUR DATA
        </n-button>
        <n-button type="primary" @click="recognize" :disabled="!showButtons">
          Recognize
        </n-button>

      </n-space>

      <n-button 
        @click="restart" 
        :disabled="!showRestart"
        class="restart-button"
      >
        Back
      </n-button>
    </n-space>
  </n-card>

</template>

<script>
import { ref, onMounted, watch } from "vue";
import { NSpace, NCard, NButton, NSpin, NUpload, NModal, useMessage } from "naive-ui";
import { useCanister } from "@connect2ic/vue";

export default {
  name: "FaceRecognition",
  components: {
    NSpace,
    NCard,
    NButton,
    NSpin,
    NUpload,
    NModal,
  },
  setup() {
    const [counter] = useCanister("couter");
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

    const selectVisibleElement = () => {
      if (showVideo.value) {
        return [video.value, video.value.videoWidth, video.value.videoHeight];
      } else if (showImage.value) {
        const image = document.querySelector(".media");
        return [image, image.width, image.height];
      } else {
        return [canvas.value, canvas.value.width, canvas.value.height];
      }
    };

    const captureImage = async () => {
      let [image, width, height] = selectVisibleElement();

      canvas.value.width = width;
      canvas.value.height = height;
      const context = canvas.value.getContext("2d");
      context.drawImage(image, 0, 0, width, height);

      const resized = document.createElement("canvas");
      resized.width = 320;
      resized.height = 240;
      let scale = Math.min(
        resized.width / canvas.value.width,
        resized.height / canvas.value.height
      );
      width = canvas.value.width * scale;
      height = canvas.value.height * scale;
      let x = (resized.width - width) / 2;
      let y = (resized.height - height) / 2;
      const ctx = resized.getContext("2d");
      if (ctx) {
        ctx.drawImage(canvas.value, x, y, width, height);
      }
      let bytes = await serialize(resized);

      if (video.value && video.value.srcObject) {
        video.value.srcObject.getTracks().forEach((track) => track.stop());
      }

      showVideo.value = false;
      showImage.value = false;
      showCanvas.value = true;
      return [bytes, { scale, x, y }];
    };

    const render = async (scaling, box) => {
      box.left = Math.round((box.left * 320 - scaling.x) / scaling.scale);
      box.right = Math.round((box.right * 320 - scaling.x) / scaling.scale);
      box.top = Math.round((box.top * 240 - scaling.y) / scaling.scale);
      box.bottom = Math.round((box.bottom * 240 - scaling.y) / scaling.scale);

      const small = document.createElement("canvas");
      small.width = 160;
      small.height = 160;
      const ctx2 = small.getContext("2d");
      if (ctx2) {
        ctx2.drawImage(
          canvas.value,
          box.left,
          box.top,
          box.right - box.left,
          box.bottom - box.top,
          0,
          0,
          140,
          140
        );
      }
      let bytes = await serialize(small);

      const ctx = canvas.value.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#18A058";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.rect(box.left, box.top, box.right - box.left, box.bottom - box.top);
        ctx.stroke();
      }

      return bytes;
    };

    const recognize = async () => {
      showButtons.value = false;
      showLoader.value = true;
      message.info("Detecting faces...");
      try {
        const [blob, scaling] = await captureImage();
        let result = await counter.value.detect(new Uint8Array(blob));
        if (!result.Ok) {
          throw result.Err.message;
        }
        let face = await render(scaling, result.Ok);
        message.info("Face detected. Recognizing...");
        result = await counter.value.recognize(new Uint8Array(face));
        if (!result.Ok) {
          throw result.Err.message;
        }
        let label = sanitize(result.Ok.label);
        let score = Math.round(result.Ok.score * 100) / 100;
        message.success(`Identification results:${label}, similarity:${score}`);
      } catch (err) {
        message.error(err.toString());
      }
      showLoader.value = false;
      showRestart.value = true;
      showButtons.value = true;
    };

    const store = async () => {
      showButtons.value = false;
      showLoader.value = true;
      message.info("Detecting faces...");
      try {
        const [blob, scaling] = await captureImage();
        let result = await counter.value.detect(new Uint8Array(blob));
        if (!result.Ok) {
          throw result.Err.message;
        }
        let face = await render(scaling, result.Ok);
        message.info("Face detected. Adding...");
        let label = prompt("Please enter your name");
        if (!label) {
          throw "Unable to add unnamed person";
        }
        label = sanitize(label);
        message.info(`Adding ${label}...`);
        result = await counter.value.add(label, new Uint8Array(face));
        if (!result.Ok) {
          throw result.Err.message;
        }
        message.success(`Successfully added ${label}。`);
        addButtonDisabled.value = true;
      } catch (err) {
        console.error(`Error：${err}`);
        message.error("Failed to add face:" + err.toString());
      }
      showLoader.value = false;
      showRestart.value = true;
      showButtons.value = true;
    };

    const handleFileChange = (options) => {
      const { file } = options;
      const reader = new FileReader();
      reader.onload = (e) => {
        imageSrc.value = e.target.result;
        showVideo.value = false;
        showCanvas.value = false;
        showImage.value = true;
        showButtons.value = true;
        addButtonDisabled.value = false;
      };
      reader.readAsDataURL(file.file);
    };

    const restart = async () => {
      showRestart.value = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        video.value.srcObject = stream;
        video.value.play();
        showButtons.value = true;
        showVideo.value = true;
        showImage.value = false;
        showCanvas.value = false;
        addButtonDisabled.value = false;
      } catch (err) {
        console.error(`An error occurred:${err}`);
        showImage.value = true;
        showButtons.value = true;
        showVideo.value = false;
        showCanvas.value = false;
        message.warning("Unable to launch camera, but you can upload photos");
      }
    };

    const serialize = (canvas) => {
      return new Promise((resolve) =>
        canvas.toBlob(
          (blob) => blob.arrayBuffer().then(resolve),
          "image/png",
          0.9
        )
      );
    };

    const sanitize = (name) => {
      return name.match(/[\p{L}\p{N}\s_-]/gu).join("");
    };



    onMounted(() => {
      restart();
    });

    watch(video, (newVideo) => {
      if (newVideo) {
        newVideo.oncanplay = () => {
          showVideo.value = true;
          showImage.value = false;
          showCanvas.value = false;
        };
      }
    });

    return {
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
    };
  },
};
</script>

<style scoped>
.main-container {
  max-width: 600px;
  margin: 0 auto;
}

.media-container {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f3f5f7;
  border: 2px dashed #d1d9e6;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.media {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.loader-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
}

:deep(.n-upload) {
  width: 100%;
}

:deep(.n-upload-trigger) {
  width: 100%;
}

:deep(.n-button) {
  min-width: 120px;
}

.restart-button {
  margin-top: 16px;
}
</style>

