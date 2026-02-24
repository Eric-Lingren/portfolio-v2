import { useState } from 'react'
import { useHistory } from "react-router-dom"
import "./menutest.scss";
import ParticleEffectButton from "react-particle-effect-button";

import Cursor from './Cursor'


const MenuItem = ({key, id, title, thumbnailDescription, thumbnailImage}) => {
  const history = useHistory();

  const [isOpen, setIsOpen] = useState(false);

  const [wasButtonClicked, setWasButtonClicked] = useState(false);

  const redirectOnClick = () => {
    setWasButtonClicked(true);
    setIsOpen(false);
    setTimeout(() => {
      history.push(`/standard/work-details/${id}`);
    }, 1600);
  };

  return (
    <div style={{ height: "80px", marginTop: "50px", marginBottom: "50px", display: "flex", justifyContent: "center" }}>
      <ParticleEffectButton
        color="#2AF783"
        duration={900}
        hidden={wasButtonClicked}
      >
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          style={{ position: "relative" }} 
        >
          <a class="menu__item">
            <span class="menu__item-text">
              {isOpen && <Cursor img={thumbnailImage} />}
              <button
                className="draw-button draw-border"
                onClick={redirectOnClick}
              >
                {title}
              </button>
            </span>
            <span class="menu__item-sub">{thumbnailDescription}</span>
          </a>
        </div>
      </ParticleEffectButton>
    </div>
  );
};

export default MenuItem