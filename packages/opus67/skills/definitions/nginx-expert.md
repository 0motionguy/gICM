# Nginx Expert

> **ID:** `nginx-expert`
> **Tier:** 2
> **Token Cost:** 5500
> **MCP Connections:** None

## What This Skill Does

Provides expert-level Nginx configuration knowledge for building production-ready web servers, reverse proxies, load balancers, and API gateways. Covers SSL/TLS termination, caching strategies, rate limiting, security hardening, and performance optimization for high-traffic applications.

This skill enables you to:
- Configure reverse proxies for Node.js, Python, Go, and other backend services
- Implement SSL/TLS with automatic certificate renewal via Let's Encrypt
- Set up intelligent caching layers to reduce backend load
- Apply rate limiting and DDoS protection
- Configure security headers for OWASP compliance
- Optimize Nginx for high-concurrency workloads
- Deploy Nginx in Docker/Kubernetes environments

## When to Use

Invoke this skill when you need to:

- **Set up reverse proxy** for Node.js, FastAPI, Rails, or other backend services
- **Configure SSL/TLS** with Let's Encrypt, custom certificates, or wildcard certs
- **Implement caching** to reduce database queries and API calls
- **Add rate limiting** to prevent abuse and DDoS attacks
- **Harden security** with CORS, CSP, HSTS, and other headers
- **Load balance** across multiple backend instances
- **Optimize performance** for high-traffic production environments
- **Troubleshoot** 502 Bad Gateway, 504 Gateway Timeout, or SSL errors
- **Migrate from Apache** or other web servers to Nginx
- **Dockerize Nginx** with dynamic configuration and health checks

## Core Capabilities

### 1. Reverse Proxy Configuration

#### Basic Reverse Proxy

The most common Nginx use case: proxying requests to a backend service.

```nginx
# /etc/nginx/sites-available/myapp
server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Upstream Configuration with Health Checks

```nginx
# Define upstream servers
upstream api_backend {
    # Load balancing method (default is round-robin)
    least_conn;  # Route to server with least connections

    # Backend servers
    server 10.0.1.10:3000 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:3000 weight=2 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3000 weight=1 max_fails=3 fail_timeout=30s;
    server 10.0.1.13:3000 backup;  # Only used if others fail

    # Keep connections alive
    keepalive 32;
    keepalive_requests 100;
    keepalive_timeout 60s;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://api_backend;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
        proxy_next_upstream_tries 3;
        proxy_next_upstream_timeout 10s;

        # Connection settings
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
}
```

#### Load Balancing Methods

```nginx
# Round Robin (default) - Distribute evenly
upstream backend_rr {
    server server1.example.com;
    server server2.example.com;
    server server3.example.com;
}

# Least Connections - Route to least busy server
upstream backend_lc {
    least_conn;
    server server1.example.com;
    server server2.example.com;
    server server3.example.com;
}

# IP Hash - Same client always goes to same server (sticky sessions)
upstream backend_ip {
    ip_hash;
    server server1.example.com;
    server server2.example.com;
    server server3.example.com;
}

# Generic Hash - Custom key for session persistence
upstream backend_hash {
    hash $request_uri consistent;
    server server1.example.com;
    server server2.example.com;
    server server3.example.com;
}

# Weighted Load Balancing
upstream backend_weighted {
    server server1.example.com weight=5;  # Gets 5x more requests
    server server2.example.com weight=2;
    server server3.example.com weight=1;
}
```

#### WebSocket Support

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream websocket_backend {
    server localhost:3000;
    server localhost:3001;
}

server {
    listen 80;
    server_name ws.example.com;

    location /ws {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # WebSocket-specific timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
}
```

### 2. SSL/TLS Termination

#### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate (automatically configures Nginx)
sudo certbot --nginx -d example.com -d www.example.com

# Or use standalone mode (requires port 80 free)
sudo certbot certonly --standalone -d example.com -d www.example.com

# Test automatic renewal
sudo certbot renew --dry-run

# Automatic renewal is set up via systemd timer or cron
# Check: systemctl list-timers | grep certbot
```

#### Manual SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    # Certificate files
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;

    # SSL protocols and ciphers (Mozilla Modern profile)
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # SSL session cache
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # Diffie-Hellman parameter
    ssl_dhparam /etc/nginx/dhparam.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### HTTP to HTTPS Redirect

```nginx
# Redirect all HTTP to HTTPS
server {
    listen 80;
    server_name example.com www.example.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect everything else to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}
```

### 3. Caching Strategies

#### Proxy Cache Configuration

```nginx
# Define cache path
proxy_cache_path /var/cache/nginx/api
    levels=1:2
    keys_zone=api_cache:10m
    max_size=1g
    inactive=60m;

server {
    listen 80;
    server_name api.example.com;

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_cache api_cache;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
        proxy_cache_bypass $http_cache_control;
        add_header X-Cache-Status $upstream_cache_status;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    }
}
```

### 4. Rate Limiting

```nginx
# Define rate limit zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    listen 80;
    server_name api.example.com;

    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        limit_req_status 429;
        proxy_pass http://localhost:3000;
    }
}
```

### 5. Security Headers

```nginx
# Comprehensive security headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval';" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
server_tokens off;
```

### 6. Location Block Patterns

```nginx
server {
    listen 80;
    server_name example.com;

    # Exact match
    location = / {
        proxy_pass http://localhost:3000/home;
    }

    # Prefix match
    location /api/ {
        proxy_pass http://localhost:3001;
    }

    # Regex match
    location ~ ^/user/\d+$ {
        proxy_pass http://localhost:3002;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Real-World Examples

### Example 1: Production Node.js App Config

Complete Nginx configuration for a production Node.js application with SSL, caching, rate limiting, and security headers.

**Main nginx.conf:**

```nginx
# /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log warn;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 100;
    reset_timedout_connection on;

    # Buffer sizes
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 8k;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "MSIE [1-6]\.";

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

    # Proxy cache
    proxy_cache_path /var/cache/nginx/api
        levels=1:2
        keys_zone=api_cache:10m
        max_size=1g
        inactive=60m
        use_temp_path=off;

    # Include site configs
    include /etc/nginx/sites-enabled/*;
}
```

**Site configuration:**

```nginx
# /etc/nginx/sites-available/nodejs-app

# Upstream backend
upstream nodejs_backend {
    least_conn;
    server localhost:3000 max_fails=3 fail_timeout=30s;
    server localhost:3001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect to HTTPS
    location / {
        return 301 https://example.com$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.com www.example.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 1.1.1.1 1.0.0.1 valid=300s;
    resolver_timeout 5s;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/example.com.access.log main;
    error_log /var/log/nginx/example.com.error.log warn;

    # Connection limits
    limit_conn conn_limit 20;

    # Root for static files
    root /var/www/example.com/public;

    # Static assets with long cache
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API endpoints with rate limiting and caching
    location /api/ {
        # Rate limiting
        limit_req zone=api_limit burst=50 nodelay;
        limit_req_status 429;

        # Proxy cache
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_valid 404 1m;
        proxy_cache_bypass $http_cache_control $http_authorization;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_lock on;
        add_header X-Cache-Status $upstream_cache_status;

        # Proxy to Node.js
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Error handling
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
        proxy_next_upstream_tries 2;
    }

    # Login endpoint with stricter rate limit
    location /api/auth/login {
        limit_req zone=login_limit burst=5;
        limit_req_status 429;
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_no_cache 1;
        proxy_cache_bypass 1;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://nodejs_backend;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/example.com/errors;
        internal;
    }
}
```

**Deployment script:**

```bash
#!/bin/bash
# deploy-nginx.sh

# Install Nginx
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Create directories
sudo mkdir -p /var/www/example.com/public
sudo mkdir -p /var/www/example.com/errors
sudo mkdir -p /var/www/certbot
sudo mkdir -p /var/cache/nginx/api

# Copy config
sudo cp nodejs-app /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/nodejs-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Obtain SSL certificate
sudo certbot --nginx -d example.com -d www.example.com \
  --non-interactive --agree-tos -m admin@example.com

# Reload Nginx
sudo systemctl reload nginx

# Set up auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo "Nginx deployed successfully!"
```

## Related Skills

- **docker-expert** - Containerization and Docker Compose orchestration
- **linux-sysadmin** - Server hardening, systemd, and system configuration
- **nodejs-backend-patterns** - Building backend services to proxy
- **api-scaffolding:fastapi-templates** - Python FastAPI services behind Nginx
- **security-scanning:sast-configuration** - Security scanning for web servers
- **cicd-automation:deployment-pipeline-design** - Automated Nginx deployment

## Further Reading

### Official Documentation
- [Nginx Documentation](https://nginx.org/en/docs/) - Official Nginx documentation
- [Nginx Admin Guide](https://docs.nginx.com/nginx/admin-guide/) - Comprehensive admin guide

### Security Resources
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/) - Generate secure SSL configs
- [Qualys SSL Labs](https://www.ssllabs.com/ssltest/) - Test SSL configuration
- [Security Headers](https://securityheaders.com/) - Check security headers

### Let's Encrypt
- [Certbot Documentation](https://certbot.eff.org/docs/) - Let's Encrypt automation
- [Let's Encrypt Rate Limits](https://letsencrypt.org/docs/rate-limits/) - Certificate limits

### Advanced Topics
- [Nginx Load Balancing](https://docs.nginx.com/nginx/admin-guide/load-balancer/) - Load balancing methods
- [OpenResty](https://openresty.org/en/) - Nginx + LuaJIT for dynamic behavior

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
