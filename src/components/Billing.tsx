import React, { FunctionComponent, useState, useEffect } from "react";
import {
  Container,
  CssBaseline,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  TextField,
  Fab,
} from "@mui/material";
import { Box, IconButton, Tab, Tabs } from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Paper from "@mui/material/Paper";
import { CircularProgress } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaidIcon from "@mui/icons-material/Paid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useGetInvoicesByUserIdQuery } from '../slices/invoicesApiSlice';
import { useSelector } from "react-redux";
import TableAddBilling from "./TableAddBilling";
import { useGetRegistersByCriteriaQuery } from '../slices/registerApiSlice';
import { useAddInvoiceMutation } from '../slices/invoicesApiSlice';
import { useDeleteInvoiceMutation } from '../slices/invoicesApiSlice';
import { useDeleteProductsByInvoiceIDMutation } from '../slices/productInvoicesApiSlice';

function filterRecordsByMonthAndYear(records: any[], targetMonth: number, targetYear: number) {
  return records.filter((record: { fecha: string | number | Date; }) => {
    const recordDate = new Date(record.fecha);
    const recordMonth = recordDate.getMonth();
    const recordYear = recordDate.getFullYear();
    return recordMonth === targetMonth && recordYear === targetYear;
  });
}

type Record = {
  _id: string;
  tipoRegistro: string;
  descRegistro: string;
  fecha: string;
  monto: number;
};

const Billing: FunctionComponent = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [spentData, setSpentData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [numericValue, setNumericValue] = useState("");
  const [rowId, setrowId] = useState("");
  const [dataEdit, setDataEdit] = useState([]);
  const [itemToUpdate, setItemToUpdate] = useState("");
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filteredPurchaseData, setFilteredPurchaseData] = useState<Record[]>([]);
  const [filteredSalesData, setFilteredSalesData] = useState<Record[]>([]);
  
  const [addInvoiceMutation] = useAddInvoiceMutation();
  const [deleteInvoiceMutation] = useDeleteInvoiceMutation();
  const [deleteProductsByInvoiceMutation] = useDeleteProductsByInvoiceIDMutation();
  
  const userId = useSelector((state: any) => state.auth.userInfo._id);
  const token = useSelector((state: any) => state.auth.token);
  
  const { data: dataResponse } = useGetInvoicesByUserIdQuery({
    idUsuario: userId,
    token: token,
  });
  
  const { data: dataResponseRegisters, isLoading, refetch } = useGetInvoicesByUserIdQuery({
    data: {
      idUsuario: userId,
    },
    token: token,
  });

  useEffect(() => {
    console.log("itemToUpdate ha cambiado:", itemToUpdate);
    setItemToUpdate(itemToUpdate);
  }, [itemToUpdate]);

  useEffect(() => {
    if (dataResponseRegisters) {
    }
  }, [dataResponseRegisters]);

  useEffect(() => {
    if (dataResponse) {
      const spentDataMapped = dataResponse
        .filter((item: { typevalue: string; }) => item.typevalue === 'Purchase')
        .map((item: { _id: string; subtype: any; }) => ({
          _id: item._id,
          subtype: item.subtype
        }));
      const incomeDataMapped = dataResponse
        .filter((item: { typevalue: string; }) => item.typevalue === 'Sales')
        .map((item: { _id: string; subtype: any; }) => ({
          _id: item._id,
          subtype: item.subtype
        }));
      setSpentData(spentDataMapped);
      setIncomeData(incomeDataMapped);
    }
  }, [dataResponse]);

  useEffect(() => {
    if (dataResponseRegisters) {
      const filtered = filterRecordsByMonthAndYear(dataResponseRegisters, currentMonth, currentYear);
      setFilteredRecords(filtered);
    }
  }, [dataResponseRegisters, currentMonth, currentYear]);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  }, []);

  useEffect(() => {
    if (dataResponseRegisters) {
      const purchaseData = dataResponseRegisters.filter((item: { invoiceType: string; }) => item.invoiceType === 'Purchase');
      const salesData = dataResponseRegisters.filter((item: { invoiceType: string; }) => item.invoiceType === 'Sales');
      setFilteredPurchaseData(purchaseData);
      setFilteredSalesData(salesData);
      console.log("purchaseData:");
      console.log(purchaseData);
      console.log("salesData:");
      console.log(salesData);
    }
  }, [dataResponseRegisters, currentMonth, currentYear]);

  const handleClickOpen = (title: string) => {
    setDialogTitle(title);
    setOpenDialog(true);
    setNumericValue("");
  };

  const handleClose = async () => {
    setOpenDialog(false);
  };

  const updateData = (newData: any, dataType: any) => {
    if (dataType === "Purchase") {
      setSpentData(newData);
    } else if (dataType === "Sales") {
      setIncomeData(newData);
    }
  };

  const handleClickOpenRegisters = () => {
    refetch();
    setOpen(true);
  };

  const handleCloseRegisters = () => {
    setOpen(false);
    refetch();
  };

  const handleDelete = async (id: string, invoiceID: number) => {
    try {
      console.log("id");
      console.log(id);
      await deleteProductsByInvoiceMutation(
        {
          registro: {
            invoiceID: invoiceID
          },
          token: token
        }
      );
      await deleteInvoiceMutation(
        {
          registro: {
            id: id
          },
          token: token
        }
      );
      refetch();
    } catch (error) {
      console.error("Error al eliminar el valor:", error);
    }
  };

  const handleEdit = async (title: string, rowId: string) => {
    setDialogTitle(title);
    setOpenDialog(true);
    setrowId(rowId);
    const itemToUpdate = dataResponseRegisters.find((item: { _id: string; }) => item._id === rowId);
    setItemToUpdate(itemToUpdate);
    await refetch();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container component="main" maxWidth="md" className={`fade-in-vertical ${isVisible ? 'active' : ''} common-styles  component-container`}>
      <CssBaseline />
      <div>
        <Typography variant="h5" align="center" gutterBottom>
          Invoices
        </Typography>
        <form className={"form"}>
          <div className={"buttonsContainer"}>
            <Fab
              color="primary"
              onClick={() => handleClickOpen("Purchase")}
            >
              <ShoppingCartIcon />+
            </Fab>
            <Fab
              color="secondary"
              onClick={() => handleClickOpen("Sales")}
            >
              <PaidIcon />+
            </Fab>
          </div>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Purchase Invoices" />
            <Tab label="Sales Invoices" />
          </Tabs>
          <Dialog
            open={openDialog}
            TransitionComponent={Slide}
            keepMounted
            onClose={handleClose}
            maxWidth="md"
            fullWidth
          >
            <DialogContent style={{ maxHeight: 400, overflowY: 'scroll' }}>
              {dialogTitle === "Purchase" && (
                <TableAddBilling
                  userId={userId}
                  title={dialogTitle}
                  typevalue="Purchase"
                  data={spentData}
                  addInvoiceMutation={addInvoiceMutation}
                  token={token}
                  updateData={updateData}
                  refetch={refetch}
                  itemToUpdate={null}
                  setOpenDialog={setOpenDialog}
                />
              )}
              {dialogTitle === "Sales" && (
                <TableAddBilling
                  userId={userId}
                  title={dialogTitle}
                  typevalue="Sales"
                  data={incomeData}
                  addInvoiceMutation={addInvoiceMutation}
                  token={token}
                  updateData={updateData}
                  refetch={refetch}
                  itemToUpdate={null}
                  setOpenDialog={setOpenDialog}
                />
              )}
              {dialogTitle === "View" && (
                <TableAddBilling
                  userId={userId}
                  title={dialogTitle}
                  typevalue="View"
                  data={dataEdit || []}
                  addInvoiceMutation={addInvoiceMutation}
                  token={token}
                  updateData={updateData}
                  refetch={refetch}
                  itemToUpdate={itemToUpdate}
                  setOpenDialog={setOpenDialog}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>
        </form>
        <div>
          <TableContainer  >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Invoice ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Invoice Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {activeTab === 0 ? "Provider" : activeTab === 1 ? "Customer" : ""}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Payment</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Taxes</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sub-total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeTab === 0 && filteredPurchaseData.length > 0 ? (
                  filteredPurchaseData.map((row: any) => (
                    <TableRow key={row._id}>
                      <TableCell>{row.invoiceID}</TableCell>
                      <TableCell>{row.invoiceType}</TableCell>
                      <TableCell>{new Date(row.dateIssue).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>{row.provider ? row.provider : row.customer}</TableCell>
                      <TableCell>{row.paymentSell ? row.paymentSell : row.paymentBuy}</TableCell>
                      <TableCell>{row.taxes}</TableCell>
                      <TableCell>{row.subTotal}</TableCell>
                      <TableCell>
                        <IconButton
                          aria-label="edit"
                          onClick={() => {
                            handleCloseRegisters();
                            handleEdit("View", row._id);
                          }}
                        >
                          <VisibilityIcon color="primary" />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDelete(row._id, row.invoiceID)}
                        >
                          <DeleteIcon color="secondary" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : activeTab === 1 && filteredSalesData.length > 0 ? (
                  filteredSalesData.map((row: any) => (
                    <TableRow key={row._id}>
                      <TableCell>{row.invoiceID}</TableCell>
                      <TableCell>{row.invoiceType}</TableCell>
                      <TableCell>{new Date(row.dateIssue).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>{row.provider ? row.provider : row.customer}</TableCell>
                      <TableCell>{row.paymentSell ? row.paymentSell : row.paymentBuy}</TableCell>
                      <TableCell>{row.taxes}</TableCell>
                      <TableCell>{row.subTotal}</TableCell>
                      <TableCell>
                        <IconButton
                          aria-label="edit"
                          onClick={() => {
                            handleCloseRegisters();
                            handleEdit("View", row._id);
                          }}
                        >
                          <VisibilityIcon color="primary" />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDelete(row._id, row.invoiceID)}
                        >
                          <DeleteIcon color="secondary" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>No data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </Container>
  );
};

export default Billing;