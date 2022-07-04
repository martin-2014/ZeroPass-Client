const c = require("./build/Release/wincapture.node");
c.capture((img) => {
    console.log(img);
});
