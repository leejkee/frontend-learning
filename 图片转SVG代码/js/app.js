document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const thresholdSlider = document.getElementById("thresholdSlider");
  const speckleSlider = document.getElementById("speckleSlider");
  const thresholdValue = document.getElementById("thresholdValue");
  const speckleValue = document.getElementById("speckleValue");
  const convertBtn = document.getElementById("convertBtn");
  const copyBtn = document.getElementById("copyBtn");
  const canvas = document.getElementById("previewCanvas");
  const svgOutput = document.getElementById("svgOutput");
  const ctx = canvas.getContext("2d");

  let originalImage = null;

  // 1. 图像加载：读取本地文件并缓存 Image 对象
  imageInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        originalImage = img;
        // 初始化画布尺寸
        canvas.width = img.width;
        canvas.height = img.height;
        processImage(); // 自动应用默认阈值
        convertBtn.disabled = false;
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // 滑动条实时更新视图
  thresholdSlider.addEventListener("input", (e) => {
    thresholdValue.textContent = e.target.value;
    if (originalImage) processImage();
  });

  speckleSlider.addEventListener("input", (e) => {
    speckleValue.textContent = e.target.value;
  });

  // 2. 图像预处理：灰度化与二值化
  function processImage() {
    if (!originalImage) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuiality = 'high';

    // 每次重绘原始图像
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // 获取像素矩阵缓冲区
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const threshold = parseInt(thresholdSlider.value, 10);

    // 遍历像素进行阈值截断去噪
    for (let i = 0; i < data.length; i += 4) {
      // 人眼感知灰度公式
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

      // 超过阈值的区域强制转为透明（白色背景视为透明，只保留黑色线条）
      // 如果你需要白底黑线，可以修改这里的逻辑
      if (gray > threshold) {
        data[i + 3] = 0; // Alpha 设为 0 (全透明)
      } else {
        data[i] = 0; // R
        data[i + 1] = 0; // G
        data[i + 2] = 0; // B
        data[i + 3] = 255; // Alpha 设为 255 (不透明纯黑)
      }
    }

    // 将处理后的缓冲区写回 Canvas 提供预览，并作为下一步的输入源
    ctx.putImageData(imageData, 0, 0);
  }

  // 3. 矢量化追踪：将处理干净的像素阵列转为 SVG
  convertBtn.addEventListener("click", () => {
    if (!originalImage) return;

    const speckle = parseInt(speckleSlider.value, 10);

    // 获取当前 Canvas 上的二值化像素数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // ImageTracer 的配置参数
    const options = {
      ltres: 0.1, // 线性追踪阈值 (精度)
      qtres: 1, // 二次样条追踪阈值
      pathomit: speckle, // 过滤掉面积小于该值的噪点路径
      colorsampling: 0, // 关闭自动色彩采样
      numberofcolors: 2, // 强制限定为 2 色
      scale: 1, // 缩放比例
      strokewidth: 0, // 不使用描边，完全使用填充
    };

    // 执行转换 (阻塞式运算，如果图片极大可以考虑 Web Worker)
    const svgString = ImageTracer.imagedataToSVG(imageData, options);
    svgOutput.value = svgString;
  });

  // 4. 复制到剪贴板
  copyBtn.addEventListener("click", () => {
    if (!svgOutput.value) return;
    navigator.clipboard.writeText(svgOutput.value).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "复制成功!";
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    });
  });
});
