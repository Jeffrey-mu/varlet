import VarPicker from './Picker.vue'
import { nextTick, reactive, type App, type Component, type TeleportProps } from 'vue'
import { NormalColumn, CascadeColumn } from './props'
import { isArray } from '@varlet/shared'
import { call, mountInstance } from '../utils/components'

export type Texts = any[]

interface PickerOptions {
  columns: NormalColumn | CascadeColumn | Texts
  show?: boolean
  title?: string
  textKey?: string
  toolbar?: boolean
  cascade?: boolean
  cascadeInitialIndexes?: number[]
  optionHeight?: number | string
  optionCount?: number | string
  confirmButtonText?: string
  cancelButtonText?: string
  confirmButtonTextColor?: string
  cancelButtonTextColor?: string
  teleport?: TeleportProps['to']
  dynamic?: boolean
  textFormatter?: (text: any, columnIndex: number) => any
  onOpen?: () => void
  onOpened?: () => void
  onClose?: () => void
  onClosed?: () => void
  onChange?: (texts: Texts, indexes: number[]) => void
  onConfirm?: (texts: Texts, indexes: number[]) => void
  onCancel?: (texts: Texts, indexes: number[]) => void
}

type PickerResolvedState = 'confirm' | 'cancel' | 'close'

interface PickerResolvedData {
  state: PickerResolvedState
  texts?: Texts
  indexes?: number[]
}

let singletonOptions: PickerOptions | null

function Picker(options: PickerOptions | Texts): Promise<PickerResolvedData> {
  return new Promise((resolve) => {
    Picker.close()

    const pickerOptions: PickerOptions = isArray(options) ? { columns: options } : options
    const reactivePickerOptions: PickerOptions = reactive(pickerOptions)
    reactivePickerOptions.dynamic = true
    reactivePickerOptions.teleport = 'body'

    singletonOptions = reactivePickerOptions

    const { unmountInstance } = mountInstance(VarPicker, reactivePickerOptions, {
      onConfirm: (texts: Texts, indexes: number[]) => {
        call(reactivePickerOptions.onConfirm, texts, indexes)
        resolve({
          state: 'confirm',
          texts,
          indexes,
        })
        reactivePickerOptions.show = false
        singletonOptions === reactivePickerOptions && (singletonOptions = null)
      },
      onCancel: (texts: Texts, indexes: number[]) => {
        call(reactivePickerOptions.onCancel, texts, indexes)
        resolve({
          state: 'cancel',
          texts,
          indexes,
        })
        reactivePickerOptions.show = false
        singletonOptions === reactivePickerOptions && (singletonOptions = null)
      },
      onClose: () => {
        call(reactivePickerOptions.onClose)
        resolve({
          state: 'close',
        })
        singletonOptions === reactivePickerOptions && (singletonOptions = null)
      },
      onClosed: () => {
        call(reactivePickerOptions.onClosed)
        unmountInstance()
        singletonOptions === reactivePickerOptions && (singletonOptions = null)
      },
      onRouteChange: () => {
        unmountInstance()
        singletonOptions === reactivePickerOptions && (singletonOptions = null)
      },
      'onUpdate:show': (value: boolean) => {
        reactivePickerOptions.show = value
      },
    })

    reactivePickerOptions.show = true
  })
}

VarPicker.install = function (app: App) {
  app.component(VarPicker.name, VarPicker)
}

Picker.Component = VarPicker as Component

Picker.install = function (app: App) {
  app.component(VarPicker.name, VarPicker)
}

Picker.close = function () {
  if (singletonOptions != null) {
    const prevSingletonOptions = singletonOptions
    singletonOptions = null

    nextTick().then(() => {
      prevSingletonOptions.show = false
    })
  }
}

export { props as pickerProps } from './props'

export const _PickerComponent = VarPicker

export default Picker
