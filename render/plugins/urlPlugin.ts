const { BASE_URL } = process.env;
const { UPDATE_URL } = process.env;
const { DEV_TOOLS } = process.env;
const { ETH_API_KEY } = process.env;
const { CRYPTOCOMPARE_API_KEY } = process.env;
const { BSC_API_KEY } = process.env;
const fs = require('fs');
const path = require('path');

export default (api: any) => {
    api.onStart(() => {
        const dir = createDir();

        let configPath = dir + '/config.ts';
        let text = `export const baseUrl = "${BASE_URL}"\n`;
        text += `export const ethApiKey = "${ETH_API_KEY}"\n`;
        text += `export const bscApiKey = "${BSC_API_KEY}"\n`;
        text += `export const cryptocompareApiKey = "${CRYPTOCOMPARE_API_KEY}"\n`;
        createFile(configPath, text);

        configPath = dir + '/node_config.ts';
        text = `const updateUrl = "${UPDATE_URL}"\n` + 'export default updateUrl';
        createFile(configPath, text);

        configPath = dir + '/dev_tools.ts';
        text = `export const devTools : string | undefined = "${DEV_TOOLS}"`;
        createFile(configPath, text);
    });

    function createDir() {
        const dir = path.join(__dirname, '../src/.hub');
        fs.mkdir(dir, { recursive: true }, (err: any) => {
            if (err) {
                throw err;
            }
        });
        return dir;
    }

    function createFile(filePath, text) {
        fs.writeFile(filePath, text, (err: string) => {
            if (err) {
                throw console.error(err);
            }
        });
    }
};
