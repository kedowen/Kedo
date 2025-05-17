import { nanoid } from 'nanoid';
import i18n from '../../utils/i18n';

import { FlowNodeRegistry } from '../../typings';
import iconImage from '../../assets/icon_image.svg'; // 暂时使用已有图标，实际项目中应替换
import { formMeta } from './form-meta';
import { Label } from '@/form-components/properties-edit/styles';

// 风格选项定义 - 使用语言包中的数组
const getStyleOptionsEnum = () => {
  return i18n.t('nodes.image_generation.styleOptions', { returnObjects: true }) as string[];
};

// 比例选项 - 使用语言包中的数组
const getAspectRatioOptions = () => {
  return i18n.t('nodes.image_generation.aspectRatioOptions', { returnObjects: true }) as string[];
};

let index = 0;
export const ImageGenerationNodeRegistry: FlowNodeRegistry = {
  type: 'image_generation',
  info: {
    get label() {
      return i18n.t('nodes.image_generation.label');
    },
    icon: iconImage,
    get description() {
      return i18n.t('nodes.image_generation.description');
    }
  },
  meta: {
    size: {
      width: 360,
      height: 305,
    },
    defaultPorts: [{ type: 'input' }, { type: 'output' }],
  },
  formMeta,
  onAdd() {
    const styleOptions = getStyleOptionsEnum();
    const aspectRatios = getAspectRatioOptions();

    return {
      id: `image_gen_${nanoid(5)}`,
      type: 'image_generation',
      data: {
        title: `${i18n.t('nodes.image_generation.label')}_${++index}`,
        inputsValues: {
          style: styleOptions[0],
          width: 1024,
          height: 1024,
          aspectRatio: aspectRatios[0],
          referenceImages: [
            {
              type: 'expression',
              content: '',
              similarity: 0.7,
            },
          ],
          prompt: '',
          negativePrompt: '',
          customParams: [],
          modelType: {
            label: '',
            value: ''
          },
        },
        inputs: {
          type: 'object',
          required: ['style', 'width', 'height', 'prompt'],
          properties: {
            style: {
              type: 'string',
              description: i18n.t('nodes.image_generation.inputs.style'),
              enum: styleOptions
            },
            width: {
              type: 'number',
              description: i18n.t('nodes.image_generation.inputs.width')
            },
            height: {
              type: 'number',
              description: i18n.t('nodes.image_generation.inputs.height')
            },
            aspectRatio: {
              type: 'string',
              description: i18n.t('nodes.image_generation.inputs.aspectRatio'),
              enum: aspectRatios
            },
            modelType: {
              type: 'object',
              description: i18n.t('nodes.image_generation.form.modelType'),
              properties: {
                label: {
                  type: 'string',
                  description: i18n.t('nodes.image_generation.inputs.modelType.label')
                },
                value: {
                  type: 'string',
                  description: i18n.t('nodes.image_generation.inputs.modelType.value')
                }
              }
            },
            referenceImages: {
              type: 'array',
              description: i18n.t('nodes.image_generation.inputs.referenceImages.title'),
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    description: i18n.t('nodes.image_generation.inputs.referenceImages.type')
                  },
                  content: {
                    type: 'number',
                    description: i18n.t('nodes.image_generation.inputs.referenceImages.content'),
                    minimum: 0,
                    maximum: 1
                  },
                  similarity: {
                    type: 'number',
                    description: i18n.t('nodes.image_generation.inputs.referenceImages.similarity')
                  },
                }
              }
            },
            prompt: {
              type: 'string',
              description: i18n.t('nodes.image_generation.inputs.prompt')
            },
            negativePrompt: {
              type: 'string',
              description: i18n.t('nodes.image_generation.inputs.negativePrompt')
            },
            customParams: {
              type: 'array',
              description: i18n.t('nodes.image_generation.inputs.customParams.title'),
              items: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: i18n.t('nodes.image_generation.inputs.customParams.name'),
                  },
                  type: {
                    type: 'string',
                    description: i18n.t('nodes.image_generation.inputs.customParams.type'),
                  },
                  value: {
                    type: 'string',
                    description: i18n.t('nodes.image_generation.inputs.customParams.value'),
                  },
                },
              },
            }
            // 自定义参数会在使用时动态添加
          },
        },
        outputs: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              description: i18n.t('nodes.image_generation.outputs.data')
            },
            msg: {
              type: 'string',
              description: i18n.t('nodes.image_generation.outputs.msg')
            }
          },
        },
      },
    };
  },
};