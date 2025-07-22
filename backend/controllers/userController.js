import sql from "../configs/db.js";


export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth();
        const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
        res.json({ success: true, creations });
        
    } catch (error) {
        res.json({ success: false, message: "Failed to fetch user creations." });
    }
}
export const getPublishCreations = async (req, res) => {
    try {
        const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
        res.json({ success: true, creations });
        
    } catch (error) {
        res.json({ success: false, message: "Failed to fetch published creations." });
    }
}
export const toggleLikeCreation = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const creations = await sql`SELECT * FROM creations WHERE id = ${id}`;
        if (!creations) {
            return res.json({ success: false, message: "Creation not found." });
        }

        const currentLikes = creations[0].likes || 0;
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if(currentLikes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter((user) => user !== userIdStr);
            message = "Creation unliked successfully.";
        } else {
            updatedLikes = [...currentLikes, userIdStr];
            message = "Creation liked successfully.";
        }

        const formatedArray = `{${updatedLikes.join(', ')}}`;

        await sql`UPDATE creations SET likes = ${formatedArray} WHERE id = ${id}`;

        res.json({ success: true, message});
        
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

