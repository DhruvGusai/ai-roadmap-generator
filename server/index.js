import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors('*'));
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

app.post('/api/generate-roadmap', async (req, res) => {
  try {
    const { career, experience, goals } = req.body;
    
    if (!career || !experience || !goals) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Career, experience, and goals are required'
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    };

    const prompt = `Generate a career roadmap in JSON format. The response should be valid JSON without any markdown or additional text.

For someone who wants to become a ${career}, with ${experience} experience level and the following goals: ${goals}

Required JSON structure:
{
  "title": "Career Roadmap for [Career]",
  "description": "A brief overview of the career path",
  "steps": [
    {
      "title": "Step title",
      "description": "Detailed description of the step",
      "duration": "Estimated time to complete this step",
      "resources": ["Resource 1", "Resource 2"]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('Raw Gemini response:', responseText);

    try {
      // Remove any potential markdown code block indicators
      const cleanedResponse = responseText.replace(/```json\n?|```\n?/g, '');
      const roadmapData = JSON.parse(cleanedResponse);
      
      // Validate the required structure
      if (!roadmapData.title || !roadmapData.description || !Array.isArray(roadmapData.steps)) {
        throw new Error('Response missing required fields');
      }
      
      res.json(roadmapData);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.log('Response that failed to parse:', responseText);
      res.status(500).json({ 
        error: 'Invalid response format',
        details: 'The AI generated an invalid JSON response'
      });
    }
  } catch (error) {
    console.error('Error in generate-roadmap endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to generate roadmap',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});