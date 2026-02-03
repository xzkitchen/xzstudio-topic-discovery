#!/bin/bash
set -e

# 设置默认端口
export PORT=${PORT:-80}

# 用环境变量替换 nginx 配置中的端口（直接覆盖主配置）
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# 创建 supervisor 日志目录
mkdir -p /var/log/supervisor

# 启动 supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
