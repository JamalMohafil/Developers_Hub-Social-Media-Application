import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageLightbox } from "@/components/utils/ImageLightBox";
import { VideoPreview } from "@/components/utils/VideoPreview";
import { Project, SkillType } from "@/lib/type";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = { project: Project };

const ProjectContentSection = ({ project }: Props) => {
  return (
    <div className="md:col-span-2 space-y-8">
      {/* Project Image Card with Lightbox */}
      {project.image && (
        <Card className="overflow-hidden p-6 rounded-xl border-2 border-emerald-700/30 shadow-xl transition-all duration-300 hover:shadow-2xl bg-slate-900">
          <h2 className="  text-2xl font-bold text-white">Project Image</h2>{" "}
          <ImageLightbox
            src={project.image || "/placeholder.svg"}
            alt={project.title}
            priority
          />
        </Card>
      )}

      {/* Project Description Card */}
      <Card className="overflow-hidden rounded-xl border-2 border-emerald-700/30 shadow-lg transition-all duration-300 hover:shadow-xl bg-slate-900">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold text-white">
            About This Project
          </h2>
          <div
            className="prose max-w-none text-slate-300 prose-headings:text-white prose-strong:text-white prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
        </div>
      </Card>

      {/* Project Video Card */}
      {project.videoUrl && (
        <Card className="overflow-hidden rounded-xl border-2 border-emerald-700/30 shadow-lg transition-all duration-300 hover:shadow-xl bg-slate-900">
          <div className="p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">Project Demo</h2>
            <VideoPreview url={project.videoUrl} />
          </div>
        </Card>
      )}

      {/* Skills Card */}
      {project.skills && project.skills.length > 0 && (
        <Card className="overflow-hidden rounded-xl border-2 border-emerald-700/30 shadow-lg transition-all duration-300 hover:shadow-xl bg-slate-900">
          <div className="p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Technologies & Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill: SkillType) => (
                <Badge
                  key={skill.id}
                  className="bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800/50 px-3 py-1.5 text-sm transition-colors duration-300"
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Project Link Card */}
      {project.projectUrl && (
        <Card className="overflow-hidden rounded-xl border-2 border-emerald-700/30 shadow-lg transition-all duration-300 hover:shadow-xl bg-slate-900">
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Ready to explore?
              </h2>
              <p className="text-slate-300">Check out the live project</p>
            </div>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Link
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <span className="flex items-center gap-2">
                  Visit Project
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProjectContentSection;
