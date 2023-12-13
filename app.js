const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

app.use(express.json());

let db;

const dbPath = path.join(__dirname, "cricketTeam.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server has started");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

convertDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get All Players API
app.get("/players/", async (req, res) => {
  const getPlayersQuery = `
        SELECT * FROM cricket_team
    `;
  const players = await db.all(getPlayersQuery);
  res.send(players.map((each) => convertDBObjectToResponseObject(each)));
});

//Get Specific Player Details API
app.get("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerQuery = `
        SELECT * FROM cricket_team WHERE player_id = ${playerId}
    `;
  const player = await db.get(getPlayerQuery);
  res.send(convertDBObjectToResponseObject(player));
});

//Add Player API
app.post("/players/", async (req, res) => {
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
        INSERT INTO cricket_team(player_name, jersey_number, role)
        VALUES ('${playerName}', ${jerseyNumber}, '${role}');
    `;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  res.send("Player Added to Team");
  console.log(playerId);
});

//Update Player Details API
app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
        UPDATE cricket_team
        SET 
            player_name='${playerName}',
            jersey_number = '${jerseyNumber}',
            role = '${role}'
        WHERE player_id = ${playerId}    
            `;
  const dbResponse = await db.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

//Delete Player API
app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const deletePlayerQuery = `
        DELETE FROM cricket_team WHERE player_id = ${playerId}
    `;
  const dbResponse = await db.run(deletePlayerQuery);
  res.send("Player Removed");
});

module.exports = app;
