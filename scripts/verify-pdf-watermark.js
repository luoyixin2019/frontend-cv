#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
    console.log('PDF 水印校验工具');
    console.log('');
    console.log('用法: node verify-pdf-watermark.js <pdf文件路径>');
    console.log('');
    console.log('示例:');
    console.log('  node verify-pdf-watermark.js /Users/bytedance/Downloads/luoyixin.pdf');
    process.exit(1);
}

if (!fs.existsSync(filePath)) {
    console.log('❌ 文件不存在: ' + filePath);
    process.exit(1);
}

const data = fs.readFileSync(filePath);

const titleMatch = data.toString('latin1').match(/Title\s*<FEFF([0-9A-Fa-f]+)>/);

if (!titleMatch) {
    console.log('❌ PDF 中未找到 Title 字段');
    process.exit(0);
}

const hexStr = titleMatch[1];
let title = '';
for (let i = 0; i < hexStr.length; i += 4) {
    const code = parseInt(hexStr.substr(i, 4), 16);
    title += String.fromCharCode(code);
}

const wmMatch = title.match(/\| wm:(.+)$/);

if (wmMatch) {
    console.log('✅ 检测到 PDF 水印！');
    console.log('   接收方标识: ' + wmMatch[1]);
    console.log('   完整 Title: ' + title);
} else {
    console.log('❌ PDF Title 中未检测到水印标记');
    console.log('   Title 内容: ' + title);
}
