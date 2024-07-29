<template>
    <n-card title="Upload">

  <n-form
    ref="formRef"
    :model="model"
    :rules="rules"
    :size="size"
    label-placement="top"
  >
    <n-grid :cols="24" :x-gap="24">
      <n-form-item-gi :span="12" label="Token-ID" path="inputValue">
        <n-input v-model:value="model.inputValue" placeholder="Token Name" />
      </n-form-item-gi>


      <n-form-item-gi :span="12" label="LOGO" path="inputValue">
        <n-upload>
          <n-button>Upload file</n-button>
        </n-upload>
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="Token-num" path="inputValue">
        <n-input v-model:value="model.inputValue2" placeholder="Token Name" />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="Valid Target" path="selectValue">
        <n-select
          v-model:value="model.selectValue"
          placeholder="Select"
          :options="alOptions"
        />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="Introduction" path="textareaValue">
        <n-input
          v-model:value="model.textareaValue"
          placeholder="Introduction"
          type="textarea"
          :autosize="{
            minRows: 3,
            maxRows: 5,
          }"
        />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="Min similarity" path="sliderValue">
        <n-slider v-model:value="model.sliderValue" :step="5" />
      </n-form-item-gi>

      <n-form-item-gi :span="12" label="Launch Datetime" path="datetimeValue">
        <n-date-picker v-model:value="model.datetimeValue" type="datetime" />
      </n-form-item-gi>

      <n-form-item-gi :span="10" label="Standard" path="cascaderValue">

<n-cascader
  v-model:value="model.cascaderValue"
  placeholder="token standard"
  :options="cascaderOptions"
  check-strategy="child"
  size="medium"
/>
</n-form-item-gi>

      <n-form-item-gi :span="14" label="Attribute" path="transferValue">
        <n-transfer
          v-model:value="model.transferValue"
          style="width: 100%"
          :options="generalOptions"
        />
      </n-form-item-gi>

      <n-gi :span="24">
        <div style="display: flex; justify-content: flex-end">
          <n-button round type="primary" @click="handleValidateButtonClick">
            Confirm
          </n-button>
        </div>
      </n-gi>
    </n-grid>
  </n-form>
</n-card>
</template>

<script>
import { defineComponent, ref,computed } from "vue";
import { useMessage } from "naive-ui";
function genOptions(depth = 2, iterator = 1, prefix = "") {
  const length = 12;
  const options = [];
  for (let i = 1; i <= length; ++i) {
    if (iterator === 1) {
      options.push({
        value: `${i}`,
        label: `${i}`,
        disabled: i % 5 === 0,
        children: genOptions(depth, iterator + 1, `${i}`)
      });
    } else if (iterator === depth) {
      options.push({
        value: `${prefix}-${i}`,
        label: `${prefix}-${i}`,
        disabled: i % 5 === 0
      });
    } else {
      options.push({
        value: `${prefix}-${i}`,
        label: `${prefix}-${i}`,
        disabled: i % 5 === 0,
        children: genOptions(depth, iterator + 1, `${prefix}-${i}`)
      });
    }
  }
  return options;
}
export default defineComponent({
  setup() {
    const formRef = ref(null);
    const message = useMessage();
    return {
      formRef,
      size: ref("medium"),
      model: ref({ 
        inputValue: null,
        textareaValue: null,
        selectValue: null,
        multipleSelectValue: null,
        datetimeValue: null,
        nestedValue: {
          path1: null,
          path2: null
        },
        switchValue: false,
        checkboxGroupValue: null,
        radioGroupValue: null,
        radioButtonGroupValue: null,
        inputNumberValue: null,
        timePickerValue: null,
        sliderValue: 0,
        transferValue: null,
        cascaderValue: null,

      }),
      generalOptions: ["HUMAN", "PET", "PASSCARD", "MORE..."].map(
        (v) => ({
          label: v,
          value: v
        })
      ),
      generalOptions: ["1", "2", "3", "4"].map(
        (v) => ({
          label: v,
          value: v
        })
      ),
      cascaderOptions: [
        {
          label: "ICRC1",
          value: "groode"
        },
        {
          label: "DRC20",
          value: "groode"
        },
        {
          label: "EXT20",
          value: "groode",
          children: [
            {
              label: "nft",
              value: "token"
            },            {
              label: "token",
              value: "token"
            }
          ]
        }



      ],
      return: {
        options: genOptions()
},
      rules: {
        inputValue: {
          required: true,
          trigger: ["blur", "input"],
          message: "Enter something"
        },
        textareaValue: {
          required: true,
          trigger: ["blur", "input"],
          message: "Enter somethinge"
        },
        selectValue: {
          required: true,
          trigger: ["blur", "change"],
          message: "Enter something"
        },
        multipleSelectValue: {
          type: "array",
          required: true,
          trigger: ["blur", "change"],
          message: "Enter something"
        },
        datetimeValue: {
          type: "number",
          required: true,
          trigger: ["blur", "change"],
          message: "Enter something"
        },
        nestedValue: {
          path1: {
            required: true,
            trigger: ["blur", "input"],
            message: "Enter something"
          },
          path2: {
            required: true,
            trigger: ["blur", "change"],
            message: "Enter something"
          }
        },
        checkboxGroupValue: {
          type: "array",
          required: true,
          trigger: "change",
          message: "Enter something"
        },
        radioGroupValue: {
          required: true,
          trigger: "change",
          message: "Enter something"
        },
        inputNumberValue: {
          type: "number",
          required: true,
          trigger: ["blur", "change"],
          message: "PLS input inputNumberValue"
        },
        timePickerValue: {
          type: "number",
          required: true,
          trigger: ["blur", "change"],
          message: "PLS input timePickerValue"
        },
        sliderValue: {
          validator(rule, value) {
            return value > 20;
          },
          trigger: ["blur", "change"],
          message: "SIMILARITY NEED LARGER THAN 20"
        },
        transferValue: {
          type: "array",
          required: true,
          trigger: "change",
          message: "请输入 transferValue"
        }
      },

      handleValidateButtonClick(e) {


            message.error("Fonction is not avaliable");
          } 
    };
  }
});
</script>