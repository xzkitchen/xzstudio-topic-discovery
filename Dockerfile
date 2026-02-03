# ============================================
# XZstudio 全栈 Dockerfile
# 单个容器同时运行前端 + 后端
# ============================================

# ---- 阶段1：构建前端 ----
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# ---- 阶段2：运行环境 ----
FROM python:3.11-slim

# 安装 nginx、supervisor 和 envsubst
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    gettext-base \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 安装 Python 依赖
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/ ./backend/

# 复制前端构建产物
COPY --from=frontend-builder /frontend/dist /var/www/html

# 创建数据目录和日志目录
RUN mkdir -p /app/backend/data /var/log/supervisor

# 复制配置文件（nginx.conf 作为模板）
COPY deploy/nginx.conf /etc/nginx/nginx.conf.template
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY deploy/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# 使用启动脚本（处理动态端口）
CMD ["/app/start.sh"]
