"use client";
import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, X, Save, AlertCircle, Eye } from "lucide-react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import type { ProfileType } from "@/lib/type";
import { updateUserImageAction } from "@/actions/user/update-user-image.action";
import ImageByChar from "../utils/ImageByChar";

// Types
interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Image cropping utility function
const createImage = async (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // نستخدم window.Image فقط إذا كان موجود
    const ImageConstructor =
      typeof window !== "undefined" ? window.Image : null;

    if (!ImageConstructor) {
      reject(
        new Error("Image constructor is not available in this environment.")
      );
      return;
    }

    const img = new ImageConstructor();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: CroppedAreaPixels
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  // Set dimensions to the desired cropped size
  canvas.width = 200;
  canvas.height = 200;

  // Draw the cropped image on the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    200,
    200
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Canvas is empty"));
        else resolve(blob);
      },
      "image/jpeg",
      0.95
    );
  });
};

type Props = {
  userProfile: ProfileType;
  isOwnProfile: boolean;
};

const ProfileImage = ({ userProfile, isOwnProfile }: Props) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false); // حالة جديدة لمعاينة الصورة
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<CroppedAreaPixels | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState(
    userProfile?.user?.image || ""
  );

  const openModal = () => {
    if (isOwnProfile) {
      setIsModalOpen(true);
    } else {
      // إذا لم يكن صاحب البروفايل، افتح معاينة الصورة
      setIsImagePreviewOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setImageSrc(null);
    setError(null);
  };

  const closeImagePreview = () => {
    setIsImagePreviewOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file: any = e.target.files[0];

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: CroppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      setError(null);

      // Create cropped image
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Upload image using the action
      const result = await updateUserImageAction(
        croppedImage,
        userProfile.userId
      );

      if (!result.success) {
        setError(result.error);
        return;
      }
      setProfileImage(result.data.image);
      // Success - close modal and refresh page
      router.refresh();
      toast.success("Profile image updated successfully");

      closeModal();
    } catch (err: any) {
      setError(err.message || "Sorry, something went wrong.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div
        className="relative w-32 h-32 cursor-pointer group"
        onClick={openModal}
      >
        <div className="absolute inset-0 rounded-full bg-slate-700 overflow-hidden">
          <div className="flex items-center justify-center h-full text-white text-4xl font-bold">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={userProfile?.user?.name || ""}
                width={200}
                height={200}
                className="object-cover w-full h-full"
              />
            ) : (
              <ImageByChar name={userProfile?.user?.name as string} />
            )}
          </div>
        </div>

        {/* Camera/Eye overlay */}
        {isOwnProfile ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Camera className="w-8 h-8 text-white" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Eye className="w-8 h-8 text-white" />
          </div>
        )}
      </div>

      {/* Image Upload Modal - فقط لصاحب البروفايل */}
      {isOwnProfile && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-lg w-full bg-slate-900 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                Update Profile Image
              </h3>
              <button
                onClick={closeModal}
                className="rounded-full p-2 hover:bg-slate-800 transition-colors duration-200"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              {!imageSrc ? (
                <div className="flex flex-col items-center justify-center gap-4">
                  <div
                    className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center w-full cursor-pointer hover:border-emerald-600 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                    <p className="text-slate-300">Select an image</p>
                    <p className="text-slate-500 text-sm mt-2">Max size: 5mb</p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />

                  {error && (
                    <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-lg flex items-start gap-2 w-full mt-2">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="relative h-64 w-full">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      cropShape="round"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="block text-sm text-slate-400 mb-2">
                      Zoom in
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-lg flex items-start gap-2 w-full mt-2">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                      onClick={() => {
                        setImageSrc(null);
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                      onClick={handleSave}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>Updating...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Update Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal - للزوار - تم تعديله */}
      {!isOwnProfile && isImagePreviewOpen && userProfile.user?.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeImagePreview} // هنا سيتم اغلاق المودل عند النقر خارج الصورة
        >
          <div
            className="relative p-4 bg-slate-900 rounded-lg"
            onClick={(e) => e.stopPropagation()} // لمنع اغلاق المودل عند النقر على الكونتينر او الصورة
          >
            {/* زر الإغلاق - تم تعديل الموضع */}
            <button
              onClick={closeImagePreview}
              className="absolute top-2 right-2 bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors duration-200 z-10"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* الصورة بحجم مناسب */}
            <div className="rounded-lg overflow-hidden relative">
              <Image
                src={profileImage}
                alt={userProfile?.user.name || ""}
                width={500}
                height={500}
                className="object-contain"
                loading="eager"
              />

              {/* اسم المستخدم */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-3">
                <h3 className="text-white text-lg font-medium">
                  {userProfile?.user.name ||
                    userProfile?.user.username ||
                    "User"}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileImage;
