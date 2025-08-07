const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_BODY_DB_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { date, weight, water, fat } = req.body;

    // Check if a page for today already exists
    const searchResponse = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Date',
        date: {
          equals: date,
        },
      },
    });

    const properties = {
        'Date': { date: { start: date } },
        'Weight (kg)': { number: weight },
        '% Water': { number: water },
        '% Fat': { number: fat },
    };

    if (searchResponse.results.length > 0) {
      // Update existing page
      const pageId = searchResponse.results[0].id;
      // Get existing properties to avoid overwriting with null
      const existingPage = await notion.pages.retrieve({ page_id: pageId });
      
      const updatedProperties = { ...existingPage.properties };
      if (weight !== null) updatedProperties['Weight (kg)'].number = weight;
      if (water !== null) updatedProperties['% Water'].number = water;
      if (fat !== null) updatedProperties['% Fat'].number = fat;

      await notion.pages.update({
        page_id: pageId,
        properties: updatedProperties,
      });
    } else {
      // Create new page
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: properties,
      });
    }

    res.status(200).json({ message: 'Successfully saved data to Notion' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving data to Notion' });
  }
}