
export function getRequiredElement<T extends HTMLElement>(
  parent: ParentNode,
  selector: string,
): T {
  const element = parent.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Required element not found: ${selector}`);
  }

  return element;
}
