import { uploadToCloudinary } from "../../utils/cloudinary.js";
import cloudinary from "../../utils/cloudinary.js";




const updateProfile= async(req,res)=>{
    const user=req.user
    const {name , bio,  city , state, country , interests}=req.body

    try{
        const allowedFields = ["name", "bio", "avatar", "city", "state", "country" , "interests"];

        const invalidFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));

        if (invalidFields.length) {
            return res.status(400).json({ message: `Invalid field(s): ${invalidFields.join(", ")}` });
        }

        const allowedInterests=[
          "adventure",
          "beach",
          "mountains",
          "history",
          "food",
          "wildlife",
          "culture",
          "luxury",
          "budget",
          "road_trip",
          "solo",
          "group",
          "trekking",
          "spiritual",
          "nature",
          "photography",
          "festivals",
          "architecture",
          "offbeat",
          "shopping",
        ]

        let parsedInterests = interests

        if(parsedInterests !== undefined){
          if(typeof parsedInterests === "string"){
            try{
              parsedInterests = JSON.parse(parsedInterests)
            }catch{
              return res.status(400).send({message:"interests should be an array"})
            }
          }

          if(!Array.isArray(parsedInterests)){
            return res.status(400).send({message:"interests should be an array"})
          }

          const isValid=parsedInterests.every(interest=>allowedInterests.includes(interest))
          if(!isValid){
            return res.status(400).send({message:"interest is not valid"})
          }

          user.interests=parsedInterests
        }

       if(name !== undefined){
        user.name=name
       }
       if(bio !== undefined){
        user.bio=bio
       }
       if (req.file && req.file.mimetype.startsWith("image/")) {
        // Check if user has a previous avatar with a public_id (not the default one)
        if (user.avatar && user.avatar.public_id) {
            try {
                await cloudinary.uploader.destroy(user.avatar.public_id);
            } catch (destroyErr) {
                console.error("Failed to delete old avatar:", destroyErr);
                // Continue with upload even if delete fails
            }
        }

        const result = await uploadToCloudinary(req.file.buffer, "/post/avatar", "image");
        user.avatar = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }

       if(city || state || country){
        user.location.city=city || user.location.city
        user.location.state=state || user.location.state
        user.location.country=country || user.location.country
       }
       
       await user.save();

       res.status(200).json({
         message: "Profile updated successfully",
             user: {
                name: user.name,
                bio: user.bio,
                avatar: user.avatar,
                location: user.location,
            }
       });
    } 
     
     catch (err) {
       console.error("Update error:", err);
       res.status(500).json({ message: "Something went wrong" });
     }

}


export default updateProfile
