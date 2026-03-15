document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        dropZone: document.getElementById('dropZone'),
        fileInput: document.getElementById('fileInput'),
        threshold: document.getElementById('threshold'),
        threshVal: document.getElementById('threshVal'),
        levels: document.getElementById('levels'),
        levelsVal: document.getElementById('levelsVal'),
        quality: document.getElementById('quality'),
        qualityVal: document.getElementById('qualityVal'),
        canvas: document.getElementById('canvas'),
        output: document.getElementById('output'),
        sizeInfo: document.getElementById('sizeInfo'),
        copyBtn: document.getElementById('copyBtn')
    };

    const ctx = elements.canvas.getContext('2d', { willReadFrequently: true });
    let originalImage = null;
    let debounceTimer = null;

    function processImage() {
        if (!originalImage) return;

        ctx.drawImage(originalImage, 0, 0, elements.canvas.width, elements.canvas.height);
        
        const imageData = ctx.getImageData(0, 0, elements.canvas.width, elements.canvas.height);
        const data = imageData.data;
        
        // 读取三个控制参数
        const thresh = parseInt(elements.threshold.value, 10);
        const levelsCount = parseInt(elements.levels.value, 10);
        const webpQuality = parseFloat(elements.quality.value);
        
        // 计算阶梯步长
        const step = 255 / levelsCount;

        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
            
            data[i] = 0;
            data[i+1] = 0;
            data[i+2] = 0;
            
            if (gray > thresh) {
                data[i+3] = 0;
            } else {
                // 核心：动态阶梯化 Alpha 通道
                const alpha = 255 - gray;
                data[i+3] = Math.round(alpha / step) * step;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);

        // 应用动态 WebP 质量系数
        const webpBase64 = elements.canvas.toDataURL('image/webp', webpQuality);
        
        elements.output.value = `![图片](${webpBase64})`;
        const kb = ((webpBase64.length - 23) * 0.75 / 1024).toFixed(2);
        elements.sizeInfo.textContent = `编码后体积: ${kb} KB`;
    }

    // 统一绑定滑块的防抖监听
    const bindSlider = (element, valElement, formatFunc) => {
        element.addEventListener('input', (e) => {
            valElement.textContent = formatFunc ? formatFunc(e.target.value) : e.target.value;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(processImage, 50);
        });
    };

    bindSlider(elements.threshold, elements.threshVal);
    bindSlider(elements.levels, elements.levelsVal);
    bindSlider(elements.quality, elements.qualityVal, (v) => parseFloat(v).toFixed(1));

    // --- 文件交互逻辑 ---
    function handleFile(file) {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                const MAX_WIDTH = 1200;
                let width = img.width;
                let height = img.height;
                
                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }
                
                elements.canvas.width = width;
                elements.canvas.height = height;
                processImage();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    
    elements.dropZone.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        elements.dropZone.classList.add('dragover'); 
    });
    
    elements.dropZone.addEventListener('dragleave', () => {
        elements.dropZone.classList.remove('dragover');
    });
    
    elements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
        e.target.value = '';
    });

    elements.copyBtn.addEventListener('click', () => {
        if (!elements.output.value) return;
        navigator.clipboard.writeText(elements.output.value);
        const originalText = elements.copyBtn.textContent;
        elements.copyBtn.textContent = '已复制!';
        setTimeout(() => elements.copyBtn.textContent = originalText, 1500);
    });
});