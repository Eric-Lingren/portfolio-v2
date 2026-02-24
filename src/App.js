import { useCallback } from "react";
import { Switch, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import GameHome from './components/game/GameHome'
import StandardHome from './components/standard/StandardHome'
import WorkDetails from './components/standard/work/WorkDetails'


// import Particles from "react-particles";
// import type { Engine, ISourceOptions } from "tsparticles-engine"
// import { loadFull } from "tsparticles"
// import { loadPolygonMaskPlugin } from "tsparticles-plugin-polygon-mask"

import Particle from './Particle'


const App = () => {
 


  return (
    <div className="App">
    <h1>Welcome</h1>
    <Particle />
      {/* <Particles options={particleConfig} init={particleInit} /> */}
      {/* <Particles id="tsparticles" options={options} init={particlesInit} /> */}
      {/* <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/standard/work-details/:id" component={WorkDetails} />
        <Route path="/standard" component={StandardHome} />
        <Route path="/game" component={GameHome} />
      </Switch> */}
    </div>
  );
}

export default App



































// ---------------------------------------------------------------------------------














// import Particles from "react-particles";
// import { loadFull } from "tsparticles";
// // import "./styles.css";

// export default function App() {
//   const particleInit = async (engine) => {
//     await loadFull(engine);
//   };

//   const particleConfig = {
//     fullScreen: {
//       enable: true,
//     },
//     detectRetina: true,
//     background: {
//       color: "#000",
//     },
//     fpsLimit: 60,
//     emitters: {
//       // direction: ["left", 'right'],
//       life: {
//         count: 0,
//         duration: 0.1,
//         delay: 0.1,
//       },
//       rate: {
//         delay: 0.01,
//         quantity: 1,
//       },
//       size: {
//         width: 100,
//         height: 0,
//       },
//       position: {
//         y: 100,
//         x: 50,
//       },
//     },
//     particles: {
//       number: {
//         value: 0,
//       },
//       life: {
//         count: 1,
//       },
//       shape: {
//         type: "line",
//       },
//       size: {
//         value: { min: 1, max: 100 },
//         animation: {
//           enable: true,
//           sync: true,
//           speed: 150,
//           destroy: "min",
//         },
//       },
//       stroke: {
//         color: {
//           value: "#303030",
//         },
//         width: 3,
//       },
//       rotate: {
//         path: true,
//       },
//       move: {
//         enable: true,
//         speed: { min: 10, max: 20 },
//         outModes: {
//           default: "destroy",
//           top: "none",
//         },
//         trail: {
//           fillColor: "#000",
//           enable: true,
//           length: 10,
//         },
//       },
//       destroy: {
//         mode: "split",
//         split: {
//           count: 1,
//           factor: { value: 1 / 3 },
//           rate: {
//             value: 100,
//           },
//           particles: {
//             color: {
//               value: ["#FF0000", "#FFD700", "#00FF00", "#00BFFF", "#FF1493"],
//             },
//             stroke: {
//               width: 0,
//             },
//             number: {
//               value: 0,
//             },
//             collisions: {
//               enable: false,
//             },
//             opacity: {
//               value: 1,
//               animation: {
//                 enable: true,
//                 speed: 0.6,
//                 minimumValue: 0.1,
//                 sync: false,
//                 startValue: "max",
//                 destroy: "min",
//               },
//             },
//             shape: {
//               type: "circle",
//             },
//             size: {
//               value: { min: 2, max: 3 },
//               animation: {
//                 enable: false,
//               },
//             },
//             life: {
//               count: 1,
//               duration: {
//                 value: {
//                   min: 1,
//                   max: 2,
//                 },
//               },
//             },
//             move: {
//               enable: true,
//               gravity: {
//                 enable: false,
//               },
//               speed: 2,
//               direction: "none",
//               random: true,
//               straight: false,
//               outMode: "destroy",
//             },
//           },
//         },
//       },
//     },
//   };
//   // <div className="particle-wrapper">
//   {/* <h1>hello</h1>
//   <div className="particle-wrapper">

//   {/* <Particles options={particleConfig} init={particleInit} />; */}
//   // </div> */}
//   return (
//     <div className="App">
//       <h1>Hello CodeSandbox</h1>
//       <h2>Start editing to see some magic happen!</h2>
//       {/* <Particles
//         id="tsparticles"
//         options={particleConfig}
//         init={particleInit}
//       /> */}
//     </div>
//   );
// }





// // import "./styles.css";
// import Particles from "react-particles";
// import type { Engine, ISourceOptions } from "tsparticles-engine";
// import { loadFull } from "tsparticles";
// import { loadPolygonMaskPlugin } from "tsparticles-plugin-polygon-mask";
// import { useCallback } from "react";




// import { polygonPathName, loadPolygonPath } from "tsparticles-path-polygon";
// // import "./styles.css";


// export default function App() {
//   // const particlesInit = useCallback(async (engine: Engine) => {
//   //   await loadFull(engine);
//   //   await loadPolygonMaskPlugin(engine);
//   //   await loadPolygonPath(tsParticles);
//   // }, []);

//   // const options = {
//   //   name: "Polygon Mask",
//   //   interactivity: {
//   //     events: {
//   //       onClick: {
//   //         enable: false,
//   //         mode: "push",
//   //       },
//   //       onDiv: {
//   //         elementId: "repulse-div",
//   //         enable: false,
//   //         mode: "repulse",
//   //       },
//   //       onHover: {
//   //         enable: true,
//   //         mode: "bubble",
//   //         parallax: {
//   //           enable: false,
//   //           force: 2,
//   //           smooth: 10,
//   //         },
//   //       },
//   //     },
//   //     modes: {
//   //       bubble: {
//   //         distance: 40,
//   //         duration: 2,
//   //         opacity: 8,
//   //         size: 6,
//   //       },
//   //       connect: {
//   //         distance: 80,
//   //         links: {
//   //           opacity: 0.5,
//   //         },
//   //         radius: 60,
//   //       },
//   //       grab: {
//   //         distance: 400,
//   //         links: {
//   //           opacity: 1,
//   //         },
//   //       },
//   //       push: {
//   //         quantity: 4,
//   //       },
//   //       remove: {
//   //         quantity: 2,
//   //       },
//   //       repulse: {
//   //         distance: 200,
//   //         duration: 0.4,
//   //       },
//   //       slow: {
//   //         active: false,
//   //         radius: 0,
//   //         factor: 1,
//   //       },
//   //     },
//   //   },
//   //   particles: {
//   //     color: {
//   //       value: "#ffffff",
//   //     },
//   //     links: {
//   //       blink: false,
//   //       color: "#ffffff",
//   //       consent: false,
//   //       distance: 30,
//   //       enable: true,
//   //       opacity: 0.4,
//   //       width: 1,
//   //     },
//   //     move: {
//   //       enable: true,
//   //       outModes: "bounce",
//   //       speed: 1,
//   //     },
//   //     number: {
//   //       limit: 0,
//   //       value: 200,
//   //     },
//   //     opacity: {
//   //       animation: {
//   //         enable: true,
//   //         speed: 2,
//   //         sync: false,
//   //       },
//   //       value: {
//   //         min: 0.05,
//   //         max: 0.4,
//   //       },
//   //     },
//   //     shape: {
//   //       type: "circle",
//   //     },
//   //     size: {
//   //       value: 1,
//   //     },
//   //   },
//   //   polygon: {
//   //     draw: {
//   //       enable: true,
//   //       lineColor: "rgba(255,255,255,0.2)",
//   //       lineWidth: 1,
//   //     },
//   //     enable: true,
//   //     move: {
//   //       radius: 10,
//   //     },
//   //     inline: {
//   //       arrangement: "equidistant",
//   //     },
//   //     scale: 1,
//   //     type: "inline",
//   //     url: "https://particles.js.org/images/smalldeer.svg",
//   //   },
//   //   background: {
//   //     color: "#000000",
//   //     image: "",
//   //     position: "50% 50%",
//   //     repeat: "no-repeat",
//   //     size: "cover",
//   //   },
//   // } as ISourceOptions;




//     // // const particleInit = async (engine) => {
//     // //   await loadFull(engine);
//     // // };


//     //   const particleInit = useCallback(async (engine: Engine) => {
//     //     await loadFull(engine);
//     //     // await loadPolygonMaskPlugin(engine);
//     //   }, []);


//     // const particleConfig = {
//     //   fullScreen: {
//     //     enable: true,
//     //   },
//     //   detectRetina: true,
//     //   background: {
//     //     color: "#000",
//     //   },
//     //   fpsLimit: 60,
//     //   emitters: {
//     //     // direction: ["left", 'right'],
//     //     life: {
//     //       count: 0,
//     //       duration: 0.1,
//     //       delay: 0.1,
//     //     },
//     //     rate: {
//     //       delay: 0.01,
//     //       quantity: 1,
//     //     },
//     //     size: {
//     //       width: 100,
//     //       height: 0,
//     //     },
//     //     position: {
//     //       y: 100,
//     //       x: 50,
//     //     },
//     //   },
//     //   particles: {
//     //     number: {
//     //       value: 0,
//     //     },
//     //     life: {
//     //       count: 1,
//     //     },
//     //     shape: {
//     //       type: "line",
//     //     },
//     //     size: {
//     //       value: { min: 1, max: 100 },
//     //       animation: {
//     //         enable: true,
//     //         sync: true,
//     //         speed: 150,
//     //         destroy: "min",
//     //       },
//     //     },
//     //     stroke: {
//     //       color: {
//     //         value: "#303030",
//     //       },
//     //       width: 3,
//     //     },
//     //     rotate: {
//     //       path: true,
//     //     },
//     //     move: {
//     //       enable: true,
//     //       speed: { min: 10, max: 20 },
//     //       outModes: {
//     //         default: "destroy",
//     //         top: "none",
//     //       },
//     //       trail: {
//     //         fillColor: "#000",
//     //         enable: true,
//     //         length: 10,
//     //       },
//     //     },
//     //     destroy: {
//     //       mode: "split",
//     //       split: {
//     //         count: 1,
//     //         factor: { value: 1 / 3 },
//     //         rate: {
//     //           value: 100,
//     //         },
//     //         particles: {
//     //           color: {
//     //             value: ["#FF0000", "#FFD700", "#00FF00", "#00BFFF", "#FF1493"],
//     //           },
//     //           stroke: {
//     //             width: 0,
//     //           },
//     //           number: {
//     //             value: 0,
//     //           },
//     //           collisions: {
//     //             enable: false,
//     //           },
//     //           opacity: {
//     //             value: 1,
//     //             animation: {
//     //               enable: true,
//     //               speed: 0.6,
//     //               minimumValue: 0.1,
//     //               sync: false,
//     //               startValue: "max",
//     //               destroy: "min",
//     //             },
//     //           },
//     //           shape: {
//     //             type: "circle",
//     //           },
//     //           size: {
//     //             value: { min: 2, max: 3 },
//     //             animation: {
//     //               enable: false,
//     //             },
//     //           },
//     //           life: {
//     //             count: 1,
//     //             duration: {
//     //               value: {
//     //                 min: 1,
//     //                 max: 2,
//     //               },
//     //             },
//     //           },
//     //           move: {
//     //             enable: true,
//     //             gravity: {
//     //               enable: false,
//     //             },
//     //             speed: 2,
//     //             direction: "none",
//     //             random: true,
//     //             straight: false,
//     //             outMode: "destroy",
//     //           },
//     //         },
//     //       },
//     //     },
//     //   },
//     // };

//       const particlesInit = useCallback(async (engine) => {
//         await loadPolygonPath(engine);
//       }, []);



//   return (
//     <div className="App">
//       <h1>Hello CodeSandbox</h1>
//       <h2>Start editing to see some magic happen!</h2>

//       <Particle />
 

//     </div>
//   );
// }
