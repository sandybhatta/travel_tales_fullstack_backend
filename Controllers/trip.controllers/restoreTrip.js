import Trip from "../../models/Trip.js";

const restoreTrip = async (req,res)=>{

    const {tripId} = req.params;
    
    if(!tripId){
        return res.status(400).json({message:"trip id was not given"})
    }

    try {
        
        const trip= await Trip.findById(tripId);
        if(!trip){
            return res.status(404).json({message:"the trip was not found"})
        }

        if(!trip.isArchived){
            return res.status(400).json({message:"the trip is not deleted"})
        }

        trip.isArchived= false;
        await trip.save()
        return res.status(200).send({message:"the trip has been restored"})


    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
          });
    }

}

export default restoreTrip