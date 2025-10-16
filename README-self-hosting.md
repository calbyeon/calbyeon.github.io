# Self-Hosting the Traffic Analytics Map

This project is a static ArcGIS JavaScript application. You can serve it from any web server that can deliver static files (Apache, Nginx, IIS, etc.). The instructions below focus on a simple self-host scenario using Node.js with `http-server`, plus notes for Apache/Nginx.

## Prerequisites

- Node.js installed (https://nodejs.org)
- Git (optional, only if you want to pull updates)

## 1. Clone or copy the project

If the project is already on your machine (the files in this folder), you can skip the clone step.

```bash
# Example: using git to clone
 git clone https://github.com/yourusername/your-repo.git traffic-map
 cd traffic-map
```

## 2. Install a simple static server (Node.js example)

```bash
 npm install -g http-server
```

The `http-server` package serves static files, perfect for testing.

## 3. Serve the site locally

From the project directory:

```bash
 http-server -p 8080
```

Now, open your browser to `http://localhost:8080` – you should see the map.

*Tip:* If the map won't load, open the browser console and look for CORS or mixed-content issues. Since all assets are loaded via HTTPS CDNs, you should be fine, but some browsers block location-based content when served from `file://`.

## 4. Deploy to your self-host server

Copy all files (including `index.html`, `app/`, `styles/`, `spinner.gif`, etc.) to the web root of your server. Here are examples for common servers:

### Apache (httpd)

1. Copy files to `/var/www/html/traffic-map`.
2. Ensure the Apache site configuration points to that directory.
3. Restart Apache: `sudo systemctl restart httpd`

Example `VirtualHost` snippet:

```
<VirtualHost *:80>
    ServerName traffic.yourdomain.com
    DocumentRoot /var/www/html/traffic-map
    <Directory /var/www/html/traffic-map>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Nginx

1. Copy the files to `/var/www/traffic-map`.
2. Add a server block in `/etc/nginx/sites-available/traffic-map`:

```
server {
    listen 80;
    server_name traffic.yourdomain.com;
    root /var/www/traffic-map;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

3. Enable the site and reload nginx:

```bash
 sudo ln -s /etc/nginx/sites-available/traffic-map /etc/nginx/sites-enabled/
 sudo nginx -t
 sudo systemctl reload nginx
```

### IIS (Windows)

1. Copy the files to `C:\inetpub\wwwroot\traffic-map`.
2. In IIS Manager, create a new site or virtual directory pointing to that folder.
3. Ensure MIME types are set for `.js`, `.css`, `.gif`, etc.

## 5. Secure and configure your domain

If you want a custom domain, update DNS to point to your server’s IP and configure HTTPS (Let’s Encrypt or another cert provider).

## 6. Maintain content

Whenever you update files locally, re-deploy them to your server. If you're using git, you can deploy via git pull or automated workflows.

## Troubleshooting

- **Map wont load:** Check the browser console; ensure the ArcGIS Portal item is accessible and that you load via HTTPS.
- **Cors errors:** Serve the site via HTTP/S; opening `index.html` directly via `file://` can break the ArcGIS API.
- **Page blank:** Make sure the JS configuration (`dojoConfig`, etc.) and ArcGIS CDN links remain intact.

---

Now you can host the traffic analytics map on your own infrastructure.
