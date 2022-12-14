const DragAndDrop = ({ isDragging }) => {
  return (
    <>
      {isDragging ? (
        <div
          style={{
            backgroundColor: "#f0f5ff",
            width: "50vw",
            height: "20vh",
            top: 0,
            left: 0,
            zIndex: 1,
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        ></div>
      ) : (
        <div
          style={{
            backgroundColor: "#5E4AE3",
            width: "50vw",
            height: "20vh",
            top: 0,
            left: 0,
            zIndex: 1,
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "20px",
              color: "#f0f5ff",
              fontWeight: 600,
            }}
          >
            Drag and drop your package.json file here!
          </p>
        </div>
      )}
    </>
  );
};

export default DragAndDrop;
