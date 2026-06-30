## nginx配置

### 配置文件 abb-front
```
server {
    listen 10001;
    server_name _;

    root /home/abb_front;
    index index.html;

    # Vue 前端
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端接口（Spring Boot）
    location /abb-front/ {
        proxy_pass http://127.0.0.1:20001/abb/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

                proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 注意事项

- ubuntu系统下，sites-available下添加了配置文件后，要执行下面的命令，启用站点
```
sudo ln -s /etc/nginx/sites-available/abb-front /etc/nginx/sites-enabled/
```