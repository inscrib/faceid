<!-- Home.vue -->
<template>
  <div class="component-box">
    <h1>nothing is something</h1>

    <n-card title=" FACE-ID">
    <template #cover>
      <img src="https://i.ibb.co/RgdfZY3/Snipaste-2024-07-30-00-18-01.png">
    </template>
   First Token distribution by face recognize build on the internet computer.<br/>
   Use on-chain facial recognition to achieve the fairest token distribution
  </n-card>
  <n-divider />
    <n-button @click="$router.push('/upload')">
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
  <n-button @click="$router.push('/test')">
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
