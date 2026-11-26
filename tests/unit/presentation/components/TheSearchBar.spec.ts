import {
  afterEach, describe, expect, it,
} from 'vitest';
import { shallowMount } from '@vue/test-utils';
import TheSearchBar from '@/presentation/components/TheSearchBar.vue';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { UseAutoUnsubscribedEventsStub } from '@tests/unit/shared/Stubs/UseAutoUnsubscribedEventsStub';

describe('TheSearchBar.vue', () => {
  describe('keyboard shortcut', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('focuses the search field on `/`', () => {
      // arrange
      const wrapper = mountComponent();

      // act
      pressKey('/');

      // assert
      expect(document.activeElement).to.equal(wrapper.find('input').element);
      wrapper.unmount();
    });

    it('leaves focus in an open dialog', () => {
      // arrange
      const wrapper = mountComponent();
      const dialog = document.createElement('div');
      dialog.setAttribute('aria-modal', 'true');
      dialog.tabIndex = -1;
      document.body.appendChild(dialog);
      dialog.focus();

      // act
      pressKey('/');

      // assert
      expect(document.activeElement).to.equal(dialog);
      wrapper.unmount();
    });
  });
});

function pressKey(key: string): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function mountComponent() {
  const host = document.createElement('div');
  document.body.appendChild(host);
  return shallowMount(TheSearchBar, {
    attachTo: host,
    global: {
      provide: {
        [InjectionKeys.useCollectionState.key]: () => new UseCollectionStateStub().get(),
        [InjectionKeys.useAutoUnsubscribedEvents.key]:
          () => new UseAutoUnsubscribedEventsStub().get(),
      },
    },
  });
}
