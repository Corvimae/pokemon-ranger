/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-unresolved
import { Node } from 'unist';
import { Transformer } from 'unified/types/ts3.4/index';
import h from 'hastscript';
import visit from 'unist-util-visit';

function childrenToText(node: Node): string {
  if (node.type === 'text') return node.value as string ?? '';

  return (node?.children as Node[]).map(childrenToText).join('\n') ?? '';
}

export function directiveConverter(): Transformer {
  return transform;

  function transform(tree: Node): void {
    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], onDirective);
  }

  function onDirective(node: Node) {
    const data = node.data || (node.data = {});
    const hast = h(node.name as string, node.attributes as string | Node | (string | Node)[]);

    data.hName = hast.tagName;
    data.hProperties = {
      ...hast.properties,
      contents: childrenToText(node),
    };
  }
}
