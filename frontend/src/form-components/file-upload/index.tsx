import React, { useState, useCallback, useRef, useContext } from "react";
import {
  Upload,
  Button,
  Typography,
  Toast,
  Spin,
  Image,
} from "@douyinfe/semi-ui";
import type { UploadProps } from "@douyinfe/semi-ui/lib/es/upload";
import { IconUpload, IconFile, IconDelete } from "@douyinfe/semi-icons";
import { uploadFileToOSS } from "@/api";
import { StoreContext } from "@/store";
import {
  FileUploadContainer,
  FileItemContainer,
  FileInfoContainer,
  FileNameText,
  UploadContainer,
  DropZoneContainer,
  UploadIcon,
  TitleContainer,
  FileListContainer,
} from "./style";

// 自定义扩展的属性
interface CustomFileUploadProps {
  /**
   * 文件上传完成后的回调
   */
  onUploadComplete?: (fileUrl: string) => void;
  /**
   * 默认文件URL
   */
  defaultFileUrl?: string;
  /**
   * 模式
   */
  size?: "small" | "large";
}

// 将Semi-UI的UploadProps与自定义属性结合
export type FileUploadProps = Omit<
  UploadProps,
  "onChange" | "beforeUpload" | "onError" | "action"
> &
  CustomFileUploadProps;

// Define interface for uploadFileToOSS response
interface UploadResponse {
  data?: string;
  success?: boolean;
  message?: string;
}

/**
 * 检查文件是否为图片
 */
const isImageFile = (fileName: string): boolean => {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".svg",
  ];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  return imageExtensions.includes(extension);
};

/**
 * 文件上传组件
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  defaultFileUrl,
  multiple = false,
  accept = "*",
  maxSize = 10,
  disabled = false,
  ...otherProps
}) => {
  // 从store中获取userId
  const { state } = useContext(StoreContext);
  const { userId } = state;
  const text = "文件";
  const [fileList, setFileList] = useState<{ name: string; url: string }[]>(
    defaultFileUrl
      ? defaultFileUrl.split(';').map(url => ({
          name: url.trim().split('/').pop() || text,
          url: url.trim(),
        }))
      : []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBeforeUpload = useCallback(
    (file: File) => {
      console.log("beforeUpload 被调用", file);
      if (file.size > maxSize * 1024 * 1024) {
        Toast.error(`${text}大小不能超过 ${maxSize}MB`);
        return false;
      }
      return true;
    },
    [maxSize]
  );

  const handleUpload = useCallback(
    async (file: File) => {
      console.log("handleUpload 被调用", file);

      if (!userId) {
        Toast.error(`缺少用户ID，无法上传${text}`);
        return;
      }

      setLoading(true);
      try {
        const fileName = `${Date.now()}_${file.name}`;
        const result = (await uploadFileToOSS(
          file,
          userId,
          fileName
        )) as UploadResponse;
        console.log("上传结果:", result);

        // 处理上传结果
        if (result && result.data) {
          const fileUrl = result.data;
          const newFile = { name: file.name, url: fileUrl };

          if (multiple) {
            setFileList((prev) => {
              const newFileList = [...prev, newFile];
              if (onUploadComplete) {
                const allUrls = newFileList.map((f) => f.url).join(";");
                onUploadComplete(allUrls);
              }
              return newFileList;
            });
          } else {
            setFileList([newFile]);
            onUploadComplete?.(fileUrl);
          }
          !multiple && Toast.success(`${text}上传成功`);
        } else {
          Toast.error(`${text}上传失败`);
        }
      } catch (error) {
        console.error(`上传${text}错误:`, error);
        Toast.error(`文件${text}错误失败`);
      } finally {
        setLoading(false);
      }
    },
    [userId, multiple, onUploadComplete]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        if (handleBeforeUpload(file)) {
          handleUpload(file);
        }
      });
    }
  };

  const handleRemoveFile = useCallback(
    (index: number) => {
      const newFileList = [...fileList];
      newFileList.splice(index, 1);
      setFileList(newFileList);

      // 如果删除后没有文件，则通知父组件
      if (newFileList.length === 0 && onUploadComplete) {
        onUploadComplete("");
      } else if (onUploadComplete) {
        // 更新所有文件URL，以分号连接
        const allUrls = newFileList.map((file) => file.url).join(";");
        onUploadComplete(allUrls);
      }
    },
    [fileList, onUploadComplete]
  );

  const handleClearAllFiles = useCallback(() => {
    setFileList([]);
    if (onUploadComplete) {
      onUploadComplete("");
    }
  }, [onUploadComplete]);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (handleBeforeUpload(file)) {
        handleUpload(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const buttonText = otherProps.children || `上传${text}`;
  const hint = otherProps.dragIcon || `点击或拖拽${text}到此区域上传`;

  return (
    <Spin style={{width:'100%',overflow:'hidden'}} spinning={loading}>
      <FileUploadContainer>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled}
          multiple={multiple}
        />
        {fileList.length > 0 ? (
          <div>
            <FileListContainer>
              {fileList.map((file, index) => (
                <FileItemContainer key={index}>
                  <FileInfoContainer>
                    {isImageFile(file.name) ? (
                      <Image
                        src={file.url}
                        alt={file.name}
                        width={60}
                        height={60}
                        style={{
                          overflow: "visible",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    ) : (
                      <IconFile size="large" />
                    )}
                    <Typography.Text ellipsis={{ showTooltip: true }}>
                      {file.name}
                    </Typography.Text>
                  </FileInfoContainer>
                  {!disabled && (
                    <Button
                      type="danger"
                      theme="borderless"
                      icon={<IconDelete />}
                      onClick={() => handleRemoveFile(index)}
                    />
                  )}
                </FileItemContainer>
              ))}
            </FileListContainer>
            {multiple && !disabled && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <Button
                  type="danger"
                  theme="light"
                  icon={<IconDelete />}
                  disabled={disabled || fileList.length === 0}
                  onClick={handleClearAllFiles}
                  style={{ marginTop: "4px" }}
                >
                  清除全部
                </Button>
                <Button
                  icon={<IconUpload />}
                  disabled={disabled}
                  onClick={handleButtonClick}
                  style={{ marginTop: "4px" }}
                >
                  {buttonText}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <UploadContainer>
            <DropZoneContainer
              disabled={disabled}
              onClick={handleButtonClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <UploadIcon>
                <IconUpload size="extra-large" />
              </UploadIcon>
              <Typography.Title heading={6}>
                <TitleContainer>{buttonText}</TitleContainer>
              </Typography.Title>
              <Typography.Text type="tertiary">{hint}</Typography.Text>
            </DropZoneContainer>
          </UploadContainer>
        )}
      </FileUploadContainer>
    </Spin>
  );
};

export default FileUpload;
