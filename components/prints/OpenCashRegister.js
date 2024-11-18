import { Box, Grid, Paper, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import PrintContainer from "./PrintContainer";
import moment from "moment";
import { useSalePointContext } from "../salePoint/salePointProvider";

export default function OpenCashRegister(props) {
  const { movement, printState = false } = props;

  const { info, user } = useSalePointContext();

  // Utiliza useState con el estado inicial correcto
  const [movementData, setMovementData] = useState({
    created_at: "2021-10-10",
    description: "Apertura de caja",
    debit: 0,
    CashRegisterId: 0,
  });

  useEffect(() => {
    if (movement) {
      setMovementData({
        created_at: movement.created_at,
        description: movement.description,
        debit: movement.debit,
        CashRegisterId: movement.CashRegisterId,
      });
    }
  }, [movement]);

  return (
    <>
      <Box padding={1} display={"none"}>
        <PrintContainer automaticPrint={false} printState={printState}>
          <Box minWidth={"80mm"} p={1}>
            <Paper variant="outlined" sx={{ padding: 1 }}>
              <Grid container spacing={1} direction={"column"}>
                <Grid item>
                  <Typography variant="subtitle1">Apertura de caja</Typography>
                </Grid>
                <Grid item>
                  <Typography fontSize={12}></Typography>
                  <Typography fontSize={12}>
                    {"Monto: " +
                      (movementData.debit == undefined
                        ? 0
                        : movementData.debit.toLocaleString("es-CL", {
                            style: "currency",
                            currency: "CLP",
                          }))}
                  </Typography>

                  <Typography fontSize={12}>
                    {"Fecha: " +
                      moment(movementData.created_at).format(
                        "DD-MM-YYYY HH:mm"
                      )}
                  </Typography>
                  <Typography fontSize={12}>
                    {"Caja: " + (movementData.CashRegisterId == undefined ? 0 : movementData.CashRegisterId)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </PrintContainer>
      </Box>
    </>
  );
}
