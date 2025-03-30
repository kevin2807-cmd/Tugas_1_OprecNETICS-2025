const express = require("express");

const app = express();
const startTime = Date.now();

app.get("/health", (req, res) => {
  res.json({
    nama: "Kevin Leonard Berutu",
    NRP: "5025231089",
    status: "DOWN",
    timeStamp: new Date().toISOString(),
    uptime: `${Math.floor((Date.now() - startTime) / 1000)}s`,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server running on: http://localhost:${port}`)
);
