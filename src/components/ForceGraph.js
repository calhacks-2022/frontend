import { useEffect, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";

const ForceGraph = () => {
  const fg = useRef();
  console.log("ref:", fg);

  useEffect(() => {
    if (fg) {
      fg.current.d3Force("link").distance((link) => {
        return link.distance;
      });
      //   fg.current.d3Force("link").linkColor((link) => {
      //     return "red";
      //   });
    }
  }, [fg]);

  const inputNodes = [];
  for (let i = 0; i < 6; i++) {
    inputNodes.push(i.toString());
  }
  const newData = {
    nodes: [],
    links: [],
  };
  for (let nodeOne of inputNodes) {
    newData.nodes.push({ id: nodeOne, group: 1 });
    // for (let nodeTwo of inputNodes) {
    //   if (nodeOne === nodeTwo) continue;
    //   newData.links.push({
    //     source: nodeOne,
    //     target: nodeTwo,
    //     distance: Math.random() > 0.5 ? 5 : 200,
    //     width: 2,
    //   });
    // }
  }

  newData.links.push({
    source: "0",
    target: "1",
    distance: 10,
  });
  newData.links.push({
    source: "1",
    target: "2",
    distance: 100,
  });
  newData.links.push({
    source: "2",
    target: "3",
    distance: 10,
  });
  newData.links.push({
    source: "3",
    target: "4",
    distance: 10,
  });
  newData.links.push({
    source: "4",
    target: "5",
    distance: 10,
  });
  newData.links.push({
    source: "5",
    target: "0",
    distance: 10,
  });

  return (
    <>
      <ForceGraph3D
        graphData={newData}
        nodeAutoColorBy="group"
        nodeThreeObject={(node) => {
          const sprite = new SpriteText(node.id);
          sprite.color = node.color;
          sprite.textHeight = 8;
          return sprite;
        }}
        // linkWidth={0.1}
        ref={fg}
      />
    </>
  );
};

export default ForceGraph;
