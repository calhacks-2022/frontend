import { useEffect, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";

let angle = 0;

const ForceGraph = ({ graphData }) => {
  const fg = useRef();

  const cameraDistance = 420;
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!fg.current) return;
      fg.current.cameraPosition({
        x: cameraDistance * Math.sin(angle),
        z: cameraDistance * Math.cos(angle),
      });
      angle += Math.PI / 8000;
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
    </>
  );
};

export default ForceGraph;
