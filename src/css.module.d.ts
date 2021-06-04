declare module '*.module.scss' {
    const classNames: {
        [className: string]: string;
    };
    export = classNames;
}
