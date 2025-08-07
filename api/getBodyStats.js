const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_BODY_DB_ID;

export default async function handler(req, res) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Date',
          direction: 'ascending',
        },
      ],
    });

    const stats = response.results.map(page => {
      return {
        date: page.properties.Date.date.start,
        weight: page.properties['Weight (kg)'].number,
        water: page.properties['% Water'].number,
        fat: page.properties['% Fat'].number,
      };
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching data from Notion' });
  }
}