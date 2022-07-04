{
    "targets": [
		{
            "target_name": "addon32",
            "cflags!": ["-std=c++14", "-fno-exceptions", "-fno-rtti"],
            "cflags_cc!": ["-std=c++14", "-fno-exceptions", "-fno-rtti"],
            "sources": ["binding.cc", "enumWindows.cc"],
            "msvs_settings": {
                "VCCLCompilerTool": {
                    "RuntimeTypeInfo": "true"
                }
            },
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS", "UNICODE", "WIN32"],
            "link_settings": {
                "libraries": ["Dwmapi.lib"]
            }
        }
    ]
}
