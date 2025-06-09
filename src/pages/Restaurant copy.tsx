import { Search } from "lucide-react";
import React, { useState } from "react";

type Restaurant = {
  id: number;
  name: string;
  email: string;
  status: string;
  avatar: string;
};

const restaurants: Restaurant[] = new Array(30).fill(null).map((_, i) => ({
  id: 149 - i,
  name: `Restaurant ${149 - i}`,
  email: `restaurant${149 - i}@gmail.com`,
  status: "approved",
  avatar: "/avatar.png",
}));

const RestaurantListPage: React.FC = () => {
  const [search, setSearch] = useState("");

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <main className="flex-1 bg-gray-100 min-h-screen">
        {/* Navbar */}

        {/* Table Section */}
        <section className="p-6">
          <div className="bg-white p-4 rounded shadow-md overflow-x-auto">
            {/* Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-2 md:space-y-0">
              <div className="flex items-center gap-2">
                <select className="border px-3 py-2 rounded text-sm">
                  <option>Select Action</option>
                  <option>Delete</option>
                </select>
                <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                  Submit
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  className="border pl-10 pr-3 py-2 rounded text-sm w-full md:w-64"
                  placeholder="Search by name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            {/* Table */}
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2">
                    <input type="checkbox" />
                  </th>
                  <th className="px-4 py-2">Vendor ID</th>
                  <th className="px-4 py-2">Avatar</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-2">
                      <input type="checkbox" />
                    </td>
                    <td className="px-4 py-2 text-blue-600 cursor-pointer hover:underline">
                      {r.id}
                    </td>
                    <td className="px-4 py-2">
                      <img
                        src={r.avatar}
                        alt={r.name}
                        className="w-8 h-8 rounded-full"
                      />
                    </td>
                    <td className="px-4 py-2">{r.name}</td>
                    <td className="px-4 py-2">{r.email}</td>
                    <td className="px-4 py-2 capitalize">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-end items-center mt-4 space-x-2 text-sm">
              <button className="px-3 py-1 border rounded">‹</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 border rounded">2</button>
              <button className="px-3 py-1 border rounded">3</button>
              <button className="px-3 py-1 border rounded">›</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RestaurantListPage;
