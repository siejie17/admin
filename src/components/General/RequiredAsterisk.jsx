import React from 'react';
import { Typography, Box } from '@mui/material';

const RequiredAsterisk = () => {
  return (
    <Box component="span" sx={{ display: 'inline', color: 'error.main', ml: 0.5 }}>
      *
    </Box>
  );
};

export default RequiredAsterisk;