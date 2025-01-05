import { configureStore } from "@reduxjs/toolkit";
import { api } from "../services/api";
import { errorMiddleware } from "./errorMiddleware";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware).concat(errorMiddleware),
});
