const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT 
            *
        FROM
            movie
        ORDER BY
            movie_id;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDBObjectToResponseObject(eachMovie))
  );
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
        INSERT INTO
            movie(director_id,movie_name,lead_actor)
        VALUES(
            '${directorId}',
            '${movieName}',
            '${leadActor}'
        );`;
  const dbResponse = await database.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT 
            *
        FROM
            movie
        WHERE 
            movie_id = ${movieId};`;
  const movieArray = await database.get(getMovieQuery);
  response.send(convertDBObjectToResponseObject(movieArray));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
        UPDATE
            movie
        SET
            director_Id = '${directorId}',
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE movie_id = ${movieId};`;
  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE FROM
            movie
        WHERE 
            movie_id = ${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});
const convertDatabaseObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT
            *
        FROM 
            director
        ORDER BY
            director_id;`;
  const directorsArray = await database.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDatabaseObjectToResponseObject(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
        SELECT 
           movie_name
        FROM
            movie
        WHERE director_id = '${directorId}';`;
  const moviesArray = await database.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
