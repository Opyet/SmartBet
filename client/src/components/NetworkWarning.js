import React from "react";

const Warning = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "80%",
        flexDirection: "column",
      }}
    >
      <img src={process.env.PUBLIC_URL + "/images/network.png"} width={128} />

      <span
        style={{
          marginTop: "24px",
          fontWeight: "bold",
          fontSize: "32px",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        PLEASE SWITCH TO BINANCE SMART CHAIN (TESTNET)
      </span>

      <a style={{ color: "white" }} href="/matches">
        <span style={{ textDecoration: "underline" }}>
          Click here after switching
        </span>
      </a>
    </div>
  );
};

export default Warning;
