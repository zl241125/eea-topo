import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const isProd = process.env.NODE_ENV === 'production';

const config = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/eea-renderer.js',
      format: 'umd',
      name: 'EEARenderer',
      sourcemap: !isProd
    },
    {
      file: 'dist/eea-renderer.esm.js',
      format: 'es',
      sourcemap: !isProd
    }
  ],
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types',
      sourceMap: !isProd
    }),
    isProd && terser()
  ],
  watch: {
    clearScreen: false,
    include: 'src/**'
  }
};

export default config; 