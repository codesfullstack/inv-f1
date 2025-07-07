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
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaidIcon from "@mui/icons-material/Paid";
import { useSelector } from "react-redux";
import TableAddRegister from "./TableAddRegister";
import { Box, IconButton, Tab, Tabs } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useGetProductsByUserIdQuery } from '../slices/productApiSlice'; // Import the hook
import { useAddProductMutation, useDeleteProductMutation } from '../slices/productApiSlice';
import { CircularProgress } from "@mui/material";
import PostAddIcon from '@mui/icons-material/PostAdd';

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

const Inventory: FunctionComponent = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [spentData, setSpentData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [numericValue, setNumericValue] = useState("");
  const [addTypeValueMutation] = useAddProductMutation();
  const [deleteTypeValueMutation] = useDeleteProductMutation();
  const [rowId, setrowId] = useState("");
  const [dataEdit, setDataEdit] = useState([]);
  const [itemToUpdate, setItemToUpdate] = useState("");
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const userId = useSelector((state: any) => state.auth.userInfo._id);
  const token = useSelector((state: any) => state.auth.token);
  const { data: dataResponseRegisters, isLoading, refetch } = useGetProductsByUserIdQuery({
    data: {
      idUsuario: userId
    },
    token: token,
  });

  useEffect(() => {
    refetch();
  }, [dataResponseRegisters]);

  const handleClickOpen = (title: string) => {
    setDialogTitle(title);
    setOpenDialog(true);
    setNumericValue("");
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const updateData = (newData: any, dataType: any) => {
    if (dataType === "Spent") {
      setSpentData(newData);
    } else if (dataType === "Income") {
      setIncomeData(newData);
    }
  };

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [open, setOpen] = useState(false);

  const handleClickOpenRegisters = () => {
    refetch();
    setOpen(true);
  };

  const handleCloseRegisters = () => {
    setOpen(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTypeValueMutation(
        {
          registro: {
            id: id
          },
          token: token
        }
      );
      refetch(); // Refrescar los datos desde la consulta
    } catch (error) {
      console.error("Error al eliminar el valor:", error);
    }
  };

  const handleEdit = (title: string, rowId: string) => {
    setDialogTitle(title);
    setOpenDialog(true);
    setrowId(rowId);
    const itemToUpdate = dataResponseRegisters.find((item: { _id: string; }) => item._id === rowId);
    setItemToUpdate(itemToUpdate);
    const refetchFunction = async () => {
      await refetch();
      console.log("Data refetched successfully.");
    };
  };

  useEffect(() => {
    if (dataResponseRegisters) {
      const filtered = filterRecordsByMonthAndYear(dataResponseRegisters, currentMonth, currentYear);
      setFilteredRecords(filtered);
    }
  }, [dataResponseRegisters, currentMonth, currentYear]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  }, []);
  
  return (
    <Container component="main" maxWidth="md" className={`fade-in-vertical ${isVisible ? 'active' : ''} common-styles  component-container`}>
      <CssBaseline />
      <div>
        <Typography variant="h5" align="center" gutterBottom>
          Inventory
        </Typography>
        <form className={"form"}>
          { }
          { }
          { }
          <div className="buttonsContainer" style={{ display: 'flex', justifyContent: 'center' }}>
            <Fab
              color="primary"
              onClick={() => handleClickOpen("Spent")}
            >
              <Typography variant="body2" style={{ fontSize: '0.65rem', marginRight: '5px' }}> New</Typography>
              <PostAddIcon />
            </Fab>
          </div>
          <Dialog
            open={openDialog}
            TransitionComponent={Slide}
            keepMounted
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
          >
            { }
            { }
            <DialogContent style={{ maxHeight: 400, overflowY: 'scroll' }}>
              {dialogTitle === "Spent" && (
                <TableAddRegister
                  userId={userId}
                  title={dialogTitle}
                  typevalue="Spent"
                  data={spentData}
                  addTypeValueMutation={addTypeValueMutation}
                  token={token}
                  updateData={updateData}
                  refetch={refetch}
                  itemToUpdate={null}
                />
              )}
              {dialogTitle === "Income" && (
                <TableAddRegister
                  userId={userId}
                  title={dialogTitle}
                  typevalue="Income"
                  data={incomeData}
                  addTypeValueMutation={addTypeValueMutation}
                  token={token}
                  updateData={updateData}
                  refetch={refetch}
                  itemToUpdate={null}
                />
              )}
              {dialogTitle === "Edit Register" && (
                <TableAddRegister
                  userId={userId}
                  title={dialogTitle}
                  typevalue="Edit Register"
                  data={dataEdit || []}
                  addTypeValueMutation={addTypeValueMutation}
                  token={token}
                  updateData={updateData}
                  refetch={refetch}
                  itemToUpdate={itemToUpdate}
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
          { }
          <TableContainer  >
            <Table>
              <TableHead>
                <TableRow>
                  { }
                  <TableCell sx={{ fontWeight: 'bold' }}>Product ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Brand</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Utility</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}> </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { }
                {dataResponseRegisters && dataResponseRegisters.length > 0 ? (
                  dataResponseRegisters.map((row: any) => (
                    <TableRow key={row._id}>
                      <TableCell>{row.productId}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.utility}</TableCell>
                      <TableCell>{row.price}</TableCell>
                      <TableCell>{row.amount}</TableCell>
                      <TableCell>
                        <IconButton
                          aria-label="edit"
                          onClick={() => {
                            handleCloseRegisters();
                            handleEdit("Edit Register", row._id);
                          }}
                        >
                          <EditIcon color="primary" />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDelete(row._id)} //node js
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
export default Inventory;
