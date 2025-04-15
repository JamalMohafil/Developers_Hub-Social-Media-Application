"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Filter, LightbulbIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { SkillType } from "@/lib/type";
import useSkills from "@/hooks/useSkills";
import { BACKEND_URL } from "@/lib/constants";
import { SortToggle } from "@/components/posts/SortToggle";

type ProjectsSidebarFiltersProps = {
  sortOrder?: string;
  skillId?: string | null;
  onFilterChange: (filters: Record<string, string | null>) => void;
};

export function ProjectsSidebarFilters({
  sortOrder = "desc",
  skillId,
  onFilterChange,
}: ProjectsSidebarFiltersProps) {
  const [sortOrderState, setSortOrderState] = useState<string>(sortOrder);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(
    skillId || "all"
  );
  const [defaultSkills, setDefaultSkills] = useState<SkillType[]>([]);
  const [loadingDefaultSkills, setLoadingDefaultSkills] = useState(true);
  const [selectedSkillData, setSelectedSkillData] = useState<SkillType | null>(
    null
  );

  // Use the custom hook for skills search
  const {
    skillQuery,
    setSkillQuery,
    skillResults,
    skillsLoading,
    skillSearchOpen,
    setSkillSearchOpen,
  } = useSkills();

  // Fetch default skills on component mount
  useEffect(() => {
    const fetchDefaultSkills = async () => {
      setLoadingDefaultSkills(true);
      try {
        // Fetch all skills from the API without limit
        const response = await fetch(`${BACKEND_URL}/users/skills`);
        if (response.ok) {
          const data = await response.json();
          setDefaultSkills(data);
        }
      } catch (error) {
        console.error("Error fetching default skills:", error);
      } finally {
        setLoadingDefaultSkills(false);
      }
    };

    fetchDefaultSkills();
  }, []);

  // Fetch selected skill data if it's not in the default skills list
  useEffect(() => {
    const fetchSelectedSkill = async () => {
      if (!skillId || skillId === "all" || loadingDefaultSkills) return;

      // Check if the selected skill is already in the default skills
      const existingSkill = defaultSkills.find((skill) => skill.id === skillId);
      if (existingSkill) {
        setSelectedSkillData(existingSkill);
        return;
      }

      // If not found in default skills, fetch it
      try {
        const response = await fetch(`${BACKEND_URL}/users/skills/${skillId}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedSkillData(data);

          // Add the fetched skill to the default skills list
          setDefaultSkills((prev) => {
            // Check if it's already in the list to avoid duplicates
            if (!prev.some((skill) => skill.id === data.id)) {
              return [data, ...prev];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error fetching selected skill:", error);
      }
    };

    fetchSelectedSkill();
  }, [skillId, defaultSkills, loadingDefaultSkills]);

  // Update local fields when props change
  useEffect(() => {
    if (skillId !== undefined) setSelectedSkill(skillId);
    if (sortOrder) setSortOrderState(sortOrder);
  }, [skillId, sortOrder]);

  // Handle sort order change
  const handleSortChange = () => {
    const newSortOrder = sortOrderState === "desc" ? "asc" : "desc";
    setSortOrderState(newSortOrder);
    onFilterChange({ sortBy: newSortOrder });
  };

  // Handle skill selection
  const handleSkillSelect = (skillId: string | null) => {
    const newSkillId = skillId === "all" ? null : skillId;
    setSelectedSkill(skillId);

    // If selecting a skill from search results, add it to default skills
    if (skillId !== "all" && skillSearchOpen && skillQuery) {
      const selectedFromSearch = skillResults.find(
        (skill) => skill.id === skillId
      );
      if (selectedFromSearch) {
        setDefaultSkills((prev) => {
          // Check if it's already in the list to avoid duplicates
          if (!prev.some((skill) => skill.id === selectedFromSearch.id)) {
            return [selectedFromSearch, ...prev];
          }
          return prev;
        });
      }
    }

    // Also add the currently selected skill data if available
    if (
      selectedSkillData &&
      !defaultSkills.some((skill) => skill.id === selectedSkillData.id)
    ) {
      setDefaultSkills((prev) => [...prev, selectedSkillData]);
    }

    onFilterChange({ skillId: newSkillId });
    // Clear search when a skill is selected
    setSkillQuery("");
    setSkillSearchOpen(false);
  };

  const SkillSkeleton = () => (
    <div className="space-y-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-9 bg-muted animate-pulse rounded-md" />
      ))}
    </div>
  );

  // Determine which skills to display
  const displaySkills =
    skillQuery && skillSearchOpen ? skillResults : defaultSkills;

  // Create a combined list that ensures the selected skill is included
  const combinedSkillsList = () => {
    if (!displaySkills) return [];

    // If we have a selected skill that's not in the display list, add it at the top
    if (
      selectedSkillData &&
      selectedSkill !== "all" &&
      !displaySkills.some((skill) => skill.id === selectedSkillData.id)
    ) {
      return [selectedSkillData, ...displaySkills];
    }

    return displaySkills;
  };
  return (
    <Card className="border-border w-full bg-card text-card-foreground sticky top-20">
      <CardContent className="p-0">
        {/* Title */}
        <div className="p-4 flex items-center gap-2 border-b border-border">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        {/* Sort section */}
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">
            Sort By
          </h3>
          <SortToggle sortOrder={sortOrderState} onToggle={handleSortChange} />
        </div>

        <Separator className="bg-border/50" />

        {/* Skills section */}
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-1">
            <LightbulbIcon className="h-3.5 w-3.5" /> Skills
          </h3>

          {/* Search input */}
          <div className="relative mb-4">
            <Input
              placeholder="Search skills..."
              value={skillQuery}
              onChange={(e) => {
                setSkillQuery(e.target.value);
                setSkillSearchOpen(true);
              }}
              onFocus={() => setSkillSearchOpen(true)}
              className="pl-8"
            />
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Skills list */}
          <ul className="space-y-1.5">
            <li>
              <button
                onClick={() => handleSkillSelect("all")}
                className={`text-left cursor-pointer w-full py-1.5 px-3 rounded-md transition-colors ${
                  !selectedSkill || selectedSkill === "all"
                    ? "font-medium text-primary bg-accent/20"
                    : "text-card-foreground hover:bg-muted"
                }`}
              >
                All Skills
              </button>
            </li>

            {/* Loading state */}
            {(skillsLoading && skillQuery) ||
            (loadingDefaultSkills && !skillQuery) ? (
              <SkillSkeleton />
            ) : (
              <>
                {/* Display skills (either search results or default skills) */}
                {combinedSkillsList().length > 0 ? (
                  combinedSkillsList().map((skill: SkillType) => (
                    <li key={skill.id}>
                      <button
                        onClick={() => handleSkillSelect(skill.id)}
                        className={`text-left cursor-pointer w-full py-1.5 px-3 rounded-md transition-colors ${
                          selectedSkill === skill.id
                            ? "font-medium text-primary bg-accent/20"
                            : "text-card-foreground hover:bg-muted"
                        }`}
                      >
                        {skill.name}
                        {selectedSkill === skill.id && (
                          <span className="ml-2 text-xs text-primary">
                            (selected)
                          </span>
                        )}
                      </button>
                    </li>
                  ))
                ) : skillQuery && skillSearchOpen ? (
                  <li className="py-2 px-3 text-sm text-muted-foreground">
                    No skills found
                  </li>
                ) : null}
              </>
            )}
          </ul>

          {/* No results message */}
          {!skillsLoading &&
            skillSearchOpen &&
            skillQuery &&
            skillResults.length === 0 && (
              <p className="text-muted-foreground text-sm mt-2 px-3">
                No skills found matching "{skillQuery}"
              </p>
            )}

          {/* No default skills message */}
          {!loadingDefaultSkills &&
            !skillQuery &&
            defaultSkills.length === 0 && (
              <p className="text-muted-foreground text-sm mt-2 px-3">
                No skills available
              </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
