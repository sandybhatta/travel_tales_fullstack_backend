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

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Search functionality
 */

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Global search
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/", protect, globalSearch)


/**
 * @swagger
 * /api/search/users:
 *   get:
 *     summary: Search users
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User search results
 */
router.get("/users" , protect , searchUsers)

/**
 * @swagger
 * /api/search/posts:
 *   get:
 *     summary: Search posts
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post search results
 */
router.get("/posts" , protect , searchPosts)

/**
 * @swagger
 * /api/search/trips:
 *   get:
 *     summary: Search trips
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip search results
 */
router.get("/trips" , protect , searchTrips)

/**
 * @swagger
 * /api/search/history:
 *   get:
 *     summary: Get search history
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Search history
 */
router.get("/history" , protect , history )

/**
 * @swagger
 * /api/search/history/{id}:
 *   delete:
 *     summary: Delete a search history item
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted
 */
router.delete('/history/:id' , protect , deleteOneSearch)

/**
 * @swagger
 * /api/search/history:
 *   delete:
 *     summary: Clear all search history
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: History cleared
 */
router.delete('/history' , protect , deleteAllSearch)



export default router;