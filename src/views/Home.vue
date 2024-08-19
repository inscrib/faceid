<!-- Home.vue -->
<template>
  <div class="component-box">
    <h1>nothing is something</h1>

    <n-card title=" FACE-ID">
    <template #cover>
      <n-carousel show-arrow>
        <img
      class="carousel-img"
      src="https://ice.frostsky.com/2024/08/11/079c13cd08df740fb9e00ebc4a414859.jpeg">
      <img
      class="carousel-img"
      src="https://ice.frostsky.com/2024/08/11/7d69c0bd5c29764300523f3cc5474b33.jpeg">
    <img
      class="carousel-img"
      src="https://ice.frostsky.com/2024/08/11/38d1def6b6ffcfad997b666bcc5bd5e3.jpeg">
  </n-carousel>
    </template>
   First Token distribution by face recognize build on the internet computer.<br/>
   Use on-chain facial recognition to achieve the fairest token distribution
  </n-card>
  <n-divider />
    <n-button @click="$router.push('/claim')">
      CLAIM
    </n-button>
  </div>
  <n-divider />
  <n-card title=" Token - List">

  <n-data-table
    :columns="columns"
    :data="data"
    :pagination="pagination"
    :bordered="false"
  />
  <n-divider />
  <n-button @click="$router.push('/deploy')">
      DEPLOY
    </n-button>
  </n-card>

</template>

<script setup>
import { ref, h } from "vue";
import { NButton, useMessage } from "naive-ui";

function createColumns(play) {
  return [
    {
      title: "No",
      key: "no"
    },
    {
      title: "ID",
      key: "ID"
    },
    {
      title: "NUM",
      key: "NUM"
    },
    {
      title: "Action",
      key: "actions",
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: "small",
            onClick: () => play(row)
          },
          { default: () => "GET" }
        );
      }
    }
  ];
}

const data = ref([
  { no: 1, ID: "lggy", NUM: "1000000000" },
  { no: 2, ID: "FACEID", NUM: "1000000000" },
  { no: null, ID: "...", NUM: "..." }
]);

const message = useMessage();

const play = (row) => {
  message.info(`${row.title}`);
};

const columns = createColumns(play);

const pagination = ref(false);
</script>
