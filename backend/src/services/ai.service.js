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
        You are an expert Amazon e-commerce copywriter. Your goal is to rewrite and optimize a product listing for maximum conversion and SEO.
        
        Analyze the following product information:
        
        Current Title:
        ${currentListing.title}
        
        Current Bullet Points:
        ${currentListing.bullet_points.map(b => `- ${b}`).join('\n')}
        
        Current Description:
        ${currentListing.description}
        
        Now, please generate a new, optimized version based on this information. 
        Follow all instructions in the provided JSON schema.
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