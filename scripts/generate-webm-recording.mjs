import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKFLOW_DIR = path.resolve(__dirname, '../docs/visual-audit/workflow');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const steps = [
  { file: '01-ria-dashboard-firm-workspace.png', label: '1. RIA Dashboard Workspace (Prudent Wealth Advisory)' },
  { file: '02-ria-clients-directory.png', label: '2. RIA Client Directory & Relationship Management' },
  { file: '03-ria-client-added-association.png', label: '3. Client Associated with Advisory Firm (Priya Sharma)' },
  { file: '04-ria-draft-recommendation-page.png', label: '4. RIA Drafts Investment Recommendation & Rationale' },
  { file: '05-ria-recommendation-dispatched-detail.png', label: '5. Recommendation Link Dispatched to Client' },
  { file: '06-client-review-desktop.png', label: '6. Client Magic Link Review (Desktop View)' },
  { file: '07-client-review-mobile.png', label: '7. Client Mobile Review (Tax Impact & What is Changing)' },
  { file: '08-client-receipt-confirmation-desktop.png', label: '8. Section 65B Statutory Receipt Authorized & Locked' },
  { file: '09-client-receipt-confirmation-mobile.png', label: '9. Mobile Receipt & Tamper-Evident Confirmation' },
  { file: '10-ria-mandate-consented-audit-trail.png', label: '10. RIA Workspace Sees Statutory Consent & Audit Trail' },
  { file: '11-ria-dashboard-updated-consented.png', label: '11. RIA Dashboard Updated with Consented Metrics' },
  { file: '12-client-unauthorized-redirect.png', label: '12. Multi-Tenant Security: Unauthorized Access Blocked (403)' },
];

async function generateVideo() {
  console.log('🎬 Generating WebM screen recording from verified workflow frames...');
  
  // Read all images as base64 data URLs
  const frames = [];
  for (const step of steps) {
    const imgPath = path.join(WORKFLOW_DIR, step.file);
    if (fs.existsSync(imgPath)) {
      const b64 = fs.readFileSync(imgPath).toString('base64');
      frames.push({
        label: step.label,
        dataUrl: `data:image/png;base64,${b64}`,
      });
    }
  }

  console.log(`Loaded ${frames.length} frames for video compilation.`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // HTML page that draws frames and records using MediaRecorder
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; background: #0F172A; overflow: hidden; font-family: system-ui, sans-serif; }
          #c { display: block; width: 1440px; height: 900px; }
        </style>
      </head>
      <body>
        <canvas id="c" width="1440" height="900"></canvas>
        <script>
          window.startRecording = async function(frames) {
            const canvas = document.getElementById('c');
            const ctx = canvas.getContext('2d');
            const stream = canvas.captureStream(30);
            
            let mimeType = 'video/webm;codecs=vp9';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = 'video/webm;codecs=vp8';
              if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm';
              }
            }
            
            const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3000000 });
            const chunks = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
            
            const recordingDone = new Promise(resolve => {
              recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: mimeType });
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(blob);
              };
            });
            
            recorder.start();
            
            // Render each frame for 2.2 seconds (66 ticks at 30fps)
            for (let i = 0; i < frames.length; i++) {
              const f = frames[i];
              const img = new Image();
              await new Promise(r => { img.onload = r; img.src = f.dataUrl; });
              
              const totalTicks = 66;
              for (let tick = 0; tick < totalTicks; tick++) {
                // Clear
                ctx.fillStyle = '#0F172A';
                ctx.fillRect(0, 0, 1440, 900);
                
                // Draw image centered / aspect fit
                const scale = Math.min(1440 / img.width, 900 / img.height);
                const dw = img.width * scale;
                const dh = img.height * scale;
                const dx = (1440 - dw) / 2;
                const dy = (900 - dh) / 2;
                ctx.drawImage(img, dx, dy, dw, dh);
                
                // Overlay step banner at top
                ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
                ctx.fillRect(0, 0, 1440, 54);
                
                ctx.fillStyle = '#38BDF8';
                ctx.font = 'bold 18px Inter, system-ui, sans-serif';
                ctx.fillText('FINCONSENT B2B SAAS WORKFLOW RECORDING', 24, 34);
                
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '600 16px Inter, system-ui, sans-serif';
                ctx.fillText(f.label, 480, 34);
                
                // Progress bar at bottom
                const progress = (i + tick / totalTicks) / frames.length;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillRect(0, 894, 1440, 6);
                ctx.fillStyle = '#10B981';
                ctx.fillRect(0, 894, 1440 * progress, 6);
                
                // Wait for next frame at 30fps
                await new Promise(r => setTimeout(r, 33));
              }
            }
            
            recorder.stop();
            return recordingDone;
          };
        </script>
      </body>
    </html>
  `;

  await page.setContent(htmlContent);
  console.log('Recording frames onto canvas stream at 30 FPS...');

  const base64Video = await page.evaluate(async (f) => {
    return await window.startRecording(f);
  }, frames);

  await browser.close();

  const outVideoPath = path.join(WORKFLOW_DIR, 'finconsent-b2b-workflow-recording.webm');
  fs.writeFileSync(outVideoPath, Buffer.from(base64Video, 'base64'));
  const sizeMb = (fs.statSync(outVideoPath).size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Successfully generated WebM recording: ${outVideoPath} (${sizeMb} MB)`);
}

generateVideo().catch(err => {
  console.error('Video generation error:', err);
  process.exit(1);
});
