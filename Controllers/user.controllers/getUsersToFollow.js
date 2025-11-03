import User from "../../models/User.js"




const getUsersToFollow = async(req,res)=>{
    const user = req.user
    try {
        const currentUser = await User.findById(user._id).select("following blockedUsers")
         const followingUsersId = currentUser.following.map(f=>f.toString())
         const blockedUsersId = currentUser.blockedUsers.map(b=>b.toString())

         
         const notRecommendeduser = [...followingUsersId , ...blockedUsersId, user._id.toString()]

         const userToFollow = await User.find({
            _id:{$nin:notRecommendeduser},
            isVerified:true,
            isDeactivated:false,
            isBanned:false,
            blockedUsers:{$nin:[user._id]}
        }).select("name username avatar location")

        return res.status(200).json({users:userToFollow})
    } catch (error) {
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}
export default getUsersToFollow