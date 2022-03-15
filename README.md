# unity-webgl

Unity WebGL provides an easy solution for embedding Unity WebGL builds in your webApp or `Vue.js` project, with two-way communication between your webApp and Unity application with advanced API's.   

UnityWebgl.js 提供了一种简单的解决方案，用于在 webApp 或 Vue.js 项目中嵌入 Unity WebGL，并通过API在 webApp 和 Unity 之间进行双向通信。

based on [react-unity-webgl](https://github.com/jeffreylanters/react-unity-webgl)

## Features
- 💊 Simple and flexible to use
- 📮 two-way communication (webApp, Unity)
- 🛠 Built-in event handler
- 🧬 Available for `Vue.js`

## API

### Unity Config

* `loaderUrl: string` The url to the build json file generated by Unity
* `dataUrl: string` :  The url to the build data file generated by Unity
* `frameworkUrl: string` :  The url to the framework file generated by Unity
* `codeUrl: string` :  The url to the unity code file generated by Unity
* `streamingAssetsUrl?: string` :  The url where the streaming assets can be found
* `companyName?: string` :  The applications company name
* `productName?: string` :  The applications product name
* `productVersion?: string` :  The applications product version
* `webglContextAttributes?: IWebGLContextAttributes` :  This object allow you to configure WebGLRenderingContext creation options. see [MDN@WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getContextAttributes)
* `devicePixelRatio?: number` :  Uncomment this to override low DPI rendering on high DPI displays. see [MDN@devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio)
* `matchWebGLToCanvasSize?: boolean` :  Uncomment this to separately control WebGL canvas render size and DOM element size. see [unity3d@matchWebGLToCanvasSize](https://issuetracker.unity3d.com/issues/webgl-builds-dont-allow-separate-control-on-canvas-render-buffer-size)

### Unity Instance

**Methods：**

* `on(eventName: string, eventListener: function)`
* `once(eventName: string, eventListener: function)`
* `off(eventName: string)`
* `clear()`
* `emit(eventName: string)`

---

* `create(canvasElement: HTMLCanvasElement | string)`
* `send(objectName: string, methodName: string, params: any)`
* `setFullscreen()`
* `destroy()`

**Events：**

- `progress(value: number)` : loading progress.
- `loaded()` : loading completed.
- `created()` : Unity instance is created.
- `destroyed()` : Quits the Unity Instance and clears it from memory.

### vue component

**props**

* `unity: UnityWebgl`
* `width?: string|number ` , default: `100%`
* `height?: string|number ` , default: `100%`

## Install
```
npm install unity-webgl
```

browser
```
https://cdn.jsdelivr.net/npm/unity-webgl/dist/UnityWebgl.min.js
```

## Usage

in example.html:

```html
<canvas id="canvas" style="width: 100%; height: 100%"></canvas>

<button onclick="onDestroy()">Destroy</button>
<button onclick="onLoad()">Reload</button>
<button onclick="onFullscreen()">Fullscreen</button>

<script>
var Unity = new UnityWebgl('#canvas', {
  loaderUrl: 'Build/OUT_BIM.loader.js',
  dataUrl: "Build/OUT_BIM.data",
  frameworkUrl: "Build/OUT_BIM.framework.js",
  codeUrl: "Build/OUT_BIM.wasm"
})

Unity
  .on('progress', percent => console.log('Unity Loaded: ', percent))
  .on('created', () => console.log('Unity Instance: created.'))
  .on('destroyed', () => console.log('Unity Instance: Destroyed.'))

function postMessage() {
  Unity.send('objectName', 'methodName', {
    id: 'B0001',
    name: 'Building#1',
    location: [150, 75]
  })
}

function onDestroy() {
  Unity.destroy()
}

function onLoad() {
  Unity.create('#canvas')
}

function onFullscreen() {
  Unity.setFullscreen(true)
}
</script>
```

You can also:

```js
var Unity = new UnityWebgl({
  loaderUrl: 'Build/OUT_BIM.loader.js',
  dataUrl: "Build/OUT_BIM.data",
  frameworkUrl: "Build/OUT_BIM.framework.js",
  codeUrl: "Build/OUT_BIM.wasm",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "DefaultCompany",
  productName: "Unity",
  productVersion: "0.1",
})

Unity.create(document.querySelector('#canvas'))
```

### Vue

in example.vue

```html
<template>
  <Unity :unity="unityContext" width="800px" height="600px" />
</template>

<script>
import UnityWebgl from 'unity-webgl'

const Unity = new UnityWebgl({
  loaderUrl: 'Build/OUT_BIM.loader.js',
  dataUrl: "Build/OUT_BIM.data",
  frameworkUrl: "Build/OUT_BIM.framework.js",
  codeUrl: "Build/OUT_BIM.wasm"
})

export default {
  name: 'Unity',
  component: {
    Unity: UnityWebgl.vueComponent
  },
  data() {
    return {
      unityContext: Unity
    }
  }
}
</script>
```

## Communication

* [**WebGL: Interacting with browser scripting**@Unity3d.Docs](https://docs.unity3d.com/Manual/webgl-interactingwithbrowserscripting.html)
* [**WebGL：与浏览器脚本交互**@Unity3d官方文档](https://docs.unity3d.com/cn/2020.3/Manual/webgl-interactingwithbrowserscripting.html)

### 1. Calling JavaScript functions from Unity scripts

**从 Unity 脚本调用 JavaScript 函数**

1. First, you should register a `showDialog` method, which be bind to the `__UnityLib__` global object by default.

   先在前端项目中通过 `Unity.on()` 注册 `showDialog` 方法，该方法会默认绑定在全局对象`__UnityLib__`上。

```js
// # in webApp

const Unity = new UnityWebgl()
// Register functions
Unity.on('showDialog', (data: any) => {
  console.log(data)
  $('#dialog').show()
})

// you also can call function.
Unity.emit('showDialog', data)
// or
window[Unity.global_name].showDialog(data) // 📢 Unity.global_name = __UnityLib__
```

2. In the Unity project, add the registered `showDialog` method to the project, and then call those functions directly from your script code. To do so, place files with JavaScript code using the `.jslib` extension under a “Plugins” subfolder in your Assets folder. The plugin file needs to have a syntax like this:

   在Unity项目中，将注册的`showDialog`方法添加到项目中。注意📢 ：请使用 `.jslib` 扩展名将包含 JavaScript 代码的文件放置在 Assets 文件夹中的“Plugins”子文件夹下。插件文件需要有如下所示的语法：

```js
// javascript_extend.jslib

mergeInto(LibraryManager.library, {
  // this is you code
  showDialog: function (str) {
    var data = Pointer_stringify(str);
    // '__UnityLib__' is a global function collection.
    __UnityLib__.showDialog(data);
  },
  
  Hello: function () {
    window.alert("Hello, world!");
  }
});
```

Then you can call these functions from your C# scripts like this:

```c#
using UnityEngine;
using System.Runtime.InteropServices;

public class NewBehaviourScript : MonoBehaviour {

    [DllImport("__Internal")]
    private static extern void Hello();

    [DllImport("__Internal")]
    private static extern void showDialog(string str);

    void Start() {
        Hello();
        
        showDialog("This is a string.");
    }
}
```

### 2. Calling Unity scripts functions from JavaScript

使用 JavaScript 调用 Unity 脚本函数

```js
const Unity = new UnityWebgl()

/**
 * Sends a message to the UnityInstance to invoke a public method.
 * @param {string} objectName Unity scene name.
 * @param {string} methodName public method name.
 * @param {any} params an optional method parameter.
 */
Unity.send(objectName, methodName, params)

// e.g. Initialize Building#001 data
Unity.send('mainScene', 'init', {
  id: 'b001',
  name: 'building#001',
  length: 95,
  width: 27,
  height: 120
})
```

