import React, { FunctionComponent, useEffect, useState } from "react";
import { Container, CssBaseline, Typography, IconButton, Box, Tab, Tabs } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { PieChart } from "@mui/x-charts/PieChart";
import { useSelector } from "react-redux";
import { useGetProductsByUserIdInvoiceQuery } from '../slices/productInvoicesApiSlice';
import Switch from '@mui/material/Switch';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaidIcon from '@mui/icons-material/Paid';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';

const Home: FunctionComponent = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [filterByType, setFilterByType] = useState('Purchase');
  const userId = useSelector((state: any) => state.auth.userInfo._id);
  const token = useSelector((state: any) => state.auth.token);
  const { data: dataResponseRegisters } = useGetProductsByUserIdInvoiceQuery({
    data: {
      idUsuario: userId,
    },
    token: token,
  });
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const years = Array.from({ length: 3 }, (_: any, i: number) => currentYear - 1 + i);
  const allDates = years.map((year: any) => `${year}`);
  const handleNextDate = () => {
    const currentIndex = allDates.indexOf(`${currentYear}`);
    if (currentIndex < allDates.length - 1) {
      const selectedYear = allDates[currentIndex + 1];
      setCurrentYear(Number(selectedYear));
    }
  };
  const handlePreviousDate = () => {
    const currentIndex = allDates.indexOf(`${currentYear}`);
    if (currentIndex > 0) {
      const selectedYear = allDates[currentIndex - 1];
      setCurrentYear(Number(selectedYear));
    }
  };

  type Record = {
    totalSales: number;
    _id: string;
    idUsuario: string;
    invoiceType: string;
    invoiceID: number;
    productId: number;
    name: string;
    description: string;
    price: number;
    amount: number;
    createdAt: string;
    updatedAt: string;
    utility: number;
    dateIssue: string;
  };

  function filterRecordsByYear(records: any[], targetYear: number) {
    if (!records) {
      return [];
    }
    return records.filter((record) => {
      const recordDate = new Date(record.dateIssue);
      const recordYear = recordDate.getFullYear();
      return recordYear === targetYear;
    });
  }
  
  const handleTabClick = (event: React.SyntheticEvent, newValue: number) => {
    const selectedYear = allDates[newValue];
    setCurrentYear(Number(selectedYear));
  };
  let sumaDeValores = 0;
  if (dataResponseRegisters) {
    console.log('Reports - dataResponseRegisters:');
    console.log(dataResponseRegisters);
    sumaDeValores = dataResponseRegisters.reduce((total: any, item: { subTotal: any }) => total + item.subTotal, 0);
  }
  const registrosDelYearSeleccionado = filterRecordsByYear(dataResponseRegisters, currentYear);
  console.log("registrosDelYearSeleccionado:");
  console.log(registrosDelYearSeleccionado);
  const tipoColores: { [key: string]: string } = {};
  registrosDelYearSeleccionado.forEach((registro: Record) => {
    if (!tipoColores[registro.invoiceType]) {
      tipoColores[registro.invoiceType] = getRandomColor();
    }
  });
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  const tipoFiltrado = filterByType === 'All' ? registrosDelYearSeleccionado : registrosDelYearSeleccionado.filter((registro) => registro.invoiceType === filterByType);
  let sumaDeValoresDelMes = 0;
  if (tipoFiltrado) {
    console.log('tipoFiltrado:');
    console.log(tipoFiltrado);
    let sumaDeValoresDelMes: number;
    if (filterByType === "Purchase") {
      sumaDeValoresDelMes = tipoFiltrado.reduce((total: number, item: any) => total + (item.amount * item.price), 0);
    } else if (filterByType === "Sales") {
      sumaDeValoresDelMes = tipoFiltrado.reduce((total: number, item: any) => total + (item.amount * (item.price + (item.price * (item.utility / 100) || 0))), 0);
    } else {
      console.error("Tipo de filtro no vÃ¡lido");
    }
    console.log('sumaDeValoresDelMes:' + getTopSellingProducts(tipoFiltrado, filterByType));
  }
  function sumPriceByDescription(records: Record[]): Record[] {
    const summarizedRecords: { [description: string]: Record } = {};
    records.forEach((record) => {
      const key = record.description;
      if (!summarizedRecords[key]) {
        summarizedRecords[key] = { ...record };
      } else {
        summarizedRecords[key].price += record.price;
      }
    });
    const result: Record[] = Object.values(summarizedRecords);
    return result;
  }
  function getTopSellingProducts(records: Record[], targetInvoiceType: string): Record[] {
    const filteredRecords = records.filter((record) => record.invoiceType === targetInvoiceType);
    const productSalesMap: { [productId: number]: number } = {};
    filteredRecords.forEach((record) => {
      const productSales = (() => {
        switch (targetInvoiceType) { // Cambiado de filterByType a targetInvoiceType
          case "Purchase":
            return record.price * record.amount;
          case "Sales":
            return record.amount * (record.price + (record.price * record.utility || 0));
          default:
            console.error("Tipo de filtro no vÃ¡lido");
            return 0;
        }
      })();
      productSalesMap[record.productId] = (productSalesMap[record.productId] || 0) + productSales;
    });
    const sortedProducts = Object.keys(productSalesMap)
      .map((productId) => ({
        productId: parseInt(productId),
        totalSales: productSalesMap[parseInt(productId)],
      }))
      .sort((a, b) => b.totalSales - a.totalSales);
    const uniqueProductMap: { [productId: number]: Record } = {};
    filteredRecords.forEach((record) => {
      uniqueProductMap[record.productId] = uniqueProductMap[record.productId] || { ...record, totalSales: 0 };
      uniqueProductMap[record.productId].totalSales += productSalesMap[record.productId];
    });
    const topSellingProducts = Object.values(uniqueProductMap);
    return tipoFiltrado;
  }
  function calcularYModificar(records: Record[]): Record[] {
    const acumulador: Record[] = [];
    console.log("records:");
    console.log(records);
    records.forEach((record) => {
      const existingRecord = acumulador.find((r) => r.description === record.description);
      if (existingRecord) {
        existingRecord.amount += record.amount;
      } else {
        acumulador.push({ ...record });
      }
    });
    console.log("acumulador:");
    console.log(acumulador);
    return acumulador;
  }
  const topSellingProducts = calcularYModificar(tipoFiltrado);
  console.log('topSellingProducts:');
  console.log(topSellingProducts);
  const pieChartData = topSellingProducts.map((product) => ({
    value: (() => {
      switch (filterByType) {
        case "Purchase":
          return product.price * product.amount;
        case "Sales":
          return product.amount * (product.price + (product.price * (product.utility / 100) || 0));
        default:
          console.error("Tipo de filtro no vÃ¡lido");
          return 0; // Otra opciÃ³n podrÃ­a ser asignar un valor predeterminado o lanzar una excepciÃ³n
      }
    })(),
    label: product.description,
    fill: tipoColores[filterByType], // Puedes ajustar esto segÃºn sea necesario
  }));
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  }, []);
  const generateMonthlyChartData = (records: Record[]) => {
    if (!records || records.length === 0) {
      console.error("No hay registros para procesar en el grÃ¡fico");
      return { originalData: [], xAxisData: [{ data: [], scaleType: 'band' as const }] };
    }
    const type = "Sales";
    const filteredRecords = records.filter(record => record.invoiceType === type);
    if (filteredRecords.length === 0) {
      console.error(`No hay registros de tipo ${type}`);
      return { originalData: [], xAxisData: [{ data: [], scaleType: 'band' as const }] };
    }
    const monthlyChartData: { month: string; totalSales: number }[] = [];
    const salesByMonth: { [month: string]: number } = {};
    filteredRecords.forEach((record) => {
      if (record.dateIssue) {
        const date = new Date(record.dateIssue);
        const monthKey = date.toLocaleString('en-US', { month: 'short' });
        const sales = record.price * (record.utility / 100) * record.amount;
        if (salesByMonth[monthKey] === undefined) {
          salesByMonth[monthKey] = sales;
        } else {
          salesByMonth[monthKey] += sales;
        }
      } else {
        console.error(`Registro sin propiedad 'dateIssue': ${JSON.stringify(record)}`);
      }
    });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((month) => {
      monthlyChartData.push({ month, totalSales: salesByMonth[month] || 0 });
    });
    const originalData = monthlyChartData.map(entry => entry.totalSales);
    const xAxisData: { data: string[]; scaleType: 'band' }[] = [
      { data: months, scaleType: 'band' as const }
    ];
    return { originalData, xAxisData };
  };
  const { originalData, xAxisData } = generateMonthlyChartData(registrosDelYearSeleccionado);
  const formatData = (data: any[]) => {
    return data.map(value => `$${value.toFixed(1)}k`);
  };
  const formattedData = formatData(originalData);
  const seriesData = [{ data: originalData }];
  const isChartDataEmpty = seriesData.length === 0 || xAxisData[0].data.length === 0;
  const height = 240;
  const margin = { top: 20, bottom: 50, left: 50, right: 20 };
  const generateMonthlyChartDataPurchase = (records: Record[]) => {
    if (!records || records.length === 0) {
      console.error("No hay registros para procesar en el grÃ¡fico");
      return { originalDataPurchase: [], xAxisDataPurchase: [{ data: [], scaleType: 'band' as const }] };
    }
    console.log('Purchase records');
    console.log(records);
    const type = "Purchase";
    const filteredRecords = records.filter(record => record.invoiceType === type);
    console.log('Purchase filteredRecords');
    console.log(filteredRecords);
    if (filteredRecords.length === 0) {
      console.error(`No hay registros de tipo ${type}`);
      return { originalDataPurchase: [], xAxisDataPurchase: [{ data: [], scaleType: 'band' as const }] };
    }
    const monthlyChartData: { month: string; totalSales: number }[] = [];
    const salesByMonth: { [month: string]: number } = {};
    filteredRecords.forEach((record) => {
      if (record.dateIssue) {
        console.log("c/record" + record.invoiceID + " " + record.price * record.amount);
        const date = new Date(record.dateIssue);
        const monthKey = date.toLocaleString('en-US', { month: 'short' }); // Usar 'short' para obtener abreviaturas de meses
        const sales = record.price * record.amount;
        if (salesByMonth[monthKey] === undefined) {
          salesByMonth[monthKey] = sales;
        } else {
          salesByMonth[monthKey] += sales;
          console.log("suma de invoice: " + salesByMonth[monthKey]);
        }
      } else {
        console.error(`Registro sin propiedad 'dateIssue': ${JSON.stringify(record)}`);
      }
    });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((month) => {
      monthlyChartData.push({ month, totalSales: salesByMonth[month] || 0 });
    });
    console.log('Purchase monthlyChartData');
    console.log(monthlyChartData);
    const originalDataPurchase = monthlyChartData.map(entry => entry.totalSales);
    const xAxisDataPurchase: { data: string[]; scaleType: 'band' }[] = [
      { data: months, scaleType: 'band' as const }
    ];
    console.log(originalDataPurchase); // [132000, 180000, 0, 0, ...]
    console.log(xAxisDataPurchase); // [{ data: ["Jan", "Feb", ...], scaleType: 'band' }]
    return { originalDataPurchase, xAxisDataPurchase };
  };
  const { originalDataPurchase, xAxisDataPurchase } = generateMonthlyChartDataPurchase(registrosDelYearSeleccionado);
  const formatDataPurchase = (data: any[]) => {
    return data.map(value => `$${value.toFixed(1)}k`);
  };
  const formattedDataPurchase = formatDataPurchase(originalDataPurchase);
  const seriesDataPurchase = [{ data: originalDataPurchase }];
  const isChartDataEmptyPurchase = !xAxisDataPurchase || xAxisDataPurchase.length === 0 || xAxisDataPurchase[0].data.length === 0;
  const heightPurchase = 240;
  const marginPurchase = { top: 20, bottom: 50, left: 50, right: 20 };

  return (
    <Container component="main" maxWidth="xs" className={`fade-in-vertical ${isVisible ? 'active' : ''} common-styles component-container`}>
      <CssBaseline />
      <div style={{ textAlign: "center" }}>
        <Typography variant="h5" align="center" gutterBottom>
          Home
        </Typography>
        { }
        <Box display="flex" alignItems="center" justifyContent="center">
          <IconButton onClick={handlePreviousDate}>
            <ArrowBackIcon />
          </IconButton>
          <Tabs
            value={years.indexOf(currentYear)}
            onChange={handleTabClick}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {allDates.map((year, index) => (
              <Tab key={year} label={year} value={index} style={{ width: "100%" }} />
            ))}
          </Tabs>
          <IconButton onClick={handleNextDate}>
            <ArrowForwardIcon />
          </IconButton>
        </Box>
        {/* // <Typography variant="h6">
        <div style={{ minWidth: '400px', minHeight: '240px' }}>
        <h4 style={{ fontWeight: 'bold', textAlign: 'left', marginBottom: '5px' }}>{"Profit per year"}</h4>
        {isChartDataEmpty ? (
          <div style={{ minWidth: '400px', minHeight: '240px' }}>
          <p style={{ margin: 0 }}>There is no data for the Profit by Year chart.</p>
            </div>
          ) : (
            <LineChart
            series={seriesData}
            height={height}
            xAxis={xAxisData}
            margin={margin}
            />
          )}
          <h4 style={{ fontWeight: 'bold', textAlign: 'left', marginBottom: '5px' }}>{"Purchases per year"}</h4>
          {isChartDataEmptyPurchase ? (
            <div style={{ minWidth: '400px', minHeight: '240px' }}>
            <p style={{ margin: 0 }}>There is no data for the Purchases by Year chart.</p>
              </div>
            ) : (
              <LineChart
              series={seriesDataPurchase}
              height={heightPurchase}
              xAxis={xAxisDataPurchase}
              margin={marginPurchase}
              />
            )}
            </div>
            </div>
            </Container>
          );
        };
export default Home;
