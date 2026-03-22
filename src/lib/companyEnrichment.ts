import { chromium } from "playwright";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export async function enrichCompanyData(companyName: string, companyWebsiteUrl?: string) {
  let textContent = "";

  if (companyWebsiteUrl) {
    try {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(companyWebsiteUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
      
      // Extract visible text from body
      textContent = await page.evaluate(() => document.body.innerText.substring(0, 5000));
      await browser.close();
    } catch (e) {
      console.error(`Failed to crawl ${companyWebsiteUrl}`, e);
    }
  }

  // Use AI to extract founders, about, and emails
  const { object: enrichment } = await generateObject({
    model: openai("gpt-4o-mini"),
    system: "You are an expert data researcher. Extract company info from the scraped text. If no text is provided, guess the email pattern based on company name.",
    prompt: `Company: ${companyName}\nWebsite: ${companyWebsiteUrl}\nScraped Text: ${textContent}`,
    schema: z.object({
      emails: z.array(z.string().email()),
      founders: z.array(z.string()),
      aboutSummary: z.string()
    })
  });

  // Fallback pattern if no emails found
  if (enrichment.emails.length === 0) {
    const cleanName = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
    enrichment.emails.push(`hr@${cleanName}.com`);
    enrichment.emails.push(`careers@${cleanName}.com`);
  }

  return enrichment;
}
