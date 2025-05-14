USE `kedoai`;

-- 用户表
CREATE TABLE `bas_user` (
  `F_UserId` varchar(50) NOT NULL COMMENT '用户ID',
  `F_Account` varchar(100) DEFAULT NULL COMMENT '账号',
  `F_Password` varchar(100) DEFAULT NULL COMMENT '密码',
  `F_Secretkey` varchar(50) DEFAULT NULL COMMENT '密钥',
  `F_UserName` varchar(255) DEFAULT NULL COMMENT '用户名',
  `F_Mobile` varchar(20) DEFAULT NULL COMMENT '手机号',
  `F_IndustryCategory` varchar(50) DEFAULT NULL COMMENT '行业分类',
  `F_Job` varchar(100) DEFAULT NULL COMMENT '职位',
  `F_TenantId` varchar(100) DEFAULT NULL COMMENT '租户ID',
  `F_CreateUserId` varchar(50) DEFAULT NULL COMMENT '创建人ID',
  `F_DeleteMark` int DEFAULT NULL COMMENT '删除标记',
  `F_EnabledMark` int DEFAULT NULL COMMENT '启用标记',
  `F_Description` varchar(255) DEFAULT NULL COMMENT '描述',
  `F_ModifyUserId` varchar(50) DEFAULT NULL COMMENT '修改人ID',
  `F_CreateDate` datetime DEFAULT NULL COMMENT '创建日期',
  `F_DeleteUserId` varchar(50) DEFAULT NULL COMMENT '删除人ID',
  `F_DeleteDate` datetime DEFAULT NULL COMMENT '删除日期',
  `F_IsPwdSetted` int DEFAULT NULL COMMENT '是否设置密码',
  `F_OnionCoin` int DEFAULT NULL COMMENT '洋葱币',
  `F_HeadImgurl` longtext COMMENT '头像URL',
  `F_HeadIcon` varchar(45) DEFAULT NULL COMMENT '头像图标',
  `F_Nickname` varchar(45) DEFAULT NULL COMMENT '昵称',
  `F_OpenId` varchar(45) DEFAULT NULL COMMENT '开放ID',
  `F_UnionId` varchar(45) DEFAULT NULL COMMENT '联合ID',
  `F_CompanyName` varchar(200) DEFAULT NULL COMMENT '公司名称',
  `F_DepartmentName` varchar(45) DEFAULT NULL COMMENT '部门名称',
  `F_Email` varchar(45) DEFAULT NULL COMMENT '邮箱',
  `F_Gender` varchar(45) DEFAULT NULL COMMENT '性别',
  `F_IsMember` int DEFAULT '0' COMMENT '是否会员',
  `F_FromDate` date DEFAULT NULL COMMENT '开始日期',
  `F_EndDate` date DEFAULT NULL COMMENT '结束日期',
  `F_LimitedCount` int DEFAULT '10000' COMMENT '限制次数',
  `F_ConsumedTotalTokens` int DEFAULT '0' COMMENT '已消耗令牌数',
  `F_UsedCount` int DEFAULT '0' COMMENT '使用次数',
  `F_CreatedDate` datetime DEFAULT NULL COMMENT '创建日期',
  `F_Tokens` int DEFAULT '10000' COMMENT '令牌数',
  `F_ModifyDate` datetime DEFAULT NULL COMMENT '修改日期',
  `F_HeadImgData` blob COMMENT '头像数据',
  `F_AppId` varchar(45) DEFAULT NULL COMMENT '应用ID',
  `F_Secret` varchar(45) DEFAULT NULL COMMENT '应用密钥',
  `F_ThirdPartyUserId` varchar(45) DEFAULT NULL COMMENT '第三方用户ID',
  PRIMARY KEY (`F_UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基础用户表';

-- 用户头像表
CREATE TABLE `bas_user_headicon` (
  `F_Id` varchar(50) NOT NULL COMMENT 'ID',
  `F_HeadImgData` blob COMMENT '头像数据',
  PRIMARY KEY (`F_Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户头像表';

INSERT INTO bas_user (
    F_UserId, F_Account, F_Password, F_Secretkey, F_UserName, F_Mobile, 
    F_IndustryCategory, F_Job, F_TenantId, F_CreateUserId, F_DeleteMark, 
    F_EnabledMark, F_Description, F_ModifyUserId, F_CreateDate, 
    F_DeleteUserId, F_DeleteDate, F_IsPwdSetted, F_OnionCoin, 
    F_HeadImgurl, F_HeadIcon, F_Nickname, F_OpenId, F_UnionId, 
    F_CompanyName, F_DepartmentName, F_Email, F_Gender, F_IsMember, 
    F_FromDate, F_EndDate, F_LimitedCount, F_ConsumedTotalTokens, 
    F_UsedCount, F_CreatedDate, F_Tokens, F_ModifyDate, F_HeadImgData, 
    F_AppId, F_Secret, F_ThirdPartyUserId
) VALUES (
    '37ba46f3-e95b-418a-a535-569bc5a7cf6r', -- UUID主键
    '15188886666',                          -- 账户名
    'f66443a97ef72c1e4041687d622185b6',      -- 加密密码
    '1dcd9d45f9a357aa',                      -- 密钥
    NULL,                                     -- 用户名(空)
    NULL,                                     -- 手机号(空)
    NULL,                                     -- 行业分类(空)
    NULL,                                     -- 职位(空)
    NULL,                                     -- 租户ID（需修正字段名冲突）
    NULL,                                     -- 创建人ID(空)
    0,                                        -- 删除标记(未删除)
    1,                                        -- 启用状态(启用)
    'UserRegist',                             -- 描述信息
    NULL,                                     -- 修改人ID(空)
    '2025-05-14 13:56:47',                   -- 创建日期
    NULL,                                     -- 删除人ID(空)
    NULL,                                     -- 删除日期(空)
    1,                                        -- 密码设置状态(已设置)
    100,                                      -- 洋葱币数量
    NULL,                                     -- 头像URL(空)
    NULL,                                     -- 图标地址(空)
    NULL,                                     -- 昵称(空)
    NULL,                                     -- OpenID(空)
    NULL,                                     -- UnionID(空)
    NULL,                                     -- 公司名称(空)
    NULL,                                     -- 部门名称(空)
    NULL,                                     -- 邮箱(空)
    NULL,                                     -- 性别(空)
    0,                                        -- 会员状态(非会员)
    NULL,                                     -- 有效期开始(空)
    NULL,                                     -- 有效期结束(空)
    0,                                        -- 限制次数(无限制)
    0,                                        -- 消耗令牌数(未消耗)
    0,                                        -- 已使用次数(未使用)
    NULL,                                     -- 创建日期(空)
    10000,                                    -- 初始令牌数
    NULL,                                     -- 修改日期(空)
    NULL,                                     -- 图片数据(空)
    NULL,                                     -- AppID(空)
    NULL,                                     -- 密钥(空)
    NULL                                      -- 第三方用户ID(需补全)
);


-- 洋葱流程方案数据表
CREATE TABLE `onionflow_schemedata` (
  `F_Id` varchar(50) NOT NULL COMMENT 'ID',
  `F_Caption` varchar(255) DEFAULT NULL COMMENT '标题',
  `F_Url` varchar(500) DEFAULT NULL COMMENT 'URL',
  `F_CreateUserId` varchar(50) DEFAULT NULL COMMENT '创建人ID',
  `F_IndustryCategory` varchar(50) DEFAULT NULL COMMENT '行业分类',
  `F_DeleteMark` int DEFAULT NULL COMMENT '删除标记',
  `F_EnabledMark` int DEFAULT NULL COMMENT '启用标记',
  `F_Description` varchar(255) DEFAULT NULL COMMENT '描述',
  `F_ModifyUserId` varchar(50) DEFAULT NULL COMMENT '修改人ID',
  `F_CreateDate` datetime DEFAULT NULL COMMENT '创建日期',
  `F_DeleteUserId` varchar(50) DEFAULT NULL COMMENT '删除人ID',
  `F_DeleteDate` datetime DEFAULT NULL COMMENT '删除日期',
  `F_OnionFlowSchemeImgId` varchar(45) DEFAULT NULL COMMENT '洋葱流方案图片ID',
  `F_OnionFlowSchemeData` longtext COMMENT '洋葱流方案数据',
  `F_OnionFlowFileData` longtext COMMENT '洋葱流文件数据',
  `F_Type` varchar(45) DEFAULT NULL COMMENT '类型',
  `F_OnionFlowSize` varchar(45) DEFAULT NULL COMMENT '洋葱流大小',
  `F_TeamId` varchar(45) DEFAULT NULL COMMENT '团队ID',
  `F_TeamOnionFlowFileGroup` varchar(45) DEFAULT NULL COMMENT '团队洋葱流文件组',
  `F_CreatorUserId` varchar(45) DEFAULT NULL COMMENT '创建者用户ID',
  `F_FlowPara` longtext COMMENT '流程参数',
  `F_ImgUrl` varchar(2000) DEFAULT NULL COMMENT '图片URL',
  PRIMARY KEY (`F_Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='洋葱流方案数据表';

-- 洋葱流程方案历史版本表
CREATE TABLE `onionflow_schemedata_hisversion` (
  `F_Id` varchar(45) NOT NULL COMMENT 'ID',
  `F_OnionFlowId` varchar(45) DEFAULT NULL COMMENT '洋葱流ID',
  `F_Caption` varchar(45) DEFAULT NULL COMMENT '标题',
  `F_OnionFlowSchemeData` varchar(45) DEFAULT NULL COMMENT '洋葱流方案数据',
  `F_IsMasterVersion` varchar(45) DEFAULT NULL COMMENT '是否主版本',
  `F_DeleteMark` int DEFAULT NULL COMMENT '删除标记',
  `F_EnabledMark` int DEFAULT NULL COMMENT '启用标记',
  `F_CreateDate` datetime DEFAULT NULL COMMENT '创建日期',
  `F_CreateUserId` varchar(45) DEFAULT NULL COMMENT '创建人ID',
  PRIMARY KEY (`F_Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='洋葱流方案历史版本表';