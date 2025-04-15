"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type FollowContextType = {
  followedUsers: Set<string>;
  isFollowing: (userId: string) => boolean;
  setFollowStatus: (userId: string, status: boolean) => void;
};

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const FollowProvider = ({ children }: { children: ReactNode }) => {
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * The FollowProvider component wraps the entire app and provides
   * context to its descendants about which users the current user is
   * following.
   *
   * The context includes three values:
   *
   *   - `followedUsers`: a Set of user IDs that the current user is
   *     following.
   *   - `isFollowing`: a function that takes a user ID and returns
   *     true if the current user is following the user.
   *   - `setFollowStatus`: a function that takes a user ID and a
   *     boolean, and sets the follow status of the current user for
   *     the given user ID to the given value.
   *
   * This context is used by the {@link useFollow} and
   * {@link useIsFollowing} hooks to provide the current user's follow
   * status for other users.
   *
   * @function FollowProvider
   * @param {Object} props The props object.
   * @param {ReactNode} props.children The children of the component.
   * @returns {React.ReactElement} The rendered component.
   */
  /*******  287f1128-3627-42e4-8038-4f1f5c02e964  *******/ const [
    followedUsers,
    setFollowedUsers,
  ] = useState<Set<string>>(new Set());

  const isFollowing = (userId: string) => {
    return followedUsers.has(userId);
  };

  const setFollowStatus = (userId: string, status: boolean) => {
    setFollowedUsers((prev) => {
      const newSet = new Set(prev);
      if (status) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  return (
    <FollowContext.Provider
      value={{ followedUsers, isFollowing, setFollowStatus }}
    >
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error("useFollow must be used within a FollowProvider");
  }
  return context;
};
