import styled from 'styled-components';

export const JsonViewerContainer = styled.div`
  width: 100%;
  .semi-json-view,
  .semi-json-view-container {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  /* Override any inner elements that might have fixed width */
  * {
    max-width: 100%;
  }
`; 