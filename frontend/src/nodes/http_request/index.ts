import { nanoid } from 'nanoid';
import i18n from '../../utils/i18n';

import { FlowNodeRegistry } from '../../typings';
import iconHttp from '../../assets/icon-http.svg';
import { formMeta } from './form-meta';

let index = 0;
export const HttpRequestNodeRegistry: FlowNodeRegistry = {
  type: 'http_request',
  info: {
    get label() {
      return i18n.t('nodes.http_request.label');
    },
    icon: iconHttp,
    description: i18n.t('nodes.http_request.description'),
  },
  meta: {
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
    expandable: false,
  },
  formMeta,
  onAdd() {
    return {
      id: `http_request_${nanoid(5)}`,
      type: 'http_request',
      data: {
        title: `${i18n.t('nodes.http_request.label')}_${++index}`,
        inputsValues: {
          method: 'GET',
          url: {
            type: 'string',
            content: '',
          },
          params: [
            {
              key: '',
              value: '',
            },
          ],
          headers: [
            {
              key: '',
              value: '',
            },
          ],
          enableAuth: false,
          authType: 'Bearer Token',
          authValue: {
            type: 'string',
            content: '',
          },
          tokenValue: {
            type: 'string',
            content: '',
          },
          authKey: '',
          authAddTo: 'Header',
          bodyType: 'none',
          bodyContent: '',
          timeout: 30000,
          maxRetries: 3,
        },
        inputs: {
          type: 'object',
          properties: {
            method: {
              type: 'string',
              enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
              description: i18n.t('nodes.http_request.form.method'),
            },
            url: {
              type: 'object',
              description: i18n.t('nodes.http_request.form.url'),
              properties: {
                type: {
                  type: 'string',
                  enum: ['string', 'expression'],
                  description: i18n.t('nodes.http_request.form.url'),
                },
                content: {
                  type: 'string',
                  description: i18n.t('nodes.http_request.form.url'),
                },
              },
            },
            params: {
              type: 'array',
              description: i18n.t('nodes.http_request.form.params'),
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' },
                },
              },
            },
            headers: {
              type: 'array',
              description: i18n.t('nodes.http_request.form.headers'),
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' },
                },
              },
            },
            enableAuth: {
              type: 'boolean',
              description: i18n.t('nodes.http_request.form.enableAuth'),
            },
            authType: {
              type: 'string',
              enum: ['Bearer Token', '自定义'],
              description: i18n.t('nodes.http_request.form.authType'),
            },
            tokenValue: {
              type: 'object',
              description: i18n.t('nodes.http_request.form.authToken'),
              properties: {
                type: {
                  type: 'string',
                  enum: ['expression', 'string'],
                  description: i18n.t('nodes.http_request.form.authCustom.value'),
                },
                content: {
                  type: 'string',
                  description: i18n.t('nodes.http_request.form.authCustom.value'),
                },
              },
            },
            authValue: {
              type: 'object',
              description: i18n.t('nodes.http_request.form.authToken'),
              properties: {
                type: {
                  type: 'string',
                  enum: ['expression', 'string'],
                  description: i18n.t('nodes.http_request.form.authToken'),
                },
                content: {
                  type: 'string',
                  description: i18n.t('nodes.http_request.form.authToken'),
                },
              },
            },
            authKey: {
              type: 'string',
              description: i18n.t('nodes.http_request.form.authCustom.key'),
            },
            authAddTo: {
              type: 'string',
              enum: ['Header', 'Query'],
              description: i18n.t('nodes.http_request.form.authCustom.addTo'),
            },
            bodyType: {
              type: 'string',
              enum: ['none', 'JSON', 'form-data', 'x-www-form-urlencoded', 'raw text', 'binary'],
              description: i18n.t('nodes.http_request.form.bodyType'),
            },
            bodyContent: {
              type: 'string',
              description: i18n.t('nodes.http_request.form.bodyContent.json'),
            },
            timeout: {
              type: 'number',
              description: i18n.t('nodes.http_request.form.advanced.timeout'),
            },
            maxRetries: {
              type: 'number',
              description: i18n.t('nodes.http_request.form.advanced.retries'),
            },
          },
          required: ['method', 'url'],
        },
        outputs: {
          type: 'object',
          properties: {
            body: {
              type: 'object',
              description: i18n.t('nodes.http_request.outputs.body'),
            },
            statusCode: {
              type: 'number',
              description: i18n.t('nodes.http_request.outputs.statusCode'),
            },
            headers: {
              type: 'object',
              description: i18n.t('nodes.http_request.outputs.headers'),
            },
          },
        },
      },
    };
  },
}; 