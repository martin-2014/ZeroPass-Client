/**
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
const { PROXY_URL } = process.env;
export default {
    dev: {
        '/api/': {
            target: PROXY_URL,
            changeOrigin: true,
        },
    },
};
