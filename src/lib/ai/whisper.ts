import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribes audio file to text using Whisper.
 * @param file File object or Buffer
 */
export async function transcribeAudio(file: File): Promise<string> {
    try {
        // Prepare file for OpenAI
        // Note: In Node environment, we might need 'fs.createReadStream' or usage of 'toFile' helper
        // Since this is Next.js Server Action / API Route context, we pass the file directly to transcription

        const response = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
            language: 'id', // Force Indonesian for better accuracy
        });

        return response.text;
    } catch (error) {
        console.error('Whisper transcription failed:', error);
        throw new Error('Gagal memproses pesan suara.');
    }
}
