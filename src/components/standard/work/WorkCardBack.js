import { useState } from 'react'
import { Link, useHistory } from "react-router-dom"
import ReactDOM from "react-dom"
import ParticleEffectButton from "react-particle-effect-button"
import {
  AwesomeButton,
} from "react-awesome-button";

import  ButtonTest  from './ButtonTest'

// import "react-awesome-button/dist/styles.css";
import AwesomeButtonStyles from "react-awesome-button/src/styles/styles.scss";
// import styles from "react-awesome-button/src/styles/themes/theme-blue";

const WorkCardBack = ({ mouseOutCard, id, title, thumbnailDescription  }) => {
  const history = useHistory();

  const [isOpen, setIsOpen] = useState(false);

  const [wasButtonClicked, setWasButtonClicked] = useState(false);

  const redirectOnClick = () => {
    setWasButtonClicked(true);
    setIsOpen(false);
    // setTimeout(() => {
    //   history.push(`/standard/work-details/${id}`);
    // }, 1600);
  };

    return (
      <div
        className="work-card-tile-container work-card-tile-back"
        onMouseLeave={mouseOutCard}
        onTouchEnd={mouseOutCard}
        onClick={redirectOnClick}
      >
        <h2 className="work-card-title"> {title} </h2>
        <p className="work-card-description"> {thumbnailDescription} </p>
        <ParticleEffectButton
          color="#2AF783"
          duration={900}
          hidden={wasButtonClicked}
        >
          <button>Click me</button>
        </ParticleEffectButton>
      </div>
    );
    }

export default WorkCardBack

