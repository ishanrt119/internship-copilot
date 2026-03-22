import { Worker } from 'bullmq';
import { chromium } from 'playwright';
import { prisma } from '../lib/prisma';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const scraperWorker = new Worker('job-aggregation', async (job) => {
  const { source, url, keyword } = job.data;
  console.log(`[Worker] Started job aggregation for ${source} (${keyword || 'all'})`);

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    if (source === 'Internshala') {
      await page.goto(url);
      
      // Wait for listings
      await page.waitForSelector('.internship_meta', { timeout: 15000 }).catch(() => null);
      
      const jobs = await page.evaluate(() => {
        const elements = document.querySelectorAll('.internship_meta');
        const results: any[] = [];
        
        elements.forEach((el) => {
          const title = el.querySelector('.heading_4_5')?.textContent?.trim() || 'Unknown Title';
          const company = el.querySelector('.heading_6')?.textContent?.trim() || 'Unknown Company';
          const location = el.querySelector('.location_link')?.textContent?.trim() || 'Remote';
          
          let applyUrl = '';
          const container = el.closest('.individual_internship');
          if (container) {
            const dataHref = container.getAttribute('data-href');
            if (dataHref) applyUrl = 'https://internshala.com' + dataHref;
          }
          
          if (applyUrl) {
            results.push({
               title,
               company,
               location,
               applyUrl,
               description: 'Extracted automatically from Internshala.', // A deep scrape could visit applyUrl
               requiredSkills: [],
               source: 'Internshala',
               isRemote: location.toLowerCase().includes('work from home'),
            });
          }
        });
        
        return results;
      });

      console.log(`[Worker] Extracted ${jobs.length} jobs from Internshala`);

      for (const j of jobs) {
        const existing = await prisma.job.findFirst({ where: { applyUrl: j.applyUrl } });
        if (!existing) {
          await prisma.job.create({
            data: {
              title: j.title,
              company: j.company,
              location: j.location,
              applyUrl: j.applyUrl,
              description: j.description,
              requiredSkills: j.requiredSkills,
              source: j.source,
              isRemote: j.isRemote,
            }
          });
        }
      }
    } else if (source === 'Indeed') {
      // Stub for Indeed
      console.log("[Worker] Indeed scraping logic goes here");
    }
    
    await browser.close();
    return { success: true };

  } catch (error: any) {
    console.error(`[Worker] Error scraping ${source}:`, error);
    throw new Error(error.message);
  }
}, { connection: connection as any });
