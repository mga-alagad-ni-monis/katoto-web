const yaml = require("js-yaml");
const fs = require("fs");
const { spawn } = require("child_process");
const uniqid = require("uniqid");

const moment = require("moment");

const db = require("../utils/firebase");

const { array } = require("../utils/quotes");

const getFiles = async (req, res) => {
  try {
    res.status(200).json({
      trainingData: {
        cG: {
          domainFile: getSpecificFile("cg", "domain.yml"),
          nluFile: getSpecificFile("cg", "nlu.yml"),
          rulesFile: getSpecificFile("cg", "rules.yml"),
          storiesFile: getSpecificFile("cg", "stories.yml"),
        },
        fC: {
          domainFile: getSpecificFile("fc", "domain.yml"),
          nluFile: getSpecificFile("fc", "nlu.yml"),
          rulesFile: getSpecificFile("fc", "rules.yml"),
          storiesFile: getSpecificFile("fc", "stories.yml"),
        },
      },
    });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const getSpecificFile = (directory, file) => {
  if (file == "domain.yml") {
    return yaml.load(
      fs.readFileSync(
        `${process.env.RASA_FILES_PATH}katoto-ml-${directory}/${file}`
      ),
      { lineWidth: -1 }
    );
  } else {
    return yaml.load(
      fs.readFileSync(
        `${process.env.RASA_FILES_PATH}katoto-ml-${directory}/data/${file}`
      ),
      { lineWidth: -1 }
    );
  }
};

const setFiles = async (req, res) => {
  const { data, mode, file } = req.body;
  try {
    setSpecificFile(mode, file, data);
    res.status(200).json({ message: "Update successful!" });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const setSpecificFile = (directory, file, data) => {
  //adding more examples into intents
  if (file === "nlu") {
    data = data?.nlu?.map((i) => {
      if (!i["examples"].includes(`- ${i["intent"]}`)) {
        i["examples"] = i["examples"] + `- ${i["intent"]}\n`;
      }
      return i;
    });
  }

  file += ".yml";
  if (file == "domain.yml") {
    fs.writeFileSync(
      `${process.env.RASA_FILES_PATH}katoto-ml-${directory}/${file}`,
      yaml.dump(data, { lineWidth: -1 })
    );
  } else {
    fs.writeFileSync(
      `${process.env.RASA_FILES_PATH}katoto-ml-${directory}/data/${file}`,
      yaml.dump(data, { lineWidth: -1 })
    );
  }
  return;
};

const setConcerns = async () => {
  const domain = yaml.load(
    fs.readFileSync(`${process.env.RASA_FILES_PATH}katoto-ml-cg/domain.yml`),
    { lineWidth: -1 }
  );

  const concernsArray = domain?.responses?.utter_mga_problema[0]?.buttons?.map(
    (i) => i?.title
  );

  const document = await db.collection("values").doc("global");

  await document.update({
    concerns: concernsArray,
  });
};

const getConcerns = async (req, res) => {
  try {
    await db
      .collection("values")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let concerns = [];
        querySnapshot.forEach((i) => {
          concerns = i?.data()?.concerns;
        });
        res.status(200).json({ concerns: concerns });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const getQuotes = async (req, res) => {
  try {
    await db
      .collection("values")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let quotes = [];
        querySnapshot.forEach((i) => {
          quotes = i?.data()?.quotes;
        });
        res.status(200).json({ quotes: quotes });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const getQuote = async (req, res) => {
  try {
    await db
      .collection("values")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let quote = [];
        querySnapshot.forEach((i) => {
          i?.data()?.quotes.forEach((j) => {
            if (j.isActive) {
              quote.push(j);
            }
          });

          if (quote.length === 0) {
            quote.push(i?.data()?.quotes[moment().dayOfYear()]);
          }
        });

        res.status(200).json({ quote: quote[0] });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const addQuote = async (req, res) => {
  const { author, quote } = req.body;
  try {
    const document = await db.collection("values").doc("global");

    let values = await document.get();

    let quotesArray = values.data().quotes;

    // used to import more quotes
    // array.map((i) => {
    //   quotesArray.push({
    //     author: i.author,
    //     quote: i.quote,
    //     isActive: false,
    //     id: uniqid.time(),
    //   });
    // });

    quotesArray.push({ author, quote, isActive: false, id: uniqid.time() });

    await document.update({
      quotes: quotesArray,
    });

    res.status(200).send({ message: "Quote added successfully!" });
  } catch (err) {
    console.log(err);
    res.status(404).send("Error");
  }
};

const editQuote = async (req, res) => {
  const { author, quote, id, status } = req.body;
  try {
    const document = await db.collection("values").doc("global");

    let values = await document.get();

    let quotesArray = values.data().quotes;

    quotesArray = quotesArray.map((i) => {
      if (i.id === id) {
        i.author = author;
        i.quote = quote;
        i.isActive = status === null ? i.isActive : status;
      } else {
        if (status !== null) {
          i.isActive = false;
        }
      }
      return i;
    });

    await document.update({
      quotes: quotesArray,
    });

    res.status(200).send({ message: "Quote edited successfully!" });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const deleteQuotes = async (req, res) => {
  const { array } = req.body;

  try {
    const document = await db.collection("values").doc("global");

    let values = await document.get();

    let quotesArray = values.data().quotes;

    quotesArray = quotesArray.filter((i) => !array.includes(i.id));

    await document.update({
      quotes: quotesArray,
    });

    res.status(200).send({ message: "Quote deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(404).send("Error");
  }
};

module.exports = {
  getFiles,
  setFiles,
  setConcerns,
  getConcerns,
  getQuotes,
  addQuote,
  editQuote,
  deleteQuotes,
  getQuote,
};
