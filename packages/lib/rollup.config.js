import path from 'path'
import { defineConfig } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import dts from 'rollup-plugin-dts'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const name = 'UnityWebgl'
const env = process.env.NODE_ENV

const banner =
  '/*!\n' +
  ` * unity-webgl.js v${pkg.version}\n` +
  ` * (c) ${new Date().getFullYear()} Mervin<mengqing723@gmail.com>\n` +
  ' * Released under the MIT License.\n' +
  ' */'

const outputs = [
  {
    name,
    file: pkg.main,
    format: 'umd',
    banner
  },
  {
    file: pkg.module,
    format: 'es',
    banner
  }
]

function generateLib(outputs) {
  return outputs.map(item => {
    const config = defineConfig({
      input: path.resolve(__dirname, 'src/index.ts'),
      output: item,
      plugins: [
        json({
          namedExports: false
        }),
        nodeResolve(),
        commonjs(),
        typescript({
          useTsconfigDeclarationDir: true,
          cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
        })
      ]
    })

    if (env === 'production' && item.format === 'umd') {
      config.plugins.push(terser())
    }

    return config
  })
}

// build vue component
function generateVue() {
  return defineConfig({
    plugins: [typescript()],
    external: ['vue-demi'],
    input: 'src/vue/index.ts',
    output: [
      {
        format: 'esm',
        file: 'dist/VueUnity.esm.js'
      },
      {
        name: 'VueUnity',
        format: 'umd',
        file: 'dist/VueUnity.min.js',
        globals: {
          vue: "Vue",
          'vue-demi': 'VueDemi'
        },
      }
    ]
  })
}

export default [
  ...generateLib(outputs),
  generateVue(),
  {
    input: 'src/index.ts',
    plugins: [dts()],
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    }
  }
]