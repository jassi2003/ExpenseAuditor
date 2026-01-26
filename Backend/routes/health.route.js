const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    time: new Date().toISOString(),
  });
});

module.exports = router;
