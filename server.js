const express = require("express");

const app = express();
const startTime = Date.now();

let uptime = process.uptime();

app.get("/health", (req, res) => {
  res.json({
    nama: "Kevin Leonard Berutu",
    NRP: "5025231089",
    status: "UP",
    timeStamp: new Date().toISOString(),
    uptime: `${uptime}s`,
  });
});

const port = 3000;
app.listen(port, () =>
  console.log(`Server running on: http://localhost:${port}`)
);
