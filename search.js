// CineVault - Search System (Uses OMDB public API)
const OMDB_BASE = "https://www.omdbapi.com/";
// Public demo key - limited to 1000 requests/day
const OMDB_KEY = "trilogy";

// Fallback demo data when API is unavailable
const DEMO_RESULTS = [
  { imdbID: "tt0468569", Title: "The Dark Knight", Year: "2008", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg", imdbRating: "9.0", Plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice." },
  { imdbID: "tt0111161", Title: "The Shawshank Redemption", Year: "1994", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NiYyLTg3MzMtYTJmNjg3Nzk5MzMzXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg", imdbRating: "9.3", Plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency." },
  { imdbID: "tt0068646", Title: "The Godfather", Year: "1972", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg", imdbRating: "9.2", Plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son." },
  { imdbID: "tt0816692", Title: "Interstellar", Year: "2014", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg", imdbRating: "8.6", Plot: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival." },
  { imdbID: "tt0944947", Title: "Game of Thrones", Year: "2011", Type: "series", Poster: "https://m.media-amazon.com/images/M/MV5BYTRiNDQwYzAtMzVlZS00NTI5LWJjYjUtMzkwNTUzMWMxZTllXkEyXkFqcGdeQXVyNDIzMzcwNjc@._V1_SX300.jpg", imdbRating: "9.2", Plot: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for thousands of years." },
  { imdbID: "tt0903747", Title: "Breaking Bad", Year: "2008", Type: "series", Poster: "https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDdmLWJjOTUtYjc2OGY3ZjdiMTZlXkEyXkFqcGdeQXVyMTMzNDExODE5._V1_SX300.jpg", imdbRating: "9.5", Plot: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future." },
  { imdbID: "tt1375666", Title: "Inception", Year: "2010", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg", imdbRating: "8.8", Plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O." },
  { imdbID: "tt0110912", Title: "Pulp Fiction", Year: "1994", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg", imdbRating: "8.9", Plot: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption." },
  { imdbID: "tt4574334", Title: "Stranger Things", Year: "2016", Type: "series", Poster: "https://m.media-amazon.com/images/M/MV5BN2ZmYjg1YmItNWQ4OC00YWM0LWE0ZDktYThjOTZiZjhhN2Q2XkEyXkFqcGdeQXVyNjgxNTQ3Mjk@._V1_SX300.jpg", imdbRating: "8.7", Plot: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back." },
  { imdbID: "tt0371746", Title: "Iron Man", Year: "2008", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BMTczNTI2ODUwOF5BMl5BanBnXkFtZTcwMTU0NTIzMw@@._V1_SX300.jpg", imdbRating: "7.9", Plot: "After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil." },
];

let searchCache = new Map();

export async function searchMedia(query, page = 1) {
  if (!query || query.trim().length < 2) return { results: [], total: 0 };
  const cacheKey = `${query}_${page}`;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  try {
    const url = `${OMDB_BASE}?apikey=${OMDB_KEY}&s=${encodeURIComponent(query)}&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    if (data.Response === "True") {
      // Fetch details for each result
      const enriched = await Promise.allSettled(
        data.Search.slice(0, 8).map(item => fetchDetails(item.imdbID))
      );
      const results = enriched
        .filter(r => r.status === "fulfilled" && r.value)
        .map(r => r.value);
      const payload = { results, total: parseInt(data.totalResults) || results.length };
      searchCache.set(cacheKey, payload);
      if (searchCache.size > 50) searchCache.delete(searchCache.keys().next().value);
      return payload;
    }
    throw new Error(data.Error || "No results");
  } catch (e) {
    // Fallback to demo data
    const q = query.toLowerCase();
    const results = DEMO_RESULTS.filter(m =>
      m.Title.toLowerCase().includes(q) ||
      m.Plot.toLowerCase().includes(q) ||
      m.Year.includes(q)
    );
    return { results, total: results.length, demo: true };
  }
}

export async function fetchDetails(imdbID) {
  try {
    const url = `${OMDB_BASE}?apikey=${OMDB_KEY}&i=${imdbID}&plot=full`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.Response === "True") return data;
    return null;
  } catch {
    return DEMO_RESULTS.find(d => d.imdbID === imdbID) || null;
  }
}

export function normalizeResult(result) {
  return {
    imdbID: result.imdbID || result.id || generateId(),
    Title: result.Title || result.name || "Unknown",
    Year: result.Year || "N/A",
    Type: result.Type || "movie",
    Poster: result.Poster !== "N/A" ? result.Poster : null,
    imdbRating: result.imdbRating || result.rating || "N/A",
    Plot: result.Plot || result.description || "No description available.",
    Genre: result.Genre || result.category || "General",
    Director: result.Director || "Unknown",
    Actors: result.Actors || "Unknown",
    Runtime: result.Runtime || "N/A",
    totalSeasons: result.totalSeasons || null,
  };
}

function generateId() {
  return "cv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}
