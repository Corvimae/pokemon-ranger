export function hasParentElement(child: Element | null, parent: Element): boolean {
  if (child === parent) return true;
  if (!child) return false;

  return hasParentElement(child.parentElement, parent);
}

export function splitOnLastElement<T>(list: T[]): [T[], T | undefined] {
  return [list.slice(0, list.length - 1), list[list.length - 1]];
}

export function capitalize(value: string): string {
  if (!value.length) return '';
  return value.charAt(0).toUpperCase() + value.substr(1);
}

export function range(from: number, to: number): number[] {
  return [...Array(to - from + 1).keys()].map(value => value + from);
}
