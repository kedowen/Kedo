import { FlowDocumentJSON } from './typings';
import i18next from 'i18next';

export const initialData: FlowDocumentJSON = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      meta: {
        position: {
          x: 180,
          y: 313.25,
        },
      },
      data: {
        get title() {
          return i18next.t('nodes.start.label');
        },
        outputs: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              default: 'Hello Flow.',
            },
          },
        },
      },
    },
    {
      id: 'end_0',
      type: 'end',
      meta: {
        position: {
          x: 1200,
          y: 313.25,
        },
      },
      data: {
       
        get title() {
          return i18next.t('nodes.end.label');
        },
        outputs: {
          type: 'array',
          properties: {
            output: {
              type: 'array',
            },
          },
        },
      },
    }
  ],
  edges: [
   
  ],
};
