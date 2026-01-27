import express from "express"

import { protect } from "../middlewares/authMiddleware.js"
import {upload} from "../middlewares/multer.js"


import deleteUser from "../Controllers/user.controllers/deleteUser.js"


import updateProfile from "../Controllers/user.controllers/updateProfile.js"

import changeusername from "../Controllers/user.controllers/changeusername.js"
import changeEmail from "../Controllers/user.controllers/changeEmail.js"
import verifyEmailChange from "../Controllers/user.controllers/verifyEmailChange.js"
import followUser from "../Controllers/user.controllers/followUser.js"
import unfollowUser from "../Controllers/user.controllers/unfollowUser.js"
import followerOfId from "../Controllers/user.controllers/followerOfId.js"
import followingOfUser from "../Controllers/user.controllers/followingOfUser.js"
import mutualFollowers from "../Controllers/user.controllers/mutualFollowers.js"
import suggestions from "../Controllers/user.controllers/suggestions.js"
import addCloseFriend from "../Controllers/user.controllers/addCloseFriend.js"
import removeCloseFriend from "../Controllers/user.controllers/removeCloseFriend.js"
import getCloseFriends from "../Controllers/user.controllers/getCloseFriends.js"
import bookmarkPost from "../Controllers/user.controllers/bookmarkPost.js"
import getBookmarkedposts from "../Controllers/user.controllers/getBookmarkedposts.js"
import searchMentionableUser from "../Controllers/user.controllers/searchMentionableUser.js"
import getAllInvitedTrips from "../Controllers/user.controllers/getAllInvitedTrips.js"
import getAllAcceptedTrips from "../Controllers/user.controllers/getAllAcceptedTrips.js"
import rejectInvitation from "../Controllers/user.controllers/rejectInvitation.js"
import getUsersToFollow from "../Controllers/user.controllers/getUsersToFollow.js"
import userProfile from "../Controllers/user.controllers/userProfile.js"
import getUniversalFeed from "../Controllers/user.controllers/getUniversalFeed.js"

import { updatePrivacy } from "../Controllers/settings.controllers/updatePrivacy.js";
import { updateAccountStatus } from "../Controllers/settings.controllers/accountSettings.js";
import blockUser from "../Controllers/settings.controllers/blockUser.js";
import unblockUser from "../Controllers/settings.controllers/unblockUser.js";
import getBlockedUsers from "../Controllers/settings.controllers/getBlockedUsers.js";

import getLikedPosts from "../Controllers/activity.controllers/getLikedPosts.js";
import getCommentedPosts from "../Controllers/activity.controllers/getCommentedPosts.js";
import getLikedTrips from "../Controllers/activity.controllers/getLikedTrips.js";















const router=express.Router()

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and social features
 */

/**
 * @swagger
 * /api/user/feed:
 *   get:
 *     summary: Get universal feed
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of feed posts
 */
// Universal Feed
router.get("/feed", protect, getUniversalFeed)


/**
 * @swagger
 * /api/user/delete:
 *   delete:
 *     summary: Delete user account
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
// to delete the user and the documents from other models too
router.delete("/delete",protect, deleteUser)




/**
 * @swagger
 * /api/user/update-profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *               bio:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
// to update the profile

router.patch("/update-profile",protect, upload.single("avatar"), updateProfile)


/**
 * @swagger
 * /api/user/change-username:
 *   patch:
 *     summary: Change username
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Username changed
 */
// to change the username

router.patch("/change-username",protect, changeusername)



/**
 * @swagger
 * /api/user/change-email:
 *   patch:
 *     summary: Request email change
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification email sent
 */
// to change and verify email change
router.patch("/change-email",protect,changeEmail)

/**
 * @swagger
 * /api/user/verify-email-change:
 *   post:
 *     summary: Verify email change
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email changed successfully
 */
router.post("/verify-email-change",protect,verifyEmailChange)


/**
 * @swagger
 * /api/user/follow/{id}:
 *   post:
 *     summary: Follow a user
 *     tags: [User]
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
 *         description: User followed
 */
// to follow someone
router.post("/follow/:id",protect,followUser)


/**
 * @swagger
 * /api/user/unfollow/{id}:
 *   post:
 *     summary: Unfollow a user
 *     tags: [User]
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
 *         description: User unfollowed
 */
// to unfollow someone
router.post("/unfollow/:id",protect,unfollowUser)

/**
 * @swagger
 * /api/user/{id}/followers:
 *   get:
 *     summary: Get user followers
 *     tags: [User]
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
 *         description: List of followers
 */
// to see the target user's followers

router.get("/:id/followers",protect, followerOfId)

/**
 * @swagger
 * /api/user/{id}/following:
 *   get:
 *     summary: Get user following
 *     tags: [User]
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
 *         description: List of following
 */
// to see the target user's following

router.get("/:id/following",protect, followingOfUser)

/**
 * @swagger
 * /api/user/{id}/mutual-follower:
 *   get:
 *     summary: Get mutual followers
 *     tags: [User]
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
 *         description: List of mutual followers
 */
// to see the mutual followers

router.get("/:id/mutual-follower",protect, mutualFollowers)


/**
 * @swagger
 * /api/user/suggestions:
 *   get:
 *     summary: Get user suggestions
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of suggested users
 */
// to suggest someone to the user
router.get("/suggestions",protect, suggestions)


/**
 * @swagger
 * /api/user/close-friends/{id}:
 *   patch:
 *     summary: Add close friend
 *     tags: [User]
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
 *         description: Added to close friends
 */
// adding a user to my close friend list
router.patch('/close-friends/:id',protect,addCloseFriend)


/**
 * @swagger
 * /api/user/close-friends/{id}:
 *   delete:
 *     summary: Remove close friend
 *     tags: [User]
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
 *         description: Removed from close friends
 */
// deleting a close Friend 
router.delete('/close-friends/:id',protect,removeCloseFriend)


/**
 * @swagger
 * /api/user/close-friends:
 *   get:
 *     summary: Get close friends list
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of close friends
 */
// getting the list of the close

router.get("/close-friends", protect, getCloseFriends)








/**
 * @swagger
 * /api/user/bookmark/{postId}:
 *   patch:
 *     summary: Toggle bookmark post
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookmark toggled
 */
// for toggle bookmarking a post

router.patch("/bookmark/:postId",protect, bookmarkPost )

/**
 * @swagger
 * /api/user/bookmarks:
 *   get:
 *     summary: Get bookmarked posts
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookmarked posts
 */
//for retrieving the bookmarked post
router.get('/bookmarks',protect,getBookmarkedposts)


/**
 * @swagger
 * /api/user/search-mentions:
 *   get:
 *     summary: Search users for mentions
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
// for searching user for mentions

router.get('/search-mentions', protect , searchMentionableUser)



/**
 * @swagger
 * /api/user/invited-trips:
 *   get:
 *     summary: Get invited trips
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invited trips
 */
// to get the list of trips that the user has been invited

router.get("/invited-trips",protect,getAllInvitedTrips)


/**
 * @swagger
 * /api/user/{tripId}/reject-invitation:
 *   delete:
 *     summary: Reject trip invitation
 *     tags: [User]
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
 *         description: Invitation rejected
 */
// api for rejecting the trips that the user was invited 
router.delete("/:tripId/reject-invitation", protect, rejectInvitation)

/**
 * @swagger
 * /api/user/accepted-trips:
 *   get:
 *     summary: Get accepted trips
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accepted trips
 */
// to get the list of all accepted trips
router.get("/accepted-trips", protect, getAllAcceptedTrips)

/**
 * @swagger
 * /api/user/users:
 *   get:
 *     summary: Get users to follow
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
//  get only users from db to follow them
router.get("/users" , protect , getUsersToFollow)

/**
 * @swagger
 * /api/user/{id}/profile:
 *   get:
 *     summary: Get user profile details
 *     tags: [User]
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
 *         description: User profile details
 */
// to get profile details
router.get("/:id/profile" , protect , userProfile)

/**
 * @swagger
 * /api/user/settings/privacy:
 *   put:
 *     summary: Update privacy settings
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Privacy settings updated
 */
// --- Settings Routes ---
router.put("/settings/privacy", protect, updatePrivacy);

/**
 * @swagger
 * /api/user/settings/account:
 *   put:
 *     summary: Update account status
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Account status updated
 */
router.put("/settings/account", protect, updateAccountStatus);

/**
 * @swagger
 * /api/user/settings/blocked:
 *   get:
 *     summary: Get blocked users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of blocked users
 */
router.get("/settings/blocked", protect, getBlockedUsers);

/**
 * @swagger
 * /api/user/settings/block/{id}:
 *   post:
 *     summary: Block a user
 *     tags: [User]
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
 *         description: User blocked
 */
router.post("/settings/block/:id", protect, blockUser);

/**
 * @swagger
 * /api/user/settings/unblock/{id}:
 *   delete:
 *     summary: Unblock a user
 *     tags: [User]
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
 *         description: User unblocked
 */
router.delete("/settings/unblock/:id", protect, unblockUser);

/**
 * @swagger
 * /api/user/activity/likes/posts:
 *   get:
 *     summary: Get liked posts activity
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liked posts activity
 */
// --- Activity Routes ---
router.get("/activity/likes/posts", protect, getLikedPosts);

/**
 * @swagger
 * /api/user/activity/comments/posts:
 *   get:
 *     summary: Get commented posts activity
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Commented posts activity
 */
router.get("/activity/comments/posts", protect, getCommentedPosts);

/**
 * @swagger
 * /api/user/activity/likes/trips:
 *   get:
 *     summary: Get liked trips activity
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liked trips activity
 */
router.get("/activity/likes/trips", protect, getLikedTrips);

export default router