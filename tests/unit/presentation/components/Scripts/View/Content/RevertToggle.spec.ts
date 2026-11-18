import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { shallowRef } from 'vue';
import RevertToggle from '@/presentation/components/Scripts/View/Content/RevertToggle.vue';
import ToggleSwitch from '@/presentation/components/Scripts/View/Content/ToggleSwitch.vue';
import { type NodeMetadata, NodeType } from '@/presentation/components/Scripts/View/Content/NodeMetadata';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { UseCollectionStateStub } from '@tests/unit/shared/Stubs/UseCollectionStateStub';
import { UserSelectionStub } from '@tests/unit/shared/Stubs/UserSelectionStub';

describe('RevertToggle.vue', () => {
  it('names the switch after the script in plain text', () => {
    // arrange
    const scriptName = 'Clear **"All"** `journald` [logs](https://privacy.sexy)';
    const expectedSubjectName = 'Clear "All" journald logs';

    // act
    const wrapper = mountComponent({ nodeText: scriptName });

    // assert
    const toggleSwitch = wrapper.findComponent(ToggleSwitch);
    expect(toggleSwitch.props('subjectName')).to.equal(expectedSubjectName);
  });
});

function mountComponent(options: {
  readonly nodeText: string,
}) {
  const node: NodeMetadata = {
    executableId: 'script-id',
    text: options.nodeText,
    isReversible: true,
    docs: [],
    children: [],
    type: NodeType.Script,
  };
  return shallowMount(RevertToggle, {
    props: {
      node,
    },
    global: {
      provide: {
        [InjectionKeys.useUserSelectionState.key]: () => ({
          currentSelection: shallowRef(new UserSelectionStub()),
          modifyCurrentSelection: () => { /* NOP */ },
        }),
        [InjectionKeys.useCollectionState.key]: () => new UseCollectionStateStub().get(),
      },
    },
  });
}
