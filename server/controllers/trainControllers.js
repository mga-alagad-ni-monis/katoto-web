const yaml = require("js-yaml");
const fs = require("fs");
const { spawn } = require("child_process");

const db = require("../utils/firebase");

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

module.exports = {
  getFiles,
  setFiles,
  setConcerns,
  getConcerns,
};
