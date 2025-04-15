import { AtSign, Facebook, Github, Instagram, Linkedin, Youtube } from "lucide-react";

export const SOCIAL_PLATFORMS = [
  { id: "github", label: "GitHub", icon: Github },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "tiktok", label: "TikTok", icon: AtSign }, // Using AtSign as TikTok is not available in lucide
];
