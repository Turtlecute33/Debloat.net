import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import CategoryRail from '@/presentation/components/Scripts/View/Selection/CategoryRail.vue';
import type { CategoryOutlineItem } from '@/presentation/components/Scripts/View/Selection/Model/CategoryOutline';

describe('CategoryRail.vue', () => {
  it('names each category with its selected count in words', () => {
    // arrange
    const items: CategoryOutlineItem[] = [
      { categoryId: 'cleanup', name: 'Privacy cleanup', scriptIds: ['a', 'b', 'c'] },
    ];
    const expectedLabel = 'Privacy cleanup, 2 of 3 selected';

    // act
    const wrapper = shallowMount(CategoryRail, {
      props: {
        items,
        selectedScriptIds: new Set(['a', 'c']),
      },
    });

    // assert
    expect(wrapper.find('button').attributes('aria-label')).to.equal(expectedLabel);
  });
});
