export const basicTypes = [
  'boolean',
  'string',
  'file',
  'number',
  'array',
  'object',
] as const;
export type BasicType = typeof basicTypes[number];

export const expressionType = "expression" as const; // 表达式类型
export type ExpressionType = typeof expressionType;

export const FxTypesEnum = [...basicTypes, expressionType];
export type JsonSchemaType = BasicType | ExpressionType;
export interface JsonSchema {
  type?: JsonSchemaType | JsonSchemaType[];
  default?: any;
  title?: string;
  description?: string;
  enum?: (string | number)[];
  properties?: Record<string, JsonSchema>;
  additionalProperties?: JsonSchema;
  items?: JsonSchema;
  required?: string[];
  $ref?: string;
  extra?: {
    literal?: boolean; // is literal type
    formComponent?: string; // Set the render component
    required?: boolean; // 该字段是否必填
  };
}
