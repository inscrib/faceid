<script setup>
import { createClient } from "@connect2ic/core"
import { Connect2ICProvider } from "@connect2ic/vue"
import App from './App.vue'
import { defaultProviders } from "@connect2ic/core/providers"
import * as couter from "./backend"

const client = createClient({
  providers: defaultProviders,
  canisters: {
    couter
  },
  
  globalProviderConfig: {
    dev: false, 
    host: 'https://ic0.app'
  },
});
// ic0.app
</script>

<template>
  <Connect2ICProvider :client="client">
    <App />
  </Connect2ICProvider>
</template>

<!-- 
<script setup>
import { createClient } from "@connect2ic/core"
import { Connect2ICProvider } from "@connect2ic/vue"
import App from './App.vue'
import { InternetIdentity } from "@connect2ic/core/providers/internet-identity"
import { idlFactory as couter } from "../../declarations/backend/backend.did.js";

const client = createClient({
  providers: [
    // You may pass in different options to each provider
    new InternetIdentity({ providerUrl: "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:4943/"}),
  ],

})
</script>

<template>
  <Connect2ICProvider :client="client">
    <App />
  </Connect2ICProvider>
</template>

 -->
