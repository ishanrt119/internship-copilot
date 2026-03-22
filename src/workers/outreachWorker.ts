import { Worker } from 'bullmq';
import { prisma } from '../lib/prisma';
import Redis from 'ioredis';
import { enrichCompanyData } from '../lib/companyEnrichment';
import { generateColdEmail } from '../lib/emailGenerator';
import { sendColdEmail } from '../lib/mailer';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const outreachWorker = new Worker('email-outreach', async (job) => {
  const { outreachId, type } = job.data;
  console.log(`[Outreach Worker] Processing ${type} for outreach ${outreachId}`);

  try {
    const outreach = await prisma.outreach.findUnique({
      where: { id: outreachId },
      include: {
        jobMatch: { include: { job: true } },
        user: true,
      }
    });

    if (!outreach) throw new Error("Outreach not found");

    const user = outreach.user;
    const jobDetails = outreach.jobMatch.job;

    // 1. Enrich
    const enrichment = await enrichCompanyData(jobDetails.company, jobDetails.source);
    
    // Pick the first email
    const targetEmail = enrichment.emails[0];
    if (!targetEmail) throw new Error("No contact email found");

    if (type === "INITIAL" && !outreach.initialSent) {
      // 2. Output
      const emailContent = await generateColdEmail(user, jobDetails, enrichment, false);
      
      // 3. Send
      await sendColdEmail({
        to: targetEmail,
        subject: emailContent.subject,
        text: emailContent.bodyText,
      });

      // 4. Update
      await prisma.outreach.update({
        where: { id: outreachId },
        data: {
          initialSent: true,
          status: "SENT",
          nextSendDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days follow-up
        }
      });
      console.log(`[Outreach Worker] Initial email sent to ${targetEmail}`);

    } else if (type === "FOLLOW_UP" && outreach.initialSent && !outreach.followUpSent) {
      const emailContent = await generateColdEmail(user, jobDetails, enrichment, true);
      
      await sendColdEmail({
        to: targetEmail,
        subject: emailContent.subject,
        text: emailContent.bodyText,
      });

      await prisma.outreach.update({
        where: { id: outreachId },
        data: {
          followUpSent: true,
          status: "SENT",
        }
      });
      console.log(`[Outreach Worker] Follow-up sent to ${targetEmail}`);
    }

    return { success: true };

  } catch (error: any) {
    console.error(`[Outreach Worker] Error:`, error);
    throw new Error(error.message);
  }
}, { connection: connection as any });
