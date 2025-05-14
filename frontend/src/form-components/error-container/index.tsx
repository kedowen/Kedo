// import { TypeTag } from '../type-tag'
import { FieldState } from "@flowgram.ai/free-layout-editor";
import { ErrorContainerStyle } from "./styles";
import { Feedback } from "../feedback";

export interface ErrorContainerProps {
  children: React.ReactNode;
  fieldState: FieldState;
  style?: React.CSSProperties;
}

export const ErrorContainer: React.FC<ErrorContainerProps> = (props) => (
  <div style={{ ...props?.style }}>
    <ErrorContainerStyle
      className={
        Object.keys(props.fieldState?.errors || {}).length > 0
          ? "has-error"
          : ""
      }
    >
      {props.children}
    </ErrorContainerStyle>
    <Feedback errors={props.fieldState?.errors} />
  </div>
);
