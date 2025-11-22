"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import ClickChart from "./components/ClickChart";
import QRCodeDisplay from "./components/QRCodeDisplay";

interface Url {
  id: string;
  shortCode: string;
  originalUrl: string;
  clickCount: number;
  lastClicked: string | null;
  expiresAt?: string | null;
}

export default function Dashboard() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [expiresAt, setExpiresAt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [linkPassword, setLinkPassword] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  async function fetchUrls() {
    const res = await fetch("/api/links");
    const data = await res.json();
    setUrls(data);
  }

  useEffect(() => {
    if (session) {
      fetchUrls();
    }
  }, [session]);

  function handleCopy(shortCode: string, id: string) {
    navigator.clipboard.writeText(`${baseUrl}/${shortCode}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!originalUrl) return;

    setLoading(true);

    await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalUrl,
        customCode: customCode || null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        password: linkPassword || null,
      }),
    });

    setOriginalUrl("");
    setCustomCode("");
    setExpiresAt("");
    setLinkPassword("");
    setLoading(false);
    fetchUrls();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    fetchUrls();
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-white to-purple-100 animate-gradient-x p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-gray-800"
          >
            Tiny Linker Dashboard
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-5 py-2 rounded-full bg-black text-white shadow-lg"
          >
            Logout
          </motion.button>
        </div>

        {/* Create Section */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleCreate}
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <input
            type="url"
            required
            placeholder="Paste long URL..."
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="border rounded-xl px-5 py-3 focus:ring-2 focus:ring-indigo-400 outline-none text-black"
          />
          <input
            type="text"
            placeholder="Custom code"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            className="border rounded-xl px-5 py-3 focus:ring-2 focus:ring-purple-400 outline-none text-black"
          />
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="border rounded-xl px-5 py-3 text-black"
          />
          <input
            type="password"
            placeholder="Password protect"
            value={linkPassword}
            onChange={(e) => setLinkPassword(e.target.value)}
            className="border rounded-xl px-5 py-3"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-full font-semibold"
          >
            {loading ? "Creating..." : "Create Short Link"}
          </motion.button>
        </motion.form>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.isArray(urls) && urls.length > 0 ? (
            urls.map((url) => (
              <motion.div
                key={url.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <a
                      href={`${baseUrl}/${url.shortCode}`}
                      target="_blank"
                      className="text-indigo-600 font-semibold text-lg"
                    >
                      {baseUrl}/{url.shortCode}
                    </a>
                    <p className="text-sm text-gray-500 break-all">
                      {url.originalUrl}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(url.id)}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleCopy(url.shortCode, url.id)}
                    className="px-4 py-1 border rounded-full text-xs"
                  >
                    {copiedId === url.id ? "Copied" : "Copy"}
                  </button>
                  <span className="text-xs text-gray-500">
                    Clicks: {url.clickCount}
                  </span>
                </div>

                {url.expiresAt && (
                  <p className="text-xs text-red-500">
                    Expires: {new Date(url.expiresAt).toLocaleString()}
                  </p>
                )}

                <div className="flex justify-between items-center pt-2">
                  <QRCodeDisplay url={`${baseUrl}/${url.shortCode}`} />
                  <div className="w-2/3">
                    <ClickChart urlId={url.id} />
                  </div>
                </div>

                {url.lastClicked && (
                  <p className="text-xs text-gray-400">
                    Last Clicked: {new Date(url.lastClicked).toLocaleString()}
                  </p>
                )}
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No links created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
