const multer = require("multer");
const uniqid = require("uniqid");

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
          `${process.env.SERVER_URI}${process.env.FILE_STORAGE_PATH}${req.files[0].filename}`
        );
    }
  } catch (err) {
    res.status(404).send("Error");
  }
};

const addCampaign = (req, res) => {
  const {
    id,
    isPublished,
    title,
    description,
    campaignType,
    effectivityDate,
    campaignInfo,
    imageHeader,
  } = req.body;

  try {
    if (id) {
      db.collection("campaigns")
        .where("id", "==", id)
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            return res.status(404).send("Error!");
          }

          querySnapshot.forEach((i) => {
            i.ref.update({
              isPublished,
              title,
              description,
              campaignType,
              effectivityDate,
              campaignInfo,
              imageHeader,
            });
          });
          res
            .status(200)
            .json({ message: "Successfully published a campaign!" });
        });
    } else {
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
            id: uniqid.time(),
          })
          .then((querySnapshot) => {
            if (querySnapshot.empty) {
              return res.status(404).send("Error");
            }
            res.status(200).json({ message: "Successfully added!" });
          });
      }
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

const deleteCampaign = async (req, res) => {
  const { deleteCampaigns } = req.body;
  try {
    const querySnapshot = await db.collection("campaigns").get();

    if (querySnapshot.empty) {
      return res.status(404).send("Unable to delete this account!");
    }

    const batch = await db.batch();

    querySnapshot.forEach((i) => {
      if (deleteCampaigns.includes(i.data().id)) {
        batch.delete(i.ref);
      }
    });

    batch.commit();

    if (deleteCampaigns.length === 1) {
      res.status(200).json({ message: "Successfully deleted a campaign!" });
    } else {
      res
        .status(200)
        .json({ message: "Successfully deleted a bunch of campaigns!" });
    }
  } catch (err) {
    res.status(404).send("Error");
  }
};

const publishCampaign = async (req, res) => {
  const { id } = req.body;
  try {
    await db
      .collection("campaigns")
      .where("id", "==", id)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error!");
        }

        querySnapshot.forEach((i) => {
          i.ref.update({
            isPublished: true,
          });
        });
        res.status(200).json({ message: "Successfully published a campaign!" });
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
  deleteCampaign,
  publishCampaign,
};
