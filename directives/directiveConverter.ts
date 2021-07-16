/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-unresolved
import { Node as UNode } from 'unist';
import { Transformer } from 'unified/types/ts3.4/index';
import h from 'hastscript';
import visit from 'unist-util-visit';

function childrenToText(node: UNode): string {
  if (node.value) return node.value as string ?? '';

  return (node?.children as UNode[])?.map(childrenToText).join('\n') ?? '';
}

export function directiveConverter(): Transformer {
  return transform;

  function transform(tree: UNode): void {
    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], onDirective);
  }

  function onDirective(node: UNode) {
    const data = node.data || (node.data = {});
    const hast = h(node.name as string, node.attributes as string | UNode | (string | UNode)[]);

    if (node.type === 'containerDirective') {
      node.children = ((node.children as UNode[]) || []).map(child => {
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
