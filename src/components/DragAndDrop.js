const DragAndDrop = ({ isDragging }) => {
  return (
    <>
      {isDragging ? (
        <div
          style={{
            backgroundColor: "#FDB833",
            opacity: 0.8,
            width: "100vw",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Drop file here
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#5E4AE3",
            width: "50vw",
            height: "20vh",
            top: 0,
            left: 0,
            zIndex: 1,
            borderRadius: "30px",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <p style={{ margin: "0", fontSize: "20px", fontWeight: 800 }}>
            Drag and drop your file here!
          </p>
        </div>
      )}
    </>
  );
};

export default DragAndDrop;
