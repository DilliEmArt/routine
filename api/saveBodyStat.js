// ต้องติดตั้ง @notionhq/client ก่อน: npm install @notionhq/client
import { Client } from "@notionhq/client";

// 1. ดึง "กุญแจลับ" และ "ID ของ Database" มาจาก Environment Variables
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_BODY_DB_ID;

// 2. นี่คือ Serverless Function ที่จะทำงาน
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 3. ดึงข้อมูลที่ส่งมาจาก Frontend
    const { date, weight, water, fat } = req.body;

    // 4. ส่งข้อมูลไปสร้างหน้าใหม่ใน Notion Database
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Date': { date: { start: date } },
        'Weight (kg)': { number: weight },
        '% Water': { number: water },
        '% Fat': { number: fat },
      },
    });

    res.status(200).json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}