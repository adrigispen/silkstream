import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

interface ErrorResponse {
  data?: {
    error?: string;
  };
  status?: number;
}

export const errorMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const error = action.payload as ErrorResponse;
    const errorMessage = error.data?.error || "Something went wrong";
    toast.error(`Error: ${errorMessage}`);
  }

  return next(action);
};
