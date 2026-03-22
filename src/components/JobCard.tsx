import { Briefcase, MapPin, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

export default function JobCard({ job, match }: { job: any, match?: any }) {
  const matchColor = 
    match?.classification === "Best Fit" ? "text-green-400 bg-green-400/10 border-green-400/20" :
    match?.classification === "Good Fit" ? "text-blue-400 bg-blue-400/10 border-blue-400/20" :
    "text-amber-400 bg-amber-400/10 border-amber-400/20";

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-colors p-6 rounded-xl flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-100 mb-1">{job.title}</h3>
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <span className="font-semibold text-zinc-300">{job.company}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {job.isRemote ? "Remote" : job.location || "Remote"}
              </div>
            </div>
          </div>
          {match && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${matchColor}`}>
              <Sparkles className="w-3 h-3" />
              {match.matchScore}% Match
            </div>
          )}
        </div>
        
        <p className="text-zinc-400 text-sm line-clamp-3 mb-4">
          {job.description}
        </p>

        {match?.missingSkills?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-zinc-500 mb-1">Missing Skills:</p>
            <div className="flex flex-wrap gap-2">
              {match.missingSkills.map((skill: string) => (
                <span key={skill} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800">
        <span className="text-xs text-zinc-500">Source: {job.source}</span>
        <a 
          href={job.applyUrl} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition"
        >
          Apply Now <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
