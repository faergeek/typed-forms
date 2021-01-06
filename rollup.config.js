import { DEFAULT_EXTENSIONS } from '@babel/core';
import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  external: [/@babel\/runtime/],
  plugins: [
    babel({
      babelHelpers: 'runtime',
      exclude: ['node_modules/**'],
      extensions: [...DEFAULT_EXTENSIONS, '.ts'],
    }),
    terser(),
  ],
  output: {
    file: 'dist/index.esm.js',
    format: 'es',
    sourcemap: true,
    sourcemapExcludeSources: true,
  },
};
