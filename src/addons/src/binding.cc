#include <napi.h>

Napi::Object InitEnumWindows(Napi::Env env);

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("enumWindows", InitEnumWindows(env));
  return exports;
}

NODE_API_MODULE(addon, Init)