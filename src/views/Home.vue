<!-- Home.vue -->
<template>
  <div class="component-box">
    <h1>nothing is something</h1>

    <n-card title=" FACE-ID">
    <template #cover>
      <img src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg">
    </template>
   First Token use face recognize build on the internet computer..
  </n-card>
  <n-divider />

    <n-button @click="$router.push('/upload')">
      Start Uploading
    </n-button>
  </div>
  <n-card title="Help center">

  <n-collapse>
    <n-collapse-item title="What should I do?" name="1">
  <div>
    1. Click on the Claim option.<br/>
    2. Upload your face data and information. Note that once uploaded, you cannot add new information. You can view your status in the About section.
  </div>
</n-collapse-item>

<n-collapse-item title="When can I check my tokens?" name="2">
  <div>
    1. Claiming consists of two parts. After uploading your data, you need to use the recognition feature to claim your face ID.<br/>
    2. Once successfully claimed, you cannot perform recognition again. Each person has up to 3 attempts.<br/>
    3. Your token allocation depends on your score. Higher differences result in more tokens, but a very high difference may lead to recognition failure.<br/>
    4. When the process is complete and the number of claims reaches the target, the canisters will automatically distribute all the balance.
  </div>
</n-collapse-item>

<n-collapse-item title="What is the total amount of tokens and how are they distributed?" name="3">
  <div>
    1. The total amount of Face ID tokens is unlimited but depends on the number of tests.<br/>
    2. All tokens are distributed to test users, approximately 500 people.<br/>
    3. We are exploring new anti-bot minting methods. This is just a test, so there may be issues. Do not deposit any balance into your account.
  </div>
</n-collapse-item>

<n-collapse-item title="Is my data secure?" name="4">
  <div>
    Yes, your information is securely stored in the ICP canister. No one can access it, and it is only used when verifying your information.
  </div>
</n-collapse-item>

<n-collapse-item title="What are the next steps?" name="5">
  <div>
    We plan to implement a new distribution method that uses face recognition to ensure fair access to tokens for more people.
  </div>
</n-collapse-item>

  </n-collapse>
</n-card>
</template>