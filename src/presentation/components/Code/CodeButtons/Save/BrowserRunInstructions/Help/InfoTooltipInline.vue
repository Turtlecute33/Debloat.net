<template>
  <span
    class="info-container"
  >
    <TooltipWrapper>
      <span
        role="img"
        tabindex="0"
        aria-label="More information"
        :aria-describedby="tooltipId"
      >
        <AppIcon
          icon="circle-info"
          aria-hidden="true"
        />
      </span>
      <template #tooltip>
        <div
          :id="tooltipId"
          role="tooltip"
        >
          <slot />
        </div>
      </template>
    </TooltipWrapper>
  </span>
</template>

<script lang="ts">
import { defineComponent, useId } from 'vue';
import TooltipWrapper from '@/presentation/components/Shared/Tooltip/TooltipWrapper.vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';

export default defineComponent({
  components: {
    TooltipWrapper,
    AppIcon,
  },
  props: {
    hasLeftMargin: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      tooltipId: useId(),
    };
  },
});
</script>

<style lang="scss">
/* Quiet until pointed at, like the documentation buttons in the script list. */
.info-container {
  vertical-align: text-top;
  color: var(--text-tertiary);
  transition: color 120ms ease;

  &:hover,
  &:focus-within {
    color: var(--accent-text);
  }
}
</style>
