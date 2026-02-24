import React, { useState, useEffect } from "react";
import useMousePosition from "./useMousePosition";
import "./Cursor.scss";

const Cursor = ({ img }) => {
  const { clientX, clientY } = useMousePosition();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const wrapperStyle = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 9999,
    left: 0,
    top: 0,
    transform: `translate(${clientX + 20}px, ${clientY + 20}px)`,
    opacity: visible ? 1 : 0,
    transition: "transform 0.15s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.3s ease",
    willChange: "transform",
  };

  return (
    <div style={wrapperStyle}>
      <div className="cursor-reveal">
        <span className="cursor-reveal__corner-tl" />
        <img src={img} alt="Project preview" className="cursor-reveal__img" />
      </div>
    </div>
  );
};

export default Cursor;
