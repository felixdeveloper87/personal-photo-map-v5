// theme.js
import { extendTheme } from '@chakra-ui/react';

const config = {
    initialColorMode: 'light',
    useSystemColorMode: false,
};

const fonts = {
    heading: `'Montserrat', sans-serif`,
    body: `'Inter', sans-serif`,
};

const styles = {
    global: (props) => ({
        body: {
            bgGradient:
                props.colorMode === 'light'
                    ? 'linear(to-r, rgb(235, 238, 239),rgb(186, 225, 230))'
                    : 'linear(to-r,rgb(49, 50, 50),rgb(22, 47, 72))',
            color: props.colorMode === 'light' ? 'gray.900' : 'gray.100',
            fontFamily: 'body',
        },
    }),
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
