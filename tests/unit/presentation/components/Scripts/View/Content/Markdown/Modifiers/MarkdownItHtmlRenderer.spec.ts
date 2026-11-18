import { describe, it, expect } from 'vitest';
import { MarkdownItHtmlRenderer } from '@/presentation/components/Scripts/View/Content/Markdown/Renderers/MarkdownItHtmlRenderer';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { parseHtml } from '@tests/shared/HtmlParser';
import { renderMarkdownUsingRenderer } from './MarkdownRenderingTester';

describe('MarkdownItHtmlRenderer', () => {
  describe('modify', () => {
    describe('sets default anchor attributes', () => {
      const testScenarios: ReadonlyArray<{
        readonly attributeName: string;
        readonly expectedValue: string;
        readonly markdownWithNonCompliantAnchorAttributes: string;
      }> = [
        {
          attributeName: 'target',
          expectedValue: '_blank',
          markdownWithNonCompliantAnchorAttributes: '[URL](https://example.com){ target="_self" }',
        },
        {
          attributeName: 'rel',
          expectedValue: 'noopener noreferrer',
          markdownWithNonCompliantAnchorAttributes: '[URL](https://example.com){ rel="nooverride" }',
        },
      ];
      testScenarios.forEach(({
        attributeName, expectedValue, markdownWithNonCompliantAnchorAttributes,
      }) => {
        it(`adds "${attributeName}" attribute to anchors`, () => {
          // arrange
          const markdown = '[example.com](https://example.com)';

          // act
          const renderedOutput = renderMarkdownUsingRenderer(MarkdownItHtmlRenderer, markdown);

          // assert
          assertAnchorElementAttribute({
            renderedOutput,
            attributeName,
            expectedValue,
            markdownContent: markdown,
          });
        });

        it(`overrides existing "${attributeName}" attribute`, () => {
          // arrange & act
          const renderedOutput = renderMarkdownUsingRenderer(
            MarkdownItHtmlRenderer,
            markdownWithNonCompliantAnchorAttributes,
          );

          // assert
          assertAnchorElementAttribute({
            renderedOutput,
            attributeName,
            expectedValue,
            markdownContent: markdownWithNonCompliantAnchorAttributes,
          });
        });
      });
    });
    it('does not convert single line breaks to <br> elements', () => {
      // arrange
      const markdown = 'Text with\nSingle\nLinebreaks';
      // act
      const renderedOutput = renderMarkdownUsingRenderer(MarkdownItHtmlRenderer, markdown);
      // assert
      const html = parseHtml(renderedOutput);
      const totalBrElements = html.getElementsByTagName('br').length;
      expect(totalBrElements).to.equal(0);
    });
    describe('raw HTML', () => {
      it('keeps superscript tags', () => {
        // arrange
        const markdown = 'Text<sup>1</sup>';
        // act
        const renderedOutput = renderMarkdownUsingRenderer(MarkdownItHtmlRenderer, markdown);
        // assert
        const html = parseHtml(renderedOutput);
        expect(html.getElementsByTagName('sup')).to.have.lengthOf(1);
      });
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly markdown: string;
        readonly forbiddenTagName: string;
      }> = [
        {
          description: 'inline tag with an event handler',
          markdown: 'Name <img src=x onerror="alert(1)">',
          forbiddenTagName: 'img',
        },
        {
          description: 'block of HTML',
          markdown: '<script>alert(1)</script>',
          forbiddenTagName: 'script',
        },
        {
          description: 'tag inside a link label',
          markdown: '[<svg onload="alert(1)">](https://example.com)',
          forbiddenTagName: 'svg',
        },
      ];
      testScenarios.forEach(({ description, markdown, forbiddenTagName }) => {
        it(`shows ${description} as text`, () => {
          // act
          const renderedOutput = renderMarkdownUsingRenderer(MarkdownItHtmlRenderer, markdown);
          // assert
          const html = parseHtml(renderedOutput);
          const forbiddenElements = html.getElementsByTagName(forbiddenTagName);
          expect(forbiddenElements).to.have.lengthOf(0, formatAssertionMessage([
            `Markdown input to render: ${markdown}`,
            `Actual render output: ${renderedOutput}`,
          ]));
          expect(html.body.textContent).to.include(`<${forbiddenTagName}`);
        });
      });
    });
  });
});

function assertAnchorElementAttribute(context: {
  readonly renderedOutput: string;
  readonly attributeName: string;
  readonly expectedValue: string;
  readonly markdownContent: string;
}) {
  const html = parseHtml(context.renderedOutput);
  const aElement = html.getElementsByTagName('a')[0];
  expectExists(aElement, formatAssertionMessage([
    'Missing expected `<a>` element',
    `Markdown input to render: ${context.markdownContent}`,
    `Actual render output: ${context.renderedOutput}`,
  ]));
  const actualValue = aElement.getAttribute(context.attributeName);
  expect(context.expectedValue).to.equal(actualValue, formatAssertionMessage([
    `Expected attribute value: ${context.expectedValue}`,
    `Actual attribute value: ${actualValue}`,
    `Attribute name: ${context.attributeName}`,
    `Markdown input to render: ${context.markdownContent}`,
    `Actual render output:\n${context.renderedOutput}`,
    `Actual \`<a>\` element HTML: ${aElement.outerHTML}`,
  ]));
}
