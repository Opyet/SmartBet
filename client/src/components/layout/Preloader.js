import { CircularProgress } from "@material-ui/core";
import React from "react";

export const Preloader = () => {
  return (
    <div
      style={{
        height: "90%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress style={{ color: "white" }} />
    </div>
  );
};

export default Preloader;
