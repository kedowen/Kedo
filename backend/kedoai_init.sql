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




DROP TABLE IF EXISTS `bas_dataitem`;
CREATE TABLE `bas_dataitem`  (
  `F_ItemId` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `F_ParentId` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_ItemCode` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_ItemName` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_IsTree` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_IsNav` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_SortCode` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_CreateUserId` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_DeleteMark` int NULL DEFAULT NULL,
  `F_EnabledMark` int NULL DEFAULT NULL,
  `F_Description` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_ModifyUserId` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_CreateDate` datetime NULL DEFAULT NULL,
  `F_DeleteUserId` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_DeleteDate` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`F_ItemId`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;


INSERT INTO `bas_dataitem` VALUES ('08dc3731-a3d3-4c21-8792-08755af7c291', NULL, 'Language', 'Language', NULL, NULL, NULL, NULL, 0, 1, NULL, NULL, '2025-05-15 16:03:42', NULL, NULL);
INSERT INTO `bas_dataitem` VALUES ('08dc3731-a3d3-4c21-8792-08755af7c297', NULL, 'DataSourceType', 'DataSourceType', NULL, NULL, NULL, NULL, 0, 1, NULL, NULL, '2025-05-15 16:03:53', NULL, NULL);
INSERT INTO `bas_dataitem` VALUES ('08dc3769-27b5-4dc3-89e2-beec5a4d7d18', NULL, 'KnowledgeType', 'KnowledgeType', NULL, NULL, NULL, NULL, 0, 1, NULL, NULL, '2025-05-15 16:03:56', NULL, NULL);
INSERT INTO `bas_dataitem` VALUES ('08dc3769-27b5-4dc3-89e2-beec5a4d7d19', NULL, 'GPTModel', 'GPTModel', NULL, NULL, NULL, NULL, 0, 1, NULL, NULL, '2025-05-15 16:03:59', NULL, NULL);
INSERT INTO `bas_dataitem` VALUES ('08dc3769-27b5-4dc3-89e2-beec5a4d7d20', NULL, 'GPTIMG', 'GPTIMG', NULL, NULL, NULL, NULL, 0, 1, NULL, NULL, '2025-05-15 16:04:05', NULL, NULL);


DROP TABLE IF EXISTS `bas_dataitemdetail`;
CREATE TABLE `bas_dataitemdetail`  (
  `F_ItemDetailId` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `F_ItemId` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_ParentId` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_ItemCode` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_ItemName` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `F_ItemValue` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_QuickQuery` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_SimpleSpelling` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_IsDefault` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_CreateUserId` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_DeleteMark` int NULL DEFAULT NULL,
  `F_EnabledMark` int NULL DEFAULT NULL,
  `F_Description` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_ModifyUserId` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_CreateDate` datetime NULL DEFAULT NULL,
  `F_DeleteUserId` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `F_DeleteDate` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`F_ItemDetailId`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;


INSERT INTO `bas_dataitemdetail` VALUES ('08dc3731-a3d3-4c21-8792-08755af7c212', '08dc3769-27b5-4dc3-89e2-beec5a4d7d19', NULL, 'GPTModel', 'GPT', 'gpt-4o', NULL, NULL, NULL, NULL, 0, 1, NULL, NULL, '2025-05-15 16:12:11', NULL, '2025-05-15 16:11:49');
INSERT INTO `bas_dataitemdetail` VALUES ('08dc3731-a3d3-4c21-8792-08755af7c213', '08dc3769-27b5-4dc3-89e2-beec5a4d7d19', NULL, 'GPTModel', 'GPT', 'gpt-4.1', NULL, NULL, NULL, NULL, 0, 1, NULL, NULL, '2025-05-15 16:12:14', NULL, '2025-05-15 16:11:52');
INSERT INTO `bas_dataitemdetail` VALUES ('08dc3731-a3d3-4c21-8792-08755af7c215', '08dc3769-27b5-4dc3-89e2-beec5a4d7d19', NULL, 'GPTModel', 'CLAUDE', 'claude-3-7-sonnet-20250219', NULL, NULL, NULL, NULL, 0, 1, NULL, NULL, '2025-05-15 16:12:23', NULL, '2025-05-15 16:11:55');
INSERT INTO `bas_dataitemdetail` VALUES ('08dc3731-a3d3-4c21-8792-08755af7c216', '08dc3769-27b5-4dc3-89e2-beec5a4d7d19', NULL, 'GPTModel', 'QIANWEN', 'qwen-long', NULL, NULL, NULL, NULL, 0, 1, NULL, NULL, '2025-05-15 16:12:28', NULL, '2025-05-15 16:11:58');
INSERT INTO `bas_dataitemdetail` VALUES ('08dc3731-a3d3-4c21-8792-08755af7c220', '08dc3769-27b5-4dc3-89e2-beec5a4d7d19', NULL, 'GPTModel', 'DEEPSEEK', 'deepseek-chat', NULL, NULL, NULL, NULL, 0, 1, NULL, NULL, '2025-05-15 16:12:31', NULL, '2025-05-15 16:12:00');
INSERT INTO `bas_dataitemdetail` VALUES ('08dc3731-a3d3-4c21-8792-08755af7c221', '08dc3769-27b5-4dc3-89e2-beec5a4d7d20', NULL, 'GPTIMG', 'JIMENG', 'JIMENG', NULL, NULL, NULL, NULL, 0, 1, NULL, NULL, '2025-05-15 16:12:34', NULL, '2025-05-15 16:12:03');
INSERT INTO `bas_dataitemdetail` VALUES ('08dc3731-a3d3-4c21-8792-08755af7c259', '08dc3769-27b5-4dc3-89e2-beec5a4d7d20', NULL, 'GPTIMG', 'gpt-4o-image', 'gpt-4o-image', NULL, NULL, NULL, NULL, 0, 1, NULL, NULL, '2025-05-15 16:12:36', NULL, '2025-05-15 16:12:06');
INSERT INTO `bas_dataitemdetail` VALUES ('08dc3731-a3d3-4c21-8792-08755af7c299', '08dc3731-a3d3-4c21-8792-08755af7c297', NULL, 'DataSourceType', 'MYSQL', 'MYSQL', NULL, NULL, NULL, NULL, 0, 1, NULL, NULL, '2025-05-15 16:12:39', NULL, '2025-05-15 16:12:08');

DROP TABLE IF EXISTS `bas_datasource`;
CREATE TABLE `bas_datasource`  (
  `F_Id` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `F_DataSourceTypeId` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `F_Caption` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `F_Ip` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `F_Port` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `F_DBName` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `F_DataSourceUserId` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `F_Pwd` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `F_Remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `F_ConnectionString` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `F_CreateUserId` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `F_CreateDate` datetime NULL DEFAULT NULL,
  `F_DeleteMark` int NULL DEFAULT NULL,
  `F_EnabledMark` int NULL DEFAULT NULL,
  `F_DeleteUserId` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `F_DeleteDate` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`F_Id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

INSERT INTO `bas_datasource` VALUES ('50db3c78-7462-4203-a1b8-bb8f9c48c754', '08dc3731-a3d3-4c21-8792-08755af7c299', 'dblink', 'Server= **,2433;Database=P*P;User ID=sa;Password=*@#4;', '02344765-54e9-4831-841b-366f1f47bd8e', '2024/3/24 22:37', '0', '1', '02344765-54e9-4831-841b-366f1f47bd8e', '2024/4/21 1:39', '', '2025-05-15 17:38:04', 0, 1, '', '2025-05-15 17:38:18');
