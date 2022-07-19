export default (props) => {
    return (
        <div
            style={{
                backgroundImage: 'url(./background.png)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                height: '100%',
            }}
        >
            {props.children}
        </div>
    );
};
