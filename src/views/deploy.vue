<template>
  <div class="app-container" :class="{ 'dark-theme': isDarkTheme }">
  <n-card title="Token Upload Form">
    <n-form
      ref="formRef"
      :model="model"
      :rules="rules"
      :size="size"
      label-placement="top"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="Token ID" path="tokenId">
          <n-input v-model:value="model.tokenId" placeholder="Enter Token ID" />
        </n-form-item-gi>

        <n-form-item-gi :span="12" label="Token Logo" path="logo">
          <n-upload accept="image/*">
            <n-button>Upload Logo</n-button>
          </n-upload>
        </n-form-item-gi>

        <n-form-item-gi :span="12" label="Token Supply" path="tokenSupply">
          <n-input v-model:value="model.tokenSupply" placeholder="Enter Token Supply" />
        </n-form-item-gi>

        <n-form-item-gi :span="12" label="Token Standard" path="tokenStandard">
          <n-cascader
            v-model:value="model.tokenStandard"
            placeholder="Select Token Standard"
            :options="tokenStandardOptions"
            check-strategy="child"
          />
        </n-form-item-gi>

        <n-form-item-gi :span="12" label="Valid Targets" path="validTargets">
          <n-select
            v-model:value="model.validTargets"
            placeholder="Select Valid Targets"
            :options="targetOptions"
            multiple
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="Minimum Similarity (%)" path="minSimilarity">
          <n-slider v-model:value="model.minSimilarity" :step="1" :min="0" :max="100" />
        </n-form-item-gi>

        <n-form-item-gi :span="24" label="Token Description" path="description">
          <n-input
            v-model:value="model.description"
            placeholder="Enter Token Description"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </n-form-item-gi>




        <n-form-item-gi :span="12" label="Token Attributes" path="attributes">
          <n-transfer
            v-model:value="model.attributes"
            :options="attributeOptions"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="Launch Date" path="launchDate">
          <n-date-picker v-model:value="model.launchDate" type="datetime" />
        </n-form-item-gi>


        <n-gi :span="24">
          <div style="display: flex; justify-content: flex-end">
            <n-button round type="primary" @click="handleSubmit">
              Submit
            </n-button>
          </div>
        </n-gi>
      </n-grid>
    </n-form>
  </n-card>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useMessage } from "naive-ui";

const formRef = ref(null);
const message = useMessage();
const size = ref("medium");

const model = ref({
  tokenId: null,
  tokenSupply: null,
  tokenStandard: null,
  validTargets: [],
  launchDate: null,
  minSimilarity: 20,
  attributes: [],
  description: null,
});

const targetOptions = [
  { label: "Human", value: "human" },
  { label: "Pet", value: "pet" },
  { label: "Pass Card", value: "passcard" },
  { label: "Other", value: "other" },
];

const attributeOptions = [
  { label: "Transferable", value: "transferable" },
  { label: "Burnable", value: "burnable" },
  { label: "Mintable", value: "mintable" },
  { label: "Pausable", value: "pausable" },
];

const tokenStandardOptions = [
  { label: "ICRC-1", value: "icrc1" },
  { label: "DRC-20", value: "drc20" },
  {
    label: "EXT-20",
    value: "ext20",
    children: [
      { label: "NFT", value: "nft" },
      { label: "Fungible Token", value: "fungible" },
    ],
  },
];

const rules = {
  tokenId: {
    required: true,
    trigger: ["blur", "input"],
    message: "Please enter a Token ID",
  },
  tokenSupply: {
    required: true,
    trigger: ["blur", "input"],
    message: "Please enter the Token Supply",
  },
  tokenStandard: {
    required: true,
    trigger: ["blur", "change"],
    message: "Please select a Token Standard",
  },
  validTargets: {
    type: "array",
    required: true,
    trigger: ["blur", "change"],
    message: "Please select at least one Valid Target",
  },
  launchDate: {
    type: "number",
    required: true,
    trigger: ["blur", "change"],
    message: "Please select a Launch Date",
  },
  minSimilarity: {
    validator(rule, value) {
      return value >= 0 && value <= 100;
    },
    required: true,
    trigger: ["blur", "change"],
    message: "Minimum Difference must be less than 2",
  },
  description: {
    required: true,
    trigger: ["blur", "input"],
    message: "Please enter a Token Description",
  },
};

const handleSubmit = (e) => {
  e.preventDefault();
  formRef.value?.validate((errors) => {
    if (!errors) {
      message.error("not available");
    } else {
      message.error("Please fix the errors in the form");
    }
  });
};
</script>

