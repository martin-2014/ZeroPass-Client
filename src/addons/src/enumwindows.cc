#include <napi.h>
#include <string>
#include <atlimage.h>
#include <dwmapi.h>

static bool IsInvisibleWin10BackgroundAppWindow(HWND hWnd) {
    int CloakedVal;
    HRESULT hRes = DwmGetWindowAttribute(hWnd, DWMWA_CLOAKED, &CloakedVal, sizeof(CloakedVal));
    if (hRes != S_OK)
    {
        CloakedVal = 0;
    }
    return CloakedVal ? true : false;
}

static BOOL CALLBACK enumWindowCallback(HWND hWnd, LPARAM lparam) {
    std::vector<HWND>& vector = *reinterpret_cast<std::vector<HWND>*>(lparam);
    if (!IsInvisibleWin10BackgroundAppWindow(hWnd) && !IsIconic(hWnd) && IsWindowVisible(hWnd)) {
        vector.push_back(hWnd);
    }

    return TRUE;
}

void enumTopWindows(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Function callback = info[0].As<Napi::Function>();
    std::vector<HWND> topWindows;

    EnumWindows(enumWindowCallback, reinterpret_cast<LPARAM>(&topWindows));
    for (auto it = topWindows.begin(); it != topWindows.end(); ++it) {
        HWND hWnd = *it;
        RECT rect;
        if (!GetClientRect(hWnd, &rect)) {
            continue;
        }

        int width = rect.right - rect.left;
        int height = rect.bottom - rect.top;
        if (width <= 50|| height <= 50) continue;

        HDC hdcFrom = GetDC(hWnd);
        if (hdcFrom == NULL) continue;
        int bitOfPix = GetDeviceCaps(hdcFrom, BITSPIXEL);

        CImage image;
        image.Create(width, height, bitOfPix);
        PrintWindow(hWnd, image.GetDC(), PW_RENDERFULLCONTENT);
        GdiFlush();
        int imgWidth = image.GetWidth();
        int imgHeight = image.GetHeight();
        int imgPitch = image.GetPitch();
        int len = imgHeight * std::abs(imgPitch);
        Napi::Object obj = Napi::Object::New(env);
        BYTE* img_Data = (BYTE*)image.GetBits() + (imgPitch * (imgHeight - 1));
        Napi::ArrayBuffer buffer = Napi::ArrayBuffer::New(env, img_Data, len);
        obj.Set("buffer", buffer);
        obj.Set("width", imgWidth);
        obj.Set("height", imgHeight);
        obj.Set("pitch", imgPitch);
        Napi::Value success = callback.Call(env.Global(), { obj });
        buffer.Detach();
        image.ReleaseDC();
        ReleaseDC(hWnd, hdcFrom);
        if (success.IsBoolean() && success.As<Napi::Boolean>().Value()) {
            break;
        }
    }
}

Napi::Object InitEnumWindows(Napi::Env env) {
    Napi::Object exports = Napi::Object::New(env);
    exports.Set(Napi::String::New(env, "enumTopWindows"),
        Napi::Function::New(env, enumTopWindows));
    return exports;
}
