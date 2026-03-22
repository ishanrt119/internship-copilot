import { openai } from "@ai-sdk/openai";
import { streamText, tool, convertToModelMessages } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // We can bypass auth for demo/testing, but since this is production-ready, we recommend auth.
  // if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are the Internship Copilot Onboarding AI. You are a friendly, concise assistant.
Your goal is to get to know the user so you can match them with internships.
Ask questions naturally and conversationally, ONE AT A TIME. DO NOT interrogate them.
You need to collect:
- Their primary skills
- Their experience level
- What roles they are looking for
- Preferred location (or Remote/Onsite)

Once you have collected all this information, you MUST call the 'submitProfileData' tool to save their profile.
After calling the tool, thank them and tell them you are now finding matches for them.`,
    messages: await convertToModelMessages(messages),
    tools: {
      submitProfileData: tool({
        description: "Save the collected user profile data to the database",
        inputSchema: z.object({
          skills: z.array(z.string()).describe("List of technical or soft skills"),
          experience: z.string().describe("A short summary of their experience level"),
          preferredRoles: z.array(z.string()).describe("Roles they want to apply for"),
          location: z.string().optional().describe("Geographic location preference"),
          remotePreferred: z.boolean().describe("Whether they prefer remote work")
        }),
        execute: async ({ skills, experience, preferredRoles, location, remotePreferred }: {
          skills: string[];
          experience: string;
          preferredRoles: string[];
          location?: string;
          remotePreferred: boolean;
        }) => {
          if (session?.user?.id) {
            await prisma.user.update({
              where: { id: session.user.id },
              data: {
                skills,
                experience,
                preferredRoles,
                location,
                remotePreferred,
                isOnboarded: true
              }
            });
            return "Profile saved successfully to the database!";
          }
          return "Profile extracted successfully (user not logged in).";
        }
      })
    }
  });

  return result.toUIMessageStreamResponse();
}
