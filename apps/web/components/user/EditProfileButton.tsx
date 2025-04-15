"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import type { ProfileType } from "@/lib/type";

import Spinner from "../utils/Spinner";
import { SOCIAL_PLATFORMS } from "@/lib/data";
import ChooseSkills from "../utils/ChooseSkills";
import EditProfileLogic from "@/logic/user/edit-profile.logic";

export const EditProfileButton = ({
  userProfile,
  username,
  name,
  setUserProfile,
}: {
  userProfile: ProfileType;
  accessToken: string;
  username: string | null;
  name: string | null;
  setUserProfile: React.Dispatch<React.SetStateAction<ProfileType>>;
}) => {
  const {
    getSocialLinkUrl,
    updateSocialLink,
    removeSkill,
    addSkill,
    closePanel,
    handleSubmit,
    handleInputChange,
    errors,
    skillsLoading,
    skillResults,
    setSkillSearchOpen,
    skillSearchOpen,
    isLoading,
    setIsOpen,
    isOpen,
    formData,
    skillQuery,
    setSkillQuery,
  } = EditProfileLogic({ userProfile, username, name, setUserProfile });
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="border-slate-700  hover:bg-slate-800 hover:text-white"
      >
        Edit Profile
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 ">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}  className="space-y-6">
            {/* Name and Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="bg-slate-800 border-slate-700  focus:ring-emerald-500"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm">
                    {errors.name._errors[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Your username"
                  className="bg-slate-800 border-slate-700  focus:ring-emerald-500"
                />
                {errors.username && (
                  <p className="text-red-400 text-sm">
                    {errors.username._errors[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="">
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio || ""}
                onChange={handleInputChange}
                placeholder="Tell us about yourself"
                rows={3}
                className="bg-slate-800 border-slate-700  focus:ring-emerald-500"
              />
              {errors.bio && (
                <p className="text-red-400 text-sm">{errors.bio._errors[0]}</p>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                  className="bg-slate-800 border-slate-700  focus:ring-emerald-500"
                />
                {errors.location && (
                  <p className="text-red-400 text-sm">
                    {errors.location._errors[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="">
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website || ""}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                  className="bg-slate-800 border-slate-700  focus:ring-emerald-500"
                />
                {errors.website && (
                  <p className="text-red-400 text-sm">
                    {errors.website._errors[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="">
                  Contact Email
                </Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail || ""}
                  onChange={handleInputChange}
                  placeholder="contact email"
                  className="bg-slate-800 border-slate-700  focus:ring-emerald-500"
                />
                {errors.contactEmail && (
                  <p className="text-red-400 text-sm">
                    {errors.contactEmail._errors[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Company and Job Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="">
                  Company
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company || ""}
                  onChange={handleInputChange}
                  placeholder="Company name"
                  className="bg-slate-800 border-slate-700  focus:ring-emerald-500"
                />
                {errors.company && (
                  <p className="text-red-400 text-sm">
                    {errors.company._errors[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="">
                  Job Title
                </Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle || ""}
                  onChange={handleInputChange}
                  placeholder="Your position"
                  className="bg-slate-800 border-slate-700  focus:ring-emerald-500"
                />
                {errors.jobTitle && (
                  <p className="text-red-400 text-sm">
                    {errors.jobTitle._errors[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Skills Section */}
            <ChooseSkills
              addSkill={addSkill}
              errors={errors}
              formData={formData}
              removeSkill={removeSkill}
              setSkillQuery={setSkillQuery}
              setSkillSearchOpen={setSkillSearchOpen}
              skillQuery={skillQuery}
              skillResults={skillResults}
              skillSearchOpen={skillSearchOpen}
              skillsLoading={skillsLoading}
            />

            {/* Social Links */}
            <div className="space-y-3">
              <Label className="">Social Links</Label>
              {errors?.socialLinks && (
                <p className="text-red-400 text-sm">
                  {errors.socialLinks?.[0]?.url._errors[0] || "Invalid input"}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <div
                      key={platform.id}
                      className="flex items-center space-x-2"
                    >
                      <Icon size={20} className="text-slate-400" />
                      <Input
                        placeholder={`${platform.label} URL`}
                        value={getSocialLinkUrl(platform.id)}
                        onChange={(e) =>
                          updateSocialLink(platform.id, e.target.value)
                        }
                        className="bg-slate-800 border-slate-700  focus:ring-emerald-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => closePanel()}
                disabled={isLoading}
                className="border-slate-700  hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isLoading ? (
                  <>
                    {" "}
                    <Spinner />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
