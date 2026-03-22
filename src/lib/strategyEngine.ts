import { prisma } from "./prisma";

export async function getApplicationStrategy(userId: string) {
  const matches = await prisma.jobMatch.findMany({
    where: { userId },
    include: { job: true }
  });

  // Sort by match score descending
  const sorted = [...matches].sort((a, b) => b.matchScore - a.matchScore);

  const highProbability = sorted.filter(m => m.matchScore >= 80);
  const quickApply = sorted.filter(m => m.missingSkills.length === 0);
  const stretch = sorted.filter(m => m.matchScore >= 50 && m.matchScore < 80);

  return {
    highProbability,
    quickApply,
    stretch
  };
}
