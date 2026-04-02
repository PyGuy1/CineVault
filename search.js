// CineVault — Search & Details
//
// Architecture:
//   Search  → TMDb  (primary — fuzzy, partial names, high limits)
//   Details → OMDb  (on-demand only when popup opens)
//   Fallback→ Local demo  (every failure point, always offline-safe)

// ── API config ────────────────────────────────────────────────────────────────
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY  = "4f4e5a2f5a2dd4eadce9a8df59c45e57";
// Use w342 for search cards (faster), w500 for detail popups
const TMDB_IMG_CARD   = "https://image.tmdb.org/t/p/w342";
const TMDB_IMG_DETAIL = "https://image.tmdb.org/t/p/w500";

const OMDB_BASE = "https://www.omdbapi.com/";
const OMDB_KEY  = "trilogy";

// ── Local demo ────────────────────────────────────────────────────────────────
const DEMO_RESULTS = [
  { imdbID:"tt0468569", Title:"The Dark Knight",                              Year:"2008", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",  imdbRating:"9.0", Genre:"Action, Crime, Drama",       Director:"Christopher Nolan",    Actors:"Christian Bale, Heath Ledger, Aaron Eckhart",          Runtime:"152 min", Plot:"When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice." },
  { imdbID:"tt0111161", Title:"The Shawshank Redemption",                     Year:"1994", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NiYyLTg3MzMtYTJmNjg3Nzk5MzMzXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg", imdbRating:"9.3", Genre:"Drama",                      Director:"Frank Darabont",       Actors:"Tim Robbins, Morgan Freeman",                          Runtime:"142 min", Plot:"Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency." },
  { imdbID:"tt0068646", Title:"The Godfather",                                Year:"1972", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",  imdbRating:"9.2", Genre:"Crime, Drama",               Director:"Francis Ford Coppola", Actors:"Marlon Brando, Al Pacino, James Caan",                 Runtime:"175 min", Plot:"The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son." },
  { imdbID:"tt0816692", Title:"Interstellar",                                 Year:"2014", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",  imdbRating:"8.6", Genre:"Adventure, Drama, Sci-Fi",   Director:"Christopher Nolan",    Actors:"Matthew McConaughey, Anne Hathaway, Jessica Chastain", Runtime:"169 min", Plot:"A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival." },
  { imdbID:"tt0944947", Title:"Game of Thrones",                              Year:"2011", Type:"series", Poster:"https://m.media-amazon.com/images/M/MV5BYTRiNDQwYzAtMzVlZS00NTI5LWJjYjUtMzkwNTUzMWMxZTllXkEyXkFqcGdeQXVyNDIzMzcwNjc@._V1_SX300.jpg",  imdbRating:"9.2", Genre:"Action, Adventure, Drama",   Director:"N/A",                  Actors:"Emilia Clarke, Peter Dinklage, Kit Harington",         Runtime:"57 min",  totalSeasons:"8", Plot:"Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for thousands of years." },
  { imdbID:"tt0903747", Title:"Breaking Bad",                                 Year:"2008", Type:"series", Poster:"https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDdmLWJjOTUtYjc2OGY3ZjdiMTZlXkEyXkFqcGdeQXVyMTMzNDExODE5._V1_SX300.jpg", imdbRating:"9.5", Genre:"Crime, Drama, Thriller",     Director:"N/A",                  Actors:"Bryan Cranston, Aaron Paul, Anna Gunn",                Runtime:"47 min",  totalSeasons:"5", Plot:"A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future." },
  { imdbID:"tt1375666", Title:"Inception",                                    Year:"2010", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",  imdbRating:"8.8", Genre:"Action, Adventure, Sci-Fi",   Director:"Christopher Nolan",    Actors:"Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page", Runtime:"148 min", Plot:"A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O." },
  { imdbID:"tt0110912", Title:"Pulp Fiction",                                 Year:"1994", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",  imdbRating:"8.9", Genre:"Crime, Drama",               Director:"Quentin Tarantino",    Actors:"John Travolta, Uma Thurman, Samuel L. Jackson",        Runtime:"154 min", Plot:"The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption." },
  { imdbID:"tt4574334", Title:"Stranger Things",                              Year:"2016", Type:"series", Poster:"https://m.media-amazon.com/images/M/MV5BN2ZmYjg1YmItNWQ4OC00YWM0LWE0ZDktYThjOTZiZjhhN2Q2XkEyXkFqcGdeQXVyNjgxNTQ3Mjk@._V1_SX300.jpg",  imdbRating:"8.7", Genre:"Drama, Fantasy, Horror",     Director:"N/A",                  Actors:"Millie Bobby Brown, Finn Wolfhard, Winona Ryder",      Runtime:"51 min",  totalSeasons:"5", Plot:"When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back." },
  { imdbID:"tt0371746", Title:"Iron Man",                                     Year:"2008", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BMTczNTI2ODUwOF5BMl5BanBnXkFtZTcwMTU0NTIzMw@@._V1_SX300.jpg",  imdbRating:"7.9", Genre:"Action, Adventure, Sci-Fi",   Director:"Jon Favreau",          Actors:"Robert Downey Jr., Gwyneth Paltrow, Terrence Howard",  Runtime:"126 min", Plot:"After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil." },
  { imdbID:"tt0167260", Title:"The Lord of the Rings: The Return of the King",Year:"2003", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BNzA5ZDJhZWMtOGM4Ny00NjA4LWJlNGMtNjQzMWFlNWE3Y2RiXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg", imdbRating:"9.0", Genre:"Action, Adventure, Drama",   Director:"Peter Jackson",        Actors:"Elijah Wood, Viggo Mortensen, Ian McKellen",           Runtime:"201 min", Plot:"Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring." },
  { imdbID:"tt1345836", Title:"The Dark Knight Rises",                        Year:"2012", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BMTk4ODQzNDY3Ml5BMl5BanBnXkFtZTcwODA0NTM4Nw@@._V1_SX300.jpg",  imdbRating:"8.4", Genre:"Action, Adventure",           Director:"Christopher Nolan",    Actors:"Christian Bale, Tom Hardy, Anne Hathaway",             Runtime:"164 min", Plot:"Eight years after the Joker's reign of anarchy, the Dark Knight, with the help of the enigmatic Catwoman, is forced from his exile to save Gotham City." },
  { imdbID:"tt0108052", Title:"Schindler's List",                             Year:"1993", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BNDE4OTEyMDQtNjk0NS00NzM4LWJmNWYtYzZlODY3ZTk3ZTllXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",  imdbRating:"9.0", Genre:"Biography, Drama, History",  Director:"Steven Spielberg",     Actors:"Liam Neeson, Ralph Fiennes, Ben Kingsley",             Runtime:"195 min", Plot:"In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis." },
  { imdbID:"tt1160419", Title:"Dune",                                         Year:"2021", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BN2FjNmEyNWMtYzM0ZS00NjIyLTg4YzYtYThlMGVjNzE1OGViXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg",  imdbRating:"8.0", Genre:"Action, Adventure, Drama",   Director:"Denis Villeneuve",     Actors:"Timothée Chalamet, Rebecca Ferguson, Zendaya",         Runtime:"155 min", Plot:"Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy." },
  { imdbID:"tt0993846", Title:"The Wolf of Wall Street",                      Year:"2013", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_SX300.jpg",  imdbRating:"8.2", Genre:"Biography, Crime, Drama",    Director:"Martin Scorsese",      Actors:"Leonardo DiCaprio, Jonah Hill, Margot Robbie",         Runtime:"180 min", Plot:"Based on the true story of Jordan Belfort, from his rise to a wealthy stock-broker living the high life to his fall involving crime, corruption and the federal government." },
  { imdbID:"tt0372784", Title:"Batman Begins",                                Year:"2005", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BOTY4YjI2N2MtYmFlMC00ZjcyLTg3YjEtMDQyM2ZjYzQ1ZTllXkEyXkFqcGdeQXVyMTQxNjkwOTQ@._V1_SX300.jpg",  imdbRating:"8.2", Genre:"Action, Adventure",           Director:"Christopher Nolan",    Actors:"Christian Bale, Michael Caine, Ken Watanabe",          Runtime:"140 min", Plot:"After training with his mentor, Batman begins his fight to free crime-ridden Gotham City from corruption." },
  { imdbID:"tt0133093", Title:"The Matrix",                                   Year:"1999", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVlLTM5YTUtZmFhZTc1ZTI2ZTljXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",  imdbRating:"8.7", Genre:"Action, Sci-Fi",              Director:"Lana Wachowski",       Actors:"Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",   Runtime:"136 min", Plot:"A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers." },
  { imdbID:"tt1520211", Title:"The Walking Dead",                             Year:"2010", Type:"series", Poster:"https://m.media-amazon.com/images/M/MV5BZmFlYjQwNDItZWM5My00NTJhLWE0MjgtZWI4NzM3NDg2YmNiXkEyXkFqcGdeQXVyMTEyMjM2NDc2._V1_SX300.jpg", imdbRating:"8.1", Genre:"Drama, Horror, Thriller",    Director:"N/A",                  Actors:"Andrew Lincoln, Norman Reedus, Melissa McBride",       Runtime:"44 min",  totalSeasons:"11", Plot:"Sheriff Deputy Rick Grimes wakes up from a coma to find a post-apocalyptic world dominated by flesh-eating zombies." },
  { imdbID:"tt0795176", Title:"Planet Earth",                                 Year:"2006", Type:"series", Poster:"https://m.media-amazon.com/images/M/MV5BNzgxMDY0NTctMjI4ZC00YWUzLWJiZjctNGFhNDFlZDJhNzQzXkEyXkFqcGdeQXVyNjg4ODI2OA@@._V1_SX300.jpg",  imdbRating:"9.4", Genre:"Documentary",                 Director:"N/A",                  Actors:"David Attenborough",                                   Runtime:"50 min",  totalSeasons:"1",  Plot:"Emmy Award winning series documents the incredible journey of the world's most fascinating creatures." },
  { imdbID:"tt0076759", Title:"Star Wars: Episode IV",                        Year:"1977", Type:"movie",  Poster:"https://m.media-amazon.com/images/M/MV5BOTA5NjhiOTAtZWM0ZC00MWNhLThiMzEtZDFkOTk2OTU1ZTJlXkEyXkFqcGdeQXVyMTA4NDI1NTQx._V1_SX300.jpg",  imdbRating:"8.6", Genre:"Action, Adventure, Fantasy",  Director:"George Lucas",         Actors:"Mark Hamill, Harrison Ford, Carrie Fisher",            Runtime:"121 min", Plot:"Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire's world-destroying battle station." },
];

// ── Caches ────────────────────────────────────────────────────────────────────
const searchCache = new Map();
let _genreCache = null;          // TMDb genre map, loaded ONCE then kept forever
let _genreLoadPromise = null;    // deduplicate concurrent genre fetches

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════════════════════════════

/**
 * searchMedia
 * ALWAYS uses TMDb — fuzzy, partial-name-friendly, high rate limit.
 * Cancelled automatically if a newer call arrives (AbortController).
 * Falls through to local demo if TMDb fails.
 */
export async function searchMedia(query, page = 1, signal = null) {
  const q = query ? query.trim() : "";
  if (q.length < 2) return { results: [], total: 0 };

  const cacheKey = "q:" + q.toLowerCase() + "_p:" + page;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  // Kick off genre map loading in background (won't block search)
  _ensureGenreMap();

  // 1. TMDb — primary, fuzzy, partial-name-friendly
  try {
    const payload = await _tmdbSearch(q, page, signal);
    // Cache even empty results so typing the same partial twice doesn't re-fetch
    _cacheSet(cacheKey, payload);
    return payload;
  } catch (err) {
    // Re-throw AbortError — caller must not update UI with stale/cancelled data
    if (err && err.name === "AbortError") throw err;
    // Network/API failure only → fall back to demo
  }

  // 2. Local demo — only reached on actual TMDb failure (network down, API error)
  // NOT reached when TMDb just returns 0 results for the query
  return _demoSearch(q);
}

/**
 * fetchDetails
 * Called ONLY when user opens a detail popup — uses OMDb for rich metadata.
 * TMDb-only IDs (tmdb_xxx) skip OMDb entirely; caller uses the TMDb data it
 * already has from the search result.
 */
export async function fetchDetails(id) {
  if (!id) return null;
  if (id.startsWith("tmdb_")) return null;   // no IMDb ID available

  // 1. OMDb
  try {
    const url = OMDB_BASE + "?apikey=" + OMDB_KEY +
                "&i=" + encodeURIComponent(id) + "&plot=full";
    const res  = await fetch(url, { signal: _timeout(8000) });
    if (!res.ok) throw new Error("OMDb HTTP " + res.status);
    const data = await res.json();
    if (data.Response === "True") return data;
    throw new Error(data.Error || "OMDb: no result");
  } catch (_) { /* fall through */ }

  // 2. Demo fallback
  return DEMO_RESULTS.find(d => d.imdbID === id) || null;
}

/**
 * normalizeResult
 * Maps any source format (TMDb / OMDb / demo) → unified watchlist-item shape.
 */
export function normalizeResult(result) {
  return {
    imdbID:      result.imdbID   || (result._tmdbId ? "tmdb_" + result._tmdbId : _genId()),
    Title:       result.Title    || result.name   || "Unknown",
    Year:        result.Year     || (result.release_date ? result.release_date.slice(0, 4) : "N/A"),
    Type:        result.Type     || (result.media_type === "tv" ? "series" : "movie"),
    Poster:      _bestPoster(result),
    imdbRating:  result.imdbRating != null && result.imdbRating !== "N/A"
                   ? result.imdbRating
                   : (result.vote_average != null ? Number(result.vote_average).toFixed(1) : "N/A"),
    Plot:        result.Plot    || result.overview    || result.description || "No description available.",
    Genre:       result.Genre   || result.genre_names || result.category    || "General",
    Director:    result.Director || "Unknown",
    Actors:      result.Actors   || "Unknown",
    Runtime:     result.Runtime  || "N/A",
    totalSeasons:result.totalSeasons || result.number_of_seasons || null,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// TMDb internals
// ══════════════════════════════════════════════════════════════════════════════

async function _tmdbSearch(query, page, externalSignal) {
  const url = TMDB_BASE + "/search/multi" +
    "?api_key=" + TMDB_KEY +
    "&query="   + encodeURIComponent(query) +
    "&page="    + page +
    "&include_adult=false";

  const signal = externalSignal || _timeout(9000);
  const res    = await fetch(url, { signal });
  if (!res.ok) throw new Error("TMDb HTTP " + res.status);

  const data = await res.json();
  if (!data.results) throw new Error("TMDb: unexpected response shape");

  // Keep movies and TV shows only, drop persons/other
  const raw = data.results.filter(r =>
    r.media_type === "movie" || r.media_type === "tv"
  );

  // Use cached genre map (may be {} if still loading — genres blank, not fatal)
  const genreMap = _genreCache || {};
  const results  = raw.slice(0, 10).map(r => _tmdbNormalize(r, genreMap));

  // Return empty array if TMDb genuinely has no results for this query.
  // Caller decides whether to show "no results" UI or fall back to demo.
  return { results, total: data.total_results || 0, _source: "tmdb" };
}

/**
 * _ensureGenreMap — loads the TMDb genre map exactly once per session.
 * Returns a promise that resolves when the map is ready.
 * Subsequent calls return the cached map immediately.
 * Using a shared promise means concurrent calls don't fire duplicate requests.
 */
function _ensureGenreMap() {
  if (_genreCache !== null) return Promise.resolve(_genreCache);
  if (_genreLoadPromise) return _genreLoadPromise;

  _genreLoadPromise = (async () => {
    try {
      const mvUrl = TMDB_BASE + "/genre/movie/list?api_key=" + TMDB_KEY;
      const tvUrl = TMDB_BASE + "/genre/tv/list?api_key="    + TMDB_KEY;
      const [mv, tv] = await Promise.all([
        fetch(mvUrl, { signal: _timeout(8000) }).then(r => r.json()),
        fetch(tvUrl, { signal: _timeout(8000) }).then(r => r.json()),
      ]);
      _genreCache = {};
      (mv.genres || []).concat(tv.genres || []).forEach(g => {
        _genreCache[g.id] = g.name;
      });
    } catch (_) {
      // Genre fetch failed — set to empty so searches still work (just no genre labels)
      // Don't cache the failure: set to {} so next call won't retry unnecessarily.
      _genreCache = {};
      _genreLoadPromise = null;  // allow one retry on next search
    }
    return _genreCache;
  })();

  return _genreLoadPromise;
}

function _tmdbNormalize(r, genreMap) {
  const isTV    = r.media_type === "tv";
  const title   = isTV ? r.name  : r.title;
  const rawDate = isTV ? r.first_air_date : r.release_date;
  const year    = rawDate ? rawDate.slice(0, 4) : "N/A";

  // Only use poster_path — backdrop_path is landscape and looks broken in portrait slots
  const poster = r.poster_path ? TMDB_IMG_CARD + r.poster_path : null;

  const genres = (r.genre_ids || [])
    .map(id => genreMap[id])
    .filter(Boolean)
    .join(", ");

  const rating = r.vote_average != null && r.vote_average > 0
    ? Number(r.vote_average).toFixed(1)
    : "N/A";

  return {
    imdbID:      "tmdb_" + r.id,
    _tmdbId:     r.id,
    Title:       title || "Unknown",
    Year:        year,
    Type:        isTV  ? "series" : "movie",
    Poster:      poster,
    poster_path: r.poster_path || null,   // stored so detail popup can use w500
    imdbRating:  rating,
    Plot:        r.overview || "No description available.",
    Genre:       genres || "General",
    genre_names: genres,
    Director:    "Unknown",
    Actors:      "Unknown",
    Runtime:     "N/A",
    totalSeasons:isTV ? (r.number_of_seasons || null) : null,
    _source:     "tmdb",
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// Demo fallback — offline-safe, never fails
// ══════════════════════════════════════════════════════════════════════════════

function _demoSearch(query) {
  const q = query.toLowerCase();
  const matched = DEMO_RESULTS.filter(m =>
    m.Title.toLowerCase().includes(q) ||
    m.Plot.toLowerCase().includes(q)  ||
    m.Year.includes(q)                ||
    (m.Genre || "").toLowerCase().includes(q)
  );
  // Never return empty — show top items so UI always has content
  const results = matched.length ? matched : DEMO_RESULTS.slice(0, 8);
  return { results, total: results.length, _source: "demo" };
}

// ══════════════════════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════════════════════

function _bestPoster(result) {
  // Priority: explicit Poster field → poster_path → backdrop_path → null
  if (result.Poster && result.Poster !== "N/A") return result.Poster;
  if (result.poster_path) return TMDB_IMG_DETAIL + result.poster_path;
  if (result.backdrop_path) return TMDB_IMG_DETAIL + result.backdrop_path;
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

function _cacheSet(key, val) {
  searchCache.set(key, val);
  // Evict oldest when cache grows beyond 80 entries
  if (searchCache.size > 80) searchCache.delete(searchCache.keys().next().value);
}
