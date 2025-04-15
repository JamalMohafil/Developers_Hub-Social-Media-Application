"use client";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import type { SkillType } from "@/lib/type";
import { Search, X, ChevronUp } from "lucide-react";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import Spinner from "./Spinner";

type Props = {
  errors: any;
  formData: any;
  removeSkill: (id: string) => void;
  skillSearchOpen: boolean;
  setSkillSearchOpen: (open: boolean) => void;
  skillQuery: string;
  setSkillQuery: (query: string) => void;
  skillsLoading: boolean;
  skillResults: SkillType[];
  addSkill: (skill: SkillType) => void;
};

const ChooseSkills = ({
  errors,
  formData,
  removeSkill,
  skillSearchOpen,
  setSkillSearchOpen,
  skillQuery,
  setSkillQuery,
  skillsLoading,
  skillResults,
  addSkill,
}: Props) => {
  return (
    <>
      {/* Skills Section */}
      <div className="space-y-3">
        <Label className="">Skills (Max 10)</Label>
        {errors?.skills && (
          <p className="text-red-400 text-sm">
            {errors.skills?.[0]?.message || "Invalid input"}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-2">
          {formData.skills &&
            formData.skills.map((skill: SkillType) => (
              <Badge
                key={skill.id}
                variant="secondary"
                className="py-1 px-2 flex items-center gap-1 bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800/50"
              >
                {skill.name}
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="ml-1 rounded-full hover:bg-slate-700 p-1"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
        </div>

        <div className="relative">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSkillSearchOpen(!skillSearchOpen)}
            disabled={formData.skills && formData.skills.length >= 10}
            className="w-full flex justify-between border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            {formData.skills && formData.skills.length >= 10
              ? "Maximum skills reached"
              : "Add skills"}
            {skillSearchOpen ? <ChevronUp size={16} /> : <Search size={16} />}
          </Button>

          {skillSearchOpen && (
            <div className="mt-1 border border-slate-700 rounded-md overflow-hidden bg-slate-800 shadow-lg z-50">
              <Command className="bg-slate-800">
                <CommandInput
                  placeholder="Search for skills..."
                  value={skillQuery}
                  onValueChange={setSkillQuery}
                  className="bg-slate-800"
                  autoFocus
                />
                <CommandList className="bg-slate-800 max-h-60">
                  <CommandEmpty>
                    {skillsLoading ? (
                      <div className="mx-auto flex justify-center items-center w-full py-4">
                        <Spinner />
                      </div>
                    ) : skillQuery.length < 1 ? (
                      "Type at least 1 character to search"
                    ) : (
                      "No skills found"
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {skillResults.map((skill: SkillType) => (
                      <CommandItem
                        key={skill.id}
                        onSelect={() => {
                          addSkill(skill);
                          setSkillSearchOpen(false);
                        }}
                        className="hover:bg-slate-700"
                      >
                        {skill.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChooseSkills;
