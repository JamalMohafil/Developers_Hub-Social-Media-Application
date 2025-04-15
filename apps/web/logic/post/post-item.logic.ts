import { DeletePostAction } from "@/actions/posts/delete-post.action";
import { likePostAction } from "@/actions/posts/like-post.action";
import { followAction } from "@/actions/user/followers/follow.action";
import { unfollowAction } from "@/actions/user/followers/unFollow.action";
import { PostItemProps } from "@/components/posts/PostItem";
import { useFollow } from "@/context/followContext";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const usePostItemLogic = ({
  post: currentPost,
  session,
  refreshPosts,
}: PostItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [post, setPost] = useState(currentPost);
  const [likeCount, setLikeCount] = useState<number>(post.likeCount || 0);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [followLoading, setFollowLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const { isFollowing, setFollowStatus } = useFollow();
  const [userFollowStatus, setUserFollowStatus] = useState<boolean>();

  useEffect(() => {
    setUserFollowStatus(
      post?.user?.id ? isFollowing(post?.user?.id as string) : false
    );
  }, [isFollowing, post?.user?.id]);
  console.log(userFollowStatus, isFollowing, "hjadmskfgdlf");
  // Function to toggle content expansion
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Function to open comments dialog
  const openComments = () => {
    setCommentsOpen(true);
  };

  // Update follow status when post changes
  useEffect(() => {
    setFollowStatus(post?.user?.id as string, post.isFollowing as boolean);
  }, []);

  // Function to copy post link
  const sharePost = () => {
    const postUrl = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      setCopied(true);
      toast.dark("Link copied");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Get the most recent comment if available
  const recentComment = (post && post.comments && post.comments[0]) || null;
  const likePost = async () => {
    // التحقق من تسجيل الدخول
    if (!session) return toast.dark("You must be logged in to like a post");

    // تجنب المعالجة المتعددة أثناء التحميل
    if (likeLoading) return;

    // تخزين الحالة الحالية قبل إجراء أي تغييرات
    const currentLikeStatus = isLiked;
    const currentLikeCount = likeCount;

    // بدء حالة التحميل
    setLikeLoading(true);

    try {
      // تحديث واجهة المستخدم فوراً للاستجابة السريعة (نقوم بالتبديل)
      setIsLiked(!currentLikeStatus);

      // تحديث عدد الإعجابات مباشرة في واجهة المستخدم (للاستجابة الفورية)
      if (!currentLikeStatus) {
        setLikeCount((prevCount) => prevCount + 1);
      } else {
        setLikeCount((prevCount) => prevCount - 1);
      }

      // إرسال الطلب إلى الخادم
      const res = await likePostAction(post.id);

      // التحقق من صحة الاستجابة
      if (res && res.action) {
        // تحديث حالة وعدد الإعجابات بناءً على استجابة الخادم
        if (res.action === "liked") {
          // نتأكد من أن حالة الإعجاب هي "معجب"، بغض النظر عن التحديثات المؤقتة
          setIsLiked(true);
          // أيضًا، تحديث كائن المنشور للحفاظ على التناسق
          setPost((prevPost) => ({
            ...prevPost,

            isFollowing: userFollowStatus,
            isLiked: true,
            likeCount: currentLikeStatus
              ? currentLikeCount
              : currentLikeCount + 1,
          }));
          // ضبط عدد الإعجابات بناءً على استجابة الخادم
          setLikeCount(
            currentLikeStatus ? currentLikeCount : currentLikeCount + 1
          );
        } else if (res.action === "unliked") {
          // نتأكد من أن حالة الإعجاب هي "غير معجب"، بغض النظر عن التحديثات المؤقتة
          setIsLiked(false);
          // أيضًا، تحديث كائن المنشور للحفاظ على التناسق
          setPost((prevPost) => ({
            ...prevPost,
            isLiked: false,
            isFollowing: userFollowStatus,

            likeCount: currentLikeStatus
              ? currentLikeCount - 1
              : currentLikeCount,
          }));
          // ضبط عدد الإعجابات بناءً على استجابة الخادم
          setLikeCount(
            currentLikeStatus ? currentLikeCount - 1 : currentLikeCount
          );
        }
      } else {
        // استعادة الحالة السابقة في حالة الخطأ
        setIsLiked(currentLikeStatus);
        setLikeCount(currentLikeCount);
        toast.dark(res?.message || "Something went wrong");
      }
    } catch (error: any) {
      console.error("Error liking post:", error);

      // استعادة الحالة السابقة
      setIsLiked(currentLikeStatus);
      setLikeCount(currentLikeCount);

      toast.dark(error?.message || "Something went wrong");
    } finally {
      // إنهاء حالة التحميل
      setLikeLoading(false);
    }
  };

  // أيضًا، تحديث useEffect لتزامن القيم الأولية بشكل صحيح
  useEffect(() => {
    // تحديث حالة المتابعة
    setFollowStatus(post?.user?.id as string, post.isFollowing as boolean);

    // مزامنة حالة الإعجاب عند تغير post من الخارج
    setIsLiked(post.isLiked);
    setLikeCount(post.likeCount || 0);
  }, [post.id, post.isLiked, post.likeCount, post.isFollowing, post?.user?.id]);

  const handleFollow = async () => {
    if (!session || !session.user || !post.user?.profileId || !post.user?.id) {
      redirect("/signin");
    }

    setFollowLoading(true);
    setFollowStatus(post.user.id, true); // Update global state

    try {
      const result = await followAction(post.user?.profileId as string);
      if (result.success) {
        toast.dark("Successfully followed user");
        setFollowStatus(post.user.id, true);
      } else {
        if (result.message === "Already following this user") {
          setFollowStatus(post.user.id, true);
          return toast.dark(result.message);
        }
        setFollowStatus(post.user.id, false);
        console.error("❌ Failed to follow user:", result.message);
        toast.dark(result.message || "Failed to follow user");
      }
    } catch (error) {
      setFollowStatus(post.user.id, false);
      console.error("❌ Follow action failed:", error);
      toast.dark("Something went wrong");
    } finally {
      setFollowLoading(false);
    }
  };
  const handleUnfollow = async () => {
    if (!session || !session.user || !post.user?.profileId || !post.user?.id) {
      redirect("/signin");
    }

    setFollowLoading(true);
    setFollowStatus(post.user.id, false); // Update global state

    try {
      const result = await unfollowAction(post.user?.profileId as string);
      if (result.success) {
        toast.dark("Successfully unfollowed user");
        setFollowStatus(post.user.id, false);
      } else {
        if (result.message === "Already unfollowing this user") {
          setFollowStatus(post.user.id, false);
          return toast.dark(result.message);
        }
        setFollowStatus(post.user.id, true);
        console.error("❌ Failed to follow user:", result.message);
        toast.dark(result.message || "Failed to unfollow user");
      }
    } catch (error) {
      setFollowStatus(post.user.id, true);
      console.error("❌ Follow action failed:", error);
      toast.dark("Something went wrong");
    } finally {
      setFollowLoading(false);
    }
  };
  const handleDeletePost = async () => {
    setDeleteLoading(true);
    try {
      const result = await DeletePostAction(post.id as string);
      if (result.status === 200) {
        toast.dark(result.message || "Successfully deleted post");
        refreshPosts();
      } else {
        toast.dark(result.message || "Something went wrong");
      }
    } catch (e: any) {
      toast.dark(e.message || "Something went wrong");
      throw e;
    } finally {
      setDeleteLoading(false);
    }
  };
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const handleOpenEdit = () => {
    setIsEditDialogOpen(true);
  };
  const isCurrentUserPost =
    (post && post.user && post?.user.id === session?.user.id) || false;
  return {
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleOpenEdit,
    isCurrentUserPost,
    handleDeletePost,
    handleUnfollow,
    handleFollow,
    likePost,
    openComments,
    sharePost,
    toggleExpand,
    isLiked,
    likeLoading,
    likeCount,
    commentsOpen,
    post,
    setPost,
    expanded,
    recentComment,
    setIsDeleteDialogOpen,
    isDeleteDialogOpen,
    copied,
    setCopied,
    setCommentsOpen,
    userFollowStatus,
    followLoading,
    deleteLoading,
  };
};
