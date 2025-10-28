import Trip from "../../models/Trip.js";

const deleteNote = async(req,res)=>{

    const { tripId , noteId } =req.params;
    const  user  = req.user;

    try {
        
        const trip = await Trip.findById(tripId);
        if(!trip){
            return res.status(404).json({message:"No trip found"})
        }
        const isOwner = trip.isOwnedBy(user._id);

        const note = trip.notes.find(note => note._id.toString() === noteId);
        
        if(!note){
            return res.status(404).json({message:"Note not Found"})
        }

        const isCreatedBy = note.createdBy.toString() === user._id.toString()

        if(!isOwner && !isCreatedBy){
            return res.status(403).json({message:"Only the trip owner or the colaborator who created the note can delete the note"})
        }

        trip.notes = trip.notes.filter(note=>note._id.toString() !== noteId);

        await trip.save();

        return res.status(200).json({
            success:true,
            
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message, 
          });
    }

}
export default deleteNote