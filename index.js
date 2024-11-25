// Example call: http://localhost:2000/space

// Import required modules
const express = require("express");
const axios = require("axios");
const cors = require("cors"); 

const app = express();
const PORT = process.env.PORT || 2000;

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for all origins 
app.use(cors()); 

// Array of space shuttle icons (URLs)
const shuttleIcons = [
  "https://cdn-icons-png.flaticon.com/512/6989/6989388.png",
  "https://cdn-icons-png.flaticon.com/512/2909/2909710.png",
  "https://cdn-icons-png.flaticon.com/512/4657/4657691.png",
  "https://cdn-icons-png.flaticon.com/512/3594/3594735.png",
];

// Basic route
app.get("/", (req, res) => {
  res.send("Welcome to the People in Space Microservice!");
});

// Rearranges the astronauts data for easier use and adds random shuttle icon URL.
function rearrangeData(astroData) {
  const groupedData = astroData.people.reduce(function (acc, person) {
    // Find the existing spacecraft or create a new one
    let spacecraft = acc.find(function (sc) {
      return sc.craft === person.craft;
    });

    if (!spacecraft) {
      spacecraft = {
        craft: person.craft,
        crew: [],
        icon: getRandomShuttleIcon(),
      }; // Add icon to spacecraft
      acc.push(spacecraft);
    }
    spacecraft.crew.push(person.name);
    return acc;
  }, []);

  return {
    number_of_people: astroData.number,
    spacecrafts: groupedData,
    message: astroData.message,
  };
}

// Function to get a random shuttle icon from the icon array
function getRandomShuttleIcon() {
  const randomIndex = Math.floor(Math.random() * shuttleIcons.length);
  return shuttleIcons[randomIndex];
}

// Route to fetch data about people in space
app.get("/astronauts", async (req, res) => {
  const url = "http://api.open-notify.org/astros.json"; // API to fetch people in space

  console.log("FETCH REQUEST RECEIVED for space data");

  try {
    // Fetch data from the external API
    const response = await axios.get(url);
    const astroData = response.data;

    const rearrangedData = rearrangeData(astroData);

    // Send the transformed data as response
    console.log("Returning processed space data:", rearrangedData);
    res.json(rearrangedData);
  } catch (error) {
    console.error("Error fetching space data:", error.message);
    res.status(500).json({ error: "Failed to retrieve space data" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Now waiting for a fetch request...");
});
