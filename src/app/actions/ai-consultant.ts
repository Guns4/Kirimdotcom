'use server'

import { safeAction } from '@/lib/safe-action'
import { createClient } from '@/utils/supabase/server'

// Simplified Mock for AI Consultant without requiring immediate OPENAI_API_KEY to prevent build crash
// In production, this would use LangChain's SqlDatabase and createSqlQueryChain
// import { SqlDatabase } from "langchain/sql_db";
// import { ChatOpenAI } from "@langchain/openai";

export const askBusinessConsultant = async (question: string) => {
    return safeAction(async (inputQuestion: string, user: any) => {
        // safeAction with requireAuth=true guarantees user is present or returns error before this

        // MOCKED LOGIC FOR DEMO:
        // We simulate what the AI would do: Parse question -> Generate SQL -> Result

        let answer = "I couldn't find specific data for that."
        let simulatedSQL = ""

        const lowerQ = inputQuestion.toLowerCase()

        if (lowerQ.includes('return') || lowerQ.includes('retur')) {
            simulatedSQL = `SELECT product_name, count(*) as returns FROM orders WHERE status = 'RETURNED' AND user_id = '${user.id}' GROUP BY product_name ORDER BY returns DESC LIMIT 1;`
            answer = "Berdasarkan data bulan ini, produk dengan tingkat retur tertinggi adalah 'Baju Koko Modern' (5 Retur)."
        }
        else if (lowerQ.includes('profit') || lowerQ.includes('untung')) {
            simulatedSQL = `SELECT SUM(net_profit) FROM expenses WHERE user_id = '${user.id}' AND month = NOW();`
            answer = "Profit bersih Anda bulan ini diperkirakan mencapai Rp 15.450.000, naik 12% dari bulan lalu."
        }
        else if (lowerQ.includes('kurir') || lowerQ.includes('tercepat')) {
            simulatedSQL = `SELECT courier, AVG(duration) as speed FROM shipments WHERE user_id = '${user.id}' GROUP BY courier ORDER BY speed ASC LIMIT 1;`
            answer = "Kurir tercepat minggu ini adalah J&T Express (Rata-rata 1.8 hari sampai)."
        }
        else {
            answer = "Saya dapat membantu menganalisa performa toko, retur, dan keuntungan Anda. Coba tanya: 'Produk apa yang paling banyak retur?'"
        }

        return {
            answer,
            sql: simulatedSQL,
            timestamp: new Date().toISOString()
        }
    }, question, { requireAuth: true })
}
