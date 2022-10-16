import logo from "./logo.svg";
import logo_png from "./logo.png";
import "./App.css";
import { useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import DragAndDrop from "./components/DragAndDrop";
import ForceGraph from "./components/ForceGraph";
import ResultItem from "./components/ResultItem";
import stacklet from "./images/stacklet.gif";
import axios from "axios";

const react_project_1 = JSON.stringify({
  name: "frontend",
  version: "0.1.0",
  private: true,
  dependencies: {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    react: "^18.2.0",
    "react-dom": "^18.2.0",
    "react-drag-drop-files": "^2.3.7",
    "react-force-graph-3d": "^1.21.13",
    "react-scripts": "5.0.1",
    three: "^0.145.0",
    "three-spritetext": "^1.6.5",
    "web-vitals": "^2.1.4",
  },
  scripts: {
    start: "react-scripts start",
    build: "react-scripts build",
    test: "react-scripts test",
    eject: "react-scripts eject",
  },
  eslintConfig: {
    extends: ["react-app", "react-app/jest"],
  },
  browserslist: {
    production: [">0.2%", "not dead", "not op_mini all"],
    development: [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version",
    ],
  },
});

function App() {
  // const [uploadedFiles, setUploadedFiles] = useState(null);
  const [fileContents, setFileContents] = useState(null);
  const [fileTitle, setFileTitle] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [packageCorrelations, setPackageCorrelations] = useState(null);
  const [packageNames, setPackageNames] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [queryPhrase, setQueryPhrase] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [resultList, setResultList] = useState([]);
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  const handleChange = async (files) => {
    const fileText = await files[0].text();
    handleValidateAndSetFileText(fileText, files[0].name);
  };

  const handleValidateAndSetFileText = async (fileText, fileName) => {
    try {
      const parsedFile = JSON.parse(fileText);
      if (
        !parsedFile.dependencies ||
        Object.keys(parsedFile.dependencies).length === 0
      ) {
        console.log("DEPENDENCIES KEY NOT FOUND");
        //TODO: HANDLE ERROR
        return;
      }
      const dependencies = Object.keys(parsedFile.dependencies);

      const config = {
        method: "POST",
        url: "https://jpbcmpeprl.execute-api.us-west-1.amazonaws.com/Prod/packages/correlation",
        data: JSON.stringify({ packages: dependencies }),
      };
      try {
        const response = await axios(config);
        console.log(response.data);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
      return;
    }
    setFileContents(fileText);
    setFileTitle(fileName);

    //TODO: MAKE API REQUEST TO RETRIEVE FOLLOWING DATA
    const packages = [];
    for (let i = 0; i < 10; i++) {
      packages.push("Package_" + i.toString());
    }

    const correlations = [
      [
        [0.64, 1],
        [1, 1],
        [0.2, 1],
        [0.06, 1],
        [0.04, 1],
        [0.28, 1],
        [0.28, 1],
        [0.23, 1],
        [0.22, 1],
        [0.27, 1],
      ],
      [
        [0.09, 1],
        [0.02, 1],
        [0.17, 1],
        [0.23, 1],
        [0.51, 1],
        [0.46, 1],
        [0.85, 1],
        [0.86, 1],
        [0.81, 1],
        [0.74, 1],
      ],
      [
        [0.03, 1],
        [0.9, 1],
        [0.46, 1],
        [0.59, 1],
        [0.86, 1],
        [0.87, 1],
        [0.86, 1],
        [0.46, 1],
        [0.38, 1],
        [0.77, 1],
      ],
      [
        [0.32, 1],
        [0.34, 1],
        [0.03, 1],
        [0.44, 1],
        [0.99, 1],
        [0.21, 1],
        [0.65, 1],
        [0.99, 1],
        [0.22, 1],
        [0, 1],
      ],
      [
        [0.29, 1],
        [0.02, 1],
        [0.39, 1],
        [0.73, 1],
        [0.72, 1],
        [0.84, 1],
        [0.35, 1],
        [0.71, 1],
        [0.48, 1],
        [0.68, 1],
      ],
      [
        [0.24, 1],
        [0.52, 1],
        [0.38, 1],
        [0.2, 1],
        [0.79, 1],
        [0.17, 1],
        [0.56, 1],
        [0.48, 1],
        [0.79, 1],
        [0.57, 1],
      ],
      [
        [0.06, 1],
        [0.16, 1],
        [0.57, 1],
        [0.91, 1],
        [0.73, 1],
        [0.48, 1],
        [0.8, 1],
        [0.84, 1],
        [0.08, 1],
        [0.57, 1],
      ],
      [
        [0.24, 1],
        [0.2, 1],
        [0.66, 1],
        [0.55, 1],
        [0.18, 1],
        [0.17, 1],
        [0.63, 1],
        [0.04, 1],
        [0.83, 1],
        [1, 1],
      ],
      [
        [0.65, 1],
        [0.08, 1],
        [0.53, 1],
        [0.92, 1],
        [0.59, 1],
        [0.04, 1],
        [0.22, 1],
        [0.96, 1],
        [0.97, 1],
        [0.98, 1],
      ],
      [
        [0.06, 1],
        [0.62, 1],
        [0.83, 1],
        [0.65, 1],
        [0.67, 1],
        [0.08, 1],
        [0.5, 1],
        [0.51, 1],
        [0.61, 1],
        [0.93, 1],
      ],
    ];

    const maxDistance = 500;
    const minCorrelation = 0.5;
    const links = [];
    const nodes = [];
    for (let i = 0; i < packages.length; i++) {
      nodes.push({ id: packages[i], group: 1, color: "white" });
      const source = packages[i];
      for (let j = i + 1; j < packages.length; j++) {
        if (i === j) continue;
        const correlation = Math.max(
          correlations[i][j][0],
          correlations[j][i][0]
        );
        if (correlation < minCorrelation) continue;
        const target = packages[j];
        links.push({
          source,
          target,
          distance: maxDistance - correlation * maxDistance,
        });
      }
    }
    setGraphData({
      nodes: JSON.parse(JSON.stringify(nodes)),
      links: JSON.parse(JSON.stringify(links)),
    });
  };

  const handleDraggingChange = (event) => {
    console.log(event);
    setIsDragging(event);
  };

  const handleMakeLayerOneRequest = async () => {
    if (queryPhrase.length <= 0) return;
    setResultList([]);
    setIsQueryLoading(true);
    const config = {
      method: "POST",
      url: "https://jpbcmpeprl.execute-api.us-west-1.amazonaws.com/Prod/layer/one",
      data: JSON.stringify({ query: "best ui library" }),
    };
    try {
      const response = await axios(config);
      console.log(response.data.data);
      setResultList(
        response.data.data.map((item) => {
          return {
            name: item,
          };
        })
      );
    } catch (error) {
      console.log(error);
    }
    setIsQueryLoading(false);
  };

  console.log(selectedResult);

  return (
    <div
      style={{
        backgroundColor: "#000012",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "15vh",
          left: "50vw",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          opacity: isQueryLoading ? 0 : 1,
        }}
      >
        <img
          src={logo_png}
          alt="logo"
          style={{
            width: "250px",
            height: "250px",
          }}
        />
      </div>
      {!fileContents && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "40%",
            justifySelf: "center",
          }}
        >
          <FileUploader
            multiple={true}
            handleChange={handleChange}
            name="file"
            types={["JSON"]}
            onDraggingStateChange={(event) => handleDraggingChange(event)}
            children={<DragAndDrop isDragging={isDragging} />}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              height: "15%",
              marginTop: "4px",
            }}
          >
            <div
              onClick={() =>
                handleValidateAndSetFileText(react_project_1, "package.json")
              }
              style={{
                backgroundColor: "#ccccffff",
                width: "50%",
                marginRight: "2px",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                borderBottomLeftRadius: "10px",
                fontWeight: "bold",
                color: "#2d2d2d",
              }}
            >
              Sample 1
            </div>
            <div
              onClick={() =>
                handleValidateAndSetFileText(react_project_1, "package.json")
              }
              style={{
                backgroundColor: "#ccccffff",
                width: "50%",
                marginLeft: "2px",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                borderBottomRightRadius: "10px",
                fontWeight: "bold",
                color: "#2d2d2d",
              }}
            >
              Sample 2
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <ForceGraph graphData={graphData} />
        {graphData.nodes.length > 0 && (
          <>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 20,
                width: "240px",
                height: "40px",
                backgroundColor: "#FF6B6C",
                marginTop: "20px",
                borderRadius: "5px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: "20px",
              }}
              onClick={() => {
                setFileContents(null);
                setFileTitle(null);
                setGraphData({ nodes: [], links: [] });
              }}
            >
              <div style={{color: "#2d2d2d", marginRight: "6px", }}>
                Clear
              </div><div style={{color: 'white'}}>{fileTitle}</div>
            </div>
            <div
              style={{
                marginLeft: "50vw",
                width: "50vw",
                height: "100vh",
                paddingLeft: "50px",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#000012",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: "50px",
                }}
              >
                <input
                  type="text"
                  placeholder="I want a library to..."
                  style={{
                    backgroundColor: "#2d2d2d",
                    width: "80%",
                    height: "60px",
                    color: "white",
                    fontSize: "20px",
                    paddingLeft: "20px",
                    borderTopLeftRadius: "10px",
                    borderBottomLeftRadius: "10px",
                    borderColor: "transparent",
                  }}
                  onChange={(event) => {
                    setQueryPhrase(event.target.value);
                  }}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      handleMakeLayerOneRequest();
                    }
                  }}
                />
                <div
                  style={{
                    width: "10%",
                    height: "60px",
                    backgroundColor: "#FDB833",
                    borderTopRightRadius: "10px",
                    borderBottomRightRadius: "10px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: 800,
                    fontSize: "20px",
                    color: "2d2d2d",
                    marginRight: "40px",
                    cursor: "pointer",
                  }}
                  onClick={handleMakeLayerOneRequest}
                >
                  Search
                </div>
              </div>
              {isQueryLoading && (
                <div
                  style={{
                    width: "90%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={stacklet}
                    alt="loading..."
                    style={{
                      width: "150px",
                      height: "150px",
                    }}
                  />
                </div>
              )}
              {resultList && (
                <div
                  style={{
                    width: "100%",
                    // backgroundColor: "red",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    paddingTop: "20px",
                    overflowY: "auto",
                  }}
                >
                  {resultList.map((item) => (
                    <ResultItem
                      name={item.name}
                      setSelected={setSelectedResult}
                      selected={selectedResult}
                      key={item.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
