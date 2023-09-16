// Import required modules
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

// Create an Express app
const app = express();
const port = process.env.PORT || 3000;

// Create a SQLite database connection
const db = new sqlite3.Database("moviesData.db");

// Middleware for JSON parsing
app.use(express.json());

// API 1: Get a list of all movie names
app.get("/movies", (req, res) => {
  db.all("SELECT movie_name FROM movie", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const movieNames = rows.map((row) => ({ movieName: row.movie_name }));
    res.json(movieNames);
  });
});

// API 2: Create a new movie
app.post("/movies", (req, res) => {
  const { directorId, movieName, leadActor } = req.body;
  db.run(
    "INSERT INTO movie (director_id, movie_name, lead_actor) VALUES (?, ?, ?)",
    [directorId, movieName, leadActor],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ message: "Movie Successfully Added" });
    }
  );
});

// API 3: Get a movie by ID
app.get("/movies/:movieId", (req, res) => {
  const movieId = req.params.movieId;
  db.get("SELECT * FROM movie WHERE movie_id = ?", [movieId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: "Movie not found" });
      return;
    }
    res.json({
      movieId: row.movie_id,
      directorId: row.director_id,
      movieName: row.movie_name,
      leadActor: row.lead_actor,
    });
  });
});

// API 4: Update movie details by ID
app.put("/movies/:movieId", (req, res) => {
  const { movieId } = req.params;
  const { directorId, movieName, leadActor } = req.body;
  db.run(
    "UPDATE movie SET director_id = ?, movie_name = ?, lead_actor = ? WHERE movie_id = ?",
    [directorId, movieName, leadActor, movieId],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Movie Details Updated" });
    }
  );
});

// API 5: Delete a movie by ID
app.delete("/movies/:movieId", (req, res) => {
  const { movieId } = req.params;
  db.run("DELETE FROM movie WHERE movie_id = ?", [movieId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Movie Removed" });
  });
});

// API 6: Get a list of all directors
app.get("/directors", (req, res) => {
  db.all("SELECT * FROM director", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const directors = rows.map((row) => ({
      directorId: row.director_id,
      directorName: row.director_name,
    }));
    res.json(directors);
  });
});

// API 7: Get a list of all movies directed by a specific director
app.get("/directors/:directorId/movies", (req, res) => {
  const directorId = req.params.directorId;
  db.all(
    "SELECT movie_name FROM movie WHERE director_id = ?",
    [directorId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const movieNames = rows.map((row) => ({ movieName: row.movie_name }));
      res.json(movieNames);
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Export the Express app instance
module.exports = app;
