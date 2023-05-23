const multer = require("multer");

const db = require("../utils/firebase");

//multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.FILE_STORAGE_PATH);
  },
  filename: function (req, file, cb) {
    cb(null, "file-" + Date.now());
  },
});

let upload = multer({ storage });

const uploadPictures = (req, res) => {
  try {
    if (req.files) {
      res
        .status(200)
        .send(
          `${process.env.SERVER_URI}/${process.env.FILE_STORAGE_PATH}${req.files[0].filename}`
        );
    }
  } catch (err) {
    res.status(404).send("Error");
  }
};

const addCampaign = (req, res) => {
  const {
    isPublished,
    title,
    description,
    campaignType,
    effectivityDate,
    campaignInfo,
    imageHeader,
  } = req.body;

  try {
    if (title && campaignType && effectivityDate && campaignInfo) {
      db.collection("campaigns")
        .add({
          isPublished,
          title,
          description,
          campaignType,
          effectivityDate,
          campaignInfo,
          imageHeader,
          createDate: new Date(),
        })
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            return res.status(404).send("Error");
          }
          res.status(200).json({ message: "Successfully added!" });
        });
    }
  } catch (err) {
    res.status(404).send("Error");
  }
};

const getCampaigns = (req, res) => {
  try {
    db.collection("campaigns")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let campaigns = [];
        querySnapshot.forEach((i) => {
          const campaign = i.data();
          campaigns.push(campaign);
        });
        res.status(200).json({ campaigns });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const getPublishedCampaigns = (req, res) => {
  try {
    db.collection("campaigns")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let campaigns = [];
        querySnapshot.forEach((i) => {
          const campaign = i.data();
          console.log(campaign.isPublished);
          if (campaign.isPublished) {
            campaigns.push(campaign);
          }
        });
        res.status(200).json({ campaigns });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

module.exports = {
  addCampaign,
  uploadPictures,
  upload,
  getCampaigns,
  getPublishedCampaigns,
};
