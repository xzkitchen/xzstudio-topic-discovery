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

# 安装 nginx 和 supervisor
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 安装 Python 依赖
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/ ./backend/

# 复制前端构建产物
COPY --from=frontend-builder /frontend/dist /var/www/html

# 创建数据目录
RUN mkdir -p /app/backend/data

# 复制配置文件
COPY deploy/nginx.conf /etc/nginx/sites-available/default
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 暴露端口
EXPOSE 80

# 使用 supervisor 同时运行 nginx 和 uvicorn
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
