import React from "react";
import { useTranslation } from 'react-i18next';
import { Input, InputNumber, Switch } from "@douyinfe/semi-ui";
import { BasicType, JsonSchema } from "@/typings/json-schema";
import { FileUpload } from "@/form-components";
import { JsonEditor } from "@/form-components";

interface TypeDefaultProps {
  type: BasicType;
  value: JsonSchema;
  disabled?: boolean;
  onChange?: (value: JsonSchema) => void;
  style?:  React.CSSProperties;
}

export const TypeDefault: React.FC<TypeDefaultProps> = (props) => {
  const { t } = useTranslation();
  const { type, value, disabled = false, onChange } = props;

  const updateProperty = (key: string, newValue: any) => {
    if (onChange) {
      const updatedValue = {
        ...value,
        [key]: newValue,
      };
      onChange(updatedValue);
    }
  };

  switch (type) {
    case "object":
    case "array":
      return (
        <JsonEditor
          value={value.default}
          onChange={(newValue) => updateProperty("default", newValue)}
        />
      );
    case "number":
      return (
        <InputNumber
          // type=="number"
          step={1}
          disabled={disabled}
          value={value.default === undefined ? 0 : value.default}
          placeholder={t('formComponents.propertiesEdit.pleaseInput')}
          onChange={(val) => updateProperty("default", val)}
          style={{ width: "100%" }}
        />
      );
    case "boolean":
      return (
        <Switch
          checked={!!value.default}
          onChange={(checked) => updateProperty("default", checked)}
          disabled={disabled}
          style={{ marginTop: "8px" }}
        />
      );
    case "file":
      return (
        <FileUpload
          defaultFileUrl={value.default}
          disabled={disabled}
          onUploadComplete={(fileUrl) => updateProperty("default", fileUrl)}
        />
      );
    case "string":
    default:
      return (
        <Input
          disabled={disabled}
          value={value.default}
          placeholder={t('formComponents.propertiesEdit.pleaseInput')}
          onChange={(val) => updateProperty("default", val)}
          style={{ width: "100%" }}
        />
      );
  }
};
