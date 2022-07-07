import styles from './index.less';
import getForm, { FormItems } from './Form';

export default () => {
    const items = getForm();

    return (
        <div className={styles.main}>
            {items.map((item, index) => (
                <FormItems
                    key={index}
                    title={item.title}
                    label={item.label}
                    content={item.content}
                />
            ))}
        </div>
    );
};
