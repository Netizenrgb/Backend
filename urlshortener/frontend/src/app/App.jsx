import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [urls, setUrls] = useState([]);
  const [inputvalues, setInputvalues] = useState("");
  const [currenturl, setCurrenturl] = useState(null);

  async function fetchurls() {
    try {
      // GET API endpoint is /getlinks
      const res = await axios.get("http://localhost:5173/api/url/getlinks");

      const responsedata = res.data;

      setUrls(responsedata.data.urls);
    } catch (error) {
      console.error("Error fetching URLs:", error);
    }
  }

  useEffect(() => {
    fetchurls();
  }, []);

  async function createShorturl() {
    // ts is a format that is used to send data from axios
    /* the url which via which the data has to travel 
    and then the data which the client send in the body
    */
    const res = await axios.post("/api/url", {
      // data from frontend ->url: inputvalues
      url: inputvalues,
    });

    setCurrenturl({
      og_url: res.data.data.og_url,
      short_code: res.data.data.short_code,
    });

    fetchurls();
  }

  async function deleteurl(id) {
    await axios.delete(`http://localhost:5173/api/url/${id}`);
    fetchurls();
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-10 md:px-10">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            URL Shortener
          </h1>

          <p className="text-neutral-400 mt-2">
            Create, manage and track your shortened URLs.
          </p>
        </div>

        {/* Shorten URL Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 md:p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={inputvalues}
              onChange={(e) => setInputvalues(e.target.value)}
              placeholder="Enter your original URL..."
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />

            <button
              onClick={() => createShorturl()}
              className="bg-amber-400 text-black font-semibold px-6 py-3 rounded-xl hover:bg-amber-300 active:scale-95 transition"
            >
              Shorten
            </button>
          </div>
        </div>

        {/* URL List */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-neutral-800/60 border-b border-neutral-800 text-sm font-semibold text-neutral-400">
            <div className="col-span-5">Original URL</div>
            <div className="col-span-3">Short URL</div>
            <div className="col-span-1 text-center">Clicks</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {urls.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-neutral-500 text-lg">No shortened URLs yet.</p>

              <p className="text-neutral-600 text-sm mt-1">
                Create your first shortened URL above.
              </p>
            </div>
          ) : (
            <div>
              {urls.map((url) => (
                <div
                  key={url._id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-5 border-b border-neutral-800 last:border-b-0 hover:bg-neutral-800/40 transition"
                >
                  {/* Original URL */}
                  <div className="md:col-span-5">
                    <p className="text-xs text-neutral-500 mb-1 md:hidden">
                      Original URL
                    </p>

                    <p
                      className="text-sm text-neutral-300 truncate"
                      title={url.og_url}
                    >
                      {url.og_url}
                    </p>
                  </div>

                  {/* Short URL */}
                  <div className="md:col-span-3">
                    <p className="text-xs text-neutral-500 mb-1 md:hidden">
                      Short URL
                    </p>

                    <a
                      href={`http://localhost:3000/${url.short_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-amber-400 font-mono text-sm hover:text-amber-300 hover:underline transition"
                    >
                      {url.short_code}
                    </a>
                  </div>

                  {/* Click Count */}
                  <div className="md:col-span-1 md:text-center">
                    <p className="text-xs text-neutral-500 mb-1 md:hidden">
                      Clicks
                    </p>

                    <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm font-semibold text-neutral-300">
                      {url.clicks_count}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-3 flex justify-start md:justify-end gap-2">
                    <button className="px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition">
                      Copy
                    </button>

                    <button
                      onClick={() => {
                        deleteurl(url._id);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-neutral-600 text-sm mt-6">
          Your shortened URLs and click statistics
        </p>
      </div>
    </main>
  );
};

export default App;
