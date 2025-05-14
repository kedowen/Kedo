import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button, Typography, Empty } from "@douyinfe/semi-ui";
import { IconPlus } from "@douyinfe/semi-icons";

import { JsonSchema } from "../../typings";
import { useNodeRenderContext } from "../../hooks";
import { PropertyEdit } from "./property-edit";
import { PropertyContainer } from "./styles";

const { Text } = Typography;

export interface PropertiesEditProps {
  value?: Record<string, JsonSchema>;
  onChange: (value: Record<string, JsonSchema>) => void;
  useFx?: boolean;
  hideRequired?: boolean;
  nodeType?: "start" | "end" | string;
}

export const PropertiesEdit: React.FC<PropertiesEditProps> = (props) => {
  const { t } = useTranslation();
  const value = (props.value || {}) as Record<string, JsonSchema>;
  const { readonly } = useNodeRenderContext();
  const [newProperty, updateNewPropertyFromCache] = useState<{
    key: string;
    value: JsonSchema;
  }>({
    key: "",
    value: { type: "string" },
  });
  const [newPropertyVisible, setNewPropertyVisible] = useState<boolean>();
  const clearCache = () => {
    updateNewPropertyFromCache({ key: "", value: { type: "string" } });
    setNewPropertyVisible(false);
  };
  const updateProperty = (
    propertyValue: JsonSchema,
    propertyKey: string,
    newPropertyKey?: string
  ) => {
    const newValue = { ...value };
    if (newPropertyKey) {
      delete newValue[propertyKey];
      newValue[newPropertyKey] = propertyValue;
    } else {
      newValue[propertyKey] = propertyValue;
    }
    props.onChange(newValue);
  };
  const updateNewProperty = (
    propertyValue: JsonSchema,
    propertyKey: string,
    newPropertyKey?: string
  ) => {
    if (newPropertyKey) {
      if (!(newPropertyKey in value)) {
        updateProperty(propertyValue, propertyKey, newPropertyKey);
      }
      clearCache();
    } else {
      updateNewPropertyFromCache({
        key: newPropertyKey || propertyKey,
        value: propertyValue,
      });
    }
  };

  return (
    <div>
      <div style={{}}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* <Text style={{ fontWeight: 'bold', fontSize: '14px', marginRight: '8px' }}>参数名称</Text>
            <Text type="tertiary" size="small">参数将作为请求体发送到API</Text> */}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "13px",
          }}
        >
          <div style={{ flex: 1 }}>{t('formComponents.formOutputs.name')}</div>
          <div style={{ width: "100px", marginLeft: "8px" }}>{t('formComponents.formOutputs.type')}</div>
          <div
            style={{
              width: "110px",
              boxSizing: "content-box",
              textAlign: "center",
            }}
          >
            {!props.hideRequired && props.nodeType !== "end" && t('formComponents.formContent.required')}
          </div>
          <div style={{  }}>
            {!readonly && (
              <Button
                theme="light"
                type="primary"
                icon={<IconPlus />}
                onClick={() => setNewPropertyVisible(true)}
                size="small"
              />
            )}
          </div>
        </div>
      </div>

      {Object.keys(props.value || {}).length === 0 && !newPropertyVisible ? (
        <Empty
          title={t('formComponents.propertiesEdit.emptyText')}
          description={t('formComponents.propertiesEdit.addProperty')}
          style={{ padding: "24px 0" }}
        />
      ) : (
        <>
          {Object.keys(props.value || {}).map((key) => {
            const property = (value[key] || {}) as JsonSchema;
            return (
              <PropertyEdit
                key={key}
                propertyKey={key}
                useFx={props.useFx}
                value={property}
                disabled={readonly}
                hideRequired={props.hideRequired}
                nodeType={props.nodeType}
                onChange={updateProperty}
                onDelete={() => {
                  const newValue = { ...value };
                  delete newValue[key];
                  console.log(newValue, "newValue");
                  props.onChange(newValue);
                }}
              />
            );
          })}
          {newPropertyVisible && (
            <PropertyEdit
              propertyKey={newProperty.key}
              value={newProperty.value}
              useFx={props.useFx}
              hideRequired={props.hideRequired}
              nodeType={props.nodeType}
              onChange={updateNewProperty}
              onDelete={() => {
                const key = newProperty.key;
                // after onblur
                setTimeout(() => {
                  const newValue = { ...value };
                  delete newValue[key];
                  console.log(newValue, "newValue2");
                  props.onChange(newValue);
                  clearCache();
                }, 10);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
