#!/usr/bin/env node

function decodeFromZeroWidth(zwStr) {
    const ZW_CHARS = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
    let result = '';
    for (let i = 0; i + 8 <= zwStr.length; i += 8) {
        const seg = zwStr.slice(i, i + 8);
        const quads = seg.split('').map(c => ZW_CHARS.indexOf(c));
        if (quads.some(q => q === -1)) continue;
        const code = parseInt(quads.join(''), 4);
        result += String.fromCharCode(code);
    }
    return result;
}

function extractZeroWidth(text) {
    return text.split('').filter(c => ['\u200B', '\u200C', '\u200D', '\uFEFF'].includes(c)).join('');
}

function extractFirstWatermark(decoded) {
    const match = decoded.match(/CV:([^:]+):(\d{4}-\d{2}-\d{2})/);
    if (match) {
        return { recipient: match[1], date: match[2], raw: match[0] };
    }
    return null;
}

function showHelp() {
    console.log('简历零宽字符水印解码工具');
    console.log('');
    console.log('用法:');
    console.log('  1. 命令行参数:  node decode-watermark.js "粘贴的文本"');
    console.log('  2. 管道输入:    pbpaste | node decode-watermark.js');
    console.log('  3. 文件输入:    node decode-watermark.js leaked.txt');
    console.log('');
    console.log('推荐方式 2：先在浏览器中复制简历文本，然后直接运行:');
    console.log('  pbpaste | node decode-watermark.js');
    process.exit(1);
}

async function getInput() {
    if (process.argv.length > 2) {
        const arg = process.argv[2];
        if (arg === '-h' || arg === '--help') showHelp();
        try {
            const fs = require('fs');
            if (fs.existsSync(arg)) {
                return fs.readFileSync(arg, 'utf-8');
            }
        } catch (e) {}
        return arg;
    }

    if (!process.stdin.isTTY) {
        const chunks = [];
        for await (const chunk of process.stdin) {
            chunks.push(chunk);
        }
        const text = Buffer.concat(chunks).toString('utf-8');
        if (text.trim()) return text;
    }

    showHelp();
}

(async () => {
    const input = await getInput();

    const zeroWidthOnly = extractZeroWidth(input);

    if (zeroWidthOnly.length === 0) {
        console.log('❌ 未检测到零宽字符隐写水印');
        console.log('   可能原因：该文本未被水印标记，或隐写字符在复制过程中丢失');
        process.exit(0);
    }

    const decoded = decodeFromZeroWidth(zeroWidthOnly);
    const watermark = extractFirstWatermark(decoded);

    if (watermark) {
        console.log('✅ 检测到隐写水印！');
        console.log('   接收方标识: ' + watermark.recipient);
        console.log('   嵌入日期:   ' + watermark.date);
    } else {
        console.log('⚠️ 检测到零宽字符，但无法解码为有效水印');
        console.log('   零宽字符数: ' + zeroWidthOnly.length);
        console.log('   解码结果:   ' + decoded);
    }
})();
