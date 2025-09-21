import { Button, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
    FaSignInAlt,
    FaSignOutAlt,
    FaUserPlus,
    FaStream,

    FaUsers,
    FaCloudUploadAlt,
    FaChartLine
} from "react-icons/fa";
import { WarningTwoIcon } from '@chakra-ui/icons';

const MotionButton = motion.create(Button);

const BaseButton = ({
    children,
    icon,
    gradient = "primary",
    variant = "solid",
    ...props
}) => {
    const { colorMode } = useColorModeValue({ colorMode: 'light' }, { colorMode: 'dark' });
    
    const gradients = {
        // Primary actions - azul confiável e profissional
        primary: {
            light: {
                bg: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                hover: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                color: "white"
            },
            dark: {
                bg: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                hover: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                color: "white"
            }
        },
        // Secondary actions - verde para ações positivas
        secondary: {
            light: {
                bg: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                hover: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white"
            },
            dark: {
                bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                hover: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                color: "white"
            }
        },
        // Success actions - verde mais vibrante para confirmações
        success: {
            light: {
                bg: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                hover: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "white"
            },
            dark: {
                bg: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                hover: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                color: "white"
            }
        },
        // Warning actions - laranja para ações que precisam de atenção
        warning: {
            light: {
                bg: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
                hover: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white"
            },
            dark: {
                bg: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                hover: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                color: "white"
            }
        },
        // Danger actions - vermelho para ações destrutivas
        danger: {
            light: {
                bg: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)",
                hover: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white"
            },
            dark: {
                bg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                hover: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                color: "white"
            }
        },
        // Info actions - azul claro para informações
        info: {
            light: {
                bg: "linear-gradient(135deg, #67e8f9 0%, #06b6d4 100%)",
                hover: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                color: "white"
            },
            dark: {
                bg: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                hover: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                color: "white"
            }
        },
        // Premium actions - dourado para funcionalidades premium
        premium: {
            light: {
                bg: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                hover: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "black"
            },
            dark: {
                bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                hover: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                color: "black"
            }
        },
        // Neutral actions - cinza para ações secundárias
        neutral: {
            light: {
                bg: "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
                hover: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                color: "white"
            },
            dark: {
                bg: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                hover: "linear-gradient(135deg, #4b5563 0%, #374151 100%)",
                color: "white"
            }
        }
    };

    // Seleciona o tema atual (light ou dark)
    const currentTheme = colorMode === 'dark' ? 'dark' : 'light';
    const g = gradients[gradient]?.[currentTheme] || gradients.primary[currentTheme];

    return (
        <MotionButton
            leftIcon={icon}
            variant={variant}
            size="md"
            bgGradient={variant === "solid" ? g.bg : undefined}
            color={variant === "solid" ? g.color : g.hover}
            borderColor={variant === "outline" ? g.hover : undefined}
            borderRadius="xl"
            fontWeight="600"
            letterSpacing="wide"
            _hover={{
                bgGradient: variant === "solid" ? g.hover : undefined,
                bg: variant === "outline" ? `${gradient}.50` : undefined,
                boxShadow: useColorModeValue(
                    "0 8px 25px rgba(0, 0, 0, 0.15)",
                    "0 8px 25px rgba(0, 0, 0, 0.3)"
                ),
                transform: "translateY(-2px)"
            }}
            _active={{
                transform: "translateY(0px)",
                boxShadow: useColorModeValue(
                    "0 4px 15px rgba(0, 0, 0, 0.1)",
                    "0 4px 15px rgba(0, 0, 0, 0.2)"
                )
            }}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {children}
        </MotionButton>
    );
};

export const UploadButton = (props) => (
    <BaseButton
        icon={<FaCloudUploadAlt />}
        gradient="success"
        width="100%"
        {...props}
    >
        Upload
    </BaseButton>
);

export const DeleteButton = (props) => (
    <BaseButton icon={<WarningTwoIcon />} gradient="danger" {...props}>
        {props.children || "Delete"}
    </BaseButton>
);

export const DeleteAlbum = (props) => (
    <BaseButton 
        icon={<WarningTwoIcon />} 
        gradient="danger" 
        size={{ base: "xs", sm: "sm", md: "sm" }}
        mb={{ base: 1, sm: 2, md: 2 }}
        px={{ base: 2, sm: 3, md: 4 }}
        py={{ base: 1, sm: 2, md: 2 }}
        {...props} 
    >
        {props.children || "Delete Album"}
    </BaseButton>
);

export const CreateAlbumButton = (props) => (
    <BaseButton 
        gradient="success" 
        size={{ base: "sm", sm: "md", md: "md" }}
        {...props}
    >
        {props.children || "Create Album"}
    </BaseButton>
);

export const YearButton = ({ isActive, children, ...props }) => (
    <BaseButton
        gradient={isActive ? "primary" : "neutral"}
        variant={isActive ? "solid" : "outline"}
        size={{ base: "sm", sm: "md", md: "md" }}
        {...props}
    >
        {children}
    </BaseButton>
);

export const DeleteByYearButton = ({ year, ...props }) => (
  <BaseButton
    icon={<WarningTwoIcon />}
    gradient="danger"
    fontWeight="semibold"
    size={{ base: "xs", sm: "sm", md: "sm" }}
    borderRadius={{ base: "lg", sm: "xl", md: "xl" }}
    boxShadow="md"
    px={{ base: 2, sm: 3, md: 4 }}
    py={{ base: 1, sm: 2, md: 2 }}
    {...props}
  >
    Delete Images of {year}
  </BaseButton>
);

export const DeleteAllByYearButton = ({ year, ...props }) => (
  <BaseButton
    icon={<WarningTwoIcon />}
    gradient="danger"
    size={{ base: "xs", sm: "sm", md: "sm" }}
    borderRadius={{ base: "lg", sm: "xl", md: "xl" }}
    boxShadow="md"
    px={{ base: 2, sm: 3, md: 4 }}
    py={{ base: 1, sm: 2, md: 2 }}
    {...props}
  >
    Delete All {year}
  </BaseButton>
);

