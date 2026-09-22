import type { Message } from 'amqplib';

export type StringMessageProperty =
  'correlationId' | 'messageId' | 'type' | 'contentType';

export function getStringMessageProperty(
  properties: Message['properties'],
  property: StringMessageProperty,
): string | undefined {
  const value: unknown = properties[property];
  return typeof value === 'string' ? value : undefined;
}

export function getMessageHeaders(
  properties: Message['properties'],
): Record<string, unknown> {
  const headers: unknown = properties.headers;
  return typeof headers === 'object' && headers !== null
    ? (headers as Record<string, unknown>)
    : {};
}
