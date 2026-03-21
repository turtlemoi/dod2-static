'use strict';
const https = require('https');

/**
 * Discord Webhook 으로 갱신 완료 임베드 메시지 전송
 * @param {object} manifest - parseAndExportSheets() 반환값
 */
async function sendDiscordMessage(manifest) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        console.log('[Discord] DISCORD_WEBHOOK_URL 미설정 — 알림 건너뜀.');
        return;
    }

    const kst       = new Date(manifest.updatedAt)
        .toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const sheetList = manifest.sheets
        .map(s => `• **${s.name}** v${s.version}`)
        .join('\n') || '없음';

    const payload = JSON.stringify({
        embeds: [{
            title:  '✅ 스태틱 데이터 최신화 완료',
            color:  0x57f287,
            fields: [
                { name: '업데이트 시각 (KST)',            value: kst,       inline: false },
                { name: `시트 목록 (${manifest.sheets.length}개)`, value: sheetList, inline: false },
            ],
            footer: { text: 'Game Static Data Server' },
        }],
    });

    return new Promise((resolve, reject) => {
        const req = https.request(
            webhookUrl,
            { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } },
            res => {
                console.log(`[Discord] 알림 전송 완료 (HTTP ${res.statusCode})`);
                resolve(res.statusCode);
            }
        );
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

module.exports = { sendDiscordMessage };
