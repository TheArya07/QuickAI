import React, { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Heart } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getToken } = useAuth();
  const { user } = useUser();

  /* ================== FETCH PUBLISHED CREATIONS ================== */
  const fetchCreations = async () => {
    try {
      const { data } = await axios.get(
        "/api/user/get-published-creations",
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const imageLikeToggle = async(id)=>{
    try{
      const {data} = await axios.post('/api/user/toggle-like-creation',{id},{
        headers : {Authorization: `Bearer ${await getToken()}`}
      })
      if(data.success){
        toast.success(data.message)
        await fetchCreations()
      }else{
        toast.error(data.message)
      }
    }catch (error){
      toast.error(error.message)
    }
  }

  /* ================== LIKE / UNLIKE CREATION ================== */
  const toggleLike = async (id) => {
    try {
      const { data } = await axios.post(
        "/api/user/toggle-like-creations",
        { id },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        fetchCreations(); // refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ================== RUN ON LOAD ================== */
  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);

  return  !loading ?(
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Community Creations</h1>

      <div className="bg-white h-full w-full rounded-xl overflow-y-scroll p-3 flex flex-wrap gap-4">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : creations.length === 0 ? (
          <p className="text-gray-500 text-sm">No images published yet</p>
        ) : (
          creations.map((creation, index) => (
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

              {/* Hover Content */}
              <div
                className="absolute inset-0 flex justify-end items-end p-3 
                bg-black/0 group-hover:bg-black/70 rounded-lg transition"
              >
                {/* Prompt */}
                <p className="text-sm text-white hidden group-hover:block mr-3">
                  {creation.prompt}
                </p>

                {/* Likes */}
                <div className="flex gap-1 items-center text-white">
                  <p>{creation.likes.length}</p>

                  <Heart onClick={()=> imageLikeToggle(creation.id)}
                    className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${
                      creation.likes.includes(user?.id)
                        ? "fill-red-500 text-red-600"
                        : "text-white"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  ) : (
    <div className="flex justofy-center items-center h-full">
<span className="w-10 h-1 my-1 rounded-full norder-3
border-primary border-t-transparent animate-spin"></span>
    </div>
    
  )
};

export default Community;
