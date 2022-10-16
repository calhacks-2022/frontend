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
        // saturated version of ccccffff
        backgroundColor: selected === name ? "#7777ffff" : "#ccccffff",
        borderRadius: "10px",
        marginBottom: "10px",
        fontSize: "20px",
        justifyContent: "flex-start",
        paddingLeft: "30px",
        paddingTop: "15px",
        paddingBottom: "15px",
        alignItems: "center",
        fontWeight: 600,
        color: "#2d2d2d",
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
