import { DEFAULT_EXTENSIONS } from '@babel/core';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

import corePkg from './packages/core/package.json';

export default {
  input: 'packages/core/src/index.ts',
  plugins: [
    nodeResolve({
      extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx'],
    }),
    typescript({ tsconfig: 'packages/core/tsconfig.json' }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: ['node_modules/**'],
      extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
    }),
  ],
  output: {
    file: `packages/core/${corePkg.module}`,
    format: 'es',
    sourcemap: true,
    sourcemapExcludeSources: true,
  },
};
