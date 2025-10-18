import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { configDotenv } from 'dotenv';
configDotenv();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in your .env file");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
                improved_title: {
                    type: SchemaType.STRING,
                    description: "A keyword-rich and highly readable product title (max 200 characters)."
                },
                rewritten_bullet_points: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                    description: "A list of 5 clear, concise, and benefit-driven bullet points."
                },
                enhanced_description: {
                    type: SchemaType.STRING,
                    description: "A persuasive and compliant product description (approx. 1000-2000 characters). Use <p> and <b> tags for basic HTML formatting."
                },
                keyword_suggestions: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                    description: "A list of 3-5 new, relevant long-tail and LSI keywords."
                }
            },
            required: ["improved_title", "rewritten_bullet_points", "enhanced_description", "keyword_suggestions"]
        }
    }
});

async function optimizeListing(currentListing) {
    
    const prompt = `
        You are a senior Amazon SEO copywriting expert with deep knowledge of keyword optimization, consumer psychology, and Amazon A10 ranking algorithm. Your task is to rewrite and optimize this product listing to maximize CTR (click-through rate) and CVR (conversion rate), while maintaining Amazon content compliance.

        Analyze the product below:

        Current Title:
        ${currentListing.title}

        Current Bullet Points:
        ${currentListing.bullet_points.map(b => `- ${b}`).join('\n')}

        Current Description:
        ${currentListing.description}

        Guidelines:
        - Maintain the product is factual accuracy, tone, and target audience.
        - Avoid keyword stuffing — ensure natural language and clarity.
        - Follow Amazon style and compliance rules.
        - Title: max 200 characters, include 1 to 2 high-traffic keywords.
        - Bullet Points: exactly 5 concise, benefit-oriented statements (≤ 250 chars each).
        - Description: 1000 to 2000 characters with <p> and <b> tags for structure.
        - Keywords: 3 to 5 long-tail or LSI keyword suggestions relevant to SEO.

        Output Format:
        Return only valid JSON conforming to this schema:
        {
        "improved_title": string,
        "rewritten_bullet_points": [string, string, string, string, string],
        "enhanced_description": string,
        "keyword_suggestions": [string, string, string]
        }

        Do not include explanations, comments, or markdown formatting.
        If unsure, gracefully return the closest valid completion.
        `;


    console.log("Sending prompt to Gemini...");

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        
        const optimizedData = JSON.parse(response.text());
        
        return optimizedData;

    } catch (error) {
        console.error("Error generating content:", error);
        if (error.response) {
            console.error("Blocked Response:", JSON.stringify(error.response, null, 2));
        }
        return null;
    }
}

export { optimizeListing };