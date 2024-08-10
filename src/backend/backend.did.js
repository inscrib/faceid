export const idlFactory = ({ IDL }) => {
  const Embedding = IDL.Record({ 'v0' : IDL.Vec(IDL.Float32) });
  const Error = IDL.Record({ 'message' : IDL.Text });
  const Addition = IDL.Variant({ 'Ok' : Embedding, 'Err' : Error });
  const BoundingBox = IDL.Record({
    'top' : IDL.Float32,
    'left' : IDL.Float32,
    'bottom' : IDL.Float32,
    'right' : IDL.Float32,
  });
  const Detection = IDL.Variant({ 'Ok' : BoundingBox, 'Err' : Error });
  const RecognitionResult = IDL.Record({
    'label' : IDL.Text,
    'score' : IDL.Float32,
  });
  const Person = IDL.Record({ 'label' : IDL.Text, 'score' : IDL.Float32 });
  const Recognition = IDL.Variant({ 'Ok' : Person, 'Err' : Error });
  return IDL.Service({
    'add' : IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text], [Addition], []),
    'add_cycles' : IDL.Func([], [], []),
    'append_face_detection_model_bytes' : IDL.Func(
        [IDL.Vec(IDL.Nat8)],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'append_face_recognition_model_bytes' : IDL.Func(
        [IDL.Vec(IDL.Nat8)],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'clear_face_detection_model_bytes' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'clear_face_recognition_model_bytes' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'detect' : IDL.Func([IDL.Vec(IDL.Nat8)], [Detection], ['query']),
    'get_add_callers' : IDL.Func(
        [],
        [IDL.Nat64, IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_all_recognition_results' : IDL.Func(
        [],
        [IDL.Vec(IDL.Text)],
        ['query'],
      ),
    'get_cycles' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_recognition_result' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(RecognitionResult)],
        ['query'],
      ),
    'recognize' : IDL.Func([IDL.Vec(IDL.Nat8)], [Recognition], []),
    'setup_models' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'toggle_add_function' : IDL.Func(
        [IDL.Bool],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
