const ResultItem = ({ name, setSelected, selected }) => {
  const handleSelect = () => {
    setSelected(name);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "90%",
        height: "50px",
        backgroundColor: selected === name ? "#5E4AE3" : "white",
        borderRadius: "20px",
        marginBottom: "20px",
        fontSize: "20px",
        justifyContent: "flex-start",
        paddingLeft: "30px",
        paddingTop: "15px",
        paddingBottom: "15px",
        alignItems: "center",
        fontWeight: 600,
        color: "black",
        borderStyle: "solid",
        borderColor: "black",
        borderWidth: "thin",
        cursor: "pointer",
      }}
      onClick={handleSelect}
    >
      {name}
    </div>
  );
};

export default ResultItem;
