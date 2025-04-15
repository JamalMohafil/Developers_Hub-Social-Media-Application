import React, { PropsWithChildren } from "react";

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="mt-12 flex items-center justify-center">
      {children}
    </div>
  );
};

export default AuthLayout;
