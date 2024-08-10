import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Addition = { 'Ok' : Embedding } |
  { 'Err' : Error };
export interface BoundingBox {
  'top' : number,
  'left' : number,
  'bottom' : number,
  'right' : number,
}
export type Detection = { 'Ok' : BoundingBox } |
  { 'Err' : Error };
export interface Embedding { 'v0' : Array<number> }
export interface Error { 'message' : string }
export interface Person { 'label' : string, 'score' : number }
export type Principal = Principal;
export type Recognition = { 'Ok' : Person } |
  { 'Err' : Error };
export interface RecognitionResult { 'label' : string, 'score' : number }
export interface _SERVICE {
  'add' : ActorMethod<[string, Uint8Array | number[], string], Addition>,
  'add_cycles' : ActorMethod<[], undefined>,
  'append_face_detection_model_bytes' : ActorMethod<
    [Uint8Array | number[]],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'append_face_recognition_model_bytes' : ActorMethod<
    [Uint8Array | number[]],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'clear_face_detection_model_bytes' : ActorMethod<
    [],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'clear_face_recognition_model_bytes' : ActorMethod<
    [],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'detect' : ActorMethod<[Uint8Array | number[]], Detection>,
  'get_add_callers' : ActorMethod<[], [bigint, Array<Principal>]>,
  'get_all_recognition_results' : ActorMethod<[], Array<string>>,
  'get_cycles' : ActorMethod<[], bigint>,
  'get_recognition_result' : ActorMethod<[Principal], [] | [RecognitionResult]>,
  'recognize' : ActorMethod<[Uint8Array | number[]], Recognition>,
  'setup_models' : ActorMethod<[], { 'Ok' : null } | { 'Err' : string }>,
  'toggle_add_function' : ActorMethod<
    [boolean],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
