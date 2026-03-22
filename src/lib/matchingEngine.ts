import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { prisma } from "./prisma";

export async function matchJobsForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { matches: true },
  });

  if (!user || user.skills.length === 0) {
    throw new Error("User has incomplete profile for matching");
  }

  // Get jobs the user hasn't matched with yet
  const existingJobIds = user.matches.map((m: any) => m.jobId);
  const jobsToMatch = await prisma.job.findMany({
    where: {
      id: { notIn: existingJobIds },
    },
    take: 20, // process in batches
  });

  const newMatches = [];

  for (const job of jobsToMatch) {
    const { object: matchResult } = await generateObject({
      model: openai("gpt-4o-mini"),
      system: "You are an AI Job Matching Engine. Analyze the candidate profile against the job description.",
      prompt: `Candidate Profile:
Skills: ${user.skills.join(", ")}
Experience: ${user.experience}
Preferred Roles: ${user.preferredRoles.join(", ")}
Remote Preferred: ${user.remotePreferred}
Location: ${user.location}

Job Details:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || "Remote"}
Description: ${job.description.substring(0, 1500)}

Calculate a Match Score from 0 to 100 based on skill overlap, experience level, and location/remote alignment.
Classify the fit as "Best Fit", "Good Fit", or "Stretch".
Explain the matching reasoning and identify missing skills.`,
      schema: z.object({
        matchScore: z.number().min(0).max(100),
        classification: z.enum(["Best Fit", "Good Fit", "Stretch"]),
        explanation: z.string(),
        missingSkills: z.array(z.string()).describe("Skills missing from the candidate profile"),
      })
    });

    const jobMatch = await prisma.jobMatch.create({
      data: {
        userId: user.id,
        jobId: job.id,
        matchScore: matchResult.matchScore,
        classification: matchResult.classification,
        explanation: matchResult.explanation,
        missingSkills: matchResult.missingSkills,
        status: "NEW",
      }
    });

    newMatches.push(jobMatch);
  }

  return newMatches;
}
