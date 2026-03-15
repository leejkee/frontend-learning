import webbrowser
import os
import http.server
import socketserver
import threading
import time

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    # 1. 在子线程中启动服务器
    daemon = threading.Thread(target=start_server, daemon=True)
    daemon.start()

    # 2. 等待一秒确保服务器已启动
    time.sleep(1)

    # 3. 打开浏览器访问 localhost
    url = f"http://localhost:{PORT}/index.html"
    webbrowser.open(url)
    print(f"Server is running on {url}. Press Ctrl+C to stop.")

    # 4. 保持主线程运行
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping server...")