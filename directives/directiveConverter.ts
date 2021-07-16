/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-unresolved
import { Node } from 'unist';
import { Transformer } from 'unified/types/ts3.4/index';
import h from 'hastscript';
import visit from 'unist-util-visit';

function childrenToText(node: Node): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((node as any).value) return (node as any).value as string ?? '';

  return (node?.children as Node[])?.map(childrenToText).join('\n') ?? '';
}

export function directiveConverter(): Transformer {
  return transform;

  function transform(tree: Node): void {
    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], onDirective);
  }

  function onDirective(node: Node) {
    const data = node.data || (node.data = {});
    const hast = h(node.name as string, node.attributes as string | Node | (string | Node)[]);

    if (node.type === 'containerDirective') {
      node.children = ((node.children as Node[]) || []).map(child => {
        if (child.data?.directiveLabel) {
          child.type = 'paragraph';
          child.data.hName = 'containerLabel';
        }
        
        return child;
      });
    }

    data.hName = hast.tagName;
    data.hProperties = {
      ...hast.properties,
      contents: childrenToText(node),
    };
  }
}
