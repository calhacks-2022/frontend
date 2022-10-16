import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import DragAndDrop from "./components/DragAndDrop";
import ForceGraph from "./components/ForceGraph";

function App() {
  const [uploadedFiles, setUploadedFiles] = useState(null);
  const [fileContents, setFileContents] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleChange = async (files) => {
    setUploadedFiles(files);
    const fileContents = await files[0].text();
    setFileContents(fileContents);
  };

  const handleDraggingChange = (event) => {
    console.log(event);
    setIsDragging(event);
  };

  console.log(uploadedFiles);

  return (
    <div
      style={{
        backgroundColor: "white",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!uploadedFiles && (
        <FileUploader
          multiple={true}
          handleChange={handleChange}
          name="file"
          types={["JSON"]}
          onDraggingStateChange={(event) => handleDraggingChange(event)}
          children={<DragAndDrop isDragging={isDragging} />}
        />
      )}
      {uploadedFiles && (
        <div>
          <p>File Name: {uploadedFiles[0].name}</p>
          <button onClick={() => setUploadedFiles(null)}>Remove file</button>
          <ForceGraph />
        </div>
      )}
    </div>
  );
}

export default App;
