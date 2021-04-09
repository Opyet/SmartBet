import { Container } from "@material-ui/core";
import React from "react";
import { useLocation } from "react-router-dom";

const ContainerMain = (props) => {
  const path = useLocation().pathname;

  return (
    <Container maxWidth="md">
      <div
        style={{ height: path === "/" ? "0vh" : "85vh", marginTop: "100px" }}
      >
        {props.children}
      </div>
    </Container>
  );
};
export default ContainerMain;
