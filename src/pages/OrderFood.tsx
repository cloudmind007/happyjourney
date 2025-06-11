import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import image from "../assets/cliprail.jpg";
import api from "@/utils/axios";

interface Station {
  stationId: number;
  stationCode: string;
  stationName: string;
}

const OrderFood = () => {
  const [selectedStation, setSelectedStation] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/stations")
      .then((res) => {
        if (Array.isArray(res.data.content)) {
          setStations(res.data.content);
        } else {
          console.error("Unexpected station response:", res.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching stations", err);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStation) {
      navigate(`venderList`);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start bg-white">
      <Card className="w-full max-w-5xl mt-10 p-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-center mb-10 gap-6">
          <img
            src={image}
            alt="Train Banner"
            className="w-[250px] h-[250px] object-cover rounded-lg"
          />
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800 leading-snug">
              Hot & Fresh Meals <br />
              <span className="text-red-600">Delivered at Your Train Seat</span>
            </h2>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4 text-center">
          Order Food on Train Online
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center space-y-4"
        >
          <Label htmlFor="station" className="text-lg font-medium">
            Select Station Name
          </Label>
          <select
            id="station"
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="w-72 p-2 border border-gray-300 rounded"
          >
            <option value="">-- Choose a station --</option>
            {stations.map((station) => (
              <option key={station.stationId} value={station.stationCode}>
                {station.stationName} ({station.stationCode})
              </option>
            ))}
          </select>

          <Button type="submit" className="w-32">
            Submit
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default OrderFood;
