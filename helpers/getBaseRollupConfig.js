/**
 * To edit the base rollup config, edit the TS file and enable Automatic Task Watching in VS Code to transpile the JS which is included in the rollup configs.
 */
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import path from 'path';
const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const esmOnlyPackages = [/unist/];
const esmExternal = (source) => !source.startsWith('.') && !path.isAbsolute(source);
// we pack ESM-only packages for CJS users, just to be nice.
const cjsExternal = (source) => esmExternal(source) &&
    !esmOnlyPackages.find((esmOnlyPackage) => esmOnlyPackage.test(source));
export const getBaseRollupConfig = (tsConfig, esmCallback, cjsCallback) => {
    const baseBuildConfig = {
        plugins: [
            // Allows node_modules resolution
            resolve({ extensions }),
            // Allow bundling cjs modules. Rollup doesn't understand cjs
            commonjs(),
            // Compile TypeScript/JavaScript files
            babel({ extensions, include: ['src/**/*'], babelHelpers: 'runtime' }),
        ],
    };
    const tsDefinitionsConfig = tsConfig
        ? [
            {
                input: './src/index.ts',
                plugins: [
                    // Allows node_modules resolution
                    resolve({ extensions }),
                    typescript({
                        tsconfig: tsConfig,
                    }),
                ],
                output: {
                    file: './dist/index.js',
                },
            },
        ]
        : [];
    return tsDefinitionsConfig.concat([
        esmCallback({
            ...baseBuildConfig,
            external: esmExternal,
        }),
        cjsCallback({
            ...baseBuildConfig,
            external: cjsExternal,
        }),
    ]);
};
