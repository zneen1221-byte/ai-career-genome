-- ============================================================
-- user.sql - 用户域建表（User / Answer / Report）
-- 数据库：MySQL，字符集 utf8mb4
-- 对应 SPEC §7
-- ============================================================

SET NAMES utf8mb4;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  openid      VARCHAR(64)  NOT NULL UNIQUE COMMENT '微信openid',
  nickname    VARCHAR(64)  DEFAULT NULL COMMENT '昵称',
  avatar      VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  age         INT          DEFAULT NULL COMMENT '年龄',
  career      VARCHAR(64)  DEFAULT NULL COMMENT '职业',
  experience  VARCHAR(64)  DEFAULT NULL COMMENT '工作经验',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 答案表
CREATE TABLE IF NOT EXISTS answers (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '答案ID',
  user_id     BIGINT  NOT NULL COMMENT '用户ID',
  question_id INT     NOT NULL COMMENT '题目ID',
  answer      VARCHAR(4) DEFAULT NULL COMMENT '用户答案(A/B/C/D)',
  score       INT     DEFAULT 0 COMMENT '得分',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='答案表';

-- 报告表
CREATE TABLE IF NOT EXISTS reports (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '报告ID',
  user_id     BIGINT NOT NULL COMMENT '用户ID',
  personality VARCHAR(2) DEFAULT NULL COMMENT '人格类型(C/S/I/B/M/E)',
  content     JSON   DEFAULT NULL COMMENT '报告内容(AI生成JSON)',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报告表';
