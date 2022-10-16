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

const react_project_2 = JSON.stringify({
  name: "example-web",
  version: "0.1.0",
  private: true,
  dependencies: {
    "@emotion/react": "^11.10.0",
    "@emotion/styled": "^11.10.0",
    "@mui/material": "^5.9.3",
    "@paypal/react-paypal-js": "^7.8.1",
    axios: "^0.27.2",
    "material-ui-phone-number": "^3.0.0",
    "neumorphism-react": "^1.1.1",
    react: "^18.2.0",
    "react-auth-code-input": "^3.2.1",
    "react-dom": "^18.2.0",
    "react-helmet": "^6.1.0",
    "react-router-dom": "^6.3.0",
    "react-script": "^2.0.5",
    "react-scripts": "^5.0.1",
    "typeface-roboto": "^1.1.13",
    "ui-neumorphism": "^1.1.3",
    "universal-cookie": "^4.0.4",
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
  const [dependencies, setDependencies] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [queryPhrase, setQueryPhrase] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [resultList, setResultList] = useState([]);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [cameraDistance, setCameraDistance] = useState(500);

  const handleChange = async (files) => {
    const fileText = await files[0].text();
    handleValidateAndSetFileText(fileText, files[0].name);
  };

  const handleSetSelectedResult = async (newSelectedResult) => {
    const unselect = selectedResult === newSelectedResult;
    setSelectedResult(unselect ? null : newSelectedResult);
    if (unselect) {
      await handleGenerateGraph(dependencies); //TODO
    } else {
      const temp = JSON.parse(JSON.stringify(dependencies));
      temp.push(newSelectedResult);
      await handleGenerateGraph(temp, newSelectedResult); //TODO
    }
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
      const deps = Object.keys(parsedFile.dependencies);
      setDependencies(deps);
      if (!(await handleGenerateGraph(deps))) {
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
    setFileContents(fileText);
    setFileTitle(fileName);
  };

  const handleGenerateGraph = async (dependencies, testAddition = "") => {
    let covariance, packages;
    const config = {
      method: "POST",
      url: "https://jpbcmpeprl.execute-api.us-west-1.amazonaws.com/Prod/packages/correlation",
      data: JSON.stringify({ packages: dependencies }),
    };
    try {
      const response = await axios(config);
      packages = response.data.names;
      covariance = response.data.covariance;
    } catch (error) {
      console.log(error);
    }

    if (!packages || !covariance) return false;
    let largestDist = 0;
    const maxDistance = 400;
    const minCovariance = 0;
    const links = [];
    const nodes = [];
    for (let i = 0; i < packages.length; i++) {
      nodes.push({
        id: packages[i],
        group: 1,
        color: packages[i] === testAddition ? "red" : "white",
      });
      const source = packages[i];
      for (let j = i + 1; j < packages.length; j++) {
        if (i === j) continue;
        const singleCov = Math.min(
          1,
          Math.max(covariance[i][j], covariance[j][i]) * 20
        );
        console.log(singleCov);
        if (singleCov < minCovariance || isNaN(singleCov)) continue;
        const target = packages[j];
        const distCalc = Math.pow(maxDistance - singleCov * maxDistance, 0.9);
        largestDist = Math.max(largestDist, distCalc);
        links.push({
          source,
          target,
          distance: distCalc,
        });
      }
    }

    if (largestDist > 200) {
      setCameraDistance(550);
    } else {
      setCameraDistance(400);
    }

    setGraphData({
      nodes: JSON.parse(JSON.stringify(nodes)),
      links: JSON.parse(JSON.stringify(links)),
    });
    return true;
  };

  const handleDraggingChange = (event) => {
    console.log(event);
    setIsDragging(event);
  };

  const handleMakeLayerOneRequest = async () => {
    if (queryPhrase.length <= 0) return;
    let plausible;
    setResultList([]);
    setIsQueryLoading(true);
    const config = {
      method: "POST",
      url: "https://jpbcmpeprl.execute-api.us-west-1.amazonaws.com/Prod/layer/one",
      data: JSON.stringify({ query: "best ui library" }),
    };
    try {
      const response = await axios(config);
      plausible = response.data.data;
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
      return;
    }
    setIsQueryLoading(false);

    //TODO: Update loading status to layer 2 loading
    if (!plausible) {
      console.log("Err Missing plausible output");
      return;
    }
    const configLayerTwo = {
      method: "POST",
      url: "https://jpbcmpeprl.execute-api.us-west-1.amazonaws.com/Prod/layer/two",
      data: JSON.stringify({ packages: dependencies, plausible }),
    };
    try {
      const response = await axios(configLayerTwo);
      console.log(response.data.data);
      setResultList(
        response.data.data.map((item) => {
          return {
            name: item[0],
          };
        })
      );
    } catch (error) {
      console.log(error);
      return;
    }
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
                handleValidateAndSetFileText(react_project_2, "package.json")
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
        <ForceGraph graphData={graphData} cameraDistance={cameraDistance} />
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
                      setSelected={handleSetSelectedResult}
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
