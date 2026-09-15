import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
await fs.mkdir('assets', {recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://localhost:4173/');
 await page.locator('#welcome-touch').click();
 await page.screenshot({path:'assets/board-desktop.png'});
 const box=await page.locator('[data-phrase=yes]').boundingBox();
 await fs.writeFile('assets/demo-target.json',JSON.stringify(box,null,2));
 await page.locator('[data-phrase=yes]').click();
 await page.screenshot({path:'assets/board-yes.png'});
 await page.locator('#settings').click();
 await page.locator('#quick-input').click();
 await page.locator('[value=hand]').check();
 await page.screenshot({path:'assets/hand-setup.png'});
 await page.locator('#input-done').click();
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(500);
 await page.screenshot({path:'assets/board-phone.png'});
 console.log('Captured actual desktop, phone, hand setup and selected Yes; target',box);
} finally {await browser.close();}
