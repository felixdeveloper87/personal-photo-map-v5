// theme.js
import { extendTheme } from '@chakra-ui/react';

// Fixed dark cartographic identity — no user-facing theme switching.
const config = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
};

const fonts = {
    heading: `'Montserrat', sans-serif`,
    body: `'Inter', sans-serif`,
};

const styles = {
    global: {
        body: {
            bg: '#0A0C11',
            color: '#ECE7DC',
            fontFamily: 'body',
        },
    },
};

const components = {
    Button: {
        baseStyle: {
            fontWeight: 'semibold',
            borderRadius: 'md',
        },
        sizes: {
            md: {
                h: '40px',
                px: '20px',
                fontSize: 'md',
            },
        },
        variants: {
            solid: (props) => ({
                bg: `${props.colorScheme}.500`,
                color: props.colorMode === 'light' ? 'white' : 'gray.900',
                _hover: {
                    bg: `${props.colorScheme}.600`,
                },
            }),
            outline: (props) => ({
                border: '2px solid',
                borderColor: props.colorMode === 'light' ? 'teal.900' : 'teal.300',
                color: props.colorMode === 'light' ? 'teal.600' : 'teal.200',
                _hover: {
                    bg: props.colorMode === 'light' ? 'teal.50' : 'gray.700',
                },
            }),
        },
        defaultProps: {
            variant: 'solid',
            size: 'md',
            colorScheme: 'teal',
        },
    },
};

const theme = extendTheme({
    config,
    fonts,
    styles,
    components,
});

export default theme;