import  express  from "express";
import { protect } from "../middlewares/authMiddleware.js";
import globalSearch from "../Controllers/search.controllers/globalSearch.js";
import searchUsers from "../Controllers/search.controllers/Searchusers.js";
import searchPosts from "../Controllers/search.controllers/searchPosts.js";
import searchTrips from "../Controllers/search.controllers/searchTrips.js";
import history from "../Controllers/search.controllers/history.js";
import deleteOneSearch from "../Controllers/search.controllers/deleteOneSearch.js";
import deleteAllSearch from "../Controllers/search.controllers/deleteAllSearch.js";


const router = express.Router()

router.get("/", protect, globalSearch)


router.get("/users" , protect , searchUsers)

router.get("/posts" , protect , searchPosts)

router.get("/trips" , protect , searchTrips)

router.get("/history" , protect , history )

router.delete('/history/:id' , protect , deleteOneSearch)

router.delete('/history' , protect , deleteAllSearch)



export default router;