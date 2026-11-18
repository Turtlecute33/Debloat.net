import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import InfoTooltipInline from '@/presentation/components/Code/CodeButtons/Save/BrowserRunInstructions/Help/InfoTooltipInline.vue';

const DOM_SELECTOR_TRIGGER = '[role="img"]';
const DOM_SELECTOR_TOOLTIP = '[role="tooltip"]';

describe('InfoTooltipInline.vue', () => {
  it('renders a keyboard-focusable information trigger', () => {
    // act
    const wrapper = mountComponent();

    // assert
    const trigger = wrapper.find(DOM_SELECTOR_TRIGGER);
    expect(trigger.attributes('tabindex')).to.equal('0');
  });

  it('gives the trigger an accessible name', () => {
    // act
    const wrapper = mountComponent();

    // assert
    const trigger = wrapper.find(DOM_SELECTOR_TRIGGER);
    expect(trigger.attributes('aria-label')).to.equal('More information');
  });

  it('associates the trigger with the tooltip for assistive technologies', () => {
    // act
    const wrapper = mountComponent();

    // assert
    const trigger = wrapper.find(DOM_SELECTOR_TRIGGER);
    const tooltip = wrapper.find(DOM_SELECTOR_TOOLTIP);
    expect(tooltip.attributes('id')).to.have.length.greaterThan(0);
    expect(trigger.attributes('aria-describedby')).to.equal(tooltip.attributes('id'));
  });

  it('renders the slot content in the tooltip', () => {
    // arrange
    const expectedText = 'Extra detail about the step.';

    // act
    const wrapper = mountComponent({ slotContent: expectedText });

    // assert
    const tooltip = wrapper.find(DOM_SELECTOR_TOOLTIP);
    expect(tooltip.text()).to.equal(expectedText);
  });
});

function mountComponent(options?: {
  readonly slotContent?: string,
}) {
  return shallowMount(InfoTooltipInline, {
    slots: {
      default: options?.slotContent ?? 'Stubbed slot content',
    },
    global: {
      stubs: {
        TooltipWrapper: {
          template: `
            <div>
              <slot />
              <slot name="tooltip" />
            </div>
          `,
        },
      },
    },
  });
}
