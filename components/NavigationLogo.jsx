import { ButtonBase } from '@mui/material';
import Image from 'next/image';
import PropTypes from 'prop-types';
import React from 'react';

export default function NavigationLogo({ fullSize = false }) {
  const imgSrc = fullSize ? '/cv_logo_small.svg' : '/cv_logo_inline.svg';
  return (
    <ButtonBase className="nav-logo" href="/" sx={{ py: fullSize ? 2 : 1, height: '100%' }}>
      <Image src={imgSrc} height={43} width={273} alt="Clearviction logo" />
    </ButtonBase>
  );
}

NavigationLogo.propTypes = {
  fullSize: PropTypes.bool,
};
