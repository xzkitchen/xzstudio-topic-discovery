FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码（作为包）
COPY . ./backend

# 创建数据目录
RUN mkdir -p /app/backend/data

# 暴露端口
EXPOSE 8000

# 以模块方式启动（支持相对导入）
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
