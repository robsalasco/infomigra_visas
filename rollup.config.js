import commonjs from 'rollup-plugin-commonjs';
// import purgeCss from '@fullhuman/postcss-purgecss';
import livereload from 'rollup-plugin-livereload';
import postcss from 'rollup-plugin-postcss';
import resolve from 'rollup-plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import {terser} from 'rollup-plugin-terser';
import svelte_preprocess_postcss from 'svelte-preprocess-postcss';
import json from 'rollup-plugin-json';

const production = !process.env.ROLLUP_WATCH;
export default {
   input: 'src/main.js',
   output: {
      format: 'iife',
      sourcemap: true,
      name: 'app',
      file: 'public/main.js',
   },
   plugins: [
      json(),
      svelte({
         dev: !production,
         preprocess: {
            style: svelte_preprocess_postcss(),
         },
         css: css => {
            css.write('public/components.css');
         },
      }),
      resolve(),
      commonjs(),
      postcss({
         extract: true,
      }),
      !production && livereload('public'),
      production && terser(),
   ],
   watch: {
       clearScreen: false,
   },
};
