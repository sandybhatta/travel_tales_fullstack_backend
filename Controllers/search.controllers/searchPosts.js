import User from "../../models/User.js"
import Post from "../../models/post.js"
import saveSearchHistory from "../../utils/saveSearchHistory.js"

const searchPosts = async(req,res)=>{
    const {user} = req.body
    const q = req.query.q
    

    const searchQuery = q.toLowerCase().trim()
    if( !searchQuery ){
        return res.status(401).json({message:"No Search query given "})
    }


    const currentUser = await User.findById(user._id).select("followers following closeFriends blockedUsers")

    const followingIds= currentUser.following.map(u=>u._id.toString())
    const blockedUsersIds= currentUser.blockedUsers.map(u=>u._id.toString())


    const posts= await Post.find({
                        _id:{ $nin:blockedUsersIds},
                        
                        $or:[
                            {
                                "location.city":{
                                    $regex:searchQuery, $options:'i'
                                },
                            },
                            {
                                "location.state":{
                                     $regex:searchQuery, $options:'i'
                                },
                            },
                           { 
                                "location.country":{
                                     $regex:searchQuery, $options:'i'
                                },
                            },
                            { 
                                 hashtags:{
                                    $regex:searchQuery, $options:'i'
                                },
                             },
                            {

                                caption:{
                                    $regex:searchQuery, $options:'i'
                                },
                            }
                        ]
    }).populate("author" , "name username avatar blockedUsers closeFriends")


    saveSearchHistory(currentUser._id, searchQuery , "post")

    const results = posts.filter(u=>{
        const author= u.author

        const blockedUsersOfAuthor = author.blockedUsers.map(blockedId=>blockedId.toString())

        if(blockedUsersOfAuthor.includes(currentUser._id.toString())){
            return false
        }
        else{
            return true
        }


    }).filter(u=>{
        let canView=false;
        if(u.visibility==="public"){
            canView=true
        }
        else if(u.visibility==="followers"){
            if(followingIds.includes(u.author._id)){
                canView=true
            }else{
                canView=false;
            }
        }
        else if(u.visibility === "close_friends"){
            const closeFriendIdsOfAuthor = u.author.closeFriends.map(close=>close.toString())
            if(closeFriendIdsOfAuthor.includes(currentUser._id.toString())){
                canView=true
            }else{
                canView=false
            }
        }else{
            if(u.author._id.toString()===currentUser._id.toString()){
                canView=true
            }
        }
        return canView

    })
    return res.status(200).json({
        ...results
    })



}

export default searchPosts