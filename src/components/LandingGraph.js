import { useEffect, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import { COV, NAMES } from "../constants/graph";

let theta = 0;
let phi = 0;

const LandingGraph = ({ graphData }) => {
  const fg = useRef();

  // const graphData = {
  //   nodes: [
  //     { id: "A", color: "white", group: 1 },
  //     { id: "B", color: "white", group: 1 },
  //     { id: "C", color: "white", group: 1 },
  //   ],
  //   links: [
  //     { source: "A", target: "B", distance: 200 },
  //     { source: "B", target: "C", distance: 200 },
  //     { source: "C", target: "A", distance: 200 },
  //   ],
  // };

  // console.log(graphData);

  const cameraDistance = 800;
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     if (!fg.current) return;
  //     fg.current.cameraPosition({
  //       x: cameraDistance * Math.sin(theta) * Math.cos(phi),
  //       z: cameraDistance * Math.sin(theta) * Math.sin(phi),
  //       y: cameraDistance * Math.cos(theta),
  //     });
  //     theta += Math.PI / 4000;
  //     phi += Math.PI / 4000;
  //   }, 20);
  //   return () => clearInterval(intervalId);
  // }, []);

  if (fg.current) {
    fg.current.d3Force("link").distance((link) => {
      return link.distance;
    });
  }

  return (
    <div
      style={{
        display: graphData.nodes.length === 0 ? "none" : "block",
      }}
    >
      <ForceGraph3D
        graphData={graphData}
        nodeAutoColorBy="group"
        nodeThreeObject={(node) => {
          const sprite = new SpriteText(node.id);
          sprite.color = node.color;
          sprite.textHeight = 8;
          return sprite;
        }}
        linkWidth={1}
        ref={fg}
        linkCurvature={0.2}
        showNavInfo={false}
        enableNavigationControls={true}
        width={window.innerWidth}
        height={(9 * Math.floor(window.innerHeight)) / 10}
        backgroundColor="#ffffff00"
        linkOpacity={0.2}
        cameraDistance={1000}
      />
    </div>
  );
};

export default LandingGraph;
