// JSON escaping alone does not protect an HTML script element's closing tag.
export function serializeJsonLd(value: object): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
