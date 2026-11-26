<template>
  <transition
    name="modal-content-transition"
    @after-leave="onAfterTransitionLeave"
  >
    <div
      v-if="show"
      class="modal-content-wrapper"
    >
      <div
        ref="modalElement"
        class="modal-content-content"
        role="dialog"
        aria-modal="true"
        :aria-label="ariaLabel"
        tabindex="-1"
        @keydown="keepTabFocusInside"
      >
        <!--
          Scrolls inside the sheet rather than the sheet itself scrolling: the sheet's glass is
          drawn by pseudo-elements stretched over its box, and in a scrolling box they would
          scroll away with the content and leave the lower part of the sheet unpainted.
        -->
        <div class="modal-content-scroller">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, shallowRef, watch } from 'vue';

const FOCUSABLE_ELEMENTS_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    ariaLabel: {
      type: String,
      default: undefined,
    },
  },
  emits: [
    'transitionedOut',
  ],
  setup(_, { emit }) {
    const modalElement = shallowRef<HTMLElement | undefined>();

    /*
      Moves focus into the dialog when it opens, so keyboard and screen reader users start in it.
      It focuses the dialog itself, not its first control: in the run instructions that control
      is a tooltip trigger, and focus would open its tooltip. `ModalContainer` gives the focus
      back to the opener when the dialog closes.
    */
    watch(modalElement, (element) => element?.focus({ preventScroll: true }), { flush: 'post' });

    function keepTabFocusInside(event: KeyboardEvent) {
      const dialog = modalElement.value;
      if (event.key !== 'Tab' || !dialog) {
        return;
      }
      const focusableElements = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR);
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const focused = document.activeElement;
      if (event.shiftKey && (focused === first || focused === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && focused === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function onAfterTransitionLeave() {
      emit('transitionedOut');
    }

    return {
      onAfterTransitionLeave,
      keepTabFocusInside,
      modalElement,
    };
  },
});

</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

$modal-content-transition-duration: 320ms;
$modal-content-offset-upward: $spacing-absolute-large;

@mixin scrollable() {
  overflow-y: auto;
  max-height: 100%;
}

.modal-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  pointer-events: none;

  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  // Margin around modal content ensures visual comfort and consistency across devices.
  // It provides:
  // - A visually comfortable space preventing a claustrophobic feeling, especially on smaller screens.
  // - Consistent appearance on various screen sizes by using absolute spacing.
  // - Focus on the modal by dimming the background and emphasizing the task.
  // - Sufficient space on small devices for users to tap outside and close the modal.
  margin: $spacing-absolute-xx-large;
  @media screen and (max-width: $media-screen-small-width) {
    margin: $spacing-absolute-x-large; // Google and Apple recommend at least 44x44px for touch targets
  }
}

/*
  A sheet of thick glass. The tint is nearly opaque on purpose: the sheet fades in through an
  ancestor's opacity, which suspends its backdrop blur until the fade ends, and a dense tint keeps
  that moment from reading as a flash of clear glass.
*/
.modal-content-content {
  @include glass-surface($radius: 26px, $tint: var(--glass-tint-strong), $frosted: true);
  overflow: hidden;
  box-sizing: border-box;

  pointer-events: auto;

  width: auto;
  height: auto;

  max-width: 640px;
  max-height: 100%;
  display: flex;
  flex-direction: column;

  color: var(--text);

  &:focus-visible {
    outline: none; // Takes focus only as the start point when it opens, it is not a control.
  }
}

.modal-content-scroller {
  min-height: 0;

  @include scrollable;
  @include glass-scrollbar;
}

@include fade-slide-transition('modal-content-transition', $modal-content-transition-duration, $modal-content-offset-upward);
</style>
