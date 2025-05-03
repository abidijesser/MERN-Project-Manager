// material-ui
import { useTheme } from '@mui/material/styles';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

export default function LogoMain() {
  const theme = useTheme();
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill={theme.palette.primary.main} />
          <path d="M8 10H24V12H8V10ZM8 15H24V17H8V15ZM8 20H24V22H8V20Z" fill="white" />
          <path d="M22 6H26V26H22V6ZM6 6H10V26H6V6Z" fill={theme.palette.primary.dark} />
        </svg>
        <span
          style={{
            marginLeft: '8px',
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black
          }}
        >
          WorkTrack
        </span>
      </div>
    </>
  );
}
