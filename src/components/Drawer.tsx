import React, { FunctionComponent, useState } from 'react';
import { Drawer as MUIDrawer } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Inventory2Icon from '@mui/icons-material/Inventory2';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

const Drawer: FunctionComponent<DrawerProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleItemClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div>
      <MUIDrawer anchor="left" open={open} onClose={onClose}>
        <List>
          <ListItem button onClick={() => handleItemClick('/home')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button onClick={() => handleItemClick('/billing')}>
            <ListItemIcon>
              <ReceiptLongIcon />
            </ListItemIcon>
            <ListItemText primary="Billing" />
          </ListItem>
          <ListItem button onClick={() => handleItemClick('/inventory')}>
            <ListItemIcon>
              <Inventory2Icon />
            </ListItemIcon>
            <ListItemText primary="Inventory" />
          </ListItem>
          <ListItem button onClick={() => handleItemClick('/reports')}>
            <ListItemIcon>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="Reports" />
          </ListItem>
        </List>
      </MUIDrawer>
    </div>
  );
};

export default Drawer;