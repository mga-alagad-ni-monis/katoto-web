const yaml = require("js-yaml");
const fs = require("fs");
const { spawn, exec } = require("child_process");

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

const train = async (req, res) => {
  const { mode } = req.body;
  try {
    const trainData = spawn(
      `conda activate katoto-ml-${mode} && rasa train --config config.yml && rasa run --enable-api --cors \"*\" -p 8080 --debug`,
      {
        shell: true,
        cwd: `${process.env.RASA_FILES_PATH}katoto-ml-${mode}`,
      }
    );
    trackLogs(trainData);
  } catch (err) {
    res.status(404).send("Error");
  }
};

const trackLogs = (command) => {
  command.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  command.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  command.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

module.exports = {
  getFiles,
  setFiles,
  train,
};
