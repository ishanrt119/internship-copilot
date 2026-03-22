import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import JobCard from "@/components/JobCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  // Determine params
  const params = searchParams;

  // We fetch jobs and matches for this user
  const matches = await prisma.jobMatch.findMany({
    where: { userId: session.user.id },
    include: { job: true },
    orderBy: { matchScore: "desc" },
  });

  // Apply filters
  let filteredMatches = matches;
  if (params.remote === "true") {
    filteredMatches = filteredMatches.filter((m: any) => m.job.isRemote);
  }
  if (params.filter === "esg") {
    const esgKeywords = ["climate", "sustainability", "renewable", "esg", "green", "carbon"];
    filteredMatches = filteredMatches.filter((m: any) => {
       const text = `${m.job.title} ${m.job.company} ${m.job.description}`.toLowerCase();
       return esgKeywords.some((kw: string) => text.includes(kw));
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-zinc-800 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Your Matches
          </h1>
        </div>
        
        <div className="flex gap-3">
          <Link 
            href="/jobs?remote=true" 
            className="px-4 py-2 border border-zinc-700 bg-zinc-900 rounded-lg text-sm hover:border-blue-500 transition"
          >
            Remote Only
          </Link>
          <Link 
            href="/jobs?filter=esg" 
            className="px-4 py-2 border border-zinc-700 bg-zinc-900 rounded-lg text-sm hover:border-green-500 text-green-400 transition"
          >
            🌱 ESG / Climate Tech
          </Link>
          <Link 
            href="/jobs" 
            className="px-4 py-2 border border-zinc-800 bg-zinc-950 rounded-lg text-sm hover:border-zinc-500 transition"
          >
            Clear Filters
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((m: any) => (
            <JobCard key={m.id} job={m.job} match={m} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
            No matches found right now. Run the matching engine or adjust filters.
          </div>
        )}
      </div>
    </div>
  );
}
