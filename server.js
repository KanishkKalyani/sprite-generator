const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();

const { NODE_ENV, PORT, CLIENT_URL } = process.env;

const isDevelopment = NODE_ENV === 'development';
const ACTIVE_PORT = PORT || 5000;

// Middleware
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

if (isDevelopment) {
  app.use(cors());
} else {
  app.use(cors({ origin: CLIENT_URL, optionsSuccessStatus: 200 }));
}

if (NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "build")));

	app.get("*", function (req, res) {
		res.sendFile(path.join(__dirname, "build", "index.html"));
	});
}

// Route
app.use('/sprite-generator', require('./routes/sprite-generator.routes'));

app.listen(ACTIVE_PORT, () =>
  console.log(`Server is running at PORT ${ACTIVE_PORT}`)
);
