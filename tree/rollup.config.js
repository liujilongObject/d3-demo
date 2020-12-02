import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import json from 'rollup-plugin-json'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import scss from 'rollup-plugin-scss'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/main.js',
  output: {
    file: 'public/static/bundle.js',
    format: 'umd',
    sourcemap: true 
  },
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled'
    }),
    json(),
    serve({
      open: true,
      port: 8000,
      openPage: '/public/index.html',
      contentBase: ''
    }),
    livereload(),
    scss({
      output: 'public/static/bundle.css',
      watch: 'src/assets/styles'
    }),
    terser()
  ]
}
