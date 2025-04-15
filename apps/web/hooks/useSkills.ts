import { SkillType } from "@/lib/type";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";

type UseSkillsParams = {
  initialSkills?: SkillType[];
  maxSkills?: number;
};

const useSkills = ({
  initialSkills = [],
  maxSkills = 10,
}: UseSkillsParams = {}) => {
  const [skills, setSkills] = useState<SkillType[]>(initialSkills);
  const [skillSearchOpen, setSkillSearchOpen] = useState(false);
  const [skillQuery, setSkillQuery] = useState("");
  const [skillResults, setSkillResults] = useState<SkillType[]>([]);
  const [skillsLoading, setSkillsLoading] = useState<boolean>(false);

  // Search skills from API
  useEffect(() => {
    const fetchSkills = async () => {
      if (skillQuery.length < 1) {
        setSkillResults([]);
        return;
      }

      try {
        setSkillsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/skills?search=${skillQuery ? encodeURIComponent(skillQuery) : ""}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (response.ok) {
          const data = await response.json();

          // Filter out skills that are already selected
          const skillIds = skills.map((skill) => skill.id);
          const filteredResults = data.filter(
            (skill: SkillType) => !skillIds.includes(skill.id)
          );

          setSkillResults(filteredResults);
        }
      } catch (error) {
        console.error("Error searching skills:", error);
      } finally {
        setSkillsLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchSkills();
    }, 300);

    return () => clearTimeout(debounce);
  }, [skillQuery, skills]);

  // Add selected skill
  const addSkill = (skill: SkillType) => {
    // Check if already added or reached limit
    if (skills.some((s) => s.id === skill.id) || skills.length >= maxSkills) {
      return;
    }

    setSkills((prev) => [...prev, skill]);
    setSkillQuery("");
  };

  // Remove a skill
  const removeSkill = (skillId: string) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== skillId));
  };

  return {
    skills,
    setSkills,
    skillsLoading,
    skillResults,
    skillSearchOpen,
    setSkillSearchOpen,
    skillQuery,
    setSkillQuery,
    addSkill,
    removeSkill,
    hasReachedMaxSkills: skills.length >= maxSkills,
  };
};

export default useSkills;
