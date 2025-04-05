const express = require("express");

const app = express();

app.get("/health", (req, res) => {
  const uptimeInSeconds = process.uptime();
  res.json({
    nama: "Kevin Leonard Berutu",
    NRP: "5025231089",
    status: "UP",
    timeStamp: new Date().toISOString(),
    uptime: `${uptimeInSeconds}s`,
  });
});

const port = 3000;
app.listen(port, () =>
  console.log(`Server running on: http://localhost:${port}`)
);
