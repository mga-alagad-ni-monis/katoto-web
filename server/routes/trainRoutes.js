const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const {
  getFiles,
  setFiles,
  getConcerns,
  getQuotes,
  addQuote,
  editQuote,
  deleteQuotes,
  getQuote,
} = require("../controllers/trainControllers");

const router = express.Router();

router.get(
  "/get-files",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  getFiles
);

router.post(
  "/set-files",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  setFiles
);

router.get(
  "/get-concerns",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  getConcerns
);

router.get(
  "/get-quotes",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  getQuotes
);

router.post(
  "/add-quote",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  addQuote
);

router.post(
  "/edit-quote",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  editQuote
);

router.post(
  "/delete-quotes",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  deleteQuotes
);

router.get(
  "/get-quote",
  verifyRoles(["guidanceCounselor", "systemAdministrator", "student"]),
  getQuote
);

module.exports = router;
