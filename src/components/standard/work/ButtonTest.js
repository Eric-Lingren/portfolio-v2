import React, { useEffect } from "react";
import "./buttontest.scss"; // Replace with the actual path to your CSS file

const ButtonTest = () => {
  useEffect(() => {
    // Load Twitter widget script when the component mounts
    const script = document.createElement("script");
    script.id = "twitter-wjs";
    script.src = "https://platform.twitter.com/widgets.js";
    document.getElementsByTagName("head")[0].appendChild(script);

    return () => {
      // Cleanup: Remove the script when the component unmounts
      const twitterScript = document.getElementById("twitter-wjs");
      if (twitterScript) {
        twitterScript.parentNode.removeChild(twitterScript);
      }
    };
  }, []);

  return (
    <div className="trapdoor">
      {/* Hello */}
      <div className="top door">Hello</div>
      <div className="bottom door">Hi</div>
      <a
        href="https://twitter.com/twholman"
        className="twitter-follow-button"
        data-show-count="false"
        data-size="large"
        data-dnt="false"
      >
        More Info
      </a>
    </div>
  );
};

export default ButtonTest;
