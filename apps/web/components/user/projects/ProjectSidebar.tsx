import { ProfileType, Project } from "@/lib/type";
import { Clock, Globe, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ShareButtons } from "./ShareButtons";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

type Props = {
  project: Project;
  profile: ProfileType;
  lastProjects: Project[];
};

const ProjectSidebar = ({ project, profile, lastProjects }: Props) => {
  return (
    <div className="space-y-6">
      <Card
        className="overflow-hidden rounded-xl p-0 border-2 
              border-emerald-700/30 shadow-lg transition-all duration-300 hover:shadow-xl bg-slate-900"
      >
        <div>
          <div className="relative">
            <div className="h-32 w-full bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-700 overflow-hidden">
              <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
              <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs text-white">
                Creator
              </div>
            </div>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="rounded-full border-4 border-slate-900 bg-slate-800 p-1 shadow-lg">
                <Image
                  src={profile.user?.image || "/placeholder.svg"}
                  alt={profile.user?.name || "Profile"}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="pt-16 pb-6 px-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">
                {profile.user?.name}
              </h2>
              {profile.jobTitle && (
                <p className="text-emerald-400 font-medium">
                  {profile.jobTitle}
                </p>
              )}
              {profile.company && (
                <p className="text-sm text-slate-400 mt-1">
                  at {profile.company}
                </p>
              )}
            </div>

            <Separator className="my-4 bg-slate-700" />

            {profile.bio && (
              <div className="mb-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-300 italic">"{profile.bio}"</p>
              </div>
            )}

            <div className="space-y-3">
              {profile.location && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/30">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300">{profile.location}</span>
                </div>
              )}

              {profile.website && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/30">
                    <Globe className="h-4 w-4 text-emerald-400" />
                  </div>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                  >
                    Personal Website
                  </a>
                </div>
              )}

              {profile.contactEmail && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/30">
                    <Mail className="h-4 w-4 text-emerald-400" />
                  </div>
                  <a
                    href={`mailto:${profile.contactEmail}`}
                    className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                  >
                    {profile.contactEmail}
                  </a>
                </div>
              )}
            </div>

            <ShareButtons profileId={profile.userId} projectId={project.id} />
          </div>
        </div>
      </Card>

      {/* Related Projects Card */}
      {lastProjects && lastProjects.length > 0 && (
        <Card className="overflow-hidden border-2 border-emerald-700/30 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl bg-slate-900">
          <div className="px-5">
            <h3 className="mb-4 text-lg font-bold text-white">
              More Projects by{" "}
              {profile && profile.user && profile.user.name
                ? profile?.user?.name.split(" ")[0]
                : "User"}
            </h3>
            <div className="space-y-3">
              {lastProjects.map((relatedProject: Project) => (
                <Link
                  href={`/projects/${relatedProject.id}`}
                  key={relatedProject.id}
                  className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-emerald-900/20"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-md bg-slate-800 relative">
                    {relatedProject.image ? (
                      <Image
                        fill
                        src={relatedProject.image || "/placeholder.svg"}
                        alt={relatedProject.title}
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                        <span className="text-lg font-bold text-emerald-500/40">
                          {relatedProject.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {relatedProject.title}
                    </h4>
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {new Date(relatedProject.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProjectSidebar;
