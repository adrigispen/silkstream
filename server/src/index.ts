import express from "express";
import cors from "cors";
import { createVideoRouter } from "./routes/videoRoutes";
import { initializeAwsServices } from "./config/aws";

async function startServer() {
  try {
    const awsServices = await initializeAwsServices();
    const app = express();

    app.use(
      cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
      })
    );

    app.use(express.json());
    app.use("/api", createVideoRouter(awsServices));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
