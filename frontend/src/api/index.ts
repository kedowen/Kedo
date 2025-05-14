import request, { BASE_URL } from '@/utils/request';
import axios from 'axios';

export function awaitWrapper(promise: Promise<any>) {
  return promise.then((res) => [null, res])
    .catch((err) => [err, null])
}


export const saveData = (data: any) => {
  return request.post('/OnionFlowData/SubmitOnionFlowData', data)
}

export const modifyData = (data: any) => {
  return request.post('/OnionFlowData/EditOnionFlowData', data)
}

export const loadData = (data: any) => {
  return request.get('/OnionFlowData/QueryOnionFlowDataById', { params: data })
}

/**
 * 执行流程
 * @param data 
 * @returns 
 */
export const execute = (data: any) => {
  return request.post('/OnionFlowExecutor/OnionAgentFlowExecuteProcess', data)
}

/**
 * 获取执行结果
 * @param data 
 * @returns 
 */
export const getExecuteResult = (data: any) => {
  return request.get('/OnionFlowExecutor/GetAgentFlowExecuteProcessResult', { params: data })
}

/**
 * 上传文件到OSS
 */
export const uploadFileToOSS = (file: Blob, userId: string, fileName: string) => {
  const formData = new FormData();
  formData.append('formFile', file, fileName);
  const url = `${BASE_URL}/Oss/UploadImg?userId=${userId}`;
  return new Promise((resolve, reject) => {
    axios.post(url, formData, {
      headers: {

      }
    }).then(res => {
      resolve(res.data);
    }).catch(err => {
      reject(err);
    });
  });
}
/**
 * 创建数据源
 * @param data 
 * @returns 
 */
export const createDataSource = (data: any) => {
  return request.post('/DataSource/CreateDataSource', data)
}
/**
 * 获取数据源类型
 * @param data 
 * @returns 
 */
export const getQueryDBDataSourceType = (data: any) => {
  return request.get('/DataSource/QueryDBDataSourceType', { params: data })
}
export const getQueryDataSourceInfoListByDataType = (data: any) => {
  return request.get('/DataSource/QueryDataSourceInfoListByDataType', { params: data })
}

/**
 * 测试执行SQL语句
 * @param data 包含sqlString、dataSourceTypeId和connectionStringId的对象
 * @returns 
 */
export const queryDBDataBySQL = (data: {
  sqlString: string;
  dataSourceTypeId: string;
  connectionStringId: string;
}) => {
  return request.post('/DataSource/QueryDBDataBySQL', data)
}


/**
 * 获取会话模型列表
 * @returns 
 */
export const getChatLLMList = () => {
  return request.post('/DataItem/GetItemData', { "itemCode": "GPTModel" })
}

/**
 * 获取图片模型列表
 * @returns 
 */
export const getImageLLMList = () => {
  return request.post('/DataItem/GetItemData', { "itemCode": "GPTIMG" })
}
/**
 * 查找全部流程
 */

export const getAllFlow = (data:any) => {
  return request.get('/OnionFlowData/QueryOnionFlowSchemeDataList',{ params: data })
}
/**
 * 获取验证码
 */
export const getCaptcha = (data:any) => {
  return request.get('/User/GetVerificationCode', { params: data })
}

/**
 * 验证码登录
 * @param data
 */

export const loginByCaptcha = (data:any) => {
  return request.post('/User/UserLoginByMobile', data)
}

/**
 * 账号密码登录
 * @param data
 */

export const loginByPassword = (data:any) => {
  return request.post('/User/UserLoginByAccount', data)
}

/**
 * 注册
 * @param data
 */
export const register = (data:any) => {
  return request.post('/User/UserRegist', data)
}

