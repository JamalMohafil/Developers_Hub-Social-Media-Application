// Public routes that allow all users to access them.
export const publicRoutes = ["/", "/profile", "/projects/:id"];

export const userRoutes = ["/dashboard", "/projects/add-project"];
export const authRoutes = [
  "/signup",

  "/signin",
  "/reset-password",
  "/reset-password/token",
];
export const DEFAULT_LOGIN_REDIRECT = "/";
