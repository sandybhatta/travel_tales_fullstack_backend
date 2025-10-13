import  express  from "express";
import { protect } from "../middlewares/authMiddleware.js";
import globalSearch from "../Controllers/search.controllers/globalSearch.js";
import searchUsers from "../Controllers/search.controllers/Searchusers.js";
import searchPosts from "../Controllers/search.controllers/searchPosts.js";
import searchTrips from "../Controllers/search.controllers/searchTrips.js";

const router = express.Router()

router.get("/", protect, globalSearch)

router.get("/users" , protect , searchUsers)

router.get("/posts" , protect , searchPosts)

router.get("/trips" , protect , searchTrips)


export default router;