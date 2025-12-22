import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Heart } from "lucide-react";
import { dummyPublishedCreationData } from "../assets/assets";

const Community = () => {
  const [creations, setCreations] = useState([]);
  const { user } = useUser();

  const fetchCreations = async () => {
    setCreations(dummyPublishedCreationData);
  };

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);

  return (
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      Creations

      <div className="bg-white h-full w-full rounded-xl overflow-y-scroll p-3 flex flex-wrap gap-4">
        {creations.map((creation, index) => (
          <div
            key={index}
            className="relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3"
          >
            {/* Image */}
            <img
              src={creation.content}
              alt=""
              className="w-full h-full object-cover rounded-lg"
            />

            {/* Hover content */}
            <div
              className="absolute inset-0 flex justify-end items-end p-3 
              bg-black/0 group-hover:bg-black/70 rounded-lg transition"
            >
              {/* Prompt text */}
              <p className="text-sm text-white hidden group-hover:block mr-3">
                {creation.prompt}
              </p>

              {/* Likes */}
              <div className="flex gap-1 items-center text-white">
                <p>{creation.likes.length}</p>

                <Heart
                  className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${
                    creation.likes.includes(user?.id)
                      ? "fill-red-500 text-red-600"
                      : "text-white"
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Community;
