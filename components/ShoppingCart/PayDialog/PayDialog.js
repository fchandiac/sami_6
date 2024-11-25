import React, { useRef, useEffect, useState } from "react";
import BackspaceIcon from "@mui/icons-material/Backspace";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  IconButton,
  Box,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useAppContext } from "../../../AppProvider";
import electron from "electron";
import AppPaper from "../../AppPaper/AppPaper";
import moment from "moment";
const PDF417 = require("pdf417-generator");

import Invoice from "../../Invoice";
import NewCustomerDialog from "../../Forms/NewCustomerDialog/NewCustomerDialog";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";
import PrintDialog from "../../prints/PrintDialog";

const ipcRenderer = electron.ipcRenderer || false;

const utils = require("../../../utils");
const print = require("../../../promises/print");
const stocks = require("../../../promises/stocks");
const sales = require("../../../promises/sales");
const lioren = require("../../../promises/lioren");
const salesDetails = require("../../../promises/salesDetails");
const pays = require("../../../promises/pays");
const customers = require("../../../promises/customers");
const orders = require("../../../promises/orders");

export default function PayDialog(props) {
  const { open, setOpen, total, stockControl } = props;
  const {
    dispatch,
    cart,
    movements,
    user,
    webConnection,
    ordersInCart,
    currentDocument,
    setCurrentDocument,
  } = useAppContext();
  const [payAmount, setPayAmount] = useState(0);
  const [change, setChange] = useState(0);
  const [disablePay, setDisablePay] = useState(true);
  const [insufficientMoney, setInsufficientMoney] = useState(true);
  const [openChangeDialog, setOpenChangeDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [paymentMethodsList, setPaymentMethodsList] = useState([]);
  const [printer, setPrinter] = useState({ idProduct: 0, idVendor: 0 });
  const [ticketInfo, setTicketInfo] = useState({
    name: "",
    address: "",
    phone: "",
    rut: "",
  });
  const [showCustomerFinder, setShowCustomerFinder] = useState(false);
  const [customersOptions, setCustomersOptions] = useState([]);
  const [customerInput, setCustomerInput] = useState("");
  const [customer, setCustomer] = useState({ id: 0, label: "", key: 0 });
  const [documentType, setDocumentType] = useState("Ticket");
  const [documentTypesList, setDocumentTypesList] = useState([]);
  const [configDocs, setConfigDocs] = useState({});
  const [liorenConfig, setLiorenConfig] = useState({});
  const [numeric_pad, setNumeric_pad] = useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false);
  const [customerCredit, setCustomerCredit] = useState({
    state: false,
    name: "",
    pay: false,
  });
  const [openTicketPrinterDialog, setOpenTicketPrinterDialog] = useState(false);
  const [printInfo, setPrintInfo] = useState({});

  const setDocumentsTypes = (webConnection, liorenConfig, configDocs) => {
    let docs = [{ name: "Ticket", label: "Ticket", value: 1 }];
    let ticket = ticketDoc(webConnection, configDocs, liorenConfig.integration);
    if (ticket) docs.push({ name: "Boleta", label: "Boleta", value: 2 });
    let invoice = invoiceDoc(
      webConnection,
      configDocs,
      liorenConfig.integration
    );
    if (invoice) docs.push({ name: "Factura", label: "Factura", value: 3 });
    //-----//
    docs.push({ name: "Sin impresora", label: "Sin impresora", value: 0 });
    setDocumentTypesList(docs);
  };

  useEffect(() => {
    if (openChangeDialog === true) {
      const handleKeyDown = (event) => {
        if (event.key === " ") {
          dispatch({ type: "CLEAR_CART" });
          setOpen(false);
          setOpenChangeDialog(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [openChangeDialog]);

  useEffect(() => {
    let paymentMethods = ipcRenderer.sendSync("get-payment-methods", "sync");
    let customerCredit = ipcRenderer.sendSync("get-customer-credit", "sync");
    let printer = ipcRenderer.sendSync("get-printer", "sync");
    let ticket_info = ipcRenderer.sendSync("get-ticket-info", "sync");
    let docs = ipcRenderer.sendSync("get-docs", "sync");
    let lioren = ipcRenderer.sendSync("get-lioren", "sync");
    let cash_register_UI = ipcRenderer.sendSync("get-cash-register-UI", "sync");

    paymentMethods = paymentMethods.map((method) => {
      return { name: method.name, label: method.name, pay: method.pay };
    });
    console.log("customerCredit", customerCredit);
    customerCredit.state === true
      ? paymentMethods.unshift({
          name: customerCredit.name,
          label: customerCredit.name,
          pay: false,
        })
      : null;
    customerCredit.state === true
      ? setCustomerCredit({
          state: true,
          name: customerCredit.name,
          pay: false,
        })
      : null;
    paymentMethods.unshift({ name: "Efectivo", label: "Efectivo", pay: true });
    setConfigDocs(docs);
    setPaymentMethodsList(paymentMethods);
    setPrinter(printer);
    setTicketInfo(ticket_info);
    setLiorenConfig(lioren);
    setDocumentsTypes(webConnection, lioren, docs);
    setNumeric_pad(cash_register_UI.number_pad);
  }, []);

  useEffect(() => {
    customers
      .findAll()
      .then((res) => {
        let data = res.map((item) => ({
          id: item.id,
          key: item.id,
          label: item.name,
        }));
        setCustomersOptions(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const updateCustomers = () => {
    customers
      .findAll()
      .then((res) => {
        let data = res.map((item) => ({
          id: item.id,
          key: item.id,
          label: item.name,
        }));
        setCustomersOptions(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (payAmount == 0) {
      setDisablePay(true);
      setInsufficientMoney(true);
    } else {
      if (payAmount < total) {
        setDisablePay(true);
        setInsufficientMoney(true);
      } else {
        setDisablePay(false);
        setInsufficientMoney(false);
        setChange(payAmount - total);
      }
    }
  }, [payAmount]);

  useEffect(() => {
    if (open === false) {
      setPayAmount(0);
      setPaymentMethod("Efectivo");
    }
  }, [open]);

  useEffect(() => {
    if (paymentMethod == "Efectivo") {
      setPayAmount(0);
      setShowCustomerFinder(false);
    } else if (paymentMethod == customerCredit.name) {
      setPayAmount(total);
      setShowCustomerFinder(true);
    } else {
      setPayAmount(total);
      setShowCustomerFinder(false);
    }
  }, [paymentMethod]);

  const addDigit = (digit) => {
    let amount = payAmount.toString();
    if (amount === "0" && digit === 0) {
      setPayAmount(0);
    } else if (amount.length >= 7) {
      setPayAmount(parseInt(amount));
    } else {
      amount += digit.toString();
      setPayAmount(parseInt(amount));
    }
  };

  const removeDigit = () => {
    let amount = payAmount.toString();
    if (amount.length === 1) {
      setPayAmount(0);
    } else {
      amount = amount.slice(0, -1);
      setPayAmount(parseInt(amount));
    }
  };

  const updateStocks = (cart) => {
    let newStocks = [];
    cart.map((product) => {
      newStocks.push(
        stocks.updateByProductAndStorage(product.id, 1001, product.virtualStock)
      );
    });
    return Promise.all(newStocks);
  };

  const saleDetailAll = (sale_id, cart) => {
    let details = [];
    cart.map((product) => {
      console.log("product", product);
      details.push(
        salesDetails.create(
          sale_id,
          product.id,
          product.quanty,
          product.sale,
          product.discount,
          product.subTotal,
          product.name
        )
      );
    });

    return Promise.all(details);
  };

  const sale = () => {
    const pr = new Promise((resolve, reject) => {
      sales
        .create(
          total,
          paymentMethod,
          0,
          0,
          stockControl,
          user.id == 0 ? 1001 : user.id
        )
        .then((res) => {
          let movs = movements.movements;
          movs.push({
            sale_id: res.id,
            user: user.name,
            type: 1004,
            amount: total,
            payment_method: paymentMethod,
            balance: movements.balance + total,
            dte_code: 0,
            dte_number: 0,
            date: new Date(),
          });
          let newMov = {
            state: true,
            balance: movements.balance + total,
            movements: movs,
          };
          ipcRenderer.send("update-movements", newMov);
          dispatch({ type: "SET_MOVEMENTS", value: newMov });
          resolve(res);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
    return pr;
  };

  const closeOrders = async () => {
    for (const order of ordersInCart) {
      await orders.updateState(order.order_id, true);
    }
    dispatch({ type: "SET_ORDERS_IN_CART", value: [] });
  };

  const saleBoleta = (dte_number) => {
    const pr = new Promise((resolve, reject) => {
      sales
        .create(
          total,
          paymentMethod,
          39,
          dte_number,
          stockControl,
          user.id == 0 ? 1001 : user.id
        )
        .then((res) => {
          let movs = movements.movements;
          movs.push({
            sale_id: res.id,
            user: user.name,
            type: 1004,
            amount: total,
            payment_method: paymentMethod,
            balance: movements.balance + total,
            dte_code: 39,
            dte_number: dte_number,
            date: new Date(),
          });
          let newMov = {
            state: true,
            balance: movements.balance + total,
            movements: movs,
          };
          ipcRenderer.send("update-movements", newMov);
          dispatch({ type: "SET_MOVEMENTS", value: newMov });
          resolve(res);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
    return pr;
  };

  const savePay = async (methodsList, paymentMethod, sale_id, amount) => {
    let state = methodsList.find((method) => method.name == paymentMethod).pay;
    let customer_id = null;
    let paid = amount;
    let balance = 0;

    if (customer.id != 0) {
      customer_id = customer.id;
      paid = 0;
      balance = amount;
    }

    await pays.create(
      sale_id,
      customer_id,
      amount,
      paymentMethod,
      state,
      new Date(),
      paid,
      balance
    );
    setCustomer({ id: 0, label: "", key: 0 });
  };

  const boletaPrintInfo = (timbre, iva, invoiceNumber, cart_, sale_id) => {
    let canvas = document.createElement("canvas");
    PDF417.draw(timbre, canvas, 2, 2, 1.5);

    let stamp_img = canvas.toDataURL("image/jpg");
    let date = moment(new Date()).format("DD-MM-yyyy");
    let time = moment(new Date()).format("HH:mm");
    let totalCart = cart_.reduce((acc, item) => acc + item.subTotal, 0);
    let printInfo = {
      printer: printer,
      stamp: stamp_img,
      date: date,
      time: time,
      name: ticketInfo.name,
      rut: ticketInfo.rut,
      address: ticketInfo.address,
      phone: ticketInfo.phone,
      total: totalCart,
      iva: iva,
      invoiceNumber: invoiceNumber,
      cart: cart_,
      paymentMethod: paymentMethod,
      sale_id: sale_id,
    };
    return printInfo;
  };

  const renderCustomerFinder = () => {
    // if (showCustomerFinder == true) {
    return (
      <>
        <Grid item xs={10} sm={10} md={10} lg={10}>
          <Autocomplete
            inputValue={customerInput}
            onInputChange={(e, newInputValue) => {
              setCustomerInput(newInputValue);
            }}
            value={customer}
            onChange={(e, newValue) => {
              setCustomer(newValue);
            }}
            isOptionEqualToValue={(option, value) =>
              value === null || option.id === value.id
            }
            disablePortal
            noOptionsText="Cliente no encontrado"
            options={customersOptions}
            renderInput={(params) => (
              <TextField {...params} label="Cliente" size={"small"} fullWidth />
            )}
          />
        </Grid>
        <Grid item xs={2} sm={2} md={2} lg={2}>
          <IconButton
            onClick={() => {
              setOpenNewCustomerDialog(true);
            }}
          >
            <AddCircleIcon />{" "}
          </IconButton>
        </Grid>
      </>
    );
    // }
  };

  const proccessPayment = async () => {
    if (currentDocument === 3) {
      console.log("currentDocument", currentDocument);
      // console.log(customer)
      setOpenInvoiceDialog(true);
    } else {
      if (currentDocument === 0) {
        console.log("currentDocument", currentDocument);
        if (stockControl == true) {
          await updateStocks(cart);
          await stocks.findAllStockAlert();
        }
        const sale_ = await sale();
        await saleDetailAll(sale_.id, cart);
        console.log(paymentMethodsList);
        await savePay(paymentMethodsList, paymentMethod, sale_.id, total);

        console.log("orders in cart", ordersInCart);
        if (ordersInCart.length > 0) {
          await closeOrders();
        }
        setOpen(false);
        setOpenChangeDialog(true);
      } else if (currentDocument === 2) {
        console.log("currentDocument", currentDocument);
        setDisablePay(true);
        const findPrinter_1 = await ipcRenderer.invoke("find-printer", printer);
        if (!findPrinter_1) {
          dispatch({
            type: "OPEN_SNACK",
            value: {
              type: "error",
              message: "Error de conexión con la impresora",
            },
          });
        } else {
          if (stockControl == true) {
            await updateStocks(cart);
            await stocks.findAllStockAlert();
          }
          console.log("cart", cart);
          let affectedCart = cart.filter((item) => item.affected == true);
          let nonAffectedCart = cart.filter((item) => item.affected == false);
          let totalAffectedCart = affectedCart.reduce(
            (acc, item) => acc + item.subTotal,
            0
          );
          let totalNonAffectedCart = nonAffectedCart.reduce(
            (acc, item) => acc + item.subTotal,
            0
          );

          if (totalAffectedCart <= 0) {
            const sale_ = await sale();
            await saleDetailAll(sale_.id, cart);
            await savePay(paymentMethodsList, paymentMethod, sale_.id, total);
            let date = moment(new Date()).format("DD-MM-yyyy");
            let time = moment(new Date()).format("HH:mm");
            let printInfo = {
              total: total,
              cart: cart,
              printer: printer,
              ticketInfo: ticketInfo,
              date: date,
              time: time,
              paymentMethod: paymentMethod,
              sale_id: sale_.id,
            };

            ipcRenderer.sendSync("print-ticket", printInfo);
            if (ordersInCart.length > 0) {
              await closeOrders();
            }

            setOpenChangeDialog(true);
            setOpen(false);
          } else {
            console.log("currentDocument", currentDocument);
            const boleta = await lioren.boleta(
              liorenConfig.token,
              totalAffectedCart,
              cart
            );
            const sale = await saleBoleta(boleta[2]);
            await savePay(paymentMethodsList, paymentMethod, sale.id, total);
            await saleDetailAll(sale.id, cart);
            if (ordersInCart.length > 0) {
              await closeOrders();
            }

            console.log("boleta", boleta);

            let prntBoletaInfo = boletaPrintInfo(
              boleta[0],
              boleta[1],
              boleta[2],
              affectedCart,
              sale.id
            );

            await ipcRenderer.invoke(
              "boleta2",
              prntBoletaInfo,
              totalNonAffectedCart,
              cart
            );

            setOpenChangeDialog(true);
            setOpen(false);
          }
        }
      } else if (currentDocument === 1) {
        console.log("currentDocument", currentDocument);
        //const findPrinter_2 = await ipcRenderer.invoke('find-printer', printer)
        const findPrinter_2 = true;
        if (!findPrinter_2) {
          dispatch({
            type: "OPEN_SNACK",
            value: {
              type: "error",
              message: "Error de conexión con la impresora",
            },
          });
        } else {
          if (stockControl == true) {
            await updateStocks(cart);
            await stocks.findAllStockAlert();
          }
          const sale_ = await sale();
          await saleDetailAll(sale_.id, cart);
          await savePay(paymentMethodsList, paymentMethod, sale_.id, total);
          let date = moment(new Date()).format("DD-MM-yyyy");
          let time = moment(new Date()).format("HH:mm");
          let printInfoLocal = {
            total: total,
            cart: cart,
            printer: printer,
            ticketInfo: ticketInfo,
            date: date,
            time: time,
            paymentMethod: paymentMethod,
            sale_id: sale_.id,
          };
          ipcRenderer.sendSync('print-ticket', printInfo)

          //================================================================================================//

          // setPrintInfo(printInfoLocal);

          // if (ordersInCart.length > 0) {
          //   await closeOrders();
          // }
          // setOpenTicketPrinterDialog(true);
          // console.log("printInfo", printInfo);

          setOpenChangeDialog(true)
          setOpen(false)
        }
      }
    }
  };

  return (
    <>
      <Dialog open={open} fullWidth>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            proccessPayment();
          }}
        >
          <DialogTitle sx={{ p: 2 }}>Proceso de pago</DialogTitle>
          <DialogContent sx={{ p: 2 }}>
            <Grid container spacing={1} direction={"row"}>
              <Grid item marginTop={1} xs={5} sm={5} md={5}>
                <Grid
                  container
                  item
                  spacing={1}
                  direction={"column"}
                  justifyContent={"space-between"}
                >
                  <Grid item marginTop={1}>
                    <TextField
                      label="Total:"
                      value={utils.renderMoneystr(total)}
                      InputProps={{
                        readOnly: true,
                      }}
                      variant="outlined"
                      size={"small"}
                      fullWidth
                    />
                  </Grid>
                  <Grid item marginTop={1}>
                    <TextField
                      label="Paga con:"
                      name="inputPayAmount"
                      value={utils.renderMoneystr(payAmount)}
                      onChange={(e) => {
                        e.target.value === "$ " ||
                        e.target.value === "$" ||
                        e.target.value === "0" ||
                        e.target.value === ""
                          ? setPayAmount(0)
                          : setPayAmount(utils.moneyToInt(e.target.value));
                      }}
                      variant="outlined"
                      size={"small"}
                      fullWidth
                      autoFocus
                    />
                  </Grid>
                  <Grid
                    item
                    textAlign={"right"}
                    sx={{ display: insufficientMoney ? "block" : "none" }}
                  >
                    <Typography color={"error"}>
                      {"Monto de pago insuficiente"}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    textAlign={"right"}
                    sx={{ display: insufficientMoney ? "none" : "block" }}
                  >
                    <Typography color={"pimary"}>
                      {"Vuelto: " + utils.renderMoneystr(change)}
                    </Typography>
                  </Grid>
                  <Grid item sx={{ display: numeric_pad ? "block" : "none" }}>
                    <Grid container spacing={1}>
                      <Grid item xs={4} sm={4} md={4}>
                        <Button
                          sx={{ height: "100%", width: "100%" }}
                          variant={"contained"}
                          onClick={() => {
                            addDigit(1);
                          }}
                        >
                          1
                        </Button>
                      </Grid>
                      <Grid item s={4} sm={4} md={4}>
                        <Button
                          sx={{ height: "100%", width: "100%" }}
                          variant={"contained"}
                          onClick={() => {
                            addDigit(2);
                          }}
                        >
                          2
                        </Button>
                      </Grid>
                      <Grid item s={4} sm={4} md={4}>
                        <Button
                          sx={{ height: "100%", width: "100%" }}
                          variant={"contained"}
                          onClick={() => {
                            addDigit(3);
                          }}
                        >
                          3
                        </Button>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4}>
                        <Button
                          sx={{ height: "100%", width: "100%" }}
                          variant={"contained"}
                          onClick={() => {
                            addDigit(4);
                          }}
                        >
                          4
                        </Button>
                      </Grid>
                      <Grid item s={4} sm={4} md={4}>
                        <Button
                          sx={{ height: "100%", width: "100%" }}
                          variant={"contained"}
                          onClick={() => {
                            addDigit(5);
                          }}
                        >
                          5
                        </Button>
                      </Grid>
                      <Grid item s={4} sm={4} md={4}>
                        <Button
                          sx={{ height: "100%", width: "100%" }}
                          variant={"contained"}
                          onClick={() => {
                            addDigit(6);
                          }}
                        >
                          6
                        </Button>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4}>
                        <Button
                          sx={{ height: "100%", width: "100%" }}
                          variant={"contained"}
                          onClick={() => {
                            addDigit(7);
                          }}
                        >
                          7
                        </Button>
                      </Grid>
                      <Grid item s={4} sm={4} md={4}>
                        <Button
                          sx={{ height: "100%", width: "100%" }}
                          variant={"contained"}
                          onClick={() => {
                            addDigit(8);
                          }}
                        >
                          8
                        </Button>
                      </Grid>
                      <Grid item s={4} sm={4} md={4}>
                        <Button
                          sx={{ height: "100%", width: "100%" }}
                          variant={"contained"}
                          onClick={() => {
                            addDigit(9);
                          }}
                        >
                          9
                        </Button>
                      </Grid>
                      <Grid item s={8} sm={8} md={8}>
                        <Button
                          sx={{ height: "100%", width: "100%" }}
                          variant={"contained"}
                          onClick={() => {
                            addDigit(0);
                          }}
                        >
                          0
                        </Button>
                      </Grid>
                      <Grid item s={4} sm={4} md={4}>
                        <Button
                          sx={{ height: "100%", width: "100%" }}
                          variant={"contained"}
                          onClick={() => {
                            removeDigit();
                          }}
                        >
                          <BackspaceIcon />
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item marginTop={1} xs={7} sm={7} md={7}>
                <Grid container spacing={1}>
                  <Grid item xs={6} sm={6} md={6}>
                    <Grid item paddingBottom={2}>
                      <AppPaper title={"Medio de pago"} sx={{ height: "100%" }}>
                        <FormGroup sx={{ p: 1 }}>
                          {paymentMethodsList.map((item) => (
                            <FormControlLabel
                              key={item.name}
                              control={
                                <Checkbox
                                  checked={paymentMethod === item.name}
                                  onChange={(e) => {
                                    setPaymentMethod(e.target.name);
                                  }}
                                  name={item.name}
                                  color="primary"
                                  size="small"
                                />
                              }
                              label={
                                <span style={{ fontSize: "12px" }}>
                                  {item.label}
                                </span>
                              }
                              style={{ marginBottom: "-12px" }}
                            />
                          ))}
                        </FormGroup>
                      </AppPaper>
                    </Grid>
                  </Grid>
                  <Grid item xs={6} sm={6} md={6}>
                    <AppPaper title={"Documento"}>
                      <FormGroup sx={{ p: 1 }}>
                        {documentTypesList.map((item) => (
                          <FormControlLabel
                            key={item.value}
                            control={
                              <Checkbox
                                checked={
                                  currentDocument === item.value ? true : false
                                }
                                onChange={(e) => {
                                  setCurrentDocument(item.value);
                                }}
                                name={item.name}
                                color="primary"
                                size="small"
                              />
                            }
                            label={
                              <span style={{ fontSize: "12px" }}>
                                {item.label}
                              </span>
                            }
                            style={{ marginBottom: "-12px" }}
                          />
                        ))}
                      </FormGroup>
                    </AppPaper>
                  </Grid>

                  {renderCustomerFinder()}
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant={"contained"} disabled={disablePay} type="submit">
              Pagar
            </Button>
            <Button onClick={() => setOpen(false)}>Cerrar</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openChangeDialog} fullWidth maxWidth={"xs"}>
        <DialogTitle sx={{ p: 2 }}>Resumen venta</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Grid container spacing={1} direction={"column"}>
            <Grid item marginTop={1}>
              <TextField
                label="Total:"
                value={utils.renderMoneystr(total)}
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
                size={"small"}
                fullWidth
              />
            </Grid>
            <Grid item marginTop={1}>
              <TextField
                label="Vuelto:"
                value={utils.renderMoneystr(change)}
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
                size={"small"}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant={"outlined"}
            onClick={() => {
              setOpenChangeDialog(false);
              dispatch({ type: "CLEAR_CART" });
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Invoice
        open={openInvoiceDialog}
        setOpen={setOpenInvoiceDialog}
        setOpenChangeDialog={setOpenChangeDialog}
        setOpenPayDialog={setOpen}
        paymentMethod={paymentMethod}
        stockControl={stockControl}
        customerForInvoice={
          customer == null ? { id: 0, label: "", key: 0 } : customer
        }
      />

      <NewCustomerDialog
        open={openNewCustomerDialog}
        setOpen={setOpenNewCustomerDialog}
        finallyCallback={updateCustomers}
      />

      {/* <PrintDialog
        open={openTicketPrinterDialog}
        setOpen={setOpenTicketPrinterDialog}
        title={"Vista Previa del Ticket"}
        dialogWidth={"sm"}
      >
        <Box sx={{ width: "58mm", fontFamily: "monospace", padding: 2 }}>
          <Typography fontSize={12} align="center">
            <strong>{printInfo.ticketInfo.name}</strong>
          </Typography>
          <Typography fontSize={10} align="center">
            {printInfo.ticketInfo.address}
          </Typography>
          <Typography fontSize={10} align="center">
            Tel: {printInfo.ticketInfo.phone}
          </Typography>
          <Typography fontSize={10} align="center">
            RUT: {printInfo.ticketInfo.rut}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography fontSize={10}>Fecha: {printInfo.date}</Typography>
          <Typography fontSize={10}>Hora: {printInfo.time}</Typography>
          <Typography fontSize={10}>
            Método de pago: {printInfo.paymentMethod}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {printInfo.cart.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography fontSize={10}>{item.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize={10}>{item.quanty}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize={10}>${item.subTotal}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1" fontWeight="bold">
            Total: ${printInfo.total}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Barcode
              value={String(printInfo.sale_id)}
              width={1}
              height={50}
              displayValue={false}
            />
          </Box>
        </Box>
      </PrintDialog> */}

      <PrintDialog
        open={openTicketPrinterDialog}
        setOpen={setOpenTicketPrinterDialog}
        title={"Vista Previa del Ticket"}
        dialogWidth={"sm"}
      >
        <Box sx={{ width: "58mm", fontFamily: "monospace", padding: 2 }}>
          <Typography fontSize={12} align="center">
            <strong>{printInfo?.ticketInfo?.name || "Sin nombre"}</strong>
          </Typography>
          <Typography fontSize={10} align="center">
            {printInfo?.ticketInfo?.address || "Dirección no disponible"}
          </Typography>
          <Typography fontSize={10} align="center">
            Tel: {printInfo?.ticketInfo?.phone || "Teléfono no disponible"}
          </Typography>
          <Typography fontSize={10} align="center">
            RUT: {printInfo?.ticketInfo?.rut || "RUT no disponible"}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography fontSize={10}>
            Fecha: {printInfo?.date || "N/A"}
          </Typography>
          <Typography fontSize={10}>
            Hora: {printInfo?.time || "N/A"}
          </Typography>
          <Typography fontSize={10}>
            Método de pago: {printInfo?.paymentMethod || "N/A"}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{fontSize:10}}>Nombre</TableCell>
                <TableCell sx={{fontSize:10}}>#</TableCell>
                <TableCell sx={{fontSize:10}}>Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {printInfo?.cart?.length > 0 ? (
                printInfo.cart.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography fontSize={10}>
                        {item.name || "Sin nombre"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={10}>{item.quanty || 0}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={10}>
                        ${item.subTotal || 0}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography fontSize={10}>
                      No hay productos en el carrito
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1" fontWeight="bold">
            Total: ${printInfo?.total || 0}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ textAlign: "center", mt: 2 }}>
            {printInfo?.sale_id ? (
              <Barcode
                value={String(printInfo.sale_id)}
                width={1}
                height={50}
                displayValue={false}
              />
            ) : (
              <Typography fontSize={10}>ID de venta no disponible</Typography>
            )}
          </Box>
        </Box>
      </PrintDialog>
    </>
  );
}

function ticketDoc(webConnection, docs, liorenIntegration) {
  if (!webConnection) {
    return false;
  } else if (!liorenIntegration) {
    return false;
  } else if (!docs.ticket) {
    return false;
  } else {
    return true;
  }
}

function invoiceDoc(webConnection, docs, liorenIntegration) {
  if (!webConnection) {
    return false;
  } else if (!liorenIntegration) {
    return false;
  } else if (!docs.invoice) {
    return false;
  } else {
    return true;
  }
}

const TicketPrinterDialog = ({ open, onClose, data }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({ componentRef });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Vista Previa del Ticket</DialogTitle>
      <DialogContent>
        <Box
          ref={componentRef}
          sx={{ width: "58mm", fontFamily: "monospace", padding: 2 }}
        >
          <Typography variant="h6" align="center">
            {data.ticketInfo.name}
          </Typography>
          <Typography variant="body2" align="center">
            {data.ticketInfo.address}
          </Typography>
          <Typography variant="body2" align="center">
            Tel: {data.ticketInfo.phone}
          </Typography>
          <Typography variant="body2" align="center">
            RUT: {data.ticketInfo.rut}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2">Fecha: {data.date}</Typography>
          <Typography variant="body2">Hora: {data.time}</Typography>
          <Typography variant="body2">
            Método de pago: {data.paymentMethod}
          </Typography>
          <Divider sx={{ my: 1 }} />
          {data.cart.map((item, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="body2">{item.name}</Typography>
              <Typography variant="body2">
                Cantidad: {item.quanty} x ${item.sale} = ${item.subTotal}
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1" fontWeight="bold">
            Total: ${data.total}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Barcode
              value={String(data.sale_id)}
              format="PDF417"
              width={1}
              height={50}
              displayValue={false}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cerrar
        </Button>
        <Button onClick={handlePrint} color="primary" variant="contained">
          Imprimir
        </Button>
      </DialogActions>
    </Dialog>
  );
};
