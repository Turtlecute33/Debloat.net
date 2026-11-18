import {
  describe, it, expect, afterEach,
} from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ModalContainer from '@/presentation/components/Shared/Modal/ModalContainer.vue';

describe('ModalContainer', () => {
  it('closes on pressing ESC key', async () => {
    // arrange
    const wrapper = mountComponent({ modelValue: true });

    // act
    const escapeEvent = new KeyboardEvent('keyup', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    // assert
    expect(wrapper.emitted('update:modelValue')).to.deep.equal([[false]]);
  });

  describe('focus', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('moves focus from the opener into the dialog on open', async () => {
      // arrange
      const opener = createFocusedOpener();
      const wrapper = mountComponent({ modelValue: false, isAttached: true });

      // act
      await wrapper.setProps({ modelValue: true });
      await flushPromises();

      // assert
      expect(document.activeElement).to.not.equal(opener);
      expect(document.activeElement).to.equal(wrapper.find('[role="dialog"]').element);
    });

    it('returns focus to the opener on close', async () => {
      // arrange
      const opener = createFocusedOpener();
      const wrapper = mountComponent({ modelValue: false, isAttached: true });
      await wrapper.setProps({ modelValue: true });
      await flushPromises();

      // act
      await wrapper.setProps({ modelValue: false });
      await flushPromises();

      // assert
      expect(document.activeElement).to.equal(opener);
    });

    function createFocusedOpener(): HTMLElement {
      const opener = document.createElement('button');
      document.body.appendChild(opener);
      opener.focus();
      return opener;
    }
  });
});

function mountComponent(options: {
  readonly modelValue: boolean,
  readonly isAttached?: boolean,
}) {
  return mount(ModalContainer, {
    props: {
      modelValue: options.modelValue,
    },
    attachTo: options.isAttached ? document.body : undefined, // Focus needs the document
  });
}
