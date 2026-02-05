import express from "express"
import { protect } from "../middlewares/authMiddleware.js"
import { upload } from "../middlewares/multer.js"

import createTrip from "../Controllers/trip.controllers/createTrip.js";
import getTripById from "../Controllers/trip.controllers/getTripById.js";
import editTrip from "../Controllers/trip.controllers/editTrip.js";
import softDeleteTrip from "../Controllers/trip.controllers/softDeleteTrip.js";
import restoreTrip from "../Controllers/trip.controllers/restoreTrip.js";
import restoreAllTrip from "../Controllers/trip.controllers/restoreAllTrip.js";
import softDeleteAll from "../Controllers/trip.controllers/softDeleteAll.js";
import visibilityChange from "../Controllers/trip.controllers/visibilityChange.js";
import completeTrip from "../Controllers/trip.controllers/completeTrip.js";
import inviteToTrip from "../Controllers/trip.controllers/inviteToTrip.js";
import acceptToTrip from "../Controllers/trip.controllers/acceptToTrip.js";
import removeCollaborator from "../Controllers/trip.controllers/removeCollaborator.js";
import getCollaboratorsOfTrip from "../Controllers/trip.controllers/getCollaboratorsOfTrip.js";
import getinvitedsOfTrip from "../Controllers/trip.controllers/getInvitedsOfTrip.js";
import removeInvite from "../Controllers/trip.controllers/removeInvite.js";
import tripsOfUser from "../Controllers/trip.controllers/tripsOfUser.js";
import tripsCollaborated from "../Controllers/trip.controllers/tripsCollaborated.js";
import getTripsByTagname from "../Controllers/trip.controllers/getTripsByTag.js";
import getArchivedTrips from "../Controllers/trip.controllers/getArchivedTrips.js";
import upcomingTrips from "../Controllers/trip.controllers/upcomingTrips.js";
import onGoingTrips from "../Controllers/trip.controllers/onGoingTrips.js";
import pastTrips from "../Controllers/trip.controllers/pastTrips.js";
import addPostToTrip from "../Controllers/trip.controllers/addPostToTrip.js";

import deletePostOfTrip from "../Controllers/trip.controllers/deltePostOfTrip.js";
import highlightPost from "../Controllers/trip.controllers/highlightPost.js";
import toggleLike from "../Controllers/trip.controllers/toggleLikeTrip.js";
import getLikesOfTrip from "../Controllers/trip.controllers/getLikesOfTrip.js";
import addExpensesTrip from "../Controllers/trip.controllers/addExpensesTrip.js";
import getExpensesTrip from "../Controllers/trip.controllers/getExpensesTrip.js";
import deleteExpense from "../Controllers/trip.controllers/deleteExpense.js";
import addNote from "../Controllers/trip.controllers/addNote.js";
import getNotes from "../Controllers/trip.controllers/getNotes.js";
import deleteNote from "../Controllers/trip.controllers/deleteNote.js";
import pinUnpinNote from "../Controllers/trip.controllers/pinUnpinNote.js";
import addTodo from "../Controllers/trip.controllers/addTodo.js";
import getTodo from "../Controllers/trip.controllers/getTodo.js";
import toggleTodo from "../Controllers/trip.controllers/toggleTodo.js";
import deleteTodo from "../Controllers/trip.controllers/deleteTodo.js";


//import getPostsOfTrip from "../Controllers/trip.controllers/getPostsOfTrip.js";


const router = express.Router();


//  STATIC / SPECIFIC ROUTES FIRST

router.get("/status/upcoming", protect, upcomingTrips);
/**
 * @swagger
 * /api/trips/status/ongoing:
 *   get:
 *     summary: Get ongoing trips
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ongoing trips
 */
router.get("/status/ongoing", protect, onGoingTrips);

/**
 * @swagger
 * /api/trips/status/past:
 *   get:
 *     summary: Get past trips
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of past trips
 */
router.get("/status/past", protect, pastTrips);

/**
 * @swagger
 * /api/trips/archived-trips:
 *   get:
 *     summary: Get archived trips
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of archived trips
 */
router.get("/archived-trips", protect, getArchivedTrips);

/**
 * @swagger
 * /api/trips/archive-all:
 *   delete:
 *     summary: Archive all trips
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All trips archived
 */
router.delete("/archive-all", protect, softDeleteAll);

/**
 * @swagger
 * /api/trips/restore-all:
 *   patch:
 *     summary: Restore all trips
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All trips restored
 */
router.patch("/restore-all", protect, restoreAllTrip);

router.post("/backfill-chats", protect, backfillTripChats);

/**
 * @swagger
 * /api/trips/tag/{tagname}:
 *   get:
 *     summary: Get trips by tag
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagname
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of trips with tag
 */
router.get("/tag/:tagname", protect, getTripsByTagname);

/**
 * @swagger
 * /api/trips/{userId}/own-trip:
 *   get:
 *     summary: Get user's own trips
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of own trips
 */
router.get("/:userId/own-trip", protect, tripsOfUser);

/**
 * @swagger
 * /api/trips/{userId}/collaborated-trip:
 *   get:
 *     summary: Get trips user collaborated on
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of collaborated trips
 */
router.get("/:userId/collaborated-trip", protect, tripsCollaborated);


//  CREATE TRIP
/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create a new trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startDate
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               coverPhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Trip created
 */
router.post("/", protect, upload.single("coverPhoto"), createTrip);


//  COLLABORATION & INVITATIONS
/**
 * @swagger
 * /api/trips/{tripId}/invite:
 *   post:
 *     summary: Invite user to trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invitation sent
 */
router.post("/:tripId/invite", protect, inviteToTrip);

/**
 * @swagger
 * /api/trips/{tripId}/accept:
 *   post:
 *     summary: Accept trip invitation
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation accepted
 */
router.post("/:tripId/accept", protect, acceptToTrip);

/**
 * @swagger
 * /api/trips/{tripId}/collaborators:
 *   get:
 *     summary: Get trip collaborators
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of collaborators
 */
router.get("/:tripId/collaborators", protect, getCollaboratorsOfTrip);

/**
 * @swagger
 * /api/trips/{tripId}/collaborators/{userId}:
 *   delete:
 *     summary: Remove collaborator
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collaborator removed
 */
router.delete("/:tripId/collaborators/:userId", protect, removeCollaborator);

/**
 * @swagger
 * /api/trips/{tripId}/invited:
 *   get:
 *     summary: Get invited users
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of invited users
 */
router.get("/:tripId/invited", protect, getinvitedsOfTrip);

/**
 * @swagger
 * /api/trips/{tripId}/invited/{userId}:
 *   delete:
 *     summary: Remove invitation
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation removed
 */
router.delete("/:tripId/invited/:userId", protect, removeInvite);


//  POSTS
/**
 * @swagger
 * /api/trips/{tripId}/posts:
 *   post:
 *     summary: Add post to trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post added to trip
 */
router.post("/:tripId/posts", protect, addPostToTrip);

/**
 * @swagger
 * /api/trips/{tripId}/posts/{postId}:
 *   delete:
 *     summary: Remove post from trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post removed from trip
 */
router.delete("/:tripId/posts/:postId", protect, deletePostOfTrip);

/**
 * @swagger
 * /api/trips/{tripId}/posts/{postId}/highlight:
 *   patch:
 *     summary: Highlight post in trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post highlighted
 */
router.patch("/:tripId/posts/:postId/highlight", protect, highlightPost);


//  LIKES
/**
 * @swagger
 * /api/trips/{tripId}/like:
 *   post:
 *     summary: Like/Unlike trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip like status toggled
 */
router.post("/:tripId/like", protect, toggleLike);

/**
 * @swagger
 * /api/trips/{tripId}/likes:
 *   get:
 *     summary: Get trip likes
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users who liked the trip
 */
router.get("/:tripId/likes", protect, getLikesOfTrip);


//  EXPENSES
/**
 * @swagger
 * /api/trips/{tripId}/expenses:
 *   post:
 *     summary: Add expense to trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Expense added
 */
router.post("/:tripId/expenses", protect, addExpensesTrip);

/**
 * @swagger
 * /api/trips/{tripId}/expenses:
 *   get:
 *     summary: Get trip expenses
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of expenses
 */
router.get("/:tripId/expenses", protect, getExpensesTrip);

/**
 * @swagger
 * /api/trips/{tripId}/expenses/{expenseId}:
 *   delete:
 *     summary: Delete expense
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expense deleted
 */
router.delete("/:tripId/expenses/:expenseId", protect, deleteExpense);


//  NOTES
/**
 * @swagger
 * /api/trips/{tripId}/notes:
 *   post:
 *     summary: Add note to trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note added
 */
router.post("/:tripId/notes", protect, addNote);

/**
 * @swagger
 * /api/trips/{tripId}/notes:
 *   get:
 *     summary: Get trip notes
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of notes
 */
router.get("/:tripId/notes", protect, getNotes);

/**
 * @swagger
 * /api/trips/{tripId}/notes/{noteId}:
 *   delete:
 *     summary: Delete note
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note deleted
 */
router.delete("/:tripId/notes/:noteId", protect, deleteNote);

/**
 * @swagger
 * /api/trips/{tripId}/notes/{noteId}/pin:
 *   patch:
 *     summary: Pin/Unpin note
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note pin status toggled
 */
router.patch("/:tripId/notes/:noteId/pin", protect, pinUnpinNote);


//  TODOs
/**
 * @swagger
 * /api/trips/{tripId}/todos:
 *   post:
 *     summary: Add todo to trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task:
 *                 type: string
 *     responses:
 *       200:
 *         description: Todo added
 */
router.post("/:tripId/todos", protect, addTodo);

/**
 * @swagger
 * /api/trips/{tripId}/todos:
 *   get:
 *     summary: Get trip todos
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of todos
 */
router.get("/:tripId/todos", protect, getTodo);

/**
 * @swagger
 * /api/trips/{tripId}/todos/{todoId}/toggle:
 *   patch:
 *     summary: Toggle todo status
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: todoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo toggled
 */
router.patch("/:tripId/todos/:todoId/toggle", protect, toggleTodo);

/**
 * @swagger
 * /api/trips/{tripId}/todos/{todoId}:
 *   delete:
 *     summary: Delete todo
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: todoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo deleted
 */
router.delete("/:tripId/todos/:todoId", protect, deleteTodo);


//  TRIP LIFE-CYCLE
/**
 * @swagger
 * /api/trips/{tripId}:
 *   patch:
 *     summary: Edit trip details
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               coverPhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Trip updated
 */
router.patch("/:tripId", protect, upload.single("coverPhoto"), editTrip);

/**
 * @swagger
 * /api/trips/{tripId}/restore:
 *   patch:
 *     summary: Restore archived trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip restored
 */
router.patch("/:tripId/restore", protect, restoreTrip);

/**
 * @swagger
 * /api/trips/{tripId}/archive:
 *   delete:
 *     summary: Archive trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip archived
 */
router.delete("/:tripId/archive", protect, softDeleteTrip);

/**
 * @swagger
 * /api/trips/{tripId}/visibility:
 *   patch:
 *     summary: Change trip visibility
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visibility:
 *                 type: string
 *                 enum: [public, private, followers]
 *     responses:
 *       200:
 *         description: Visibility changed
 */
router.patch("/:tripId/visibility", protect, visibilityChange);

/**
 * @swagger
 * /api/trips/{tripId}/complete:
 *   patch:
 *     summary: Mark trip as complete
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip completed
 */
router.patch("/:tripId/complete", protect, completeTrip);


//  LAST: Dynamic route for fetching trip by ID
/**
 * @swagger
 * /api/trips/{tripId}:
 *   get:
 *     summary: Get a trip by ID
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *         description: The trip ID
 *     responses:
 *       200:
 *         description: Trip details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       404:
 *         description: Trip not found
 */
router.get("/:tripId", protect, getTripById);




export default router;
