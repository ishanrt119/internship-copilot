import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export async function generateColdEmail(userProfile: any, jobDetails: any, companyDetails: any, isFollowUp = false) {
  const prompt = `
Candidate Profile:
Name: ${userProfile.name}
Skills: ${userProfile.skills.join(", ")}
Experience: ${userProfile.experience}

Job Target:
Title: ${jobDetails.title}
Company: ${jobDetails.company}

Company Enrichment:
Founders: ${companyDetails.founders?.join(", ") || "Unknown"}
Summary: ${companyDetails.aboutSummary || "N/A"}

Action: Write a ${isFollowUp ? "polite 3-day follow-up" : "concise, warm, founder-friendly initial"} cold email.
Do not sound spammy. Keep it under 150 words.
  `;

  const { object: email } = await generateObject({
    model: openai("gpt-4o-mini"),
    system: "You are an expert B2B cold email copywriter.",
    prompt,
    schema: z.object({
      subject: z.string(),
      bodyText: z.string().describe("The plain text body of the email")
    })
  });

  return email;
}
