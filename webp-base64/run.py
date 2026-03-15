import webbrowser
import os

def open_local_index():
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # 拼接 index.html 的路径
    index_path = os.path.join(script_dir, "index.html")
    url = f"file://{index_path}"
    webbrowser.open(url)
    print(f"Opened {url}")

if __name__ == "__main__":
    open_local_index()
