import { PageLoading } from '@ant-design/pro-layout';
import ReactDOM from 'react-dom';
import styles from './index.less';

class Loading {
    domNode: HTMLElement;
    isExistNode: boolean;
    timer: any;
    constructor() {
        this.domNode = document.createElement('div');
        this.isExistNode = false;
    }

    private render(visible: boolean) {
        if (!this.isExistNode && visible) {
            document.body.appendChild(this.domNode);
            const children = this.createNode();
            ReactDOM.render(children, this.domNode);
            this.isExistNode = true;
        }
        if (visible) {
            this.domNode.className = styles.hubLoadingWrap;
        } else {
            this.domNode.className = `${styles.hubLoadingWrap} ${styles.hubHide}`;
        }
    }
    createNode() {
        const node = <PageLoading />;
        return node;
    }

    show(isDelay = true, delay = 300) {
        this.timer && clearTimeout(this.timer);
        if (!isDelay) {
            this.render(true);
        } else {
            // 防闪烁
            this.timer = setTimeout(() => this.render(true), delay);
        }
    }

    hide() {
        this.timer && clearTimeout(this.timer);
        this.render(false);
    }
}

export default new Loading();
