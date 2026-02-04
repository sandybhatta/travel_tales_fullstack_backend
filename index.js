// index.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDb } from "./config/db.js";


import authRoutes from "./routes/authroutes.js"
import userRoutes from "./routes/userRoutes.js"
import tripRoutes from "./routes/tripRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import commentRoutes  from "./routes/commentRoutes.js"
import searchRoutes from "./routes/searchRoutes.js"
import { scheduleTripCompletion } from "./cronJob/scheduleTripCompletion.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

import { app, server } from "./socket/socket.js";
import path from "path";

dotenv.config();

scheduleTripCompletion()

connectDb();

// Create Express app (Moved to socket.js)
// const app = express();


 
app.use(cookieParser()); 

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_LIVE_URL,             
  "https://www.traveltalesapp.in",     
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",        
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log("Blocked by CORS:", origin); // Debugging log
          callback(new Error("Not allowed by CORS"));
        }
    },

  credentials: true, 
}));


console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);


app.get("/", (req, res) => {
  res.send(" API is running...");
});

// Swagger UI Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


import notificationRoutes from "./routes/notificationRoutes.js"


app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/user",userRoutes)

app.use("/api/trips", tripRoutes )

app.use("/api/posts", postRoutes )

app.use("/api/comment",commentRoutes)

app.use('/api/search',searchRoutes)

app.use("/api/notifications", notificationRoutes);



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
 
});
