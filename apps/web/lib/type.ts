import { z } from "zod";
export type FormStateType =
  | {
      error?: {
        name?: string[];
        username?: string[];
        email?: string[];
        password?: string[];
      };
      data?: {
        name?: string;
        username?: string;
        email?: string;
        password?: string;
      };
      message?: string;
    }
  | undefined;

export const updateUserFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(25, "Username must be less than or equal to 25 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores, with no spaces."
    ),
  bio: z
    .string()
    .max(450, "Bio cannot exceed 450 characters")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(21, {
      message: "Your location title is very long, make it short and try again",
    })
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .max(21, {
      message: "Your company name is very long, make it short and try again",
    })
    .optional()
    .or(z.literal("")),
  jobTitle: z
    .string()
    .max(21, {
      message: "Your job title is very long, make it short and try again",
    })
    .optional()
    .or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  contactEmail: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  skills: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .max(10, "You can add up to 10 skills")
    .optional(),
  socialLinks: z
    .array(
      z.object({
        platform: z.string(),
        // الحل هنا: السماح بالسلاسل الفارغة أو روابط صالحة
        url: z.union([
          z.string().url("Invalid URL"),
          z.string().max(0), // السماح بالسلسلة الفارغة
        ]),
      })
    )
    .optional(),
});
export const SignupFormSchema = z.object({
  name: z.string({ message: "Please enter your name" }),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(25, "Username must be less than or equal to 25 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores, with no spaces."
    ),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be 8 charcters at least" })
    .trim(),
  //   password: z
  //     .string()
  //     .min(8, { message: "Be at least 8 characters long" })
  //     .regex(/[a-zA-Z]/, {
  //       message: "Contain at least one letter.",
  //     })
  //     .regex(/[0-9]/, {
  //       message: "Contain at least one number.",
  //     })
  //     .regex(/[^a-zA-Z0-9]/, {
  //       message: "Contain at least one special character.",
  //     })
  //     .trim(),
});
const imageFileSizeLimit = 1024 * 1024 * 5;
export const projectFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(80, "Title must be shorter than 80 characters"),
  description: z.string().min(1, "Description is required"),
  image: z
    .instanceof(File)
    .refine(
      (file) =>
        ["image/png", "image/jpg", "image/jpeg", "image/webp"].includes(
          file.type
        ),
      { message: "Invalid image file type" }
    )
    .refine((file) => file.size <= imageFileSizeLimit, {
      message: "File size should not exceed 5MB",
    })
    .optional()
    .nullable(),
  projectUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  skills: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .max(10, "You can add up to 10 skills")
    .optional(),
  videoUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});
export const projectEditSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.any().optional(),
  projectUrl: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().length(0)),
  videoUrl: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  skills: z.array(z.any()).optional(),
});

export const SignInFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, {
    message: "Password field must not be empty.",
  }),
});
export const ResetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
});
export const PasswordResetSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be 8 characters at least" })
      .trim(),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be 8 characters at least" })
      .trim(),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const updateCommentSchema = z.object({
  content: z.string().min(1, "Please enter a comment"),
});
export const updateReplySchema = z.object({
  content: z.string().min(1, "Please enter a comment"),
});
const containsTextOnly = /[^\s<>]+/;

export const updatePostSchema = z.object({
  title: z.string().optional(),
  content: z
    .string()
    .min(1, "Please enter content")
    .refine((content) => containsTextOnly.test(content), {
      message: "Content must contain text and not just HTML tags",
    }),
  image: z.any().optional(),
  categories: z.array(z.any()).optional(),
  tags: z.array(z.any()).optional(),
  status: z.enum(["PUBLISHED", "DRAFT"]),
});
export const createPostSchema = z.object({
  title: z.string().optional(),
  content: z
    .string()
    .min(1, "Please enter content")
    .refine((content) => containsTextOnly.test(content), {
      message: "Content must contain text and not just HTML tags",
    }),
  image: z.any().optional(),
  categories: z.array(z.any()).optional(),
  tags: z.array(z.any()).optional(),
  status: z.enum(["PUBLISHED", "DRAFT"]),
});

export enum Role {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  USER = "USER",
}

// type.ts
export type UserInfoType = {
  // تعريف حقول بيانات المستخدم حسب ما يعيده API الخاص بك
  email: string;
  id: string;
  emailVerified: boolean;
  username?: string | null;
  image?: string | null;
  profileId: string;
  name?: string | null;
  role: Role;
  oauthId?: string;
  // أي حقول أخرى قد تكون موجودة في استجابة API
};
export type FollowType = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt?: string;
  updatedAt?: string;
  follower?: ProfileType;
  following?: ProfileType;
};

export type SessionType = {
  user: UserInfoType;
  accessToken: string;
  // refreshToken: string;
  lastUpdated?: number;
};

export type SkillType = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};
export type Project = {
  id: string;
  title: string;
  description: string;
  image?: string;
  videoUrl?: string;
  projectUrl?: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
  skills: SkillType[];

  // Relation
  profile: ProfileType; // يجب أن تحدد نوع `Profile`
};
export type SocialLink = {
  id: string;
  platform: string; // e.g., "github", "instagram", "linkedin"
  url: string;
  profileId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProfileType = {
  id: string;
  userId: string;
  company?: string;
  bio?: string;
  location?: string;
  website?: string;
  contactEmail?: string;
  jobTitle?: string;
  createdAt: string; // تمثل `DateTime` على أنها string في TypeScript
  updatedAt: string; // تمثل `DateTime` على أنها string في TypeScript

  // Relations
  user?: UserInfoType; // يجب أن تحدد نوع `User`
  skills: SkillType[];
  projects: Project[];
  followersCount: number;
  postsCount: number;
  followingCount: number;
  isFollowing: boolean;
  socialLinks: SocialLink[];
};

export enum NotificationType {
  MESSAGE = "MESSAGE",
  FOLLOW = "FOLLOW",
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  SYSTEM = "SYSTEM",
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  link?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  userId: string;
}

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    name?: string;
    id?: string;
    image?: string;
  };
  isLiked?: boolean;
  likeCount?: number;
  replyCount?: number;
};

export type Reply = {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    name?: string;
    id?: string;
    image?: string;
  };
  isLiked?: boolean;
  likeCount?: number;
};
export type Post = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  isLiked?: boolean;
  updatedAt: string;
  status: "DRAFT" | "PUBLISHED";
  profileId: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  tags?: Tag[];
  isFollowing?: boolean;
  user?: {
    name?: string;
    id?: string;
    image?: string;
    profileId?: string;
  };
  likeCount?: number;
  commentCount?: number;
  comments?: Comment[];
};
export type Category = {
  id: string;
  name: string;
};

export type Tag = {
  id: string;
  name: string;
};
export type PostStatus = "PUBLISHED" | "DRAFT";
export const POST_STATUS = ["PUBLISHED", "DRAFT"];
