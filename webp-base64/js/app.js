document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const thresholdSlider = document.getElementById('threshold');
    const threshVal = document.getElementById('threshVal');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('output');
    const copyBtn = document.getElementById('copyBtn');
    const sizeInfo = document.getElementById('sizeInfo');

    let originalImage = null;

    // 文件拖拽与点击上传逻辑
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        dropZone.classList.add('dragover'); 
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                // 限制最大宽度防止超大图片导致浏览器卡顿
                const MAX_WIDTH = 1200;
                let width = img.width;
                let height = img.height;
                
                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }
                
                canvas.width = width;
                canvas.height = height;
                processImage();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    thresholdSlider.addEventListener('input', (e) => {
        threshVal.textContent = e.target.value;
        if (originalImage) processImage();
    });

    function processImage() {
        // 1. 绘制原图
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        
        // 2. 提取像素矩阵进行绝对二值化
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const threshold = parseInt(thresholdSlider.value, 10);

        for (let i = 0; i < data.length; i += 4) {
            // 计算灰度
            const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];

            data[i] = data[i + 1] = data[i + 2] = 0;
            
            if (gray > threshold) {
                // 去除白底和浅灰噪点 -> 完全透明
                data[i+3] = 0; 
            } else {
                data[i+3] = 255 - gray;
            }
        }
        ctx.putImageData(imageData, 0, 0);

        // 3. 编码为 WebP 格式的 Base64
        // 0.8 的质量系数足以保证线条边缘不产生伪影
        const webpBase64 = canvas.toDataURL('image/webp', 0.8);
        
        // 4. 计算大小并生成 Markdown
        const base64Length = webpBase64.length - 'data:image/webp;base64,'.length;
        const sizeInKB = (base64Length * 0.75 / 1024).toFixed(2);
        sizeInfo.textContent = `编码后体积: ${sizeInKB} KB`;
        
        output.value = `![图片说明](${webpBase64})`;
    }

    copyBtn.addEventListener('click', () => {
        if (!output.value) return;
        navigator.clipboard.writeText(output.value);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '已复制!';
        setTimeout(() => copyBtn.textContent = originalText, 1500);
    });
});