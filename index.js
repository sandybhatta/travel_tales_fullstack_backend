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


dotenv.config();

scheduleTripCompletion()

connectDb();

// 🚀 Create Express app
const app = express();


app.use(express.json()); 
app.use(cookieParser()); 
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",

  credentials: true, 
}));


console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);


app.get("/", (req, res) => {
  res.send(" API is running...");
});





app.use("/api/auth", authRoutes);

app.use("/api/user",userRoutes)

app.use("/api/trips", tripRoutes )

app.use("/api/posts", postRoutes )

app.use("/api/comment",commentRoutes)

app.use('/api/search',searchRoutes)




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
 
});
