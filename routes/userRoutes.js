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















const router=express.Router()


// to delete the user and the documents from other models too
router.delete("/delete",protect, deleteUser)




// to update the profile

router.patch("/update-profile",protect, upload.single("avatar"), updateProfile)


// to change the username

router.patch("/change-username",protect, changeusername)



// to change and verify email change
router.patch("/change-email",protect,changeEmail)

router.post("/verify-email-change",protect,verifyEmailChange)


// to follow someone
router.post("/follow/:id",protect,followUser)


// to unfollow someone
router.post("/unfollow/:id",protect,unfollowUser)

// to see the target user's followers

router.get("/:id/followers",protect, followerOfId)

// to see the target user's following

router.get("/:id/following",protect, followingOfUser)

// to see the mutual followers

router.get("/:id/mutual-follower",protect, mutualFollowers)


// to suggest someone to the user
router.get("/suggestions",protect, suggestions)


// adding a user to my close friend list
router.patch('/close-friends/:id',protect,addCloseFriend)


// deleting a close Friend 
router.delete('/close-friends/:id',protect,removeCloseFriend)


// getting the list of the close

router.get("/close-friends", protect, getCloseFriends)








// for toggle bookmarking a post

router.patch("/bookmark/:postId",protect, bookmarkPost )

//for retrieving the bookmarked post
router.get('/bookmarks',protect,getBookmarkedposts)


// for searching user for mentions

router.get('/search-mentions', protect , searchMentionableUser)



// to get the list of trips that the user has been invited

router.get("/invited-trips",protect,getAllInvitedTrips)


// api for rejecting the trips that the user was invited 
router.delete("/:tripId/reject-invitation", protect, rejectInvitation)

// to get the list of all accepted trips
router.get("/accepted-trips", protect, getAllAcceptedTrips)


router.get("/users" , protect , getUsersToFollow)









export default router