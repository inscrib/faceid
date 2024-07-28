import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "./backend.did.js";
export { idlFactory } from "./backend.did.js";

/* CANISTER_ID is replaced by webpack based on node environment
 * Note: canister environment variable will be standardized as
 * process.env.CANISTERID<CANISTER_NAME_UPPERCASE>
 * beginning in dfx 0.15.0
 */
// export const canisterId =
//   process.env.CANISTER_ID_BACKEND;

export const canisterId = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';

export const createActor = (canisterId, options = {}) => {
  // 检查并设置host
  const isLocalEnv = process.env.DFX_NETWORK === 'local';
  const host = isLocalEnv ? 'http://127.0.0.1:4943/' : 'https://ic0.app';

  // 创建HttpAgent，并明确传入host
  const agent = options.agent || new HttpAgent({ host, ...options.agentOptions });

  // 检查传入的agent和agentOptions
  if (options.agent && options.agentOptions) {
    console.warn(
      'Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.'
    );
  }

  // 在非生产环境中获取root key，用于开发中的证书验证
  if (process.env.DFX_NETWORK !== 'ic') {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        'Unable to fetch root key. Check to ensure that your local replica is running'
      );
      console.error(err);
    });
  }

  // 使用candid接口和HttpAgent创建actor
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

