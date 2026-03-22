import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { matchJobsForUser } from "@/lib/matchingEngine";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jobData = await req.json();

    // 1. Save Job
    const job = await prisma.job.create({
      data: {
        title: jobData.title,
        company: "Unknown (From Extension)",
        applyUrl: jobData.url,
        description: jobData.text,
        source: "Extension",
      }
    });

    // 2. Trigger Match Engine for this user specifically for this job
    // The matching engine matches un-matched jobs automatically.
    await matchJobsForUser(session.user.id);

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (error: any) {
    console.error("Extension Save Error:", error);
    return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
  }
}
