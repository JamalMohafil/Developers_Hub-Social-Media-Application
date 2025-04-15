import {
  ProfileType,
  SkillType,
  SocialLink,
  updateUserFormSchema,
} from "@/lib/type";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useSkills from "@/hooks/useSkills";
import { updateUserAction } from "@/actions/user/update-user.action";

type Props = {
  userProfile: ProfileType;
  username: string | null;
  name: string | null;
  setUserProfile: React.Dispatch<React.SetStateAction<ProfileType>>;
};

const EditProfileLogic = ({
  setUserProfile,
  userProfile,
  name,
  username,
}: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // استخدام كود المهارات
  const {
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
  } = useSkills({
    initialSkills: userProfile.skills || [],
    maxSkills: 10,
  });

  const [formData, setFormData] = useState<any>({
    name: name || "",
    username: username || "",
    bio: userProfile.bio || "",
    location: userProfile.location || "",
    company: userProfile.company || "",
    jobTitle: userProfile.jobTitle || "",
    website: userProfile.website || "",
    contactEmail: userProfile.contactEmail || "",
    socialLinks: userProfile.socialLinks || [],
    skills: userProfile.skills || [],
  });

  // تحديث formData عند تغيير المهارات
  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      skills: skills,
    }));
  }, [skills]);

  // رفع بيانات النموذج عند فتح الحوار
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: name || "",
        username: username || "",
        bio: userProfile.bio || "",
        location: userProfile.location || "",
        company: userProfile.company || "",
        jobTitle: userProfile.jobTitle || "",
        website: userProfile.website || "",
        skills: userProfile.skills || [],
        contactEmail: userProfile.contactEmail || "",
        socialLinks: userProfile.socialLinks || [],
      });
      setSkills(userProfile.skills || []);
    }
  }, [isOpen, name, username, userProfile, setSkills]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من صحة البيانات
    const dataToValidate = {
      ...formData,
      skills: skills,
    };

    const validationResult = updateUserFormSchema.safeParse(dataToValidate);
    if (!validationResult.success || validationResult.error) {
      setErrors(validationResult.error.format());
      return;
    }
    setIsLoading(true);

    try {
      const cleanedFormData = {
        ...dataToValidate,
        socialLinks: dataToValidate.socialLinks.filter(
          (link: SocialLink) => link.url && link.url.trim() !== ""
        ),
      };
      console.log(cleanedFormData);
      console.log(userProfile.userId);
      console.log(formData);

      const updatedData = await updateUserAction(
        userProfile.userId,
        cleanedFormData
      );
      console.log(updatedData, "data");
      if (
        updatedData &&
        updatedData.error &&
        updatedData.error.message &&
        updatedData.error.message === "Username is already taken"
      ) {
        toast.error("Username is already taken");
        setUserProfile(userProfile);

        // تحديث حالة الأخطاء في النموذج
        return setErrors((prev: any) => ({
          ...prev,
          username: {
            _errors: ["Username is already taken"],
          },
        }));
      }
      if (updatedData) {
        setUserProfile((prevProfile: any) => ({
          ...prevProfile,
          ...updatedData,
          user: updatedData.user,
          skills: updatedData.skills,
          socialLinks: updatedData.socialLinks,
        }));

        toast.success("Profile updated successfully!");
        closePanel();

        setTimeout(() => {
          router.refresh();
        }, 100);
      }
    } catch (error: any) {
      // التحقق من رسالة الخطأ لمعرفة إذا كان اسم المستخدم مستخدم بالفعل

      toast.error(error.message || "Failed to update profile");

      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const closePanel = () => {
    setErrors({});
    setIsOpen(false);
  };

  // Add or update social link
  const updateSocialLink = (platform: string, url: string) => {
    setFormData((prev: any) => {
      const currentLinks = [...(prev.socialLinks || [])];
      const existingIndex = currentLinks.findIndex(
        (link) => link.platform === platform
      );

      if (existingIndex >= 0) {
        // Update existing link
        currentLinks[existingIndex] = { platform, url };
      } else {
        // Add new link
        currentLinks.push({ platform, url });
      }

      return {
        ...prev,
        socialLinks: currentLinks,
      };
    });
  };

  // Get social link URL for a platform
  const getSocialLinkUrl = (platform: string) => {
    if (!formData.socialLinks) return "";
    const link = formData.socialLinks.find(
      (link: SocialLink) => link.platform === platform
    );
    return link && link.url ? link.url : "";
  };

  return {
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
    skills,
  };
};

export default EditProfileLogic;
