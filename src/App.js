import logo from "./logo.svg";
import logo_png from "./logo.png";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import DragAndDrop from "./components/DragAndDrop";
import ForceGraph from "./components/ForceGraph";
import ResultItem from "./components/ResultItem";
import stacklet from "./images/stacklet.gif";
import axios from "axios";
import LandingGraph from "./components/LandingGraph";
import { COV, NAMES } from "./constants/graph";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";

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
  const landingfg = useRef();
  // const [uploadedFiles, setUploadedFiles] = useState(null);
  const [fileContents, setFileContents] = useState(null);
  const [fileTitle, setFileTitle] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [packageCorrelations, setPackageCorrelations] = useState(null);
  const [packageNames, setPackageNames] = useState(null);
  const [dependencies, setDependencies] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [landingGraph, setLandingGraph] = useState({ nodes: [], links: [] });
  const [queryPhrase, setQueryPhrase] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [resultList, setResultList] = useState([]);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [cameraDistance, setCameraDistance] = useState(500);
  const [showLandingPage, setShowLandingPage] = useState(true);

  // const testAPI = async (queryP) => {
  //   const config = {
  //     method: "POST",
  //     url: "http://127.0.0.1:8000/embed?query=" + queryP,
  //   };
  //   try {
  //     const response = await axios(config);
  //     console.log(response);
  //   } catch (error) {
  //     console.log(error);
  //     return;
  //   }
  // };

  const handleChange = async (files) => {
    // await testAPI("Hello test");
    const fileText = await files[0].text();
    handleValidateAndSetFileText(fileText, files[0].name);
  };

  const handleGenerateLandingGraph = () => {
    const packages = NAMES;
    const covariance = COV;

    const maxDistance = 1000;
    const minCovariance = 0.1;
    const links = [];
    const nodes = [];
    for (let i = 0; i < packages.length; i++) {
      nodes.push({
        id: packages[i],
        group: 1,
        color: "white",
      });
      const source = packages[i];
      for (let j = i + 1; j < packages.length; j++) {
        if (i === j) continue;
        const singleCov = Math.min(1, covariance[i][j] * 20);
        if (singleCov < minCovariance || isNaN(singleCov)) continue;
        const target = packages[j];
        const distCalc = Math.round(
          Math.pow(maxDistance - singleCov * maxDistance, 0.9)
        );
        console.log(distCalc);
        links.push({
          source,
          target,
          distance: distCalc,
        });
      }
    }

    const graphData = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      links: JSON.parse(JSON.stringify(links)),
    };
    // setLandingGraph(graphData);
    // console.log(JSON.parse(JSON.stringify(graphData)));
    return graphData;
  };

  handleGenerateLandingGraph();

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
        color: packages[i] === testAddition ? "#FDB833" : "white",
      });
      const source = packages[i];
      for (let j = i + 1; j < packages.length; j++) {
        if (i === j) continue;
        const singleCov = Math.min(
          1,
          Math.max(covariance[i][j], covariance[j][i]) * 20
        );
        // console.log(singleCov);
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
    // console.log(event);
    setIsDragging(event);
  };

  const handleMakeLayerOneRequest = async () => {
    if (queryPhrase.length <= 0) return;
    // console.log("INPUT LAYER 1:", queryPhrase);
    let plausible;
    if (selectedResult) {
      handleGenerateGraph(dependencies);
    }
    setResultList([]);
    setSelectedResult();
    setIsQueryLoading(true);
    const config = {
      method: "POST",
      url: "https://jpbcmpeprl.execute-api.us-west-1.amazonaws.com/Prod/layer/one",
      data: JSON.stringify({ query: queryPhrase }),
    };
    try {
      const response = await axios(config);

      if (
        queryPhrase.includes("icon") &&
        !response.data.data.includes("react-icons")
      ) {
        response.data.data.push("react-icons");
      }
      plausible = response.data.data;
      // console.log("Response of layer 1:", response.data.data);
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

    const cleanedPlaus = [];
    for (let pkg of plausible) {
      if (!pkg.includes("@types")) {
        cleanedPlaus.push(pkg);
      }
    }

    // console.log("Deps:", dependencies);
    // console.log("Plaus:", plausible);

    const configLayerTwo = {
      method: "POST",
      url: "https://jpbcmpeprl.execute-api.us-west-1.amazonaws.com/Prod/layer/two",
      data: JSON.stringify({ packages: dependencies, plausible: cleanedPlaus }),
    };
    try {
      const response = await axios(configLayerTwo);
      // console.log("Layer 2 res:", response.data.data);
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

  // console.log(selectedResult);

  // useEffect(() => {
  //   if (landingGraph.nodes.length > 0) return;
  //   handleGenerateLandingGraph();
  // }, []);

  const landingGraphRaw = {
    nodes: [
      {
        id: "antd",
        group: 1,
        color: "white",
      },
      {
        id: "create-react-app",
        group: 1,
        color: "white",
      },
      {
        id: "dotenv",
        group: 1,
        color: "white",
      },
      {
        id: "express",
        group: 1,
        color: "white",
      },
      {
        id: "jsonwebtoken",
        group: 1,
        color: "white",
      },
      {
        id: "mongoose",
        group: 1,
        color: "white",
      },
      {
        id: "nodemon",
        group: 1,
        color: "white",
      },
      {
        id: "react-router-dom",
        group: 1,
        color: "white",
      },
      {
        id: "@ethersproject/providers",
        group: 1,
        color: "white",
      },
      {
        id: "@testing-library/jest-dom",
        group: 1,
        color: "white",
      },
      {
        id: "@testing-library/react",
        group: 1,
        color: "white",
      },
      {
        id: "@testing-library/user-event",
        group: 1,
        color: "white",
      },
      {
        id: "@usedapp/core",
        group: 1,
        color: "white",
      },
      {
        id: "@web3-react/core",
        group: 1,
        color: "white",
      },
      {
        id: "@web3-react/injected-connector",
        group: 1,
        color: "white",
      },
      {
        id: "cipher-base",
        group: 1,
        color: "white",
      },
      {
        id: "fs",
        group: 1,
        color: "white",
      },
      {
        id: "os",
        group: 1,
        color: "white",
      },
      {
        id: "react",
        group: 1,
        color: "white",
      },
      {
        id: "react-dom",
        group: 1,
        color: "white",
      },
      {
        id: "react-scripts",
        group: 1,
        color: "white",
      },
      {
        id: "styled-components",
        group: 1,
        color: "white",
      },
      {
        id: "web-vitals",
        group: 1,
        color: "white",
      },
      {
        id: "web3",
        group: 1,
        color: "white",
      },
      {
        id: "concurrently",
        group: 1,
        color: "white",
      },
      {
        id: "mdb-react-ui-kit",
        group: 1,
        color: "white",
      },
      {
        id: "tar-pack",
        group: 1,
        color: "white",
      },
      {
        id: "global",
        group: 1,
        color: "white",
      },
      {
        id: "json-server",
        group: 1,
        color: "white",
      },
      {
        id: "tiny-slider",
        group: 1,
        color: "white",
      },
      {
        id: "webpack",
        group: 1,
        color: "white",
      },
      {
        id: "@auth0/auth0-spa-js",
        group: 1,
        color: "white",
      },
      {
        id: "@date-io/date-fns",
        group: 1,
        color: "white",
      },
      {
        id: "@date-io/moment",
        group: 1,
        color: "white",
      },
      {
        id: "@emotion/core",
        group: 1,
        color: "white",
      },
      {
        id: "@emotion/react",
        group: 1,
        color: "white",
      },
      {
        id: "@emotion/styled",
        group: 1,
        color: "white",
      },
      {
        id: "@fortawesome/fontawesome-svg-core",
        group: 1,
        color: "white",
      },
      {
        id: "@fortawesome/free-brands-svg-icons",
        group: 1,
        color: "white",
      },
      {
        id: "@fortawesome/free-regular-svg-icons",
        group: 1,
        color: "white",
      },
      {
        id: "@fortawesome/free-solid-svg-icons",
        group: 1,
        color: "white",
      },
      {
        id: "@fortawesome/react-fontawesome",
        group: 1,
        color: "white",
      },
      {
        id: "@fullcalendar/core",
        group: 1,
        color: "white",
      },
      {
        id: "@fullcalendar/daygrid",
        group: 1,
        color: "white",
      },
      {
        id: "@fullcalendar/interaction",
        group: 1,
        color: "white",
      },
      {
        id: "@fullcalendar/react",
        group: 1,
        color: "white",
      },
      {
        id: "@fullcalendar/timegrid",
        group: 1,
        color: "white",
      },
      {
        id: "@google-cloud/storage",
        group: 1,
        color: "white",
      },
      {
        id: "@material-ui/core",
        group: 1,
        color: "white",
      },
      {
        id: "@material-ui/data-grid",
        group: 1,
        color: "white",
      },
      {
        id: "@material-ui/icons",
        group: 1,
        color: "white",
      },
      {
        id: "@material-ui/lab",
        group: 1,
        color: "white",
      },
      {
        id: "@material-ui/pickers",
        group: 1,
        color: "white",
      },
      {
        id: "@mui/icons-material",
        group: 1,
        color: "white",
      },
      {
        id: "@mui/material",
        group: 1,
        color: "white",
      },
      {
        id: "@stripe/react-stripe-js",
        group: 1,
        color: "white",
      },
      {
        id: "@stripe/stripe-js",
        group: 1,
        color: "white",
      },
      {
        id: "ag-grid-community",
        group: 1,
        color: "white",
      },
      {
        id: "ag-grid-react",
        group: 1,
        color: "white",
      },
      {
        id: "apexcharts",
        group: 1,
        color: "white",
      },
      {
        id: "auth0-js",
        group: 1,
        color: "white",
      },
      {
        id: "availity-reactstrap-validation",
        group: 1,
        color: "white",
      },
      {
        id: "axios",
        group: 1,
        color: "white",
      },
      {
        id: "axios-mock-adapter",
        group: 1,
        color: "white",
      },
      {
        id: "babel-plugin-react-intl",
        group: 1,
        color: "white",
      },
      {
        id: "bootstrap",
        group: 1,
        color: "white",
      },
      {
        id: "bs-stepper",
        group: 1,
        color: "white",
      },
      {
        id: "chart.js",
        group: 1,
        color: "white",
      },
      {
        id: "chroma-js",
        group: 1,
        color: "white",
      },
      {
        id: "classnames",
        group: 1,
        color: "white",
      },
      {
        id: "craete-react-app",
        group: 1,
        color: "white",
      },
      {
        id: "date-fns",
        group: 1,
        color: "white",
      },
      {
        id: "date-utils",
        group: 1,
        color: "white",
      },
      {
        id: "docx",
        group: 1,
        color: "white",
      },
      {
        id: "docx-merger",
        group: 1,
        color: "white",
      },
      {
        id: "docxtemplater",
        group: 1,
        color: "white",
      },
      {
        id: "draft-js",
        group: 1,
        color: "white",
      },
      {
        id: "draft-js-import-html",
        group: 1,
        color: "white",
      },
      {
        id: "draftjs-to-html",
        group: 1,
        color: "white",
      },
      {
        id: "emoji-picker-react",
        group: 1,
        color: "white",
      },
      {
        id: "faker",
        group: 1,
        color: "white",
      },
      {
        id: "file-saver",
        group: 1,
        color: "white",
      },
      {
        id: "firebase",
        group: 1,
        color: "white",
      },
      {
        id: "flatpickr",
        group: 1,
        color: "white",
      },
      {
        id: "formik",
        group: 1,
        color: "white",
      },
      {
        id: "formik-antd",
        group: 1,
        color: "white",
      },
      {
        id: "history",
        group: 1,
        color: "white",
      },
      {
        id: "html2pdf.js",
        group: 1,
        color: "white",
      },
      {
        id: "intl-messageformat",
        group: 1,
        color: "white",
      },
      {
        id: "jquery",
        group: 1,
        color: "white",
      },
      {
        id: "latest-version",
        group: 1,
        color: "white",
      },
      {
        id: "leaflet",
        group: 1,
        color: "white",
      },
      {
        id: "libreoffice-convert",
        group: 1,
        color: "white",
      },
      {
        id: "match-sorter",
        group: 1,
        color: "white",
      },
      {
        id: "material-ui-dropzone",
        group: 1,
        color: "white",
      },
      {
        id: "moment",
        group: 1,
        color: "white",
      },
      {
        id: "multer",
        group: 1,
        color: "white",
      },
      {
        id: "namor",
        group: 1,
        color: "white",
      },
      {
        id: "npm",
        group: 1,
        color: "white",
      },
      {
        id: "pdfjs-dist",
        group: 1,
        color: "white",
      },
    ],
    links: [
      {
        source: "antd",
        target: "react-router-dom",
        distance: 431,
      },
      {
        source: "antd",
        target: "axios",
        distance: 438,
      },
      {
        source: "create-react-app",
        target: "dotenv",
        distance: 444,
      },
      {
        source: "create-react-app",
        target: "express",
        distance: 419,
      },
      {
        source: "create-react-app",
        target: "jsonwebtoken",
        distance: 453,
      },
      {
        source: "create-react-app",
        target: "mongoose",
        distance: 437,
      },
      {
        source: "dotenv",
        target: "express",
        distance: 217,
      },
      {
        source: "dotenv",
        target: "jsonwebtoken",
        distance: 366,
      },
      {
        source: "dotenv",
        target: "mongoose",
        distance: 324,
      },
      {
        source: "dotenv",
        target: "nodemon",
        distance: 436,
      },
      {
        source: "dotenv",
        target: "axios",
        distance: 455,
      },
      {
        source: "dotenv",
        target: "multer",
        distance: 453,
      },
      {
        source: "express",
        target: "jsonwebtoken",
        distance: 327,
      },
      {
        source: "express",
        target: "mongoose",
        distance: 257,
      },
      {
        source: "express",
        target: "nodemon",
        distance: 384,
      },
      {
        source: "express",
        target: "concurrently",
        distance: 436,
      },
      {
        source: "express",
        target: "multer",
        distance: 431,
      },
      {
        source: "jsonwebtoken",
        target: "mongoose",
        distance: 332,
      },
      {
        source: "jsonwebtoken",
        target: "nodemon",
        distance: 453,
      },
      {
        source: "jsonwebtoken",
        target: "multer",
        distance: 450,
      },
      {
        source: "mongoose",
        target: "nodemon",
        distance: 438,
      },
      {
        source: "mongoose",
        target: "concurrently",
        distance: 452,
      },
      {
        source: "mongoose",
        target: "multer",
        distance: 443,
      },
      {
        source: "react-router-dom",
        target: "@testing-library/jest-dom",
        distance: 0,
      },
      {
        source: "react-router-dom",
        target: "@testing-library/react",
        distance: 0,
      },
      {
        source: "react-router-dom",
        target: "@testing-library/user-event",
        distance: 0,
      },
      {
        source: "react-router-dom",
        target: "react",
        distance: 234,
      },
      {
        source: "react-router-dom",
        target: "react-dom",
        distance: 135,
      },
      {
        source: "react-router-dom",
        target: "react-scripts",
        distance: 0,
      },
      {
        source: "react-router-dom",
        target: "styled-components",
        distance: 323,
      },
      {
        source: "react-router-dom",
        target: "web-vitals",
        distance: 0,
      },
      {
        source: "react-router-dom",
        target: "@emotion/react",
        distance: 292,
      },
      {
        source: "react-router-dom",
        target: "@emotion/styled",
        distance: 289,
      },
      {
        source: "react-router-dom",
        target: "@fortawesome/fontawesome-svg-core",
        distance: 413,
      },
      {
        source: "react-router-dom",
        target: "@fortawesome/free-regular-svg-icons",
        distance: 450,
      },
      {
        source: "react-router-dom",
        target: "@fortawesome/free-solid-svg-icons",
        distance: 405,
      },
      {
        source: "react-router-dom",
        target: "@fortawesome/react-fontawesome",
        distance: 402,
      },
      {
        source: "react-router-dom",
        target: "@material-ui/core",
        distance: 444,
      },
      {
        source: "react-router-dom",
        target: "@mui/icons-material",
        distance: 335,
      },
      {
        source: "react-router-dom",
        target: "@mui/material",
        distance: 298,
      },
      {
        source: "react-router-dom",
        target: "axios",
        distance: 0,
      },
      {
        source: "react-router-dom",
        target: "bootstrap",
        distance: 226,
      },
      {
        source: "react-router-dom",
        target: "firebase",
        distance: 361,
      },
      {
        source: "react-router-dom",
        target: "formik",
        distance: 442,
      },
      {
        source: "react-router-dom",
        target: "moment",
        distance: 420,
      },
      {
        source: "@testing-library/jest-dom",
        target: "@testing-library/react",
        distance: 0,
      },
      {
        source: "@testing-library/jest-dom",
        target: "@testing-library/user-event",
        distance: 0,
      },
      {
        source: "@testing-library/jest-dom",
        target: "react",
        distance: 0,
      },
      {
        source: "@testing-library/jest-dom",
        target: "react-dom",
        distance: 0,
      },
      {
        source: "@testing-library/jest-dom",
        target: "react-scripts",
        distance: 0,
      },
      {
        source: "@testing-library/jest-dom",
        target: "styled-components",
        distance: 383,
      },
      {
        source: "@testing-library/jest-dom",
        target: "web-vitals",
        distance: 0,
      },
      {
        source: "@testing-library/jest-dom",
        target: "@emotion/react",
        distance: 447,
      },
      {
        source: "@testing-library/jest-dom",
        target: "@emotion/styled",
        distance: 432,
      },
      {
        source: "@testing-library/jest-dom",
        target: "@fortawesome/fontawesome-svg-core",
        distance: 439,
      },
      {
        source: "@testing-library/jest-dom",
        target: "@fortawesome/free-solid-svg-icons",
        distance: 432,
      },
      {
        source: "@testing-library/jest-dom",
        target: "@fortawesome/react-fontawesome",
        distance: 425,
      },
      {
        source: "@testing-library/jest-dom",
        target: "@material-ui/core",
        distance: 448,
      },
      {
        source: "@testing-library/jest-dom",
        target: "@mui/icons-material",
        distance: 429,
      },
      {
        source: "@testing-library/jest-dom",
        target: "@mui/material",
        distance: 396,
      },
      {
        source: "@testing-library/jest-dom",
        target: "axios",
        distance: 352,
      },
      {
        source: "@testing-library/jest-dom",
        target: "bootstrap",
        distance: 278,
      },
      {
        source: "@testing-library/jest-dom",
        target: "firebase",
        distance: 428,
      },
      {
        source: "@testing-library/react",
        target: "@testing-library/user-event",
        distance: 0,
      },
      {
        source: "@testing-library/react",
        target: "react",
        distance: 0,
      },
      {
        source: "@testing-library/react",
        target: "react-dom",
        distance: 0,
      },
      {
        source: "@testing-library/react",
        target: "react-scripts",
        distance: 0,
      },
      {
        source: "@testing-library/react",
        target: "styled-components",
        distance: 387,
      },
      {
        source: "@testing-library/react",
        target: "web-vitals",
        distance: 0,
      },
      {
        source: "@testing-library/react",
        target: "@emotion/react",
        distance: 450,
      },
      {
        source: "@testing-library/react",
        target: "@emotion/styled",
        distance: 434,
      },
      {
        source: "@testing-library/react",
        target: "@fortawesome/fontawesome-svg-core",
        distance: 438,
      },
      {
        source: "@testing-library/react",
        target: "@fortawesome/free-solid-svg-icons",
        distance: 431,
      },
      {
        source: "@testing-library/react",
        target: "@fortawesome/react-fontawesome",
        distance: 425,
      },
      {
        source: "@testing-library/react",
        target: "@material-ui/core",
        distance: 450,
      },
      {
        source: "@testing-library/react",
        target: "@mui/icons-material",
        distance: 431,
      },
      {
        source: "@testing-library/react",
        target: "@mui/material",
        distance: 398,
      },
      {
        source: "@testing-library/react",
        target: "axios",
        distance: 356,
      },
      {
        source: "@testing-library/react",
        target: "bootstrap",
        distance: 283,
      },
      {
        source: "@testing-library/react",
        target: "firebase",
        distance: 427,
      },
      {
        source: "@testing-library/user-event",
        target: "react",
        distance: 1,
      },
      {
        source: "@testing-library/user-event",
        target: "react-dom",
        distance: 0,
      },
      {
        source: "@testing-library/user-event",
        target: "react-scripts",
        distance: 0,
      },
      {
        source: "@testing-library/user-event",
        target: "styled-components",
        distance: 386,
      },
      {
        source: "@testing-library/user-event",
        target: "web-vitals",
        distance: 0,
      },
      {
        source: "@testing-library/user-event",
        target: "@emotion/react",
        distance: 446,
      },
      {
        source: "@testing-library/user-event",
        target: "@emotion/styled",
        distance: 431,
      },
      {
        source: "@testing-library/user-event",
        target: "@fortawesome/fontawesome-svg-core",
        distance: 439,
      },
      {
        source: "@testing-library/user-event",
        target: "@fortawesome/free-solid-svg-icons",
        distance: 432,
      },
      {
        source: "@testing-library/user-event",
        target: "@fortawesome/react-fontawesome",
        distance: 426,
      },
      {
        source: "@testing-library/user-event",
        target: "@material-ui/core",
        distance: 450,
      },
      {
        source: "@testing-library/user-event",
        target: "@mui/icons-material",
        distance: 428,
      },
      {
        source: "@testing-library/user-event",
        target: "@mui/material",
        distance: 395,
      },
      {
        source: "@testing-library/user-event",
        target: "axios",
        distance: 350,
      },
      {
        source: "@testing-library/user-event",
        target: "bootstrap",
        distance: 278,
      },
      {
        source: "@testing-library/user-event",
        target: "firebase",
        distance: 426,
      },
      {
        source: "react",
        target: "react-dom",
        distance: 0,
      },
      {
        source: "react",
        target: "react-scripts",
        distance: 0,
      },
      {
        source: "react",
        target: "styled-components",
        distance: 424,
      },
      {
        source: "react",
        target: "web-vitals",
        distance: 29,
      },
      {
        source: "react",
        target: "@emotion/react",
        distance: 393,
      },
      {
        source: "react",
        target: "@emotion/styled",
        distance: 398,
      },
      {
        source: "react",
        target: "@mui/icons-material",
        distance: 447,
      },
      {
        source: "react",
        target: "@mui/material",
        distance: 424,
      },
      {
        source: "react",
        target: "axios",
        distance: 389,
      },
      {
        source: "react-dom",
        target: "react-scripts",
        distance: 0,
      },
      {
        source: "react-dom",
        target: "styled-components",
        distance: 405,
      },
      {
        source: "react-dom",
        target: "web-vitals",
        distance: 0,
      },
      {
        source: "react-dom",
        target: "@emotion/react",
        distance: 358,
      },
      {
        source: "react-dom",
        target: "@emotion/styled",
        distance: 365,
      },
      {
        source: "react-dom",
        target: "@mui/icons-material",
        distance: 431,
      },
      {
        source: "react-dom",
        target: "@mui/material",
        distance: 401,
      },
      {
        source: "react-dom",
        target: "axios",
        distance: 369,
      },
      {
        source: "react-dom",
        target: "bootstrap",
        distance: 433,
      },
      {
        source: "react-scripts",
        target: "styled-components",
        distance: 375,
      },
      {
        source: "react-scripts",
        target: "web-vitals",
        distance: 0,
      },
      {
        source: "react-scripts",
        target: "@emotion/react",
        distance: 424,
      },
      {
        source: "react-scripts",
        target: "@emotion/styled",
        distance: 400,
      },
      {
        source: "react-scripts",
        target: "@fortawesome/fontawesome-svg-core",
        distance: 428,
      },
      {
        source: "react-scripts",
        target: "@fortawesome/free-regular-svg-icons",
        distance: 452,
      },
      {
        source: "react-scripts",
        target: "@fortawesome/free-solid-svg-icons",
        distance: 421,
      },
      {
        source: "react-scripts",
        target: "@fortawesome/react-fontawesome",
        distance: 414,
      },
      {
        source: "react-scripts",
        target: "@material-ui/core",
        distance: 418,
      },
      {
        source: "react-scripts",
        target: "@material-ui/icons",
        distance: 445,
      },
      {
        source: "react-scripts",
        target: "@mui/icons-material",
        distance: 390,
      },
      {
        source: "react-scripts",
        target: "@mui/material",
        distance: 363,
      },
      {
        source: "react-scripts",
        target: "axios",
        distance: 304,
      },
      {
        source: "react-scripts",
        target: "bootstrap",
        distance: 258,
      },
      {
        source: "react-scripts",
        target: "firebase",
        distance: 431,
      },
      {
        source: "styled-components",
        target: "web-vitals",
        distance: 391,
      },
      {
        source: "styled-components",
        target: "@emotion/react",
        distance: 433,
      },
      {
        source: "styled-components",
        target: "@emotion/styled",
        distance: 435,
      },
      {
        source: "styled-components",
        target: "@mui/icons-material",
        distance: 448,
      },
      {
        source: "styled-components",
        target: "@mui/material",
        distance: 427,
      },
      {
        source: "styled-components",
        target: "axios",
        distance: 376,
      },
      {
        source: "web-vitals",
        target: "@emotion/react",
        distance: 433,
      },
      {
        source: "web-vitals",
        target: "@emotion/styled",
        distance: 413,
      },
      {
        source: "web-vitals",
        target: "@fortawesome/fontawesome-svg-core",
        distance: 445,
      },
      {
        source: "web-vitals",
        target: "@fortawesome/free-solid-svg-icons",
        distance: 435,
      },
      {
        source: "web-vitals",
        target: "@fortawesome/react-fontawesome",
        distance: 429,
      },
      {
        source: "web-vitals",
        target: "@mui/icons-material",
        distance: 416,
      },
      {
        source: "web-vitals",
        target: "@mui/material",
        distance: 381,
      },
      {
        source: "web-vitals",
        target: "axios",
        distance: 344,
      },
      {
        source: "web-vitals",
        target: "bootstrap",
        distance: 301,
      },
      {
        source: "web-vitals",
        target: "firebase",
        distance: 439,
      },
      {
        source: "@emotion/react",
        target: "@emotion/styled",
        distance: 0,
      },
      {
        source: "@emotion/react",
        target: "@mui/icons-material",
        distance: 12,
      },
      {
        source: "@emotion/react",
        target: "@mui/material",
        distance: 0,
      },
      {
        source: "@emotion/react",
        target: "axios",
        distance: 354,
      },
      {
        source: "@emotion/react",
        target: "firebase",
        distance: 446,
      },
      {
        source: "@emotion/react",
        target: "formik",
        distance: 447,
      },
      {
        source: "@emotion/styled",
        target: "@material-ui/core",
        distance: 454,
      },
      {
        source: "@emotion/styled",
        target: "@mui/icons-material",
        distance: 0,
      },
      {
        source: "@emotion/styled",
        target: "@mui/material",
        distance: 0,
      },
      {
        source: "@emotion/styled",
        target: "axios",
        distance: 356,
      },
      {
        source: "@emotion/styled",
        target: "firebase",
        distance: 448,
      },
      {
        source: "@emotion/styled",
        target: "formik",
        distance: 446,
      },
      {
        source: "@fortawesome/fontawesome-svg-core",
        target: "@fortawesome/free-brands-svg-icons",
        distance: 394,
      },
      {
        source: "@fortawesome/fontawesome-svg-core",
        target: "@fortawesome/free-regular-svg-icons",
        distance: 364,
      },
      {
        source: "@fortawesome/fontawesome-svg-core",
        target: "@fortawesome/free-solid-svg-icons",
        distance: 208,
      },
      {
        source: "@fortawesome/fontawesome-svg-core",
        target: "@fortawesome/react-fontawesome",
        distance: 205,
      },
      {
        source: "@fortawesome/fontawesome-svg-core",
        target: "axios",
        distance: 452,
      },
      {
        source: "@fortawesome/fontawesome-svg-core",
        target: "bootstrap",
        distance: 450,
      },
      {
        source: "@fortawesome/free-brands-svg-icons",
        target: "@fortawesome/free-regular-svg-icons",
        distance: 438,
      },
      {
        source: "@fortawesome/free-brands-svg-icons",
        target: "@fortawesome/free-solid-svg-icons",
        distance: 388,
      },
      {
        source: "@fortawesome/free-brands-svg-icons",
        target: "@fortawesome/react-fontawesome",
        distance: 385,
      },
      {
        source: "@fortawesome/free-regular-svg-icons",
        target: "@fortawesome/free-solid-svg-icons",
        distance: 358,
      },
      {
        source: "@fortawesome/free-regular-svg-icons",
        target: "@fortawesome/react-fontawesome",
        distance: 364,
      },
      {
        source: "@fortawesome/free-solid-svg-icons",
        target: "@fortawesome/react-fontawesome",
        distance: 191,
      },
      {
        source: "@fortawesome/free-solid-svg-icons",
        target: "axios",
        distance: 455,
      },
      {
        source: "@fortawesome/free-solid-svg-icons",
        target: "bootstrap",
        distance: 447,
      },
      {
        source: "@fortawesome/react-fontawesome",
        target: "axios",
        distance: 452,
      },
      {
        source: "@fortawesome/react-fontawesome",
        target: "bootstrap",
        distance: 443,
      },
      {
        source: "@material-ui/core",
        target: "@material-ui/icons",
        distance: 358,
      },
      {
        source: "@material-ui/core",
        target: "@material-ui/lab",
        distance: 448,
      },
      {
        source: "@material-ui/core",
        target: "@mui/material",
        distance: 453,
      },
      {
        source: "@material-ui/core",
        target: "axios",
        distance: 444,
      },
      {
        source: "@material-ui/icons",
        target: "@material-ui/lab",
        distance: 456,
      },
      {
        source: "@mui/icons-material",
        target: "@mui/material",
        distance: 0,
      },
      {
        source: "@mui/icons-material",
        target: "axios",
        distance: 421,
      },
      {
        source: "@mui/material",
        target: "axios",
        distance: 389,
      },
      {
        source: "axios",
        target: "bootstrap",
        distance: 399,
      },
      {
        source: "axios",
        target: "chart.js",
        distance: 446,
      },
      {
        source: "axios",
        target: "formik",
        distance: 437,
      },
      {
        source: "axios",
        target: "moment",
        distance: 395,
      },
    ],
  };

  // const landingGraphRaw = {
  //   nodes: [
  //     {
  //       id: "antd",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "create-react-app",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "dotenv",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "express",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "jsonwebtoken",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "mongoose",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "nodemon",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "react-router-dom",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@ethersproject/providers",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@testing-library/jest-dom",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@testing-library/react",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@testing-library/user-event",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@usedapp/core",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@web3-react/core",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@web3-react/injected-connector",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "cipher-base",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "fs",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "os",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "react",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "react-dom",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "react-scripts",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "styled-components",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "web-vitals",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "web3",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "concurrently",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "mdb-react-ui-kit",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "tar-pack",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "global",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "json-server",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "tiny-slider",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "webpack",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@auth0/auth0-spa-js",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@date-io/date-fns",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@date-io/moment",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@emotion/core",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@emotion/react",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@emotion/styled",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@fortawesome/fontawesome-svg-core",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@fortawesome/free-brands-svg-icons",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@fortawesome/free-regular-svg-icons",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@fortawesome/free-solid-svg-icons",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@fortawesome/react-fontawesome",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@fullcalendar/core",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@fullcalendar/daygrid",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@fullcalendar/interaction",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@fullcalendar/react",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@fullcalendar/timegrid",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@google-cloud/storage",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@material-ui/core",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@material-ui/data-grid",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@material-ui/icons",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@material-ui/lab",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@material-ui/pickers",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@mui/icons-material",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@mui/material",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@stripe/react-stripe-js",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "@stripe/stripe-js",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "ag-grid-community",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "ag-grid-react",
  //       group: 1,
  //       color: "white",
  //     },
  //     {
  //       id: "apexcharts",
  //       group: 1,
  //       color: "white",
  //     },
  //   ],
  //   links: [
  //     {
  //       source: "antd",
  //       target: "react-router-dom",
  //       distance: 430.87968556807687,
  //     },
  //     {
  //       source: "create-react-app",
  //       target: "dotenv",
  //       distance: 444.34254375308046,
  //     },
  //     {
  //       source: "create-react-app",
  //       target: "express",
  //       distance: 418.7506667880846,
  //     },
  //     {
  //       source: "create-react-app",
  //       target: "jsonwebtoken",
  //       distance: 453.11012507805617,
  //     },
  //     {
  //       source: "create-react-app",
  //       target: "mongoose",
  //       distance: 437.11312539939206,
  //     },
  //     {
  //       source: "dotenv",
  //       target: "express",
  //       distance: 216.94178820985206,
  //     },
  //     {
  //       source: "dotenv",
  //       target: "jsonwebtoken",
  //       distance: 365.9065681490524,
  //     },
  //     {
  //       source: "dotenv",
  //       target: "mongoose",
  //       distance: 324.4366650406507,
  //     },
  //     {
  //       source: "dotenv",
  //       target: "nodemon",
  //       distance: 436.38029471063504,
  //     },
  //     {
  //       source: "express",
  //       target: "jsonwebtoken",
  //       distance: 326.8027075088037,
  //     },
  //     {
  //       source: "express",
  //       target: "mongoose",
  //       distance: 256.75426196374985,
  //     },
  //     {
  //       source: "express",
  //       target: "nodemon",
  //       distance: 384.1675687366121,
  //     },
  //     {
  //       source: "express",
  //       target: "concurrently",
  //       distance: 436.47190602041167,
  //     },
  //     {
  //       source: "jsonwebtoken",
  //       target: "mongoose",
  //       distance: 331.6235548723529,
  //     },
  //     {
  //       source: "jsonwebtoken",
  //       target: "nodemon",
  //       distance: 453.20135428419337,
  //     },
  //     {
  //       source: "mongoose",
  //       target: "nodemon",
  //       distance: 438.120544796268,
  //     },
  //     {
  //       source: "mongoose",
  //       target: "concurrently",
  //       distance: 451.9239594892098,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "@testing-library/jest-dom",
  //       distance: 0,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "@testing-library/react",
  //       distance: 0,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "@testing-library/user-event",
  //       distance: 0,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "react",
  //       distance: 233.99768614397837,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "react-dom",
  //       distance: 135.0891064133439,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "react-scripts",
  //       distance: 0,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "styled-components",
  //       distance: 322.8266611905156,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "web-vitals",
  //       distance: 0,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "@emotion/react",
  //       distance: 291.77301832444107,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "@emotion/styled",
  //       distance: 289.4727391496456,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "@fortawesome/fontawesome-svg-core",
  //       distance: 412.76373880050164,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "@fortawesome/free-regular-svg-icons",
  //       distance: 449.55058911681067,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "@fortawesome/free-solid-svg-icons",
  //       distance: 405.10481938071405,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "@fortawesome/react-fontawesome",
  //       distance: 401.7778870265642,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "@material-ui/core",
  //       distance: 444.06824882365385,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "@mui/icons-material",
  //       distance: 335.3991646300666,
  //     },
  //     {
  //       source: "react-router-dom",
  //       target: "@mui/material",
  //       distance: 298.0884628145408,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "@testing-library/react",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "@testing-library/user-event",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "react",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "react-dom",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "react-scripts",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "styled-components",
  //       distance: 383.05236326763327,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "web-vitals",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "@emotion/react",
  //       distance: 447.2671886158515,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "@emotion/styled",
  //       distance: 431.5218235828712,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "@fortawesome/fontawesome-svg-core",
  //       distance: 438.9446056022757,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "@fortawesome/free-solid-svg-icons",
  //       distance: 431.98042858941835,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "@fortawesome/react-fontawesome",
  //       distance: 425.4631345265036,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "@material-ui/core",
  //       distance: 447.81532262610705,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "@mui/icons-material",
  //       distance: 428.76905369877045,
  //     },
  //     {
  //       source: "@testing-library/jest-dom",
  //       target: "@mui/material",
  //       distance: 396.31877485568793,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "@testing-library/user-event",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "react",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "react-dom",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "react-scripts",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "styled-components",
  //       distance: 387.232533461036,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "web-vitals",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "@emotion/react",
  //       distance: 449.7332054114147,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "@emotion/styled",
  //       distance: 433.99764896709837,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "@fortawesome/fontawesome-svg-core",
  //       distance: 438.4868152859817,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "@fortawesome/free-solid-svg-icons",
  //       distance: 431.43009608453804,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "@fortawesome/react-fontawesome",
  //       distance: 424.91187099940566,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "@material-ui/core",
  //       distance: 450.1897101122754,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "@mui/icons-material",
  //       distance: 430.6044510174503,
  //     },
  //     {
  //       source: "@testing-library/react",
  //       target: "@mui/material",
  //       distance: 397.8925914124528,
  //     },
  //     {
  //       source: "@testing-library/user-event",
  //       target: "react",
  //       distance: 1,
  //     },
  //     {
  //       source: "@testing-library/user-event",
  //       target: "react-dom",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/user-event",
  //       target: "react-scripts",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/user-event",
  //       target: "styled-components",
  //       distance: 385.56107004900696,
  //     },
  //     {
  //       source: "@testing-library/user-event",
  //       target: "web-vitals",
  //       distance: 0,
  //     },
  //     {
  //       source: "@testing-library/user-event",
  //       target: "@emotion/react",
  //       distance: 446.26208230324164,
  //     },
  //     {
  //       source: "@testing-library/user-event",
  //       target: "@emotion/styled",
  //       distance: 430.6961980389722,
  //     },
  //     {
  //       source: "@testing-library/user-event",
  //       target: "@fortawesome/fontawesome-svg-core",
  //       distance: 439.31079966087265,
  //     },
  //     {
  //       source: "@testing-library/user-event",
  //       target: "@fortawesome/free-solid-svg-icons",
  //       distance: 432.1638554428073,
  //     },
  //     {
  //       source: "@testing-library/user-event",
  //       target: "@fortawesome/react-fontawesome",
  //       distance: 425.64687139580593,
  //     },
  //     {
  //       source: "@testing-library/user-event",
  //       target: "@material-ui/core",
  //       distance: 449.7332054114147,
  //     },
  //     {
  //       source: "@testing-library/user-event",
  //       target: "@mui/icons-material",
  //       distance: 428.3100680823835,
  //     },
  //     {
  //       source: "@testing-library/user-event",
  //       target: "@mui/material",
  //       distance: 395.11479949546873,
  //     },
  //     {
  //       source: "react",
  //       target: "react-dom",
  //       distance: 0,
  //     },
  //     {
  //       source: "react",
  //       target: "react-scripts",
  //       distance: 0,
  //     },
  //     {
  //       source: "react",
  //       target: "styled-components",
  //       distance: 424.3605279955948,
  //     },
  //     {
  //       source: "react",
  //       target: "web-vitals",
  //       distance: 28.653916934160648,
  //     },
  //     {
  //       source: "react",
  //       target: "@emotion/react",
  //       distance: 392.983689365282,
  //     },
  //     {
  //       source: "react",
  //       target: "@emotion/styled",
  //       distance: 397.8925914124528,
  //     },
  //     {
  //       source: "react",
  //       target: "@mui/icons-material",
  //       distance: 447.08446069598597,
  //     },
  //     {
  //       source: "react",
  //       target: "@mui/material",
  //       distance: 423.7171938729979,
  //     },
  //     {
  //       source: "react-dom",
  //       target: "react-scripts",
  //       distance: 0,
  //     },
  //     {
  //       source: "react-dom",
  //       target: "styled-components",
  //       distance: 405.01244569019025,
  //     },
  //     {
  //       source: "react-dom",
  //       target: "web-vitals",
  //       distance: 0,
  //     },
  //     {
  //       source: "react-dom",
  //       target: "@emotion/react",
  //       distance: 358.33054046143536,
  //     },
  //     {
  //       source: "react-dom",
  //       target: "@emotion/styled",
  //       distance: 365.3459826924944,
  //     },
  //     {
  //       source: "react-dom",
  //       target: "@mui/icons-material",
  //       distance: 430.51270182386145,
  //     },
  //     {
  //       source: "react-dom",
  //       target: "@mui/material",
  //       distance: 400.7607146856483,
  //     },
  //     {
  //       source: "react-scripts",
  //       target: "styled-components",
  //       distance: 374.9562503414627,
  //     },
  //     {
  //       source: "react-scripts",
  //       target: "web-vitals",
  //       distance: 0,
  //     },
  //     {
  //       source: "react-scripts",
  //       target: "@emotion/react",
  //       distance: 424.2686297591997,
  //     },
  //     {
  //       source: "react-scripts",
  //       target: "@emotion/styled",
  //       distance: 400.20577252587395,
  //     },
  //     {
  //       source: "react-scripts",
  //       target: "@fortawesome/fontawesome-svg-core",
  //       distance: 427.7592131886128,
  //     },
  //     {
  //       source: "react-scripts",
  //       target: "@fortawesome/free-regular-svg-icons",
  //       distance: 452.01521526687986,
  //     },
  //     {
  //       source: "react-scripts",
  //       target: "@fortawesome/free-solid-svg-icons",
  //       distance: 421.23474363253894,
  //     },
  //     {
  //       source: "react-scripts",
  //       target: "@fortawesome/react-fontawesome",
  //       distance: 413.6854294123056,
  //     },
  //     {
  //       source: "react-scripts",
  //       target: "@material-ui/core",
  //       distance: 417.9222776706701,
  //     },
  //     {
  //       source: "react-scripts",
  //       target: "@material-ui/icons",
  //       distance: 445.34813098446534,
  //     },
  //     {
  //       source: "react-scripts",
  //       target: "@mui/icons-material",
  //       distance: 390.109289008377,
  //     },
  //     {
  //       source: "react-scripts",
  //       target: "@mui/material",
  //       distance: 363.00917899541935,
  //     },
  //     {
  //       source: "styled-components",
  //       target: "web-vitals",
  //       distance: 390.57306071407857,
  //     },
  //     {
  //       source: "styled-components",
  //       target: "@emotion/react",
  //       distance: 433.0808600498888,
  //     },
  //     {
  //       source: "styled-components",
  //       target: "@emotion/styled",
  //       distance: 435.0058683186268,
  //     },
  //     {
  //       source: "styled-components",
  //       target: "@mui/icons-material",
  //       distance: 447.90667104479934,
  //     },
  //     {
  //       source: "styled-components",
  //       target: "@mui/material",
  //       distance: 426.5654236535485,
  //     },
  //     {
  //       source: "web-vitals",
  //       target: "@emotion/react",
  //       distance: 432.7140841211112,
  //     },
  //     {
  //       source: "web-vitals",
  //       target: "@emotion/styled",
  //       distance: 412.76373880050164,
  //     },
  //     {
  //       source: "web-vitals",
  //       target: "@fortawesome/fontawesome-svg-core",
  //       distance: 444.61681987005534,
  //     },
  //     {
  //       source: "web-vitals",
  //       target: "@fortawesome/free-solid-svg-icons",
  //       distance: 434.63927317192133,
  //     },
  //     {
  //       source: "web-vitals",
  //       target: "@fortawesome/react-fontawesome",
  //       distance: 429.31976439129676,
  //     },
  //     {
  //       source: "web-vitals",
  //       target: "@mui/icons-material",
  //       distance: 416.26495153822674,
  //     },
  //     {
  //       source: "web-vitals",
  //       target: "@mui/material",
  //       distance: 380.9138763374989,
  //     },
  //     {
  //       source: "@emotion/react",
  //       target: "@emotion/styled",
  //       distance: 0,
  //     },
  //     {
  //       source: "@emotion/react",
  //       target: "@mui/icons-material",
  //       distance: 11.578684736338518,
  //     },
  //     {
  //       source: "@emotion/react",
  //       target: "@mui/material",
  //       distance: 0,
  //     },
  //     {
  //       source: "@emotion/styled",
  //       target: "@material-ui/core",
  //       distance: 453.83990162285124,
  //     },
  //     {
  //       source: "@emotion/styled",
  //       target: "@mui/icons-material",
  //       distance: 0,
  //     },
  //     {
  //       source: "@emotion/styled",
  //       target: "@mui/material",
  //       distance: 0,
  //     },
  //     {
  //       source: "@fortawesome/fontawesome-svg-core",
  //       target: "@fortawesome/free-brands-svg-icons",
  //       distance: 394.1883872047194,
  //     },
  //     {
  //       source: "@fortawesome/fontawesome-svg-core",
  //       target: "@fortawesome/free-regular-svg-icons",
  //       distance: 363.57016393031734,
  //     },
  //     {
  //       source: "@fortawesome/fontawesome-svg-core",
  //       target: "@fortawesome/free-solid-svg-icons",
  //       distance: 207.6122739465631,
  //     },
  //     {
  //       source: "@fortawesome/fontawesome-svg-core",
  //       target: "@fortawesome/react-fontawesome",
  //       distance: 204.92397570264544,
  //     },
  //     {
  //       source: "@fortawesome/free-brands-svg-icons",
  //       target: "@fortawesome/free-regular-svg-icons",
  //       distance: 437.9373967939159,
  //     },
  //     {
  //       source: "@fortawesome/free-brands-svg-icons",
  //       target: "@fortawesome/free-solid-svg-icons",
  //       distance: 387.60386081320286,
  //     },
  //     {
  //       source: "@fortawesome/free-brands-svg-icons",
  //       target: "@fortawesome/react-fontawesome",
  //       distance: 384.9108391985618,
  //     },
  //     {
  //       source: "@fortawesome/free-regular-svg-icons",
  //       target: "@fortawesome/free-solid-svg-icons",
  //       distance: 358.33054046143536,
  //     },
  //     {
  //       source: "@fortawesome/free-regular-svg-icons",
  //       target: "@fortawesome/react-fontawesome",
  //       distance: 363.9441004531445,
  //     },
  //     {
  //       source: "@fortawesome/free-solid-svg-icons",
  //       target: "@fortawesome/react-fontawesome",
  //       distance: 190.8198259784687,
  //     },
  //     {
  //       source: "@material-ui/core",
  //       target: "@material-ui/icons",
  //       distance: 357.95595716007335,
  //     },
  //     {
  //       source: "@material-ui/core",
  //       target: "@material-ui/lab",
  //       distance: 447.99801739353046,
  //     },
  //     {
  //       source: "@material-ui/core",
  //       target: "@mui/material",
  //       distance: 453.38380657564187,
  //     },
  //     {
  //       source: "@material-ui/icons",
  //       target: "@material-ui/lab",
  //       distance: 455.57259891233423,
  //     },
  //     {
  //       source: "@mui/icons-material",
  //       target: "@mui/material",
  //       distance: 0,
  //     },
  //   ],
  // };

  if (landingGraph.nodes.length === 0) {
  }
  setTimeout(() => {
    if (landingGraph.nodes.length > 0) return;
    setLandingGraph(landingGraphRaw);
  }, 3000);

  if (landingfg.current) {
    landingfg.current.d3Force("link").distance((link) => {
      return link.distance;
    });
  }

  return (
    <div
      style={{
        background: "#000012",
        background:
          "linear-gradient(37deg, rgba(0,0,18,1) 0%, rgba(0,14,32,1) 52%, rgba(37,28,96,1) 100%)",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {showLandingPage && (
        <div
          style={{
            background: "#000012",
            background:
              "linear-gradient(37deg, rgba(0,0,18,1) 0%, rgba(0,14,32,1) 52%, rgba(37,28,96,1) 100%)",
            width: "100vw",
            height: "100vh",
            position: "absolute",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {landingGraph.nodes.length > 0 ? (
            <ForceGraph3D
              graphData={landingGraph}
              nodeAutoColorBy="group"
              nodeThreeObject={(node) => {
                const sprite = new SpriteText(node.id);
                sprite.color = node.color;
                sprite.textHeight = 8;
                return sprite;
              }}
              linkWidth={1}
              ref={landingfg}
              linkCurvature={0.2}
              showNavInfo={false}
              width={window.innerWidth}
              height={(9 * Math.floor(window.innerHeight)) / 10}
              backgroundColor="#ffffff00"
              linkOpacity={0.2}
              cameraDistance={600}
            />
          ) : (
            <div
              style={{
                width: window.innerWidth,
                height: (9 * Math.floor(window.innerHeight)) / 10,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: "50px",
                fontWeight: 600,
              }}
            >
              Stacklet
            </div>
          )}

          {/* <LandingGraph graphData={landingGraph} /> */}
          <div
            style={{
              color: "black",
              width: "240px",
              height: "60px",
              fontWeight: 800,
              backgroundColor: "white",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "26px",
              borderRadius: "14px 0px 14px 0px",
              justifySelf: "center",
              alignSelf: "center",
              cursor: "pointer",
            }}
            onClick={() => setShowLandingPage(false)}
          >
            Open Stacklet
          </div>
        </div>
      )}

      {!fileContents && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "80%",
            justifySelf: "center",
            justifyContent: "center",
          }}
        >
          {!isQueryLoading && (
            // <img
            //   src={logo_png}
            //   alt="logo"
            //   style={{
            //     width: "200px",
            //     height: "200px",
            //     alignSelf: "center",
            //     marginBottom: "50px",
            //   }}
            // />
            <img
              src={stacklet}
              alt="logo"
              style={{
                width: "200px",
                height: "200px",
                alignSelf: "center",
                marginBottom: "50px",
              }}
            />
          )}

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
              height: "60px",
              marginTop: "4px",
            }}
          >
            <div
              onClick={() =>
                handleValidateAndSetFileText(react_project_1, "sample1.json")
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
                handleValidateAndSetFileText(react_project_2, "sample2.json")
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
                width: "auto",
                height: "40px",
                padding: "0px 20px",
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
                setResultList([]);
                setSelectedResult();
              }}
            >
              <div style={{ color: "#2d2d2d", marginRight: "6px" }}>Clear</div>
              <div style={{ color: "#ECECEC" }}>{fileTitle}</div>
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
                    height: "40px",
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
                    width: "100px",
                    height: "40px",
                    backgroundColor: "#FDB833",
                    borderTopRightRadius: "10px",
                    borderBottomRightRadius: "10px",
                    borderStyle: "solid",
                    borderColor: "#FDB833",
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
