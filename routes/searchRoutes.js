import  express  from "express";
import { protect } from "../middlewares/authMiddleware.js";
import globalSearch from "../Controllers/search.controllers/globalSearch.js";
import searchUsers from "../Controllers/search.controllers/Searchusers.js";

const router = express.Router()

router.get("/", protect, globalSearch)
router.get("/users" , protect , searchUsers)


export default router;