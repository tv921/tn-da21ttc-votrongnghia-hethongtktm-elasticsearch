const { client } = require('../services/elasticsearch.service');

async function autocomplete(req, res) {
  const prefix = req.query.q || '';
  if (!prefix) return res.json([]);

  try {
    const body = {
      suggest: {
        "title-suggest": {
          prefix,
          completion: {
            field: "title_suggest",
            fuzzy: { fuzziness: 1 },
            size: 10
          }
        }
      }
    };

    const response = await client.search({
      index: "pdf_documents",
      body
    });

    const options = response.suggest["title-suggest"][0].options;
    const suggestions = options.map(opt => opt.text);
    res.json(suggestions);

  } catch (error) {
    console.error("Autocomplete error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { autocomplete };
