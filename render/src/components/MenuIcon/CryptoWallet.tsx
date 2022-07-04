import { SvgProps } from '.';
export default (props: SvgProps) => {
    return (
        <svg width={props.size} height={props.size} viewBox="0 0 200 200">
            <path
                id="a"
                data-name="a"
                fill="none"
                stroke={props.fill}
                fillRule="evenodd"
                strokeWidth="15px"
                d="M27.712,49.653H174.288a10,10,0,0,1,10,10V174.347a10,10,0,0,1-10,10H27.712a10,10,0,0,1-10-10V59.653A10,10,0,0,1,27.712,49.653Z"
            />
            <path
                id="b"
                data-name="b"
                fill="none"
                stroke={props.fill}
                fillRule="evenodd"
                strokeWidth="15px"
                d="M181,137H158a21,21,0,0,1,0-42h23"
            />
            <path
                id="c"
                data-name="c"
                fill="none"
                stroke={props.fill}
                fillRule="evenodd"
                strokeWidth="15px"
                strokeLinejoin="round"
                d="M79,49l53-31,18,29"
            />
            <path
                id="d"
                data-name="d"
                fill={props.fill}
                fillRule="evenodd"
                d="M79,115L99,77l20,38H79Zm40,5L99,158,79,120h40Z"
            />
        </svg>
    );
};
