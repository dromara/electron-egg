<template>
  <div
    class="hot-key-input-component"
    :class="{ cursor: focus, 'hot-key-input-shark': isShark }"
    :style="$props.style"
    tabindex="0"
    @focus="handleFocus"
    @blur="focus = false"
    @keydown.prevent="handleKeydown"
    :placeholder="list.length ? '' : placeholder"
  >
    <div class="hot-item" v-for="(item, index) in list" :key="index">
      <span class="hot-text">{{ formatItemText(item.text) }} </span>
      <i class="icon-close" @click="handleDeleteKey(index)"></i>
    </div>
  </div>
</template>

<script>
const CODE_NUMBER = Array.from({ length: 10 }, (v, k) => `Digit${k + 1}`)
const CODE_NUMPAD = Array.from({ length: 10 }, (v, k) => `Numpad${k + 1}`)
const CODE_ABC = Array.from(
  { length: 26 },
  (v, k) => `Key${String.fromCharCode(k + 65).toUpperCase()}`
)
const CODE_FN = Array.from({ length: 12 }, (v, k) => `F${k + 1}`)
const CODE_CONTROL = [
  "Shift",
  "ShiftLeft",
  "ShiftRight",
  "Control",
  "ControlLeft",
  "ControlRight",
  "Alt",
  "AltLeft",
  "AltRight",
] // ShiftKey Control(Ctrl) Alt

export default {
  name: "HotKeyInput",
  props: {
    type: {
      type: String,
      // lowser upper
      default: ()=> 'defalut'
    },
    // 默认绑定值
    // 传入 ['Ctrl+d'] 格式时会自动处理成 [{ text: 'Ctrl+d', controlKey: { altKey: false, ctrlKey: true, shiftKey: false, key: 'd', code: 'KeyD } }]
    hotkey: {
      type: Array | Object,
      required: true,
    },
    // 校验函数 判断是否允许显示快捷键
    verify: {
      type: Function,
      default: () => true,
    },
    // 无绑定时提示文字
    placeholder: {
      type: String,
      default: "",
    },
    // 限制最大数量
    max: {
      type: [String, Number],
      default: 0,
    },
    // 当max时，再次输入快捷键 - true: 清空后输入，false：无操作
    reset: {
      type: Boolean,
      default: false,
    },
    shake: {
      type: Boolean,
      default: true,
    },
    // 快捷键使用范围
    range: {
      type: Array,
      default: () => ["NUMBER", "NUMPAD", "ABC", "FN"],
    },
  },
  data() {
    return {
      isShark: false,
      focus: false,
      hotkeyBackups: this.hotkey || '' ,
      list: [],
      keyRange: [],
    }
  },
  watch: {
    list: function (list) {
      list.length ? (this.focus = false) : (this.focus = true)
      // .sync修饰符
      this.$emit(
        "update:hotkey",
        this.list.map((item) => {
          return this.formatItemText(item.text)
          // if(item.text && this.type != 'default'){
          //   return this.type == 'lowser' ? item.text.toLowerCase():item.text.toUpperCase()
          // }
          // return item.text
        })
      )
    },
    
    hotkeyBackups: {
      handler: function (val) {
        if (!val.length) return;
        const list = [];
        val.forEach((item) => {
          const arr = item.split("+");
          const controlKey = {
            altKey: arr.includes("Alt"),
            ctrlKey: arr.includes("Control"),
            shiftKey: arr.includes("Shift"),
            key: arr[arr.length - 1],
            code: `Key${arr[arr.length - 1].toUpperCase()}`,
          };
          list.push({
            text: arr.reduce((text, item, i) => {
              if (i) text += "+";
              if (controlKey.key === item) text += item.toUpperCase();
              else text += item;
              return text;
            }, ""),
            controlKey,
          });
        });
        this.list = list;
      },
      immediate: true,
    },
    range: {
      handler: function (val) {
        if(val === null){
          this.keyRange = null
          return
        }
        const keyRangeList = {
          NUMBER: CODE_NUMBER,
          NUMPAD: CODE_NUMPAD,
          ABC: CODE_ABC,
          FN: CODE_FN,
        }
        val.forEach((item) => {
          this.keyRange = this.keyRange.concat(
            keyRangeList[item.toUpperCase()]
          )
        })
      },
      immediate: true,
    },
  },
  methods: {
    formatItemText(text){
      if(text && this.type != 'default'){
        return this.type == 'lowser' ? text.toLowerCase() : text.toUpperCase()
      }
      return text
    },
    handleFocus() {
      if (!this.list.length) this.focus = true
    },
    handleDeleteKey(index) {
      this.list.splice(index, 1)
    },
    handleKeydown(e) {
      console.log('e: ',e)
      e.preventDefault()
      e.stopPropagation()
      const { altKey, ctrlKey, shiftKey, key, code } = e
      if (!CODE_CONTROL.includes(key)) {
        if (this.keyRange !== null && !this.keyRange.includes(code)){
          this.shakeAction()
          return
        }
        let controlKey = ''
        let temps = [
          { key: altKey, text: "Alt" },
          { key: ctrlKey, text: "Ctrl" },
          { key: shiftKey, text: "Shift" },
        ]
        temps.forEach((curKey) => {
          if (curKey.key) {
            if (controlKey) controlKey += "+"
            controlKey += curKey.text
          }
        })
        if (key) {
          if (controlKey) controlKey += "+"
          controlKey += key.toUpperCase()
        }
        this.addHotkey({
          text: controlKey,
          controlKey: { altKey, ctrlKey, shiftKey, key, code },
        })
      }
    },
    addHotkey(data) {
      if (this.list.length) {
        if (this.list.length.toString() >= this.max.toString()) {
          if (this.reset) {
            this.list = []
          } else {
            return
          }
        } else if (this.list.some((item) => data.text === item.text)) {
          this.shakeAction()
          return
        }
      }
      if (!this.verify(data)) {
        this.shakeAction()
        return
      }
      this.list.push(data)
    },
    shakeAction(){
      if(this.shake){
            this.isShark = true
            setTimeout(()=>{
              this.isShark = false
            }, 800)
          }
    }
  },
}
</script>
<style lang="less">
@keyframes Blink {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes hot-key-input-shake {
  0% {
    transform: scale(1);
  }
  10%,
  20% {
    transform: scale(0.9) rotate(-1deg);
  }
  30%,
  50%,
  70%,
  90% {
    transform: scale(1.1) rotate(1deg);
  }
  40%,
  60%,
  80% {
    transform: scale(1.1) rotate(-1deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

.hot-key-input-shark {
  animation: hot-key-input-shake 0.8s 1 ease-in;
}

.hot-key-input-component {
  display: flex;
  padding: 5px;
  border: 1px solid #dcdcdc;
  background-color: #fff;
  color: #333;
  cursor: text;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.hot-key-input-component:before {
  content: attr(placeholder);
  color: #afafaf;
}

.hot-key-input-component.cursor::after {
  content: "|";
  animation: Blink 1.2s ease 0s infinite;
  position: absolute;
  left: 10px;
}

.hot-item {
  display: flex;
  align-items: center;
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
  padding: 0 5px;
  margin-right: 5px;
}

.hot-key-input-component .hot-item .icon-close {
  display: block;
  content: "";
  background: url("data:image/svg+xml,%3Csvg class='icon' viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cpath d='M512 64C264.58 64 64 264.58 64 512s200.58 448 448 448 448-200.58 448-448S759.42 64 512 64zm0 832c-212.08 0-384-171.92-384-384s171.92-384 384-384 384 171.92 384 384-171.92 384-384 384z' fill='%23909399'/%3E%3Cpath d='M625.14 353.61L512 466.75 398.86 353.61a32 32 0 0 0-45.25 45.25L466.75 512 353.61 625.14a32 32 0 0 0 45.25 45.25L512 557.25l113.14 113.14a32 32 0 0 0 45.25-45.25L557.25 512l113.14-113.14a32 32 0 0 0-45.25-45.25z' fill='%23909399'/%3E%3C/svg%3E")
    no-repeat center;
  background-size: contain;
  width: 14px;
  height: 14px;
  transform: scale(0.9);
  opacity: 0.6;
}

.hot-key-input-component .hot-item .icon-close:hover {
  cursor: pointer;
  opacity: 1;
}
</style>