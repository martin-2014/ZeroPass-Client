import { WebRequestController, errRes } from "./webRequestController";
import { LevelDb, Merge } from "../repositories/index";
import logger from "electron-log";

const repos = new LevelDb(new Merge());

const webRequestController = new WebRequestController(repos);

export interface WebRequestRouter {
    (req: Message.WebRequestData): Promise<Message.WebResponseData>;
}

const webRequestRouter: WebRequestRouter = async (req) => {
    const startTime = Date.now();
    let result: Message.WebResponseData;
    try {
        result = await webRequestController[req.method](req.params);
    } catch (e) {
        logger.error(e);
        result = errRes("err_server_error");
    }
    logger.debug(
        `web local request ${req.method} spend ${Date.now() - startTime} ms`
    );
    return result;
};

export { webRequestRouter };
