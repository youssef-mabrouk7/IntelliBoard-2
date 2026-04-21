import axios from "axios";

const HF_API_KEY = process.env.HF_API_KEY;

export async function queryHuggingFace(prompt) {
  const response = await axios.post(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
    {
      inputs: prompt
    },
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`
      }
    }
  );

  return response.data;
}   