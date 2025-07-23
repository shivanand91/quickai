
import { clerkClient } from '@clerk/express';
import sql from '../configs/db.js'
import OpenAI from "openai";
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { Buffer } from 'buffer';
import FormData from 'form-data';

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: 'You have reached your free usage limit.' });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Failed to generate article." })

    }
}
export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: 'You have reached your free usage limit.' });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-article')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Failed to generate article." })

    }
}
export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: 'This feature is only available for premium users.' });
        }

        const form = new FormData();
        form.append('prompt', prompt);

        const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", form, {
            headers: {
                ...form.getHeaders(),
                'x-api-key': process.env.CLIPDROP_API_KEY
            },
            responseType: "arraybuffer"
        });

        const base64 = Buffer.from(data, 'binary').toString('base64');

        const { secure_url } = await cloudinary.uploader.upload(`data:image/png;base64,${base64}`);

        await sql`
            INSERT INTO creations (user_id, prompt, content, type, publish)
            VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
        `;

        res.json({ success: true, secure_url });

    } catch (error) {
        console.error("Image generation error:", error.message);
        res.json({ success: false, message: "Failed to generate image." });
    }
}

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const plan = req.plan;

    const image = req.file;
    if (!image) {
      return res.json({ success: false, message: 'No image file uploaded.' });
    }

    if (plan !== 'premium') {
      return res.json({ success: false, message: 'This feature is only available for premium users.' });
    }

    const result = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background"
        }
      ]
    });

    if (!result.secure_url) {
      return res.json({ success: false, message: 'Cloudinary failed to return image URL.' });
    }

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${result.secure_url}, 'image')
    `;

    return res.json({ success: true, content: result.secure_url });
  } catch (error) {
    console.error('Background removal failed:', error);
    return res.json({ success: false, message: "Failed to remove image background." });
  }
};


export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (!image) {
      return res.json({ success: false, message: 'No image uploaded.' });
    }

    if (!object || object.trim().split(' ').length > 1) {
      return res.json({ success: false, message: 'Please provide a single object to remove.' });
    }

    if (plan !== 'premium') {
      return res.json({ success: false, message: 'This feature is only available for premium users.' });
    }

    // Upload original image
    const uploaded = await cloudinary.uploader.upload(image.path);

    const public_id = uploaded.public_id;

    // Create transformed URL
    const transformedUrl = cloudinary.url(public_id, {
      transformation: [
        { effect: `gen_remove:${object}` },
      ],
      secure: true,
    });

    // Optional: test the URL before saving (Cloudinary might not apply transformation right away)

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object} from image`}, ${transformedUrl}, 'image')
    `;

    return res.json({ success: true, content: transformedUrl }); // ✅ frontend expects `content`
  } catch (error) {
    console.error('Object removal failed:', error);
    return res.json({ success: false, message: "Failed to remove image object." });
  }
};

export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const  resume  = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: 'This feature is only avaliable for premium users.' });
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: 'Resume file size exceeds 5MB limit.' });
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer);

        const prompt = `Review this resume and provide feedback on the following aspects:
        1. Overall structure and formatting
        2. Clarity and conciseness of the content
        3. Relevance of the information provided
        4. Suggestions for improvement
        Resume Content: ${pdfData.text}`;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;


        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the uploaded image', ${content}, 'review-resume')`;

        res.json({ success: true, content })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: "Failed to review resume." })

    }
}
