import { describe, it, expect } from 'vitest';
import { removeMarkdownFormatting } from '@/presentation/components/Scripts/View/Content/Markdown/RemoveMarkdownFormatting';

describe('removeMarkdownFormatting', () => {
  const testScenarios: ReadonlyArray<{
    readonly description: string;
    readonly markdown: string;
    readonly expectedText: string;
  }> = [
    {
      description: 'removes bold markers',
      markdown: 'Clear **"All"** permissions',
      expectedText: 'Clear "All" permissions',
    },
    {
      description: 'removes inline code markers',
      markdown: 'Clear system logs (`journald`)',
      expectedText: 'Clear system logs (journald)',
    },
    {
      description: 'keeps only the text of links',
      markdown: 'Disable [telemetry](https://privacy.sexy) reports',
      expectedText: 'Disable telemetry reports',
    },
    {
      description: 'removes every marker in a name',
      markdown: 'Disable shortcut (**Windows logo key** + **C**)',
      expectedText: 'Disable shortcut (Windows logo key + C)',
    },
    {
      description: 'keeps underscores inside words',
      markdown: 'Disable "USO_UxBroker" task',
      expectedText: 'Disable "USO_UxBroker" task',
    },
    {
      description: 'keeps text without markdown',
      markdown: 'Clear browser history',
      expectedText: 'Clear browser history',
    },
  ];
  testScenarios.forEach(({ description, markdown, expectedText }) => {
    it(description, () => {
      // act
      const actualText = removeMarkdownFormatting(markdown);

      // assert
      expect(actualText).to.equal(expectedText);
    });
  });
});
