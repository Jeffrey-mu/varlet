<template>
  <div
    :class="classes(n(), n('$--box'), n(`--${variant}`), [size === 'small', n('--small')], [disabled, n('--disabled')])"
    @click="handleClick"
  >
    <div
      :class="
        classes(
          n('controller'),
          [isFocus, n('--focus')],
          [errorMessage, n('--error')],
          [formDisabled || disabled, n('--disabled')]
        )
      "
      :style="{
        color,
        cursor,
      }"
    >
      <div :class="classes(n('icon'), [!hint, n('--icon-non-hint')])" ref="prependIconEl">
        <slot name="prepend-icon" />
      </div>

      <div :class="classes(n('middle'), [!hint, n('--middle-non-hint')])">
        <slot />

        <label
          v-if="hint || alwaysCustomPlaceholder"
          :class="
            classes(
              n('placeholder'),
              n('$--ellipsis'),
              [isFocus, n('--focus')],
              [formDisabled || disabled, n('--disabled')],
              [errorMessage, n('--error')],
              [!hint, n('--placeholder-non-hint')],
              computePlaceholderState()
            )
          "
          :style="{
            transform: placeholderTransform,
            color,
          }"
          :for="id"
        >
          <span :class="n('placeholder-text')" ref="placeholderTextEl">{{ placeholder }}</span>
        </label>
      </div>

      <div :class="classes(n('icon'), [!hint, n('--icon-non-hint')])">
        <var-icon
          :class="n('clear-icon')"
          var-field-decorator-cover
          name="close-circle"
          v-if="clearable && !isEmpty(value)"
          @click="handleClear"
        />
        <slot name="append-icon" />
      </div>
    </div>

    <template v-if="line">
      <template v-if="variant === 'outlined'">
        <fieldset
          :class="
            classes(
              n('line'),
              [isFocus, n('--line-focus')],
              [errorMessage, n('--line-error')],
              [formDisabled || disabled, n('--line-disabled')]
            )
          "
        >
          <legend
            :class="classes(n('line-legend'), [hint && (!isEmpty(value) || isFocus), n('line-legend--hint')])"
            :style="{ width: legendWidth }"
          ></legend>
        </fieldset>
      </template>

      <div
        :class="classes(n('line'), [formDisabled || disabled, n('--line-disabled')], [errorMessage, n('--line-error')])"
        :style="{ background: !errorMessage ? blurColor : undefined }"
        v-else
      >
        <div
          :class="
            classes(
              n('dot'),
              [isFocus, n('--line-focus')],
              [formDisabled || disabled, n('--line-disabled')],
              [errorMessage, n('--line-error')]
            )
          "
          :style="{ background: !errorMessage ? focusColor : undefined }"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import VarIcon from '../icon'
import { defineComponent, ref, watchEffect, nextTick, type Ref, computed, type ComputedRef } from 'vue'
import { props } from './props'
import { isEmpty } from '@varlet/shared'
import { createNamespace, call } from '../utils/components'
import { useEventListener } from '@varlet/use'

const { n, classes } = createNamespace('field-decorator')

export default defineComponent({
  name: 'VarFieldDecorator',
  components: {
    VarIcon,
  },
  props,
  setup(props) {
    const prependIconEl: Ref<HTMLElement | null> = ref(null)
    const placeholderTextEl: Ref<HTMLElement | null> = ref(null)
    const legendWidth: Ref<string> = ref('')
    const placeholderTransform: Ref<string> = ref('')
    const color: ComputedRef<string | undefined> = computed(() =>
      !props.errorMessage ? (props.isFocus ? props.focusColor : props.blurColor) : undefined
    )

    const computePlaceholderState = () => {
      const { hint, value, isFocus, composing } = props

      if (!hint && (!isEmpty(value) || composing)) {
        return n('--placeholder-hidden')
      }

      if (hint && (!isEmpty(value) || isFocus)) {
        return n('--placeholder-hint')
      }
    }

    const computedLegendWidth = () => {
      const { size, placeholder } = props

      nextTick().then(() => {
        if (!placeholderTextEl.value || !placeholder) {
          legendWidth.value = '0'
          return
        }

        const placeholderTextWidth = window.getComputedStyle(placeholderTextEl.value)?.width
        const placeholderSpace = `var(--field-decorator-outlined-${size}-placeholder-space)`
        legendWidth.value = `calc(${placeholderTextWidth} * 0.75 + 2 * ${placeholderSpace})`
      })
    }

    const computedPlaceholderTransform = () => {
      const { hint, value, isFocus, variant } = props

      nextTick().then(() => {
        if (!prependIconEl.value) {
          return
        }

        if (hint && (!isEmpty(value) || isFocus)) {
          const prependIconWidth = window.getComputedStyle(prependIconEl.value)?.width || '0'
          const translateY = variant === 'outlined' ? '-50%' : '0'
          placeholderTransform.value = `translate(-${prependIconWidth}, ${translateY}) scale(0.75)`
        } else {
          placeholderTransform.value = ''
        }
      })
    }

    const resize = () => {
      computedLegendWidth()
      computedPlaceholderTransform()
    }

    const handleClear = (e: Event) => {
      call(props.onClear, e)
    }

    const handleClick = (e: Event) => {
      call(props.onClick, e)
    }

    watchEffect(resize)
    useEventListener(() => window, 'resize', resize)

    return {
      prependIconEl,
      placeholderTextEl,
      placeholderTransform,
      color,
      legendWidth,
      computePlaceholderState,
      n,
      classes,
      isEmpty,
      handleClear,
      handleClick,
    }
  },
})
</script>

<style lang="less">
@import '../styles/common';
@import '../icon/icon';
@import './fieldDecorator';
</style>
