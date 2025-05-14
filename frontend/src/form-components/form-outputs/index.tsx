import { Field } from "@flowgram.ai/free-layout-editor";
import { useTranslation } from 'react-i18next';
import { TypeTag } from "../type-tag";
import { JsonSchema } from "../../typings";
import { useIsSidebar } from "../../hooks";
import { FormOutputsContainer } from "./styles";
import { Space, Typography } from "@douyinfe/semi-ui";
import { isArray, isObject } from "lodash-es";

/**
 * 对outputs进行字段渲染
 * @returns 输出字段
 */
export function FormOutputs() {
  const { t } = useTranslation();
  const isSidebar = useIsSidebar();
  if (isSidebar) {
    return null;
  }
  return (
    <FormOutputsContainer>
      <Typography.Text
        strong
        type="secondary"
        size="small"
        style={{ minWidth: "40px", flexShrink: 0 }}
      >
        {t('formComponents.formOutputs.title')}
      </Typography.Text>
      <Space style={{ flexGrow: 1, overflow: "hidden" }}>
        <Field<JsonSchema> name="outputs">
          {({ field }) => {
            const properties = field.value?.properties;
            let content;
            if (
              properties &&
              isObject(properties) &&
              Object.keys(properties).length > 0
            ) {
              content = Object.keys(properties).map((key) => {
                const property = properties[key];
                return (
                  <TypeTag
                    key={key}
                    name={key}
                    type={(property.type as string) || "string"}
                  />
                );
              });
            }
            if (content) {
              return <>{content}</>;
            } else {
              return (
                <Typography.Text type="secondary" size="small">
                  {t('formComponents.propertiesEdit.emptyText')}
                </Typography.Text>
              );
            }
          }}
        </Field>
      </Space>
    </FormOutputsContainer>
  );
}

interface FormOutputsProps {
  name: string;
  label: string;
}

/**
 * 对array类型的参数进行输出渲染
 * @param props name、label
 * @returns
 */
export function FormArrayOutputs(props: FormOutputsProps) {
  const { t } = useTranslation();
  const { name, label } = props;
  const isSidebar = useIsSidebar();
  if (isSidebar) {
    return null;
  }
  return (
    <FormOutputsContainer>
      <Typography.Text
        strong
        type="secondary"
        size="small"
        style={{ minWidth: "40px", flexShrink: 0 }}
      >
        {label}
      </Typography.Text>
      <Space style={{ flexGrow: 1, overflow: "hidden" }}>
        <Field<JsonSchema> name={name}>
          {({ field }) => {
            const properties = field.value;
            let content;
            if (properties && isArray(properties) && properties.length > 0) {
              content = properties.map((item, index) => {
                return (
                  <TypeTag
                    key={index}
                    name={item.title}
                    type={item.type as string}
                  />
                );
              });
            }
            if (content) {
              return <>{content}</>;
            } else {
              return (
                <Typography.Text type="secondary" size="small">
                  {t('formComponents.propertiesEdit.emptyText')}
                </Typography.Text>
              );
            }
          }}
        </Field>
      </Space>
    </FormOutputsContainer>
  );
}
