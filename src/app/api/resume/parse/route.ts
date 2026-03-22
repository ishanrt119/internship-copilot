import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFParse } from "pdf-parse";

// Initialize S3 Client conditionally based on env vars
const s3Client = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY 
  ? new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json({ error: "No resume file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload to S3 if configured
    let resumeUrl = "";
    if (s3Client && process.env.S3_BUCKET_NAME) {
      const fileName = `resumes/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
        })
      );
      resumeUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }

    // 2. Parse PDF text
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const extractedText = pdfData.text;

    // 3. Extract Structured JSON via AI (or mock if no key)
    let profile;
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("your-openai-api-key")) {
      console.warn("Using Mock Resume Parsing - No valid OpenAI API key found.");
      profile = {
        skills: ["Mock Skill 1", "Mock Skill 2", "TypeScript", "React"],
        projects: [{ name: "Demo Project", description: "A project created during demo mode." }],
        experience: [{ company: "Demo Corp", role: "Software Intern", duration: "3 months", highlights: ["Built a demo app", "Learned mocking"] }],
        education: [{ institution: "Demo University", degree: "B.S. Computer Science", year: "2025" }]
      };
    } else {
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        system: "You are an expert resume parser. Extract the candidate's core details accurately.",
        prompt: `Extract structured profile data from this resume text:\n\n${extractedText}`,
        schema: z.object({
          skills: z.array(z.string()).describe("List of technical and soft skills"),
          projects: z.array(z.object({
            name: z.string(),
            description: z.string()
          })).describe("List of key projects"),
          experience: z.array(z.object({
            company: z.string(),
            role: z.string(),
            duration: z.string(),
            highlights: z.array(z.string())
          })),
          education: z.array(z.object({
            institution: z.string(),
            degree: z.string(),
            year: z.string()
          }))
        })
      });
      profile = object;
    }

    // 4. Save to DB if user is logged in
    if (session?.user?.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          resumeUrl: resumeUrl || undefined,
          skills: profile.skills as any,
          experience: JSON.stringify(profile.experience),
        }
      });
    }

    return NextResponse.json({ success: true, profile, resumeUrl });

  } catch (error) {
    console.error("Error parsing resume:", error);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
