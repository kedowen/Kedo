import { useCallback, useState, type MouseEvent, useContext } from "react";
import { useTranslation } from 'react-i18next';

import {
  Field,
  FieldRenderProps,
  useClientContext,
  useService,
} from "@flowgram.ai/free-layout-editor";
import { NodeIntoContainerService } from "@flowgram.ai/free-container-plugin";
import {
  IconButton,
  Dropdown,
  Typography,
  Button,
  Input,
} from "@douyinfe/semi-ui";
import {
  IconMore,
  IconSmallTriangleDown,
  IconSmallTriangleLeft,
  IconClose
} from "@douyinfe/semi-icons";

import { Feedback } from "../feedback";
import { FlowNodeRegistry } from "../../typings";
import { FlowCommandId } from "../../shortcuts";
import { useIsSidebar, useNodeRenderContext } from "../../hooks";
import { getIcon } from "./utils";
import { Header, Operators, Title } from "./styles";
import { SidebarContext } from "@/context";

const { Text } = Typography;

function DropdownContent({
  handleRename,
}: {
  handleRename: (e: React.MouseEvent) => void;
}) {
  const { t } = useTranslation();
  const [key, setKey] = useState(0);
  const { node, deleteNode } = useNodeRenderContext();
  const clientContext = useClientContext();
  const registry = node.getNodeRegistry<FlowNodeRegistry>();
  const nodeIntoContainerService = useService<NodeIntoContainerService>(
    NodeIntoContainerService
  );
  const canMoveOut = nodeIntoContainerService.canMoveOutContainer(node);

  const rerenderMenu = useCallback(() => {
    setKey((prevKey) => prevKey + 1);
  }, []);

  const handleMoveOut = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      nodeIntoContainerService.moveOutContainer({ node });
      nodeIntoContainerService.removeNodeLines(node);
      requestAnimationFrame(rerenderMenu);
    },
    [nodeIntoContainerService, node, rerenderMenu]
  );

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      clientContext.playground.commandService.executeCommand(
        FlowCommandId.COPY,
        node
      );
      e.stopPropagation(); // Disable clicking prevents the sidebar from opening
    },
    [clientContext, node]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      deleteNode();
      e.stopPropagation(); // Disable clicking prevents the sidebar from opening
    },
    [clientContext, node]
  );

  return (
    <Dropdown
      trigger="hover"
      position="bottomRight"
      onVisibleChange={rerenderMenu}
      render={
        <Dropdown.Menu key={key}>
          {canMoveOut && (
            <Dropdown.Item onClick={handleMoveOut}>移出</Dropdown.Item>
          )}
          {/* {registry.meta!.renameDisabled === false && (
          
          )} */}
          <Dropdown.Item onClick={handleRename}>{t('formComponents.formHeader.rename')}</Dropdown.Item>
          {registry.meta!.copyDisable === false && (
            <Dropdown.Item onClick={handleCopy}>{t('formComponents.formHeader.copy')}</Dropdown.Item>
          )}
          {(registry.canDelete?.(clientContext, node) ||
            !registry.meta!.deleteDisable) && (
            <Dropdown.Item onClick={handleDelete}>{t('formComponents.formHeader.delete')}</Dropdown.Item>
          )}
        </Dropdown.Menu>
      }
    >
      <IconButton
        color="secondary"
        size="small"
        theme="borderless"
        icon={<IconMore />}
        onClick={(e) => e.stopPropagation()}
      />
    </Dropdown>
  );
}

export function FormHeader() {
  const { t } = useTranslation();
  const { node, expanded, toggleExpand, readonly } = useNodeRenderContext();
  const { setNodeRender } = useContext(SidebarContext);
  const isSidebar = useIsSidebar();
  const handleExpand = (e: React.MouseEvent) => {
    toggleExpand();
    e.stopPropagation(); // Disable clicking prevents the sidebar from opening
  };
  const [isRename, setIsRename] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleClose = useCallback(() => {
    setNodeRender(undefined);
  }, [setNodeRender]);

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRename(true);
  };

  const titleContainerStyle = {
    position: "relative" as const,
    width: "100%",
    height: "28px",
    display: "flex",
    alignItems: "center",
  };

  const wrapperStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
  };

  const textWrapperStyle = {
    ...wrapperStyle,
    cursor: readonly ? "default" : "text",
    padding: "0 4px",
    transition: "background-color 0.2s",
    borderRadius: "4px",
    backgroundColor: isHovering ? "rgba(0,0,0,0.03)" : "transparent",
  };

  const textStyle = {
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "28px",
    padding: 0,
    color: "#303030",
  };

  const inputStyle = {
    height: "28px",
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "28px",
    padding: "0 4px",
    borderRadius: "4px",
    width: "100%",
    transition: "all 0.2s",
    boxShadow: "0 0 0 2px rgba(22, 93, 255, 0.2)",
  };

  return (
    <Header style={{ cursor: isSidebar ? "default" : "move" }}>
      {getIcon(node)}
      <Title>
        <Field name="title">
          {({
            field: { value, onChange },
            fieldState,
          }: FieldRenderProps<string>) => (
            <div style={titleContainerStyle}>
              {isRename ? (
                <div style={wrapperStyle}>
                  <Input
                    style={inputStyle}
                    value={value}
                    onChange={(e) => onChange(e)}
                    onBlur={() => setIsRename(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsRename(false);
                      } else if (e.key === "Escape") {
                        setIsRename(false);
                      }
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  style={textWrapperStyle}
                  onMouseEnter={() => !readonly && setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onDoubleClick={(e) => {
                    if (!readonly) {
                      e.stopPropagation();
                      setIsRename(true);
                    }
                  }}
                >
                  <Text ellipsis={{ showTooltip: true }} style={textStyle}>
                    {value}
                  </Text>
                  {fieldState?.errors && (
                    <Feedback errors={fieldState.errors} />
                  )}
                </div>
              )}
            </div>
          )}
        </Field>
      </Title>
      {node.renderData.expandable && !isSidebar && (
        <Button
          type="primary"
          icon={
            expanded ? <IconSmallTriangleDown /> : <IconSmallTriangleLeft />
          }
          size="small"
          theme="borderless"
          onClick={handleExpand}
        />
      )}
      {readonly ? undefined : (
        <Operators>
          <DropdownContent handleRename={handleRename} />
        </Operators>
      )}
      {
        isSidebar && ( 
          <Button
            icon={<IconClose />}
            size="small"
            theme="borderless"
            onClick={handleClose}
          />
        )
      }
    </Header>
  );
}
