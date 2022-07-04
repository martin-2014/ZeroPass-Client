import { enumTopWindows } from "./addons/binding";
import jsqr from "jsqr";

const detectTopWindowQrCode = async () => {
    let result: string | null = null;
    enumTopWindows((img) => {
        result = parseCode(img);
        if (result !== null && isValidOneTimePassword(result)) {
            return true; // stop windows enumeration
        } else {
            result = null;
            return false;
        }
    });
    return result;
};

const isValidOneTimePassword = (val: string) => {
    return val.toLowerCase().startsWith("otpauth://totp/");
};

const parseCode = (imgBuffer) => {
    const { buffer, width, height, pitch } = imgBuffer;
    const len = width * height;
    // argb => rgba
    const argbBuffer = new Uint32Array(buffer);
    const rgbaBuffer = new Uint32Array(len);
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const argbPos = row * Math.abs(pitch / 4) + col;
            const index = (pitch > 0 ? row : height - row - 1) * width + col;
            rgbaBuffer[index] =
                ((argbBuffer[argbPos] << 8) & 0xfff0) |
                ((argbBuffer[argbPos] >> 24) & 0xf);
        }
    }
    try {
        const result = jsqr(
            new Uint8ClampedArray(rgbaBuffer.buffer),
            width,
            height
        );
        return result.data;
    } catch {
        return null;
    }
};

export default detectTopWindowQrCode;
