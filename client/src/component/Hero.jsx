import React from "react";
import { useNavigate } from "react-router-dom";
import user_group from "../assets/user_group.png"; 

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div
      className="
        min-h-screen
        bg-[url('/gradientBackground.png')]
        bg-cover
        bg-center
        bg-no-repeat
        flex
        items-center
        justify-center
        px-4
      "
    >
      <div className="text-center max-w-3xl">
        
        {/* HEADING */}
        <h1
          className="
            text-3xl sm:text-5xl md:text-6xl xl:text-7xl 
            font-semibold 
            mx-auto 
            leading-[1.2]
          "
        >
          Create amazing content <br />
          with <span className="text-primary">AI tools</span>
        </h1>

        {/* PARAGRAPH */}
        <p
          className="
            mt-4 
            max-w-xs sm:max-w-lg xl:max-w-xl 
            mx-auto
            text-xs sm:text-sm 
            text-gray-600
          "
        >
          Transform your content creation with our suite of premium AI tools.
          Write articles, generate images, and enhance your workflow effortlessly.
        </p>

        {/* BUTTON GROUP */}
        <div className="flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs mt-6">
          <button
            onClick={() => navigate("/ai")}
            className="
              bg-primary 
              text-white 
              px-10 
              py-3 
              rounded-lg 
              hover:scale-105 
              active:scale-95 
              transition 
              cursor-pointer
            "
          >
            Start creating now
          </button>

          <button
            className="
              bg-white 
              px-10 
              py-3 
              rounded-lg 
              border border-gray-300 
              hover:scale-105 
              active:scale-95 
              transition 
              cursor-pointer
            "
          >
            Watch demo
          </button>
        </div>

        {/* TRUSTED BY SECTION */}
        <div className="flex items-center gap-4 mt-8 mx-auto text-gray-600 justify-center">
          <img src={user_group} alt="Users Group" className="h-8" />
          Trusted by 10k+ people
        </div>

      </div>
    </div>
  );
};

export default Hero;
