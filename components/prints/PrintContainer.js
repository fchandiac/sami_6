import React, { useEffect, useRef, useState } from "react";
import { Box, Grid, IconButton } from "@mui/material";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";

import { useReactToPrint } from "react-to-print";

export default function PrintContainer(props) {
  const { children, automaticPrint = false, printState = false } = props;
  const printRef = useRef(null);

  useEffect(() => {
    if (automaticPrint) {
      print();
    }
  }, []);

  useEffect(() => {
    console.log("PrintState", printState);
    if (printState === true) {
      print();
    }
  }, [printState]);

  const print = useReactToPrint({
    content: () => printRef.current,
  });
  return (
    <>
      <Box ref={printRef}>{children}</Box>
      <Box mb={1} />
      <Grid item xs={12} container justifyContent="right" p={1}>
        <IconButton
          onClick={() => {
            print();
          }}
        >
          <LocalPrintshopIcon />
        </IconButton>
      </Grid>
    </>
  );
}
