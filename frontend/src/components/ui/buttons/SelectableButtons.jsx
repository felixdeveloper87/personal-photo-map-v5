import React from "react";
import { Button, Box, useColorModeValue, Icon } from "@chakra-ui/react";
import { motion, useSpring, useTransform } from "framer-motion";
import { IoCheckmarkCircle, IoCheckmark } from "react-icons/io5";

const MotionButton = motion.create(Button);

// Ripple animation variant
const rippleVariants = {
  initial: { scale: 0, opacity: 0.4 },
  animate: {
    scale: 4,
    opacity: 0,
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
  },
  exit: { opacity: 0, scale: 0 },
};

// Shine/shimmer effect
const shineVariants = {
  initial: { x: "-100%" },
  animate: {
    x: ["-100%", "200%"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
      repeatDelay: 3,
    },
  },
};

export const ShowAllButton = ({ isSelected, onClick, children }) => {
  const [clickPosition, setClickPosition] = React.useState(null);
  const bgColor = useColorModeValue("white", "gray.800");
  const selectedBg = useColorModeValue("blue.500", "blue.400");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClickPosition({ x, y });
    setTimeout(() => setClickPosition(null), 600);
    onClick?.();
  };

  return (
    <motion.div
      initial={false}
      animate={{
        scale: isSelected ? 1.02 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ position: "relative", display: "inline-block" }}
    >
      <Box
        as={motion.div}
        position="relative"
        overflow="hidden"
        borderRadius={{ base: "lg", sm: "xl", md: "xl" }}
        whileHover={{
          scale: 1.05,
          y: -2,
        }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
        onMouseDown={handleClick}
        cursor="pointer"
        _hover={{
          boxShadow: isSelected
            ? "0 8px 20px rgba(59, 130, 246, 0.3)"
            : "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Shine effect */}
        {isSelected && (
          <motion.div
            variants={shineVariants}
            initial="initial"
            animate="animate"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Ripple effect */}
        {clickPosition && (
          <motion.div
            variants={rippleVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: "absolute",
              left: clickPosition.x,
              top: clickPosition.y,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.6)",
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}

        <Button
          bg={isSelected ? selectedBg : bgColor}
          color={isSelected ? "white" : textColor}
          colorScheme={isSelected ? "blue" : "gray"}
          borderRadius={{ base: "lg", sm: "xl", md: "xl" }}
          size={{ base: "xs", sm: "sm", md: "sm" }}
          fontWeight="semibold"
          px={{ base: 2, sm: 3, md: 4 }}
          py={{ base: 1, sm: 2, md: 2 }}
          fontSize={{ base: "xs", sm: "sm", md: "sm" }}
          border="none"
          position="relative"
          zIndex={2}
          _hover={{
            bg: isSelected ? selectedBg : hoverBg,
            transform: "none",
          }}
          transition="all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
        >
          {isSelected && (
            <Icon
              as={IoCheckmark}
              boxSize={3}
              mr={1}
              style={{
                animation: "slideIn 0.3s ease-out",
              }}
            />
          )}
          {children || "Show All"}
        </Button>
      </Box>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-5px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </motion.div>
  );
};

// Reusable enhanced button component
const EnhancedSelectableButton = ({ 
  children, 
  isSelected, 
  onClick, 
  icon, 
  ...props 
}) => {
  const [clickPosition, setClickPosition] = React.useState(null);
  const bgColor = useColorModeValue("white", "gray.800");
  const selectedBg = useColorModeValue("blue.500", "blue.400");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClickPosition({ x, y });
    setTimeout(() => setClickPosition(null), 600);
    onClick?.();
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          scale: isSelected ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ position: "relative", display: "inline-block" }}
      >
        <Box
          as={motion.div}
          position="relative"
          overflow="hidden"
          borderRadius={{ base: "lg", sm: "xl", md: "xl" }}
          whileHover={{
            scale: 1.05,
            y: -2,
          }}
          whileTap={{ scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17,
          }}
          onMouseDown={handleClick}
          cursor="pointer"
          _hover={{
            boxShadow: isSelected
              ? "0 8px 20px rgba(59, 130, 246, 0.3)"
              : "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Shine effect */}
          {isSelected && (
            <motion.div
              variants={shineVariants}
              initial="initial"
              animate="animate"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Ripple effect */}
          {clickPosition && (
            <motion.div
              variants={rippleVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: "absolute",
                left: clickPosition.x,
                top: clickPosition.y,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.6)",
                pointerEvents: "none",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}

          <Button
            bg={isSelected ? selectedBg : bgColor}
            color={isSelected ? "white" : textColor}
            colorScheme={isSelected ? "blue" : "gray"}
            borderRadius={{ base: "lg", sm: "xl", md: "xl" }}
            size={{ base: "xs", sm: "sm", md: "sm" }}
            fontWeight="semibold"
            px={{ base: 2, sm: 3, md: 4 }}
            py={{ base: 1, sm: 2, md: 2 }}
            fontSize={{ base: "xs", sm: "sm", md: "sm" }}
            border="none"
            position="relative"
            zIndex={2}
            _hover={{
              bg: isSelected ? selectedBg : hoverBg,
              transform: "none",
            }}
            transition="all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
            {...props}
          >
            {isSelected && (
              <Icon
                as={IoCheckmark}
                boxSize={3}
                mr={1}
                style={{
                  animation: "slideIn 0.3s ease-out",
                }}
              />
            )}
            {icon && <Icon as={icon} boxSize={3} mr={1} />}
            {children}
          </Button>
        </Box>

        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-5px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </motion.div>
    </>
  );
};

export const YearSelectableButton = ({ year, isSelected, onClick }) => (
  <EnhancedSelectableButton
    isSelected={isSelected}
    onClick={onClick}
  >
    {year}
  </EnhancedSelectableButton>
);

export const AlbumSelectableButton = ({ album, isSelected, onClick }) => (
  <EnhancedSelectableButton
    isSelected={isSelected}
    onClick={onClick}
  >
    {album.name}
  </EnhancedSelectableButton>
);
