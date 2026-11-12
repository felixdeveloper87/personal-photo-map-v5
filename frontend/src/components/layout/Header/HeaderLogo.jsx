import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Wordmark from '../../ui/Wordmark';

// `styles` is accepted for backwards compatibility; the wordmark reads Atlas tokens directly.
// eslint-disable-next-line no-unused-vars
const HeaderLogo = ({ styles }) => {
  const navigate = useNavigate();
  return <Wordmark mark="logo" tagline="Journey through photos" onClick={() => navigate('/')} />;
};

export default memo(HeaderLogo);
