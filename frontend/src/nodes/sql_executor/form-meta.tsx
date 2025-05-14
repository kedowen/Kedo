import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { Tooltip, Button, Input, Typography, Modal, Space, Table, Empty, TextArea, Collapse, Switch, Select } from '@douyinfe/semi-ui';
import { IconPlusCircle, IconHelpCircle, IconSearch, IconRefresh, IconPlus, IconMinus, IconDelete, IconEdit } from '@douyinfe/semi-icons';
import Editor from '@monaco-editor/react';
import { useTranslation } from 'react-i18next';

import { FormRenderProps, Field, FormMeta, ValidateTrigger, FieldRenderProps, useForm } from '@flowgram.ai/free-layout-editor';
import { useIsSidebar } from '../../hooks';
import { FormHeader, FormContent, FormItem, Feedback, FormOutputs, TypeSelect, FormArrayOutputs } from '../../form-components';
import { FlowNodeJSON, FlowLiteralValueSchema, FlowRefValueSchema } from '../../typings';

// 从code-inputs导入需要的子组件，而不是整个CodeInputs
import { OutputParamItem, CodeParamItem, CodeParamsEditor } from '../code/code-inputs';
import { FxExpression, FxIcon } from '../../form-components/fx-expression';
import { createDataSource, getQueryDBDataSourceType, getQueryDataSourceInfoListByDataType, queryDBDataBySQL } from '@/api';
import { StoreContext } from "@/store";
import { ParamsArrayEditor, OutputParamsEditor } from "@/components";
const { Text } = Typography;

// SQL内置输入参数，不在自定义参数中显示
const SQL_BUILT_IN_INPUTS = ['sqlQuery', 'dataTable', 'customParams'];

// 自定义节点区块组件
const SectionBlock = ({ 
  title, 
  children, 
  action 
}: { 
  title: React.ReactNode; 
  children: React.ReactNode; 
  action?: React.ReactNode 
}) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      marginBottom: '8px' 
    }}>
      <Text strong style={{ fontSize: '14px' }}>{title}</Text>
      {action}
    </div>
    <div>{children}</div>
  </div>
);

// 内联简化视图组件
const SimplifiedSqlView = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  const { t } = useTranslation();
  const sqlQuery = form?.getValueIn('inputsValues.sqlQuery') || '';
  const dataTable = form?.getValueIn('inputsValues.dataTable') || '';
  const [customInputParams, setCustomInputParams] = useState<Array<{key: string, value: any}>>([]);
  const [customArrayParams, setCustomArrayParams] = useState<Array<{title: string, type: string, value: any}>>([]);
  const [outputParams, setOutputParams] = useState<Array<string>>([]);
  
  // 用于安全显示可能是对象的值
  const safeRenderValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '--';
    }
    
    if (typeof value === 'object') {
      // 检查是否是FX表达式对象
      if (value.type === 'fx' || value.type === 'expression') {
        return `{{${value.content}}}`;
      }
      // 对象类型截断显示
      return JSON.stringify(value).length > 30 
        ? JSON.stringify(value).substring(0, 27) + '...'
        : JSON.stringify(value);
    }
    
    // 对长字符串进行截断
    if (typeof value === 'string' && value.length > 30) {
      return value.substring(0, 27) + '...';
    }
    
    return String(value);
  };
  
  // 展示SQL语句的摘要
  const getSqlPreview = () => {
    if (!sqlQuery) return '未设置SQL语句';
    // 简单的摘要：展示SQL语句前50个字符
    return sqlQuery.length > 50 
      ? `${sqlQuery.substring(0, 50)}...` 
      : sqlQuery;
  };
  
  // 更新自定义输入参数和输出参数
  useEffect(() => {
    if (!form?.values) return;
    
    // 使用类型断言访问inputs和inputsValues
    const formValues = form.values as any;
    
    // 更新输入参数列表
    if (formValues.inputs?.properties) {
      const allParams = Object.keys(formValues.inputs.properties);
      const filteredParams = allParams.filter(param => !SQL_BUILT_IN_INPUTS.includes(param));
      
      // 获取参数值
      const paramValues = filteredParams.map(key => ({
        key,
        value: formValues.inputsValues ? formValues.inputsValues[key] : undefined
      }));
      
      // 更新状态
      setCustomInputParams(paramValues);
    }
    
    // 检查并处理customParams数组参数
    if (form.values.inputsValues && 
        form.values.inputsValues.customParams && 
        Array.isArray(form.values.inputsValues.customParams)) {
      const customParams = form.values.inputsValues.customParams;
      setCustomArrayParams(customParams);
    }
    
    // 更新输出参数列表
    if (formValues.outputs?.properties) {
      const allOutputParams = Object.keys(formValues.outputs.properties);
      setOutputParams(allOutputParams);
    }
  }, [form?.values]);

  // 自定义参数展示逻辑
  const renderCustomParams = () => {
    // 优先显示customParams数组参数
    if (customArrayParams.length > 0) {
      // 只显示前两个参数
      const visibleParams = customArrayParams.slice(0, 2);
      const hiddenCount = customArrayParams.length - 2;
  
      return (
        <>
          {visibleParams.map((param, index) => (
            <Tooltip key={index} content={
              <div style={{ maxWidth: '200px', wordBreak: 'break-all' }}>
                <Typography.Text>
                  {param.title}: {safeRenderValue(param.value)}
                  <br />
                  <small>类型: {param.type}</small>
                </Typography.Text>
              </div>
            }>
              <div>
                <InputTag type="primary">{param.title}</InputTag>
              </div>
            </Tooltip>
          ))}
  
          {/* 显示额外参数数量 */}
          {hiddenCount > 0 && (
            <Tooltip content={
              <div style={{ maxWidth: '200px' }}>
                {customArrayParams.slice(2).map((param, index) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    <Typography.Text>
                      {param.title}: {safeRenderValue(param.value)}
                      <br />
                      <small>类型: {param.type}</small>
                    </Typography.Text>
                  </div>
                ))}
              </div>
            }>
              <div>
                <InputTag type="primary" style={{ cursor: 'pointer' }}>+{hiddenCount}</InputTag>
              </div>
            </Tooltip>
          )}
        </>
      );
    }
    
    // 如果没有customParams数组参数，则显示旧版的自定义参数
    if (customInputParams.length > 0) {
      const visibleParams = customInputParams.slice(0, 2);
      const hiddenCount = customInputParams.length - 2;
      
      return (
        <>
          {visibleParams.map((param) => (
            <Tooltip key={param.key} content={
              <div style={{ maxWidth: '200px', wordBreak: 'break-all' }}>
                <Typography.Text>{param.key}: {safeRenderValue(param.value)}</Typography.Text>
              </div>
            }>
              <div>
                <InputTag type="primary">{param.key}</InputTag>
              </div>
            </Tooltip>
          ))}
          {hiddenCount > 0 && (
            <InputTag type="primary">+{hiddenCount}</InputTag>
          )}
        </>
      );
    }
    
    return (
      <Typography.Text type="tertiary" size="small">无自定义输入参数</Typography.Text>
    );
  };

  // 添加类型断言以避免TypeScript错误
  const formValues = form?.values as any;

  return (
    <>
      <FormHeader />
      {/* 数据表和SQL信息 */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px 4px 10px',
        // borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          marginRight: '12px'
        }}>
          <Typography.Text strong style={{ fontSize: '13px' }}>
            {t('nodes.sql_executor.form.dataSource')}: {dataTable || t('nodes.sql_executor.form.noDataSourceSelected')}
          </Typography.Text>
        </div>
      </div>
      <FormArrayOutputs name="inputsValues.customParams" label={t('nodes.sql_executor.form.inputParams')}/>
      <FormOutputs/>
    </>
  );
};

// 输入标签组件
const InputTag = ({ children, type, style }: { 
  children: React.ReactNode; 
  type: 'primary' | 'warning' | 'tertiary';
  style?: React.CSSProperties;
}) => {
  // 根据类型设置不同的颜色
  const getColor = () => {
    switch (type) {
      case 'primary':
        return { bg: '#e6f7e8', text: '#18a058' }; // 使用SQL节点的绿色
      case 'warning':
        return { bg: '#fff0f0', text: '#ff4d4f' };
      case 'tertiary':
        return { bg: '#f0f0f0', text: '#666' };
      default:
        return { bg: '#f0f0f0', text: '#666' };
    }
  };
  
  const colors = getColor();
  
  return (
    <div style={{
      backgroundColor: colors.bg,
      color: colors.text,
      padding: '1px 6px',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: type !== 'tertiary' ? 'bold' : 'normal',
      ...style
    }}>
      {children}
    </div>
  );
};

// SQL提示信息
const SQL_TOOLTIP = (t: any) => t('nodes.sql_executor.form.sqlTooltip');

// 修改模拟的数据源列表
const mockDataSources = [];

// 创建一个上下文来共享数据源状态
const DataSourceContext = React.createContext<{
  dataSources: Array<{id: string; name: string; connectionString: string; remark: string; status: number}>;
  setDataSources: React.Dispatch<React.SetStateAction<Array<{id: string; name: string; connectionString: string; remark: string; status: number}>>>;
}>({
  dataSources: [],
  setDataSources: () => {}
});

// 数据源添加弹窗接口
interface AddDataSourceProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (dataSource: { id: string; name: string; url: string; type: string; typeId: string }) => void;
}

// 数据源添加弹窗组件
const AddDataSourceModal: React.FC<AddDataSourceProps> = ({
  visible,
  onClose,
  onAdd
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');                     // f_Caption
  const [url, setUrl] = useState('');                       // f_ConnectionString
  const [ip, setIp] = useState('');                         // f_Ip
  const [port, setPort] = useState('0');                    // f_Port
  const [dbName, setDbName] = useState('');                 // f_DBName
  const [userId, setUserId] = useState('');                 // f_DataSourceUserId
  const [pwd, setPwd] = useState('');                       // f_Pwd
  const [remark, setRemark] = useState('');                 // f_Remark
  const [dataSourceTypeId, setDataSourceTypeId] = useState('');  // f_DataSourceTypeId
  const [dbTypes, setDbTypes] = useState<Array<{id: string, name: string}>>([]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const { state, dispatch } = useContext(StoreContext);

  // 加载数据库类型列表
  useEffect(() => {
    if (visible) {
      loadDbTypes();
    }
  }, [visible]);

  // 加载数据库类型
  const loadDbTypes = async () => {
    try {
      const result = await getQueryDBDataSourceType({mDataSourceType:'DataSourceType'});
      const response = result.data;
      if (response && Array.isArray(response)) {
        // 假设返回的结构有id和name字段
        setDbTypes(response.map(item => ({
          id: item.itemDetailId || '',
          name: item.itemName || ''
        })));
      } else {
        console.error(' :', response);
      }
    } catch (error) {
      console.error('获取数据库类型出错:', error);
    }
  };

  // 重置表单
  const resetForm = () => {
    setName('');
    setUrl('');
    setIp('');
    setPort('0');
    setDbName('');
    setUserId('');
    setPwd('');
    setRemark('');
    setDataSourceTypeId('');
    setTestResult(null);
  };

  // 处理关闭
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 处理添加
  const handleAdd = async () => {
    try {
      setLoading(true);
      
      // 准备请求数据
      const requestData = {
        f_DataSourceTypeId: dataSourceTypeId,
        f_Caption: name,
        f_Ip: ip,
        f_Port: parseInt(port) || 0,
        f_DBName: dbName,
        f_DataSourceUserId: userId,
        f_Pwd: pwd,
        f_Remark: remark,
        f_ConnectionString: url,
        f_CreateUserId: state.userId  // 使用全局状态中的userId
      };
      
      // 调用创建接口
      const response = await createDataSource(requestData);
      
      if (response && response.data) {
        
        // 如果API成功返回，将新数据源信息和类型ID一起传递给父组件 
        onAdd({ 
          id: response.data,
          name: name,
          url: url,
          type: dbTypes.find(t => t.id === dataSourceTypeId)?.name || '未知类型',
          typeId: dataSourceTypeId
        });
        
        resetForm();
        onClose();
      
      } 
    } catch (error) {
      console.error('创建数据源失败:', error);
      setTestResult({
        success: false,
        message: '创建数据源失败: ' + (error instanceof Error ? error.message : '未知错误')
      });
    } finally {
      setLoading(false);
    }
  };

  // 测试连接
  const testConnection = async () => {
    if (!url.trim()) {
      setTestResult({ success: false, message: '请输入数据库连接地址' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // 这里可以添加实际的连接测试API调用
      // 目前使用模拟测试
      setTimeout(() => {
        const success = true; // 模拟成功
        setTestResult({
          success,
          message: success ? '连接成功' : '连接失败: 无法连接到数据库服务器'
        });
        setTesting(false);
      }, 1000);
    } catch (error) {
      setTestResult({
        success: false,
        message: '测试连接失败: ' + (error instanceof Error ? error.message : '未知错误')
      });
      setTesting(false);
    }
  };

  return (
    <Modal
      title={t('nodes.sql_executor.dataSource.addDataSource')}
      visible={visible}
      onCancel={handleClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="tertiary" onClick={handleClose} style={{ marginRight: 8 }}>
            {t('nodes.sql_executor.dataSource.cancel')}
          </Button>
          <Button 
            type="primary" 
            onClick={handleAdd}
            disabled={!name.trim()  || testing || loading}
            loading={loading}
          >
            {t('nodes.sql_executor.dataSource.confirm')}
          </Button>
        </div>
      }
      width={600}
    >
      <div style={{ padding: '20px 0' }}>
        {/* 数据库类型 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>{t('nodes.sql_executor.dataSource.databaseType')}</Text> <Text type="secondary">{t('nodes.sql_executor.dataSource.required')}</Text>
          </div>
          <Select
            placeholder={`${t('formComponents.propertiesEdit.pleaseInput')}${t('nodes.sql_executor.dataSource.databaseType')}`}
            value={dataSourceTypeId}
            onChange={value => setDataSourceTypeId(value)}
            style={{ width: '100%' }}
            optionList={dbTypes.map(type => ({
              label: type.name,
              value: type.id
            }))}
          />
        </div>

        {/* 数据源名称 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>{t('nodes.sql_executor.dataSource.dataSourceName')}</Text> <Text type="secondary">{t('nodes.sql_executor.dataSource.required')}</Text>
          </div>
          <Input 
            placeholder={`${t('formComponents.propertiesEdit.pleaseInput')}${t('nodes.sql_executor.dataSource.dataSourceName')}`}
            value={name}
            onChange={value => setName(value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* IP地址 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>{t('nodes.sql_executor.dataSource.ipAddress')}</Text>
          </div>
          <Input 
            placeholder={`${t('formComponents.propertiesEdit.pleaseInput')}${t('nodes.sql_executor.dataSource.ipAddress')}`}
            value={ip}
            onChange={value => setIp(value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* 端口 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>{t('nodes.sql_executor.dataSource.port')}</Text>
          </div>
          <Input 
            placeholder={`${t('formComponents.propertiesEdit.pleaseInput')}${t('nodes.sql_executor.dataSource.port')}`}
            value={port}
            onChange={value => setPort(value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* 数据库名称 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>{t('nodes.sql_executor.dataSource.databaseName')}</Text>
          </div>
          <Input 
            placeholder={`${t('formComponents.propertiesEdit.pleaseInput')}${t('nodes.sql_executor.dataSource.databaseName')}`}
            value={dbName}
            onChange={value => setDbName(value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* 用户名 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>{t('nodes.sql_executor.dataSource.username')}</Text>
          </div>
          <Input 
            placeholder={`${t('formComponents.propertiesEdit.pleaseInput')}${t('nodes.sql_executor.dataSource.username')}`}
            value={userId}
            onChange={value => setUserId(value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* 密码 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>{t('nodes.sql_executor.dataSource.password')}</Text>
          </div>
          <Input 
            placeholder={`${t('formComponents.propertiesEdit.pleaseInput')}${t('nodes.sql_executor.dataSource.password')}`}
            value={pwd}
            onChange={value => setPwd(value)}
            style={{ width: '100%' }}
            mode="password"
          />
        </div>

        {/* 备注 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text strong>{t('nodes.sql_executor.dataSource.remark')}</Text>
          </div>
          <TextArea 
            placeholder={`${t('formComponents.propertiesEdit.pleaseInput')}${t('nodes.sql_executor.dataSource.remark')}`}
            value={remark}
            onChange={value => setRemark(value)}
            rows={2}
          />
        </div>
      </div>
    </Modal>
  );
};

// 数据源选择器接口
interface DataSourceSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (dataSourceId: string) => void;
  currentSelected: string | null;
}

// 数据源选择弹窗组件
const DataSourceSelectorModal: React.FC<DataSourceSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  currentSelected
}) => {
  const { t } = useTranslation();
  // 使用上下文中的数据源
  const { dataSources, setDataSources } = useContext(DataSourceContext);
  
  // 状态管理
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(currentSelected);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [addDataSourceVisible, setAddDataSourceVisible] = useState(false);
  const [dataSourceTypes, setDataSourceTypes] = useState<Array<{id: string, name: string}>>([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');

  // 组件加载时初始化
  useEffect(() => {
    if (visible) {
      setSelectedDataSource(currentSelected);
      setSearchText('');
      // 加载数据源列表和类型
      loadDataSourceTypes();
    }
  }, [visible, currentSelected]);

  // 加载数据源类型
  const loadDataSourceTypes = async () => {
    try {
      const result = await getQueryDBDataSourceType({mDataSourceType:'DataSourceType'});
      const response = result.data;
      console.log(response,'loadDataSourceTypes');
      if (response && Array.isArray(response)) {
        const types = response.map(item => {
          console.log(`类型: ${item.itemName}, ID: ${item.itemDetailId}`);
          return {
            id: item.itemDetailId || '',
            name: item.itemName || ''
          };
        });
        
        setDataSourceTypes(types);
        
        // 如果已有选中的typeId，则不重置
        if (types.length > 0 && !selectedTypeId) {
          const firstTypeId = types[0].id;
          console.log(`默认选中类型: ${types[0].name}, ID: ${firstTypeId}`);
          setSelectedTypeId(firstTypeId);
          // 延迟执行查询，确保状态已更新
          setTimeout(() => {
            fetchDataSourcesWithTypeId(firstTypeId);
          }, 0);
        } else if (selectedTypeId) {
          // 如果已有选中的typeId，直接使用该typeId查询
          fetchDataSourcesWithTypeId(selectedTypeId);
        }
      }
    } catch (error) {
      console.error('获取数据库类型出错:', error);
    }
  };

  // 添加使用指定类型ID查询数据源列表的函数
  const fetchDataSourcesWithTypeId = async (typeId: string) => {
    try {
      setLoading(true);
      console.log(`查询类型ID: ${typeId} 的数据源列表`);
      const result = await getQueryDataSourceInfoListByDataType({F_DataTypeId: typeId});
      const response = result.data;
      
      if (response && Array.isArray(response)) {
        // 更新数据处理逻辑，使用API返回的字段名
        const formattedSources = response.map(item => ({
          id: item.f_Id || '',
          name: item.f_Caption || '',
          connectionString: item.f_ConnectionString || '',
          remark: item.f_Remark || '',
          status: item.f_Status || 0
        }));
        console.log(formattedSources,'formattedSources');
        setDataSources(formattedSources);
      }
    } catch (error) {
      console.error('获取数据源列表出错:', error);
    } finally {
      setLoading(false);
    }
  };

  // 修改原有fetchDataSources函数
  const fetchDataSources = async () => {
    if (selectedTypeId) {
      fetchDataSourcesWithTypeId(selectedTypeId);
    } else {
      // 如果未选择类型，尝试获取所有数据源
      fetchDataSourcesWithTypeId('');
    }
  };

  // 处理类型选择处理函数，解决类型问题
  const handleTypeSelect = (value: any) => {
    if (typeof value === 'string') {
      console.log(`手动选择类型ID: ${value}`);
      setSelectedTypeId(value);
      fetchDataSourcesWithTypeId(value);
    }
  };

  // 选择数据源
  const handleSelectDataSource = (dsId: string) => {
    if(!dsId) return;
    console.log('选择数据源项', dsId);
    setSelectedDataSource(dsId);
  };

  // 刷新数据源
  const refreshDataSources = () => {
    fetchDataSources();
  };

  // 确认选择
  const handleConfirm = () => {
    if (selectedDataSource) {
      console.log('确认选择数据源', selectedDataSource);
      onSelect(selectedDataSource);
      onClose();
    }
  };

  // 显示添加数据源弹窗
  const showAddDataSource = () => {
    setAddDataSourceVisible(true);
  };

  // 添加新数据源
  const handleAddDataSource = (dataSource: { id: string; name: string; url: string; type: string; typeId: string }) => {
    console.log('添加数据源成功', dataSource);
    
    // 设置选中的数据源类型ID，使用传入的typeId
    setSelectedTypeId(dataSource.typeId);
    
    // 创建新的数据源对象
    const newDataSource = {
      id: dataSource.id,
      name: dataSource.name,
      connectionString: dataSource.url,
      remark: '',
      status: 1
    };
    
    // 将新数据源添加到列表
    setDataSources(prev => {
      // 检查是否已存在相同ID的数据源，避免重复
      const exists = prev.some(ds => ds.id === dataSource.id);
      if (exists) {
        return prev.map(ds => ds.id === dataSource.id ? newDataSource : ds);
      } else {
        return [...prev, newDataSource];
      }
    });
    
    // 自动选择新添加的数据源
    setSelectedDataSource(dataSource.id);
    
    // 关闭添加数据源弹框
    setAddDataSourceVisible(false);
    
    // 延迟两秒后刷新列表数据
    // 提前显示loading状态
    setLoading(true);
    setTimeout(() => {
      // 使用正确的类型ID请求列表
      fetchDataSourcesWithTypeId(dataSource.typeId);
    }, 2000);
  };

  // 过滤数据源
  const getFilteredDataSources = () => {
    if (!searchText) return dataSources;
    
    return dataSources.filter((ds: {name: string; connectionString: string; remark: string}) => 
      ds.name.toLowerCase().includes(searchText.toLowerCase()) || 
      ds.connectionString.toLowerCase().includes(searchText.toLowerCase()) ||
      ds.remark.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  return (
    <>
      <Modal
        title={t('nodes.sql_executor.dataSource.selectDataSource')}
        visible={visible}
        onCancel={onClose}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="tertiary" onClick={onClose} style={{ marginRight: 8 }}>
              {t('nodes.sql_executor.dataSource.cancel')}
            </Button>
            <Button 
              type="primary" 
              onClick={handleConfirm}
              disabled={!selectedDataSource}
            >
              {t('nodes.sql_executor.dataSource.confirm')}
            </Button>
          </div>
        }
        width={800}
      >
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', width: '70%' }}>
            <Select
              placeholder={t('nodes.sql_executor.dataSource.databaseType')}
              value={selectedTypeId}
              onChange={(value) => {
                if (typeof value === 'string') {
                  handleTypeSelect(value);
                }
              }}
              style={{ width: '160px' }}
              optionList={dataSourceTypes.map(type => ({
                label: type.name,
                value: type.id
              }))}
            />
            {/* <Input 
              prefix={<IconSearch />}
              placeholder="搜索数据源..." 
              value={searchText}
              onChange={setSearchText}
              style={{ flex: 1 }}
            /> */}
          </div>
          <div>
            <Button icon={<IconRefresh />} type="tertiary" onClick={refreshDataSources} style={{ marginRight: '8px' }}>
              {t('nodes.sql_executor.dataSource.refresh')}
            </Button>
            <Button type="primary" icon={<IconPlus />} onClick={showAddDataSource}>
              {t('nodes.sql_executor.dataSource.addDataSource')}
            </Button>
          </div>
        </div>
        
        <Table
          loading={loading}
          dataSource={getFilteredDataSources()}
          rowKey="id"
          pagination={false}
          onRow={(record) => {
            if (!record) return {};
            console.log(record,'record');
            return {
              onClick: () => handleSelectDataSource(record.id),
              style: { 
                cursor: 'pointer',
                background: selectedDataSource === record.id ? '#f0f8ff' : 'transparent'
              }
            };
          }}
          columns={[
            {
              title: t('nodes.sql_executor.dataSource.dataSourceName'),
              dataIndex: 'name',
              width: 180,
              render: (text) => <Text strong>{text}</Text>
            },
            {
              title: t('nodes.sql_executor.dataSource.connectionAddress'),
              dataIndex: 'connectionString',
              ellipsis: true,
              render: (text) => (
                <Tooltip content={text}>
                  <div style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {text}
                  </div>
                </Tooltip>
              )
            },
            {
              title: t('nodes.sql_executor.dataSource.remark'),
              dataIndex: 'remark',
              width: 150
            },
            {
              title: t('nodes.sql_executor.dataSource.status'),
              dataIndex: 'status',
              width: 80,
              render: (status) => (
                <Text type={status === 1 ? "success" : "danger"}>
                  {status === 1 ? t('nodes.sql_executor.dataSource.normal') : t('nodes.sql_executor.dataSource.disabled')}
                </Text>
              )
            }
          ]}
          empty={
            <Empty
              description={t('plugins.variableSelector.noData')}
              style={{ padding: '40px 0' }}
            />
          }
        />
      </Modal>

      <AddDataSourceModal
        visible={addDataSourceVisible}
        onClose={() => setAddDataSourceVisible(false)}
        onAdd={handleAddDataSource}
      />
    </>
  );
};

// 表单接口
interface TableSelectInfo {
  database: string;
  table: string;
}

// 定义JsonSchema类型 (如果未在typings中定义)
interface JsonSchema {
  type?: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  [key: string]: any;
}

// 系统预设的SQL输出参数
const SQL_BUILT_IN_OUTPUTS = ['outputList', 'rowNum'];

const ButtonContainerStyle = { 
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '16px', 
  marginBottom: '8px' 
};

// SQL全屏编辑器对话框组件
const SqlEditorModal = ({
  visible,
  onCancel,
  onOk,
  sqlContent,
  setSqlContent
}: {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  sqlContent: string;
  setSqlContent: (content: string) => void;
}) => {
  const { t } = useTranslation();
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const editorRef = useRef<any>(null);
  const loadTimeoutRef = useRef<any>(null);

  // 重置状态
  useEffect(() => {
    if (visible) {
      // 模态框显示时，尝试加载编辑器
      setLoading(true);
      
      // 设置一个加载超时，确保即使加载失败也能显示编辑器界面
      loadTimeoutRef.current = setTimeout(() => {
        console.log('SQL编辑器加载超时，强制显示');
        setEditorLoaded(true);
        setLoading(false);
      }, 3000); // 3秒后超时
      
      // 延迟一点时间再加载编辑器
      const timer = setTimeout(() => {
        setEditorLoaded(true);
      }, 300);
      
      return () => {
        clearTimeout(timer);
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
      };
    } else {
      // 模态框隐藏时，重置状态
      setEditorLoaded(false);
      setLoading(false);
    }
  }, [visible]);

  // 处理编辑器加载完成事件
  const handleEditorDidMount = (editor: any) => {
    console.log('SQL编辑器加载完成');
    // 清除超时定时器
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    
    setLoading(false);
    editorRef.current = editor;
    
    // 滚动到顶部并确保显示第一行
    try {
      setTimeout(() => {
        if (editorRef.current) {
          // 聚焦编辑器
          editorRef.current.focus();
          
          // 滚动到顶部
          editorRef.current.setScrollPosition({ scrollTop: 0 });
          
          // 确保显示第一行
          editorRef.current.revealLine(1);
        }
      }, 100);
    } catch (error) {
      console.error('编辑器初始化操作失败:', error);
      // 即使初始化失败，也确保不显示loading
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Typography.Text strong style={{ marginRight: '10px' }}>{t('nodes.sql_executor.sqlEditor.title')}</Typography.Text>
          </div>
        </div>
      }
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={1200}
      height={800}
      style={{ top: 10 }}
      bodyStyle={{ padding: '12px' }}
      centered
      maskClosable={false}
      closeOnEsc
      keepDOM
      fullScreen
      okText={t('nodes.sql_executor.dataSource.confirm')}
      cancelText={t('nodes.sql_executor.dataSource.cancel')}
    >
      <div 
        style={{ 
          height: 'calc(90vh - 120px)', 
          position: 'relative',
          border: '1px solid #e8e8e8',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f9f9f9',
            zIndex: 1
          }}>
            <div style={{ textAlign: 'center' }}>
              <Text>{t('nodes.sql_executor.sqlEditor.loading')}</Text>
            </div>
          </div>
        )}
        
        {editorLoaded && (
          <Editor
            height="100%"
            language="sql"
            value={sqlContent}
            onChange={(value) => setSqlContent(value || '')}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              lineHeight: 22,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              lineNumbers: 'on',
              folding: true,
              contextmenu: true,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              formatOnPaste: true,
              formatOnType: true,
              find: {
                addExtraSpaceOnTop: false,
                autoFindInSelection: 'always',
                seedSearchStringFromSelection: 'always'
              }
            }}
          />
        )}
      </div>
    </Modal>
  );
};

// 测试执行结果弹窗组件
const SqlExecutionResultModal = ({
  visible,
  onClose,
  sql,
  dataTable
}: {
  visible: boolean;
  onClose: () => void;
  sql: string;
  dataTable: string;
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState<Array<any>>([]);
  const [columns, setColumns] = useState<Array<any>>([]);
  const [error, setError] = useState<string | null>(null);
  const { dataSources } = useContext(DataSourceContext);
  
  // 执行SQL并获取结果
  useEffect(() => {
    if (visible) {
      setLoading(true);
      setError(null);
      
      // 查找选中的数据源
      const selectedDataSource = dataSources.find(ds => ds.id === dataTable);
      
      if (!selectedDataSource) {
        setError('未找到选中的数据源');
        setLoading(false);
        return;
      }
      
      if (!sql.trim()) {
        setError('SQL语句不能为空');
        setLoading(false);
        return;
      }
      
      // 调用接口执行SQL
      queryDBDataBySQL({
        sqlString: sql,
        dataSourceTypeId: dataTable, // 使用选中的数据源ID
        connectionStringId: selectedDataSource.connectionString // 使用数据源的连接字符串
      })
      .then(response => {
        if (response && response.data) {
          const resultData = response.data;
          
          // 检查是否有结果数据
          if (Array.isArray(resultData) && resultData.length > 0) {
            // 从第一行数据提取列信息
            const firstRow = resultData[0];
            const columns = Object.keys(firstRow).map(key => ({
              title: key,
              dataIndex: key,
              width: 150
            }));
            
            setColumns(columns);
            setResultData(resultData);
          } else {
            // 无结果或空结果
            setColumns([]);
            setResultData([]);
          }
        } else {
          setError('执行SQL返回的数据格式不正确');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('执行SQL出错:', err);
        setError(err?.message || '执行SQL时发生错误');
        setLoading(false);
      });
    }
  }, [visible, sql, dataTable, dataSources]);
  
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Typography.Text strong style={{ marginRight: '10px' }}>{t('nodes.sql_executor.sqlEditor.testResult')}</Typography.Text>
          {dataTable && (
            <Typography.Text type="secondary" size="small">
              {t('nodes.sql_executor.dataSource.dataSourceId')}: {dataTable}
            </Typography.Text>
          )}
        </div>
      }
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      bodyStyle={{ padding: '12px' }}
      centered
    >
      {/* SQL显示 */}
      <div style={{ 
        marginBottom: '16px', 
        padding: '8px 12px',
        background: '#f5f5f5',
        borderRadius: '4px',
        maxHeight: '100px',
        overflow: 'auto'
      }}>
        <Typography.Text code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {sql}
        </Typography.Text>
      </div>
      
      {/* 结果表格 */}
      {loading ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          background: '#fafafa',
          borderRadius: '4px'
        }}>
          <Typography.Text type="secondary">{t('nodes.sql_executor.sqlEditor.executing')}</Typography.Text>
        </div>
      ) : error ? (
        <div style={{ 
          padding: '20px', 
          background: '#fff2f0', 
          border: '1px solid #ffccc7',
          borderRadius: '4px',
          color: '#ff4d4f'
        }}>
          <Typography.Text type="danger">{t('nodes.sql_executor.sqlEditor.executionError')}: {error}</Typography.Text>
        </div>
      ) : (
        <div style={{ maxHeight: '500px', overflow: 'auto' }}>
          {resultData.length > 0 ? (
            <>
              <Table
                columns={columns}
                dataSource={resultData}
                pagination={{
                  pageSize: 10,
                  size: 'small'
                }}
                size="small"
                bordered
                scroll={{ y: 400, x: '100%' }}
              />
              <div style={{ 
                marginTop: '8px',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <Typography.Text type="secondary" size="small">
                  {t('nodes.sql_executor.sqlEditor.totalRecords', { count: resultData.length })}
                </Typography.Text>
                <Typography.Text type="success" size="small">
                  {t('nodes.sql_executor.sqlEditor.executeSuccess')}
                </Typography.Text>
              </div>
            </>
          ) : (
            <Empty description={t('nodes.sql_executor.sqlEditor.noResults')} />
          )}
        </div>
      )}
    </Modal>
  );
};

// 表单渲染函数
export const renderForm = (props: FormRenderProps<FlowNodeJSON>) => {
  const { form } = props;
  const isSidebar = useIsSidebar();
  const { t } = useTranslation();
  const [activeKeys, setActiveKeys] = useState([t('nodes.sql_executor.form.inputParams'), t('nodes.sql_executor.form.outputParams'), t('nodes.sql_executor.form.dataSource'), 'SQL']); // 默认展开输入输出、数据源和SQL
  const [dbSelectorVisible, setDbSelectorVisible] = useState(false);
  const [rerender, setRerender] = useState(false); // 添加状态用于强制刷新
  
  // 数据源状态管理
  const [dataSources, setDataSources] = useState(mockDataSources);

  if (!isSidebar) {
    return <SimplifiedSqlView {...props} />;
  }
  
  // -- 输入参数处理回调 --
  const handleAddInputParam = useCallback(() => {
    const timestamp = Date.now();
    const tempName = `param_${timestamp}`;
    if (form) {
      // 获取当前输入属性
      const currentInputs = form.getValueIn('inputs.properties') || {};
      const updatedInputs = { ...currentInputs, [tempName]: { type: 'string', description: `自定义参数: ${tempName}` } };
      
      // 获取当前输入值
      const currentValues = form.getValueIn('inputsValues') || {};
      const updatedValues = { ...currentValues, [tempName]: '' };
      
      // 分别更新属性和值
      form.setValueIn('inputs.properties', updatedInputs);
      form.setValueIn('inputsValues', updatedValues);
      
      // 确保通过表单提交来同步状态
      const formAny = form as any;
      if (typeof formAny.submit === 'function') {
        setTimeout(() => {
          formAny.submit();
        }, 10);
      }
    }
  }, [form]);

  const handleDeleteInputParam = useCallback((key: string) => {
     if (form) {
       // 获取并更新输入属性
       const currentInputs = { ...form.getValueIn('inputs.properties') };
       delete currentInputs[key];
       form.setValueIn('inputs.properties', currentInputs);
       
       // 获取并更新输入值
       const inputsValues = { ...form.getValueIn('inputsValues') };
       delete inputsValues[key];
       form.setValueIn('inputsValues', inputsValues);
       
       // 确保通过表单提交来同步状态
       const formAny = form as any;
       if (typeof formAny.submit === 'function') {
         setTimeout(() => {
           formAny.submit();
         }, 10);
       }
     }
   }, [form]);

  // -- 输出参数处理回调 --
  const handleOutputChange = useCallback((path: string, value: JsonSchema) => {
    form.setValueIn(path, value);
  }, [form]);

  const handleDeleteOutput = useCallback((path: string, key: string) => {
    const parentPropertiesPath = `${path}.properties`;
    const parentProps = form.getValueIn(parentPropertiesPath) as Record<string, JsonSchema> | undefined;
    if (parentProps) {
        const newProps = { ...parentProps };
        delete newProps[key];
        form.setValueIn(parentPropertiesPath, newProps);
    }
  }, [form]);

  const handleRenameKey = useCallback((path: string, oldKey: string, newKey: string) => {
    const propertiesPath = `${path}.properties`;
    const currentProps = form.getValueIn(propertiesPath) as Record<string, JsonSchema> | undefined;
    if (!currentProps || currentProps[newKey]) return; // Basic checks
    const updatedProps = Object.entries(currentProps).reduce((acc, [propKey, propValue]) => {
      acc[propKey === oldKey ? newKey : propKey] = propValue;
      return acc;
    }, {} as Record<string, JsonSchema>);
    form.setValueIn(propertiesPath, updatedProps);
  }, [form]);

  const handleAddChildOutput = useCallback((path: string) => {
    const propertiesPath = `${path}.properties`;
    const currentProps = form.getValueIn(propertiesPath) as Record<string, JsonSchema> || {};
    let newKey = `child${Object.keys(currentProps).length}`;
    while (currentProps[newKey]) { newKey = `child${parseInt(newKey.replace('child', ''), 10) + 1}`; }
    const newProps = { ...currentProps, [newKey]: { type: 'string', description: `子参数 ${newKey}` } };
    form.setValueIn(propertiesPath, newProps);
  }, [form]);
  
  const addTopLevelOutput = useCallback(() => {
    const propertiesPath = 'outputs.properties';
    const currentProps = form.getValueIn(propertiesPath) as Record<string, JsonSchema> || {};
    // Filter out built-in outputs before determining the new key index
    const customKeys = Object.keys(currentProps).filter(k => !SQL_BUILT_IN_OUTPUTS.includes(k));
    let newKey = `key${customKeys.length}`;
    while (currentProps[newKey]) { newKey = `key${parseInt(newKey.replace('key', ''), 10) + 1}`; }
    const newProps = { ...currentProps, [newKey]: { type: 'string', description: `输出参数 ${newKey}` } };
    form.setValueIn(propertiesPath, newProps);
  }, [form]);

  // -- 数据表选择逻辑 --
  const handleAddDataTable = () => setDbSelectorVisible(true);
  const handleTableSelect = (dataSourceId: string) => {
    console.log('选择数据源', dataSourceId);
    
    // 查找选择的数据源
    const dataSource = dataSources.find(ds => ds.id === dataSourceId);
    if (!dataSource) {
      console.error('未找到选择的数据源', dataSourceId);
      // 直接使用数据源ID
      form.setValueIn('inputsValues.dataTable', dataSourceId);
    } else {
      console.log('找到数据源', dataSource);
      // 传递数据源ID而不是名称
      form.setValueIn('inputsValues.dataTable', dataSource.id);
      console.log('设置数据源ID成功', dataSource.id);
    }
    
    // 强制刷新界面
    setRerender(prevState => !prevState);
    
    // 立即提交更改
    const formAny = form as any;
    if (typeof formAny.submit === 'function') {
      formAny.submit();
    }
  };
  const handleClearDataTable = () => {
    console.log('清除数据源');
    // 直接更新表单值
    form.setValueIn('inputsValues.dataTable', '');
    
    // 强制刷新界面
    setRerender(prevState => !prevState);
    
    // 确保通过表单提交来同步状态
    const formAny = form as any;
    if (typeof formAny.submit === 'function') {
      formAny.submit();
    }
  };
  const selectedDataTable = form.getValueIn('inputsValues.dataTable') || '';

  // 检查数据表字段是否为表达式模式
  const isDataTableExpression = () => {
    const dataTableDef = form.getValueIn('inputs.properties.dataTable');
    return dataTableDef && dataTableDef.type === 'expression';
  };

  // 切换数据表为表达式模式
  const switchDataTableToExpressionMode = () => {
    if (form) {
      // 获取当前dataTable定义
      const dataTableDef = form.getValueIn('inputs.properties.dataTable') || {};
      const originalType = dataTableDef.type || 'string';
      
      // 更新为表达式类型，保存原始类型
      form.setValueIn('inputs.properties.dataTable', {
        ...dataTableDef,
        type: 'expression',
        _originalType: originalType
      });
      
      // 保存当前值作为表达式内容
      const currentValue = form.getValueIn('inputsValues.dataTable') || '';
      form.setValueIn('inputsValues.dataTable', currentValue);
    }
  };

  // 切换数据表回普通模式
  const switchDataTableToNormalMode = () => {
    if (form) {
      // 获取当前dataTable定义
      const dataTableDef = form.getValueIn('inputs.properties.dataTable') || {};
      const originalType = dataTableDef._originalType || 'string';
      
      // 恢复原始类型
      form.setValueIn('inputs.properties.dataTable', {
        ...dataTableDef,
        type: originalType,
        _originalType: undefined
      });
      
      // 保持当前值不变
      const currentValue = form.getValueIn('inputsValues.dataTable') || '';
      form.setValueIn('inputsValues.dataTable', currentValue);
    }
  };

  const renderSelectedTable = () => {
    if (!selectedDataTable) {
      return (
        <div style={{ 
          padding: '12px 16px', 
          color: '#888', 
          textAlign: 'center', 
          border: '1px dashed #ccc', 
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px'
        }}>
          <span>{t('nodes.sql_executor.form.noDataSourceSelected')}</span>
        </div>
      );
    }

    // 查找选中ID对应的数据源
    const selectedSource = dataSources.find(ds => ds.id === selectedDataTable);
    // 如果找到了数据源，显示其名称；否则显示ID
    const displayName = selectedSource ? selectedSource.name : selectedDataTable;

    return (
      <div style={{ 
        padding: '8px 12px', 
        border: '1px solid #e0e0e0', 
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f5f5f5'
      }}>
        <Text strong>{displayName}</Text>
        <div>
          <Button 
            type="danger" 
            theme="borderless"
            size="small"
            onClick={handleClearDataTable}
          >
            移除
          </Button>
        </div>
      </div>
    );
  };

  return (
    <DataSourceContext.Provider value={{ dataSources, setDataSources }}>
      <FormHeader />
      <FormContent>
        {/* 使用Collapse组件来组织各部分 */}
        <Collapse  expandIconPosition="left"  activeKey={activeKeys} onChange={(keys) => setActiveKeys(keys as string[])}>
          {/* 输入参数部分 */}
          <Collapse.Panel 
            header={t('nodes.sql_executor.form.inputParams')} 
            itemKey={t('nodes.sql_executor.form.inputParams')}
          >
            <Space vertical style={{ width: '100%' }}>
              <ParamsArrayEditor
                arrayName="customParams"
                disabled={false}
                emptyText={t('nodes.sql_executor.form.noCustomParams')}
              />
            </Space>
          </Collapse.Panel>

          {/* 数据源部分 - 改为可折叠面板 */}
          <Collapse.Panel 
            header={
              <div style={{ 
                fontSize: '14px', 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 'bold'
              }}>
                {t('nodes.sql_executor.form.dataSource')}
              </div>
            }
            itemKey={t('nodes.sql_executor.form.dataSource')}
            extra={
              <Button
                icon={<IconPlusCircle />}
                theme="borderless"
                type="tertiary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // 阻止点击事件传播，避免触发面板折叠
                  handleAddDataTable();
                }}
                disabled={!!selectedDataTable}
                style={{ display: 'inline-flex', alignItems: 'center', visibility: 'visible' }}
              />
            }
          >
            {/* 添加key属性以确保在数据变化时重新渲染 */}
            <div key={`data-source-${selectedDataTable}-${rerender}`} style={{ position: 'relative' }}>
              {renderSelectedTable()}
              
              {/* 在面板内部也添加一个加号按钮，确保在展开状态也能看到 */}
              {!selectedDataTable && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1 }}>
                  <Button
                    icon={<IconPlusCircle />}
                    theme="borderless"
                    type="tertiary"
                    size="small"
                    onClick={handleAddDataTable}
                  />
                </div>
              )}
            </div>
          </Collapse.Panel>

          {/* SQL输入部分 - 改为可折叠面板 */}
          <Collapse.Panel
            header={
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                <span>{t('nodes.sql_executor.form.sql')}</span>
                <Tooltip content={SQL_TOOLTIP(t)} position="right">
                  <IconHelpCircle style={{ marginLeft: 4, color: '#888', cursor: 'help' }} />
                </Tooltip>
              </div>
            }
            itemKey="SQL"
          >
            <Field
              name="inputsValues.sqlQuery"
              render={({ field: { value, onChange }, fieldState }: FieldRenderProps<FlowLiteralValueSchema | FlowRefValueSchema>) => {
                // 添加状态管理SQL编辑器对话框
                const [sqlModalVisible, setSqlModalVisible] = useState(false);
                const [tempSqlContent, setTempSqlContent] = useState((value as string) || '');
                const [testExecutionVisible, setTestExecutionVisible] = useState(false);
                
                // 打开SQL编辑器对话框
                const openSqlModal = () => {
                  setTempSqlContent((value as string) || '');
                  setSqlModalVisible(true);
                };
                
                // 关闭SQL编辑器对话框
                const closeSqlModal = () => {
                  setSqlModalVisible(false);
                };
                
                // 保存SQL编辑器内容
                const saveSqlContent = () => {
                  onChange(tempSqlContent);
                  setSqlModalVisible(false);
                };
                
                return (
                  <div>
                    <div style={{ position: 'relative', marginTop: '8px' }}>
                      <Editor
                        height="200px"
                        language="sql"
                        value={(value as string) || ''}
                        onChange={(val) => onChange(val || '')}
                        onMount={(editor) => {
                          console.log('SQL内联编辑器加载完成');
                          // 编辑器加载完成后的处理
                        }}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          readOnly: false,
                        }}
                      />
                      
                      {/* 全屏编辑按钮和测试执行按钮 */}
                      <div style={{ 
                        position: 'absolute', 
                        right: 0, 
                        bottom: 0,
                        padding: '10px',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <Button
                          type="tertiary"
                          theme="solid"
                          style={{ 
                            backgroundColor: '#e8f2ff', 
                            color: '#0077ff',
                            borderColor: '#e8f2ff'
                          }}
                          onClick={openSqlModal}
                        >
                          {t('nodes.sql_executor.form.fullscreenEdit')}
                        </Button>
                        
                        <Button
                          type="primary"
                          theme="solid"
                          style={{ 
                            backgroundColor: 'red', 
                            color: '#fff',
                            borderColor: '#f4b0ab'
                          }}
                          onClick={() => {
                            // 显示测试执行结果弹窗
                            setTestExecutionVisible(true);
                          }}
                        >
                          {t('nodes.sql_executor.form.testExecute')}
                        </Button>
                      </div>
                    </div>
                    
                    <Feedback errors={fieldState?.errors} invalid={fieldState?.invalid} />
                    
                    {/* SQL全屏编辑器对话框 */}
                    <SqlEditorModal
                      visible={sqlModalVisible}
                      onCancel={closeSqlModal}
                      onOk={saveSqlContent}
                      sqlContent={tempSqlContent}
                      setSqlContent={setTempSqlContent}
                    />
                    
                    {/* SQL测试执行结果弹窗 */}
                    <SqlExecutionResultModal
                      visible={testExecutionVisible}
                      onClose={() => setTestExecutionVisible(false)}
                      sql={(value as string) || ''}
                      dataTable={form.getValueIn('inputsValues.dataTable') || ''}
                    />
                  </div>
                );
              }}
            />
          </Collapse.Panel>

          {/* 输出参数部分 */}
          <Collapse.Panel 
            header={<Typography.Text strong>{t('nodes.sql_executor.form.outputParams')}</Typography.Text>} 
            itemKey={t('nodes.sql_executor.form.outputParams')}
          >
            <OutputParamsEditor 
              paramPath="outputs"
              tooltipContent={t('nodes.sql_executor.form.sqlHeaderTooltip')}
              headerTitle={t('nodes.sql_executor.form.sqlHeaderTitle')}
              emptyText={t('nodes.sql_executor.form.emptyOutputText')}
              addButtonText={t('nodes.sql_executor.form.addOutputParam')}
            />
          </Collapse.Panel>
        </Collapse>
      </FormContent>

      {/* 数据表选择弹窗 */}
      <DataSourceSelectorModal
        visible={dbSelectorVisible}
        onClose={() => setDbSelectorVisible(false)}
        onSelect={handleTableSelect}
        currentSelected={null}
      />
    </DataSourceContext.Provider>
  );
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    // 验证SQL语句
    'inputsValues.sqlQuery': ({ value }) => {
      // 检查值是否为字符串（可能是普通字符串或表达式）
      if (typeof value === 'string' && value.trim() === '') {
        return 'SQL 语句不能为空';
      }
      // 处理表达式类型的值
      if (typeof value === 'object' && value.type === 'expression' && (!value.content || value.content.trim() === '')) {
        return 'SQL 表达式不能为空';
      }
      return undefined;
    },
    // 验证数据表选择
    'inputsValues.dataTable': ({ value }) => {
      if (typeof value === 'string' && value.trim() === '') {
        return '请选择一个数据表';
      }
      return undefined;
    },
  },
};
