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
        const { creationId } = req.body;

        const result = await sql`SELECT * FROM creations WHERE id = ${creationId}`;
        if (!result.length) {
            return res.json({ success: false, message: "Creation not found." });
        }

        const creation = result[0];
        let likes = creation.likes || [];
        if (typeof likes === 'string') {
            likes = likes.replace(/[{}"]/g, '').split(',').filter(Boolean);
        }

        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if (likes.includes(userIdStr)) {
            updatedLikes = likes.filter(user => user !== userIdStr);
            message = "Creation unliked successfully.";
        } else {
            updatedLikes = [...likes, userIdStr];
            message = "Creation liked successfully.";
        }

        const formattedArray = `{${updatedLikes.join(',')}}`;

        await sql`UPDATE creations SET likes = ${formattedArray} WHERE id = ${creationId}`;

        res.json({ success: true, message });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


