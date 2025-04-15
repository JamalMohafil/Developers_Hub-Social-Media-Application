import { Badge } from "@/components/ui/badge";
import { Project, SkillType } from "@/lib/type";
import { CalendarIcon } from "lucide-react";
import React from "react";

type Props = {
  formattedDate: string;
  project: Project;
};

const ProjectHeroSection = ({ formattedDate, project }: Props) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-800 pt-16 pb-20 text-white">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/30 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-400/30 blur-3xl"></div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-in-up inline-block mb-4 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur-md">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Published on {formattedDate}</span>
            </span>
          </div>
          <h1 className="animate-fade-in-up mb-6  text-4xl font-extrabold tracking-tight  md:text-5xl lg:text-6xl">
            {project.title}
          </h1>
          <div className="animate-fade-in-up flex flex-wrap justify-center gap-3">
            {project.skills &&
              project.skills.map((skill: SkillType) => (
                <Badge
                  key={skill.id}
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-0 transition-all duration-300"
                >
                  {skill.name}
                </Badge>
              ))}
          </div>
        </div>
      </div>

      {/* Animated wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#020617" /* slate-950 */
            fillOpacity="1"
            d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default ProjectHeroSection;
