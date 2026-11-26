import {
  describe, it, expect, afterEach,
} from 'vitest';
import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';
import ModalContent from '@/presentation/components/Shared/Modal/ModalContent.vue';

const DOM_MODAL_CONTENT_SELECTOR = '.modal-content-content';
const DOM_MODAL_CONTENT_WRAPPER_SELECTOR = '.modal-content-wrapper';

describe('ModalContent.vue', () => {
  describe('rendering based on `show` prop', () => {
    it('renders modal content when `show` prop is true', () => {
      // arrange
      const wrapper = mountComponent({ showProperty: true });

      // act
      const modalContentWrapper = wrapper.find(DOM_MODAL_CONTENT_WRAPPER_SELECTOR);

      // assert
      expect(modalContentWrapper.exists()).to.equal(true);
    });

    it('does not render modal content when `show` prop is false', () => {
      // arrange
      const wrapper = mountComponent({ showProperty: false });

      // act
      const modalContentWrapper = wrapper.find(DOM_MODAL_CONTENT_WRAPPER_SELECTOR);

      // assert
      expect(modalContentWrapper.exists()).to.equal(false);
    });

    it('does not render modal content by default', () => {
      // arrange & act
      const wrapper = mountComponent();

      // assert
      const modalContentWrapper = wrapper.find(DOM_MODAL_CONTENT_WRAPPER_SELECTOR);
      expect(modalContentWrapper.exists()).to.equal(false);
    });
  });

  it('renders slot content when provided', () => {
    // arrange
    const expectedText = 'Slot content';
    const slotContentClass = 'slot-content';

    // act
    const wrapper = mountComponent({
      showProperty: true,
      slotHtml: `<div class="${slotContentClass}">${expectedText}</div>`,
    });

    // assert
    const slotWrapper = wrapper.find(`.${slotContentClass}`);
    const slotText = slotWrapper.text();
    expect(slotText).to.equal(expectedText);
  });

  describe('aria attributes', () => {
    it('does not set aria-expanded, which ARIA does not allow on a dialog', () => {
      // arrange & act
      const wrapper = mountComponent({ showProperty: true });

      // assert
      const modalContent = wrapper.find(DOM_MODAL_CONTENT_SELECTOR);
      expect(modalContent.attributes('aria-expanded')).to.equal(undefined);
    });

    it('always sets aria-modal to true for the modal content', () => {
      // arrange & act
      const wrapper = mountComponent({ showProperty: true });

      // assert
      const modalContent = wrapper.find(DOM_MODAL_CONTENT_SELECTOR);
      expect(modalContent.attributes('aria-modal')).to.equal('true');
    });

    it('sets role to dialog', () => {
      // arrange & act
      const wrapper = mountComponent({ showProperty: true });

      // assert
      const modalContent = wrapper.find(DOM_MODAL_CONTENT_SELECTOR);
      expect(modalContent.attributes('role')).to.equal('dialog');
    });

    it('sets aria-label from `ariaLabel` prop', () => {
      // arrange
      const expectedLabel = 'How to run the script';

      // act
      const wrapper = mountComponent({ showProperty: true, ariaLabel: expectedLabel });

      // assert
      const modalContent = wrapper.find(DOM_MODAL_CONTENT_SELECTOR);
      expect(modalContent.attributes('aria-label')).to.equal(expectedLabel);
    });
  });

  describe('focus', () => {
    const slotWithButtonsHtml = [
      '<button class="first">First</button>',
      '<button class="middle">Middle</button>',
      '<button class="last">Last</button>',
    ].join('');

    afterEach(() => {
      document.body.innerHTML = '';
    });

    async function mountShownWithButtons() {
      const wrapper = mountComponent({
        showProperty: true, slotHtml: slotWithButtonsHtml, isAttached: true,
      });
      await nextTick(); // Lets the dialog take the focus that it takes when it opens
      return wrapper;
    }

    it('focuses the dialog when shown', async () => {
      // arrange
      const wrapper = mountComponent({ showProperty: false, isAttached: true });

      // act
      await wrapper.setProps({ show: true });
      await nextTick();

      // assert
      const modalContent = wrapper.find(DOM_MODAL_CONTENT_SELECTOR);
      expect(document.activeElement).to.equal(modalContent.element);
    });

    it('moves focus from the last to the first focusable element on Tab', async () => {
      // arrange
      const wrapper = await mountShownWithButtons();
      const last = wrapper.find('.last');
      (last.element as HTMLElement).focus();

      // act
      await last.trigger('keydown', { key: 'Tab' });

      // assert
      expect(document.activeElement).to.equal(wrapper.find('.first').element);
    });

    it('moves focus from the first to the last focusable element on Shift+Tab', async () => {
      // arrange
      const wrapper = await mountShownWithButtons();
      const first = wrapper.find('.first');
      (first.element as HTMLElement).focus();

      // act
      await first.trigger('keydown', { key: 'Tab', shiftKey: true });

      // assert
      expect(document.activeElement).to.equal(wrapper.find('.last').element);
    });

    it('moves focus from the dialog to the last focusable element on Shift+Tab', async () => {
      // arrange
      const wrapper = await mountShownWithButtons();
      const modalContent = wrapper.find(DOM_MODAL_CONTENT_SELECTOR);
      (modalContent.element as HTMLElement).focus();

      // act
      await modalContent.trigger('keydown', { key: 'Tab', shiftKey: true });

      // assert
      expect(document.activeElement).to.equal(wrapper.find('.last').element);
    });

    it('lets Tab move focus between inner elements', async () => {
      // arrange
      const wrapper = await mountShownWithButtons();
      const middle = wrapper.find('.middle');
      (middle.element as HTMLElement).focus();
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });

      // act
      middle.element.dispatchEvent(tabEvent);

      // assert
      expect(tabEvent.defaultPrevented).to.equal(false);
    });

    it('keeps focus in the dialog on Tab when it has no focusable elements', async () => {
      // arrange
      const wrapper = mountComponent({ showProperty: true, isAttached: true });
      const modalContent = wrapper.find(DOM_MODAL_CONTENT_SELECTOR);
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });

      // act
      modalContent.element.dispatchEvent(tabEvent);

      // assert
      expect(tabEvent.defaultPrevented).to.equal(true);
    });
  });

  it('emits `transitionedOut` event after the transition leave', async () => {
    // arrange
    const wrapper = mountComponent({ showProperty: true });

    // act
    await wrapper.vm.$nextTick(); // Ensure the component reflects initial prop
    wrapper.setProps({ show: false }); // Trigger the transition
    await wrapper.vm.$nextTick(); // Allow the component to update
    const transitionWrapper = wrapper.findComponent({ name: 'transition' });
    transitionWrapper.vm.$emit('after-leave'); // Simulate the after-leave lifecycle hook of the transition

    // assert
    expect(wrapper.emitted().transitionedOut).to.have.length(1);
  });
});

function mountComponent(options?: {
  readonly showProperty?: boolean,
  readonly ariaLabel?: string,
  readonly slotHtml?: string,
  readonly isAttached?: boolean,
}) {
  return shallowMount(ModalContent, {
    props: {
      ...(options?.showProperty !== undefined ? { show: options?.showProperty } : {}),
      ...(options?.ariaLabel !== undefined ? { ariaLabel: options?.ariaLabel } : {}),
    },
    slots: options?.slotHtml !== undefined ? { default: options?.slotHtml } : undefined,
    attachTo: options?.isAttached ? document.body : undefined, // Focus needs the document
  });
}
