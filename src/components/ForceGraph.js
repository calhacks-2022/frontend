import { useEffect, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";

let theta = 0;
let phi = 0;

const ForceGraph = ({ graphData, cameraDistance }) => {
  const fg = useRef();

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!fg.current) return;
      fg.current.cameraPosition({
        x: cameraDistance * Math.sin(theta) * Math.cos(phi),
        z: cameraDistance * Math.sin(theta) * Math.sin(phi),
        y: cameraDistance * Math.cos(theta),
      });
      theta += Math.PI / 4000;
      phi += Math.PI / 4000;
    }, 20);
    return () => clearInterval(intervalId);
  }, []);

  //   const inputNodes = [];
  //   for (let i = 0; i < 6; i++) {
  //     inputNodes.push(i.toString());
  //   }
  //   const newData = {
  //     nodes: [],
  //     links: [],
  //   };
  //   for (let nodeOne of inputNodes) {
  //     newData.nodes.push({ id: nodeOne, group: 1 });
  //     for (let nodeTwo of inputNodes) {
  //       if (nodeOne === nodeTwo) continue;
  //       newData.links.push({
  //         source: nodeOne,
  //         target: nodeTwo,
  //         distance: Math.random() > 0.5 ? 5 : 200,
  //         width: 2,
  //       });
  //     }
  //   }

  //   function onNextFrame(callback) {
  //     setTimeout(function () {
  //       requestAnimationFrame(callback);
  //     });
  //   }
  //   onNextFrame(() =>
  //   fg.current.d3Force("link").distance((link) => {
  //     return link.distance;
  //   })
  //   );

  if (fg.current) {
    fg.current.d3Force("link").distance((link) => {
      return link.distance;
    });
  }

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: graphData.nodes.length === 0 ? "none" : "flex",
        }}
      >
        <div>
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
            enableNavigationControls={false}
            showNavInfo={false}
            width={Math.floor((5 * window.innerWidth) / 10)}
            height={Math.floor(window.innerHeight)}
            linkColor="#FF6B6C"
            linkOpacity={0.2}
          />
        </div>
      </div>
    </>
  );
};

export default ForceGraph;
