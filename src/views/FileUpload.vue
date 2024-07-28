<template>
  <input
    id="file"
    class="file"
    name="file"
    type="file"
    accept="image/png, image/jpeg"
    @change="handleFileChange"
  />
</template>

<script>
export default {
  name: "FileUpload",
  emits: ["file-loaded"],
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.$emit("file-loaded", e.target.result);
        };
        reader.readAsDataURL(file);
      }
    },
  },
};
</script>