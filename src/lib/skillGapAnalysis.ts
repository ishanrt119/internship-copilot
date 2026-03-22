import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export async function generateSkillGapResources(missingSkills: string[]) {
  if (!missingSkills || missingSkills.length === 0) return [];

  const { object: resources } = await generateObject({
    model: openai("gpt-4o-mini"),
    system: "You are a career development expert. Recommend standard learning resources.",
    prompt: `The candidate is missing these skills: ${missingSkills.join(", ")}. 
    Suggest 1-2 generic resources (like 'Coursera course', 'Official documentation') for each skill.`,
    schema: z.object({
      suggestions: z.array(z.object({
        skill: z.string(),
        resource: z.string(),
        type: z.enum(["Course", "Documentation", "Project Idea"])
      }))
    })
  });

  return resources.suggestions;
}
