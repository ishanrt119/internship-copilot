import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BarChart3, Mail, Briefcase, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  // Fetch stats
  const totalJobs = await prisma.job.count();
  const userMatches = await prisma.jobMatch.count({ where: { userId: session.user.id } });
  const outreaches = await prisma.outreach.findMany({ where: { userId: session.user.id } });

  const emailsSent = outreaches.length;
  const replies = outreaches.filter((o: any) => o.status === "REPLIED").length;
  const conversionRate = emailsSent > 0 ? Math.round((replies / emailsSent) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Dashboard
        </h1>
        <div className="flex gap-4">
          <Link href="/jobs" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">View Jobs</Link>
          <img src={session.user.image!} alt="Avatar" className="w-10 h-10 rounded-full border border-zinc-800" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Jobs Scraped" value={totalJobs} icon={<Briefcase className="w-6 h-6 text-blue-400" />} />
        <StatCard title="Matches Found" value={userMatches} icon={<BarChart3 className="w-6 h-6 text-purple-400" />} />
        <StatCard title="Cold Emails Sent" value={emailsSent} icon={<Mail className="w-6 h-6 text-green-400" />} />
        <StatCard title="Conversion Rate" value={`${conversionRate}%`} icon={<TrendingUp className="w-6 h-6 text-amber-400" />} />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-zinc-300">Recent Outreaches</h2>
        {outreaches.length === 0 ? (
          <p className="text-zinc-500 text-sm">No outreaches sent yet. Go matches some jobs!</p>
        ) : (
          <div className="space-y-4">
            {outreaches.map((outreach: any) => (
              <div key={outreach.id} className="flex justify-between items-center p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                <span className="font-medium">{outreach.id}</span>
                <span className="text-sm px-2 py-1 rounded bg-blue-900/50 text-blue-400">{outreach.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex items-center gap-4">
      <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
        {icon}
      </div>
      <div>
        <p className="text-sm text-zinc-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
