import React, { FunctionComponent, useState, useEffect, useRef } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Autocomplete,
  IconButton,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { toast } from "react-toastify";
import { useUpdateInvoiceMutation } from '../slices/invoicesApiSlice';
import { useGetProductsByUserIdQuery } from '../slices/productApiSlice'; // Import the hook
import { useAddProductInvoiceMutation } from '../slices/productInvoicesApiSlice';
import { useGetGenerateIdInvoiceQuery } from '../slices/invoicesApiSlice';
import { useGetProductsByUserIdInvoiceQuery } from '../slices/productInvoicesApiSlice';
import { useUpdateProductAmountMutation } from '../slices/productApiSlice';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  amount: number;
  dateIssue: string;
  utility: number;
}

interface TableConfigProps {
  userId: string;
  title: string;
  data: {
    _id: string;
    subtype: string;
  }[];
  typevalue: string;
  addInvoiceMutation: any;
  token: string;
  updateData: (newData: any, dataType: string) => void;
  refetch: () => void;
  itemToUpdate: any;
  setOpenDialog: any;
}

const TableAddBilling: FunctionComponent<TableConfigProps> = ({
  userId,
  title,
  data,
  typevalue,
  addInvoiceMutation,
  token,
  updateData,
  refetch,
  itemToUpdate,
  setOpenDialog
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSubtype, setNewSubtype] = useState("");
  const [originalSubtype, setOriginalSubtype] = useState("");
  const [addNewSubtype, setAddNewSubtype] = useState("");
  const [isNumericKeyboardOpen, setIsNumericKeyboardOpen] = useState(true);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [updateInvoice] = useUpdateInvoiceMutation();
  const [addProductInvoiceMutation] = useAddProductInvoiceMutation();
  const [updateProductAmount] = useUpdateProductAmountMutation();
  const [descRegistro, setDescRegistro] = useState(
    itemToUpdate && typevalue === "View" ? itemToUpdate.descRegistro : ""
  );
  const [subTotal, setSubTotal] = useState(
    itemToUpdate && typevalue === "View" ? itemToUpdate.subTotal : 0
  );
  const [dateIssue, setDateIssue] = useState(
    itemToUpdate && typevalue === "View" ? formatDate(itemToUpdate.dateIssue) : ""
  );
  const [taxes, setTaxes] = useState(
    itemToUpdate && typevalue === "View" ? itemToUpdate.taxes : ""
  );
  const [invoiceID, setInvoiceID] = useState(
    itemToUpdate && typevalue === "View" ? itemToUpdate.invoiceID : ""
  );
  const [customer, setCustomer] = useState(
    itemToUpdate && typevalue === "View" ? itemToUpdate.customer : ""
  );
  const [paymentSell, setPaymentSell] = useState(
    itemToUpdate && typevalue === "View" ? itemToUpdate.paymentSell : ""
  );
  const [provider, setProvider] = useState(
    itemToUpdate && typevalue === "View" ? itemToUpdate.provider : ""
  );
  const [paymentBuy, setPaymentBuy] = useState(
    itemToUpdate && typevalue === "View" ? itemToUpdate.paymentBuy : ""
  );
  const paymentSellOptions = ['ðŸ’µ Cash', 'ðŸ’³ Credit Card', 'ðŸ’³ Debit Card', 'ðŸ“ Check', 'ðŸ–¥ï¸ Online Payment'];
  const [invoiceId, setInvoiceId] = useState(
    itemToUpdate && typevalue === "View" ? itemToUpdate.invoiceID : ""
  );
  const [searchTerm, setSearchTerm] = useState('');

  const [searchResults, setSearchResults] = useState<Array<{
    invoiceID: number;
    invoiceType: string;
    productId: number;
    name: string;
    description: string;
    utility: number;
    price: number;
    amount: number;
    dateIssue: string;
  }>>([]);
  
  const [selectedProduct, setSelectedProduct] = useState<{
    invoiceID: number;
    invoiceType: string;
    productId: number;
    name: string;
    description: string;
    utility: number;
    price: number;
    amount: number;
    dateIssue: string;
  } | null>(null);
  const [confirmAddDialogOpen, setConfirmAddDialogOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [invalidationKey, setInvalidationKey] = useState<number>(0); // Estado para la clave de invalidaciÃ³n
  const [editableAmount, setEditableAmount] = useState('');
  const [productAmounts, setProductAmounts] = useState<{ [productId: number]: number }>({});

  const [searchResultsUpdated, setSearchResultsUpdated] = useState<Array<{
    invoiceID: number;
    invoiceType: string;
    productId: number;
    name: string;
    description: string;
    utility: number;
    price: number;
    amount: number;
  }>>([]);

  const { data: dataResponseRegisters, isLoading, refetch: refetchProducts } =
    useGetProductsByUserIdQuery({
      data: {
        idUsuario: userId,
      },
      token: token,
    });

  const { data: dataProductsInvoicesRegisters, refetch: customRefetch } = useGetProductsByUserIdInvoiceQuery({
    data: {
      idUsuario: userId
    },
    token: token,
  });

  const { data: generateIdData, error: generateIdError, refetch: generateIdRefetch } = useGetGenerateIdInvoiceQuery({
    data: { invoiceId: typevalue },
    token: token
  });

  useEffect(() => {
    if (itemToUpdate && typevalue === "View") {
      const { descRegistro, subTotal, dateIssue, taxes, invoiceID, customer, paymentSell, provider, paymentBuy } = itemToUpdate;
      setDescRegistro(descRegistro || "");
      setSubTotal(subTotal || "");
      setDateIssue(formatDate(dateIssue) || "");
      setTaxes(taxes || "");
      setInvoiceID(invoiceID || "");
      setCustomer(customer || "");
      setPaymentSell(paymentSell || "");
      setProvider(provider || "");
      setPaymentBuy(paymentBuy || "");
    } else {
      setDescRegistro("");
      setSubTotal("");
      setDateIssue("");
      setTaxes("");
      setInvoiceID("");
      setCustomer("");
      setPaymentSell("");
      setProvider("");
      setPaymentBuy("");
    }
  }, [itemToUpdate, typevalue]);

  useEffect(() => {
    console.log("itemToUpdate ha cambiado en TableAddRegister:", itemToUpdate);
  }, [itemToUpdate]);

  useEffect(() => {
    if (!editingId) {
      setAddNewSubtype("");
    }
  }, [editingId]);
  useEffect(() => {
    if (editingId && tableRef.current) {
      const rowElement = tableRef.current.querySelector(`#row-${editingId}`);
      if (rowElement) {
        rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [editingId, tableRef]);

  useEffect(() => {
    console.log("dataResponseRegisters");
    console.log(dataResponseRegisters)
    if (dataResponseRegisters) {
    }
  }, [dataResponseRegisters]);
  useEffect(() => {
    console.log(generateIdData);
    if (generateIdData) {
      console.log("InvoiceId");
      console.log(typeof invoiceId);
      console.log("generateIdData.sequence_value:");
      console.log(typeof generateIdData.sequence_value);
      setInvoiceId(generateIdData.sequence_value);
      console.log("valor de InvoiceId:");
      console.log(invoiceId);
    }
  }, [generateIdData]);
  if (generateIdError) {
    console.error('Error obteniendo el ID generado:', generateIdError);
  }

  useEffect(() => {
    if (typevalue === 'View') {
      console.log("en useEffect");
      if (dataProductsInvoicesRegisters) {
        console.log("invoiceID en dataProductsInvoicesRegisters");
        console.log(invoiceID);
        const dataInvoiceIdProducts = dataProductsInvoicesRegisters.filter((item: { invoiceID: any; }) => item.invoiceID === invoiceID);
        setFilteredData(dataInvoiceIdProducts);
      }
    } else {
      setFilteredData([]);
    }
  }, [typevalue, invoiceID, dataProductsInvoicesRegisters, searchResults, refetch]);
  
  function formatDate(dateString: string | number | Date) {
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0); // Forzar la zona horaria a UTC
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const calculateTotal = async () => {
    try {
      let totalSum = 0;
      for (const product of searchResultsUpdated) {
        console.log('FOR - product:');
        console.log(product);
        let multiplicationResult = 0;
        if (typevalue === 'Sales') {
          multiplicationResult = (product.price + (product.price * (product.utility / 100))) * product.amount;
        } else if (typevalue === 'Purchase') {
          multiplicationResult = product.price * product.amount;
        } else {
          console.error('Tipo de valor no reconocido');
        }
        if (!isNaN(multiplicationResult)) {
          totalSum += multiplicationResult;
        }
      }
      return totalSum;
    } catch (error) {
      console.error('Error al calcular el total:', error);
      throw error;
    }
  };

  const handleAdd = async () => {
    if (!dateIssue) {
      if (!dateIssue) {
        toast.error("You must select a valid dateIssue.");
      }
      return;
    }
    try {
      const totalSum = await calculateTotal();
      setInvoiceId(generateIdData.sequence_value);
      console.log("en addInvoiceMutation invoiceID"); // prioblema asÃ­ncrono!!
      console.log(invoiceID);
      const response = await addInvoiceMutation({
        registro: {
          invoiceID: generateIdData.sequence_value,
          invoiceType: typevalue,
          dateIssue: dateIssue,
          subTotal: totalSum,
          taxes: (totalSum * 0.19).toFixed(0),
          customer: customer,
          paymentSell: paymentSell,
          provider: provider,
          paymentBuy: paymentBuy,
          idUsuario: userId
        },
        token: token,
      });
      console.log("data:");
      console.log(data);
      generateIdRefetch(); //test
      refetch();
    } catch (error) {
      console.error("Error al agregar el nuevo valor:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewSubtype(originalSubtype);
  };

  const openNumericKeyboard = () => {
    setIsNumericKeyboardOpen(true);
  };
  
  const closeNumericKeyboard = () => {
    setIsNumericKeyboardOpen(false);
  };

  const handleNumericButtonClick = (number: number) => {
    setSubTotal((prevValue: string) => prevValue + number.toString());
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (editingId) {
      } else {
        handleAdd();
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (editingId) {
        handleCancelEdit();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dateIssue || !descRegistro) {
      if (!dateIssue) {
        toast.error("Debes seleccionar una dateIssue vÃ¡lida.");
      }
      if (!descRegistro) {
        toast.error("You must select a type.");
      }
      return;
    }
    try {
    } catch (error) {
      console.error("Error al agregar el nuevo valor:", error);
    }
  };

  const handleEdit = async () => {
    try {
      console.log("itemToUpdate");
      console.log(itemToUpdate);
      if (!itemToUpdate) {
        console.error("Elemento no encontrado para actualizar");
        return;
      }
      console.log("en handle edit invoiceID");
      console.log(invoiceID);
      const updatedItem = {
        invoiceID: invoiceID,
        invoiceType: typevalue,
        dateIssue: dateIssue,
        subTotal: subTotal,
        taxes: taxes,
        customer: customer,
        paymentSell: paymentSell,
        provider: provider,
        paymentBuy: paymentBuy,
      };
      await updateInvoice(
        {
          id: itemToUpdate._id,
          registro: updatedItem,
          token: token
        }
      );
      refetch();
    } catch (error) {
      console.error("Error al editar el registro:", error);
    }
  };

  const handlePaymentSellChange = (event: { target: { value: any; }; }) => {
    setPaymentSell(event.target.value);
  };

  const handlePaymentBuyChange = (event: { target: { value: any; }; }) => {
    setPaymentBuy(event.target.value);
  };

  const handleSearch = () => {
    const filteredResults = dataResponseRegisters.filter(
      (product: { name: string; productId: number; }) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productId.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filteredResults);
  };

  const handleCreateInvoice = () => {
    setConfirmAddDialogOpen(true);
  };

  const confirmAddToCart = async () => {
    try {
      setProductAmounts((prevAmounts) => {
        const updated = { ...prevAmounts };
        updated[selectedProduct!.productId] = Number(editableAmount);
        return updated;
      });
      setSearchResults((prev) => [...prev, selectedProduct!]);
      setSelectedProduct(null);
      setSearchTerm('');
      setConfirmAddDialogOpen(false);
      await refetchProducts();
      setSearchResults((prevResults) =>
        prevResults.map((product) => {
          const updated = dataResponseRegisters.find(
            (p: { productId: number; }) => p.productId === product.productId
          );
          return updated
            ? { ...product, amount: updated.amount }
            : product;
        })
      );
      toast.success('Product successfully added with updated information.');
    } catch (err) {
      console.error('Error en confirmAddToCart:', err);
      toast.error('Hubo un error al agregar el producto');
    }
  };

  const cancelAddToCart = () => {
    setConfirmAddDialogOpen(false);
  };
  const handleDeleteFromList = (productIdToDelete: number) => {
    console.log('Deleting product with ID:', productIdToDelete);
    console.log('Previous results:', searchResults);
    setSearchResults((prevResults) => {
      const newResults = prevResults.filter((product) => product.productId !== productIdToDelete);
      console.log('New results:', newResults);
      return newResults;
    });
  };

  const handleConfirmAll = async () => {
    try {
      await refetchProducts();
      for (const originalProduct of searchResults) {
        const amountIngresado = productAmounts[originalProduct.productId];
        const invoiceID = generateIdData.sequence_value;
        const productToSendToInvoice = {
          ...originalProduct,
          invoiceID,
          invoiceType: typevalue,
          amount: amountIngresado,
          dateIssue: dateIssue,
          idUsuario: userId
        };
        const updatedAmount =
          typevalue === 'Purchase'
            ? originalProduct.amount + amountIngresado
            : originalProduct.amount - amountIngresado;
        const productToUpdate = {
          productId: originalProduct.productId,
          name: originalProduct.name,
          description: originalProduct.description,
          price: originalProduct.price,
          amount: updatedAmount,
          utility: originalProduct.utility,
        };
        await updateProductAmount({
          registro: productToUpdate,
          token: token,
        });
        const response = await addProductInvoiceMutation({
          registro: productToSendToInvoice,
          token: token,
        });
        console.log('Factura registrada:', response);
        searchResultsUpdated.push(productToSendToInvoice);
      }
      handleForceReload();
      setSearchResults([]);
      toast.success('The invoice has been successfully issued.');
    } catch (error) {
      console.error('Error al confirmar productos:', error);
      toast.error('Hubo un error al confirmar los productos');
    }
  };

  const handleAmountChange = (productId: number, newValue: number) => {
    setProductAmounts((prevAmounts) => ({
      ...prevAmounts,
      [productId]: newValue,
    }));
  };
  const handleEditAmount = (productId: number) => {
    const updatedAmount = productAmounts[productId];
    console.log(`Product ${productId} amount updated to ${updatedAmount}`);
  };
  const handleForceReload = () => {
    setInvalidationKey((prevKey) => prevKey + 1);
    customRefetch(); // Llama a la funciÃ³n de refetch aquÃ­
  };
  const isAutocompleteDisabled = typevalue === 'View';
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!dateIssue || (!provider && !paymentBuy) || (!customer && !paymentSell)) {
      if (!dateIssue) {
        toast.error("You must select a valid dateIssue.");
        return;
      }
      if (typevalue == "Purchase") {
        if (!provider) {
          toast.error("You must enter a valid provider.");
          return;
        }
        if (!paymentBuy) {
          toast.error("You must enter a valid paymentBuy.");
          return;
        }
      }
      if (typevalue == "Sales") {
        if (!customer) {
          toast.error("You must enter a valid customer.");
          return;
        }
        if (!paymentSell) {
          toast.error("You must enter a valid paymentSell.");
          return;
        }
      }
      if (searchResults.length === 0) {
        toast.error("You must add products to the list.");
        return;
      }
    }
    try {
      setLoading(true);
      await handleConfirmAll();
      await handleAdd();
      setLoading(false);
      setOpenDialog(false);
      setConfirmAddDialogOpen(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };
  const isReadOnly = typevalue === 'View';
  
  return (
    <form onSubmit={handleAdd}>
      <div>
        <Typography variant="h6" gutterBottom>
          { }
          {itemToUpdate ? "ðŸ“‹" + itemToUpdate.invoiceType + ' Invoice' : `${title} Invoice`}
        </Typography>
        <br />
        <Grid container spacing={2}>
          { }
          <Grid item xs={6} style={{ width: '50%' }}>
            { }
            <TextField
              label="Invoice ID"
              variant="standard"
              type="text"
              value={invoiceId}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          { }
          <Grid item xs={6} >
            { }
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Date"
                value={dayjs(dateIssue)}
                onChange={(newValue) => {
                  if (newValue !== null) {
                    setDateIssue(newValue.format('MM-DD-YYYY'));
                  }
                }}
                disabled={isReadOnly}
                components={{
                  TextField: (props) => <TextField {...props} variant="standard" /> // Forzamos el estilo standard
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={6}>
            {(typevalue === 'Purchase' || (itemToUpdate && (typevalue === 'View' && itemToUpdate.invoiceType === 'Purchase'))) && (
              <TextField
                label="Provider"
                variant="standard"
                type="text"
                value={provider || ""}
                fullWidth
                onChange={(e) => setProvider(e.target.value)}
                InputProps={{
                  readOnly: isReadOnly,
                }}
              />
            )}
          </Grid>
          <Grid item xs={6}>
            {(typevalue === 'Purchase' || (itemToUpdate && (typevalue === 'View' && itemToUpdate.invoiceType === 'Purchase'))) && (
              <FormControl fullWidth variant="standard">
                <InputLabel id="paymentSell-label">Payment Buy</InputLabel>
                <Select
                  labelId="paymentSell-label"
                  id="paymentSell"
                  value={paymentBuy}
                  onChange={handlePaymentBuyChange}
                  label="Payment Buy"
                  variant="standard"
                  inputProps={{
                    readOnly: isReadOnly, // Usa inputProps para aplicar readOnly
                  }}
                >
                  {paymentSellOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
          <Grid item xs={6}>
            {(typevalue === 'Sales' || (itemToUpdate && (typevalue === 'View' && itemToUpdate.invoiceType === 'Sales'))) && (
              <TextField
                label="Customer"
                variant="standard"
                type="text"
                value={customer || ""}
                fullWidth
                onChange={(e) => setCustomer(e.target.value)}
                InputProps={{
                  readOnly: isReadOnly,
                }}
              />
            )}
          </Grid>
          <Grid item xs={6}>
            {(typevalue === 'Sales' || (itemToUpdate && (typevalue === 'View' && itemToUpdate.invoiceType === 'Sales'))) && (
              <FormControl fullWidth variant="standard">
                <InputLabel id="paymentSell-label">Payment Sell</InputLabel>
                <Select
                  labelId="paymentSell-label"
                  id="paymentSell"
                  value={paymentSell}
                  onChange={handlePaymentSellChange}
                  label="Payment Sell"
                  variant="standard"
                  inputProps={{
                    readOnly: isReadOnly, // Usa inputProps para aplicar readOnly
                  }}
                >
                  {paymentSellOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
          { }
          {typevalue === 'View' && (
            <>
              { }
              <Grid item xs={6}>
                <TextField
                  label="Taxes"
                  variant="standard"
                  type="text"
                  value={"$" + taxes || ""}
                  fullWidth
                  onChange={(e) => setTaxes(e.target.value)}
                  InputProps={{
                    readOnly: isReadOnly,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Sub Total"
                  variant="standard"
                  type="text"
                  value={"$" + subTotal || ""}
                  fullWidth
                  onChange={(e) => setSubTotal(e.target.value)}
                  InputProps={{
                    readOnly: isReadOnly,
                  }}
                />
              </Grid>
            </>
          )}
          { }
        </Grid>
      </div>
      { }
      <br />
      { }
      <Grid item xs={6} style={{ width: '50%' }}>
        <Autocomplete
          options={dataResponseRegisters}
          getOptionLabel={(option) => option.description}
          value={selectedProduct}
          onChange={(_, newValue) => setSelectedProduct(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="ðŸ§º Search product by description"
              variant="standard"
              fullWidth
              value={typevalue === 'View' ? null : selectedProduct}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ display: isAutocompleteDisabled ? 'none' : 'block' }}
            />
          )}
        />
      </Grid>
      { }
      <br />
      { }
      <Button variant="contained" color="primary" onClick={confirmAddToCart} disabled={!selectedProduct}
        style={{ display: isAutocompleteDisabled ? 'none' : 'block' }}
      >
        Add to List
      </Button>
      <br />
      <div style={{ marginTop: '20px' }}>
        <Typography variant="h6" gutterBottom>
          ðŸ›’ Product list
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Product ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}> </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {typevalue === 'View'
                ? filteredData.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>{product.productId}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.amount}</TableCell>
                    <TableCell>{ }</TableCell>
                  </TableRow>
                ))
                : searchResults.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>{product.productId}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={productAmounts[Number(product.productId)] || 0}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          const numericValue = isNaN(Number(newValue)) ? 0 : Number(newValue);
                          handleAmountChange(product.productId, numericValue);
                        }}
                        onBlur={() => handleEditAmount(product.productId)}
                        inputProps={{ min: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDeleteFromList(product.productId)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          handleCreateInvoice()
        }}
        fullWidth
        style={{
          marginTop: 2,
          display: isReadOnly ? 'none' : 'block'  // Ocultar si isReadOnly es true
        }}
      >
        Generate Invoice
      </Button>
      <Dialog open={confirmAddDialogOpen} onClose={cancelAddToCart}>
        <DialogTitle>Confirm Add to List</DialogTitle>
        <DialogContent>
          Do you confirm that all the data is correct for the new invoice?
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelAddToCart} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClick} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};
export default TableAddBilling;
