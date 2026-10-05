import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--no-sandbox','--disable-dev-shm-usage'] });
console.log('launched', b.version());
const p = await b.newPage();
await p.setContent('<h1>hi</h1>');
console.log(await p.title());
await b.close();
