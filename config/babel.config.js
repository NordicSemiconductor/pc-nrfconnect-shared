module.exports = api => {
    api.cache(true);
    return {
        presets: ['@babel/preset-react', '@babel/preset-typescript'],
        plugins: [
            'add-module-exports',
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-transform-destructuring',
            '@babel/plugin-transform-modules-commonjs',
            '@babel/plugin-transform-parameters',
            '@babel/plugin-transform-spread',
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-proposal-optional-chaining',
            '@babel/plugin-proposal-nullish-coalescing-operator',
        ],
    };
};
