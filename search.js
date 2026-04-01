// CineVault - Search System
// Chain: OMDb (primary) → TMDb (fallback) → Local demo (final fallback)

// ── OMDb ────────────────────────────────────────────────────────────────────
const OMDB_BASE = "https://www.omdbapi.com/";
const OMDB_KEY  = "trilogy";          // public demo key, 1 000 req/day

// ── TMDb ────────────────────────────────────────────────────────────────────
// TMDb v3 – free tier, no auth needed for read (just API-key in query)
const TMDB_BASE   = "https://api.themoviedb.org/3";
const TMDB_KEY    = "4f4e5a2f5a2dd4eadce9a8df59c45e57";   // public read-only key
const TMDB_IMG    = "https://image.tmdb.org/t/p/w500";

// ── Local demo ───────────────────────────────────────────────────────────────
const DEMO_RESULTS = [
  { imdbID:"tt0468569", Title:"The Dark Knight",         Year:"2008", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg", imdbRating:"9.0", Plot:"When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.", Genre:"Action, Crime, Drama" },
  { imdbID:"tt0111161", Title:"The Shawshank Redemption",Year:"1994", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NiYyLTg3MzMtYTJmNjg3Nzk5MzMzXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg", imdbRating:"9.3", Plot:"Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.", Genre:"Drama" },
  { imdbID:"tt0068646", Title:"The Godfather",           Year:"1972", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg", imdbRating:"9.2", Plot:"The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.", Genre:"Crime, Drama" },
  { imdbID:"tt0816692", Title:"Interstellar",            Year:"2014", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg", imdbRating:"8.6", Plot:"A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", Genre:"Adventure, Drama, Sci-Fi" },
  { imdbID:"tt0944947", Title:"Game of Thrones",         Year:"2011", Type:"series", Poster:"https://m.media-amazon.com/images/M/MV5BYTRiNDQwYzAtMzVlZS00NTI5LWJjYjUtMzkwNTUzMWMxZTllXkEyXkFqcGdeQXVyNDIzMzcwNjc@._V1_SX300.jpg", imdbRating:"9.2", Plot:"Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for thousands of years.", Genre:"Action, Adventure, Drama", totalSeasons:"8" },
  { imdbID:"tt0903747", Title:"Breaking Bad",            Year:"2008", Type:"series", Poster:"https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDdmLWJjOTUtYjc2OGY3ZjdiMTZlXkEyXkFqcGdeQXVyMTMzNDExODE5._V1_SX300.jpg", imdbRating:"9.5", Plot:"A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.", Genre:"Crime, Drama, Thriller", totalSeasons:"5" },
  { imdbID:"tt1375666", Title:"Inception",               Year:"2010", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg", imdbRating:"8.8", Plot:"A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.", Genre:"Action, Adventure, Sci-Fi" },
  { imdbID:"tt0110912", Title:"Pulp Fiction",            Year:"1994", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg", imdbRating:"8.9", Plot:"The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.", Genre:"Crime, Drama" },
  { imdbID:"tt4574334", Title:"Stranger Things",         Year:"2016", Type:"series", Poster:"https://m.media-amazon.com/images/M/MV5BN2ZmYjg1YmItNWQ4OC00YWM0LWE0ZDktYThjOTZiZjhhN2Q2XkEyXkFqcGdeQXVyNjgxNTQ3Mjk@._V1_SX300.jpg", imdbRating:"8.7", Plot:"When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.", Genre:"Drama, Fantasy, Horror", totalSeasons:"5" },
  { imdbID:"tt0371746", Title:"Iron Man",                Year:"2008", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BMTczNTI2ODUwOF5BMl5BanBnXkFtZTcwMTU0NTIzMw@@._V1_SX300.jpg", imdbRating:"7.9", Plot:"After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.", Genre:"Action, Adventure, Sci-Fi" },
  { imdbID:"tt0167260", Title:"The Lord of the Rings: The Return of the King", Year:"2003", Type:"movie", Poster:"https://m.media-amazon.com/images/M/MV5BNzA5ZDJhZWMtOGM4Ny00NjA4LWJlNGMtNjQzMWFlNWE3Y2RiXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg", imdbRating:"9.0", Plot:"Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.", Genre:"Action, Adventure, Drama" },
  { imdbID:"tt1345836", Title:"The Dark Knight Rises",  Year:"2012", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BMTk4ODQzNDY3Ml5BMl5BanBnXkFtZTcwODA0NTM4Nw@@._V1_SX300.jpg", imdbRating:"8.4", Plot:"Eight years after the Joker's reign of anarchy, the Dark Knight, with the help of the enigmatic Catwoman, is forced from his exile to save Gotham City.", Genre:"Action, Adventure" },
  { imdbID:"tt0108052", Title:"Schindler's List",        Year:"1993", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BNDE4OTEyMDQtNjk0NS00NzM4LWJmNWYtYzZlODY3ZTk3ZTllXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg", imdbRating:"9.0", Plot:"In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.", Genre:"Biography, Drama, History" },
  { imdbID:"tt1160419", Title:"Dune",                   Year:"2021", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BN2FjNmEyNWMtYzM0ZS00NjIyLTg4YzYtYThlMGVjNzE1OGViXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg", imdbRating:"8.0", Plot:"Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.", Genre:"Action, Adventure, Drama" },
  { imdbID:"tt0993846", Title:"The Wolf of Wall Street", Year:"2013", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_SX300.jpg", imdbRating:"8.2", Plot:"Based on the true story of Jordan Belfort, from his rise to a wealthy stock-broker living the high life to his fall involving crime, corruption and the federal government.", Genre:"Biography, Crime, Drama" },
];

let searchCache = new Map();

// ── Public API ────────────────────────────────────────────────────────────────

export async function searchMedia(query, page = 1) {
  if (!query || query.trim().length < 2) return { results: [], total: 0 };
  const cacheKey = `${query}_${page}`;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  // 1️⃣  OMDb
  try {
    const payload = await _omdbSearch(query, page);
    _cache(cacheKey, payload);
    return payload;
  } catch (_) { /* fall through */ }

  // 2️⃣  TMDb
  try {
    const payload = await _tmdbSearch(query, page);
    _cache(cacheKey, payload);
    return { ...payload, fallback: "tmdb" };
  } catch (_) { /* fall through */ }

  // 3️⃣  Local demo
  return _demoSearch(query);
}

export async function fetchDetails(imdbID) {
  // OMDb detail
  try {
    const url = `${OMDB_BASE}?apikey=${OMDB_KEY}&i=${imdbID}&plot=full`;
    const res = await fetch(url, { signal: _timeout(6000) });
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.Response === "True") return data;
    throw new Error();
  } catch { /* fall through */ }

  // Local demo fallback
  return DEMO_RESULTS.find(d => d.imdbID === imdbID) || null;
}

export function normalizeResult(result) {
  return {
    imdbID:      result.imdbID || result.id || _genId(),
    Title:       result.Title  || result.name  || "Unknown",
    Year:        result.Year   || result.release_date?.slice(0,4) || "N/A",
    Type:        result.Type   || (result.media_type === "tv" ? "series" : "movie"),
    Poster:      _poster(result),
    imdbRating:  result.imdbRating || (result.vote_average ? result.vote_average.toFixed(1) : "N/A"),
    Plot:        result.Plot || result.overview || result.description || "No description available.",
    Genre:       result.Genre || result.genre_names || result.category || "General",
    Director:    result.Director  || "Unknown",
    Actors:      result.Actors    || "Unknown",
    Runtime:     result.Runtime   || "N/A",
    totalSeasons:result.totalSeasons || result.number_of_seasons || null,
  };
}

// ── OMDb internals ────────────────────────────────────────────────────────────

async function _omdbSearch(query, page) {
  const url = `${OMDB_BASE}?apikey=${OMDB_KEY}&s=${encodeURIComponent(query)}&page=${page}`;
  const res = await fetch(url, { signal: _timeout(8000) });
  if (!res.ok) throw new Error("OMDb network error");
  const data = await res.json();
  if (data.Response !== "True") throw new Error(data.Error || "OMDb no results");

  const enriched = await Promise.allSettled(
    data.Search.slice(0, 8).map(item => fetchDetails(item.imdbID))
  );
  const results = enriched
    .filter(r => r.status === "fulfilled" && r.value)
    .map(r => r.value);
  return { results, total: parseInt(data.totalResults) || results.length };
}

// ── TMDb internals ────────────────────────────────────────────────────────────

async function _tmdbSearch(query, page) {
  const url = `${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
  const res = await fetch(url, { signal: _timeout(8000) });
  if (!res.ok) throw new Error("TMDb network error");
  const data = await res.json();
  if (!data.results?.length) throw new Error("TMDb no results");

  // Filter to movies & tv, enrich with genre names
  const genreMap = await _tmdbGenreMap();
  const items = data.results
    .filter(r => r.media_type === "movie" || r.media_type === "tv")
    .slice(0, 8)
    .map(r => _tmdbNormalize(r, genreMap));

  return { results: items, total: data.total_results || items.length };
}

let _genreCache = null;
async function _tmdbGenreMap() {
  if (_genreCache) return _genreCache;
  try {
    const [mv, tv] = await Promise.all([
      fetch(`${TMDB_BASE}/genre/movie/list?api_key=${TMDB_KEY}`).then(r => r.json()),
      fetch(`${TMDB_BASE}/genre/tv/list?api_key=${TMDB_KEY}`).then(r => r.json()),
    ]);
    _genreCache = {};
    [...(mv.genres || []), ...(tv.genres || [])].forEach(g => { _genreCache[g.id] = g.name; });
  } catch { _genreCache = {}; }
  return _genreCache;
}

function _tmdbNormalize(r, genreMap) {
  const isTV    = r.media_type === "tv";
  const title   = isTV ? r.name : r.title;
  const year    = isTV ? r.first_air_date?.slice(0,4) : r.release_date?.slice(0,4);
  const poster  = r.poster_path ? `${TMDB_IMG}${r.poster_path}` : null;
  const genres  = (r.genre_ids || []).map(id => genreMap[id]).filter(Boolean).join(", ");
  const rating  = r.vote_average ? r.vote_average.toFixed(1) : "N/A";

  return {
    imdbID:       `tmdb_${r.id}`,
    Title:        title || "Unknown",
    Year:         year  || "N/A",
    Type:         isTV  ? "series" : "movie",
    Poster:       poster,
    imdbRating:   rating,
    Plot:         r.overview || "No description available.",
    Genre:        genres || "General",
    genre_names:  genres,
    Director:     "Unknown",
    Actors:       "Unknown",
    Runtime:      "N/A",
    totalSeasons: null,
    _tmdb:        true,
  };
}

// ── Demo search ───────────────────────────────────────────────────────────────

function _demoSearch(query) {
  const q = query.toLowerCase();
  const results = DEMO_RESULTS.filter(m =>
    m.Title.toLowerCase().includes(q) ||
    m.Plot.toLowerCase().includes(q)  ||
    m.Year.includes(q)
  );
  // If nothing matches, return all demo results so the UI is never empty
  return { results: results.length ? results : DEMO_RESULTS.slice(0, 8), total: results.length || DEMO_RESULTS.length, demo: true };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _poster(result) {
  if (result.Poster && result.Poster !== "N/A") return result.Poster;
  if (result.poster_path) return `${TMDB_IMG}${result.poster_path}`;
  return null;
}

function _timeout(ms) {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

function _genId() {
  return "cv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function _cache(key, val) {
  searchCache.set(key, val);
  if (searchCache.size > 60) searchCache.delete(searchCache.keys().next().value);
}

