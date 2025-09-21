import { Button } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionButton = motion.create(Button);

export const ShowAllButton = ({ isSelected, onClick, children }) => (
  <MotionButton
    colorScheme={isSelected ? "blue" : "gray"}
    onClick={onClick}
    borderRadius={{ base: "lg", sm: "xl", md: "xl" }}
    size={{ base: "xs", sm: "sm", md: "sm" }}
    fontWeight="semibold"
    px={{ base: 2, sm: 3, md: 4 }}
    py={{ base: 1, sm: 2, md: 2 }}
    fontSize={{ base: "xs", sm: "sm", md: "sm" }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
  >
    {children || "Show All"}
  </MotionButton>
);

export const YearSelectableButton = ({ year, isSelected, onClick }) => (
  <MotionButton
    colorScheme={isSelected ? "blue" : "gray"}
    onClick={onClick}
    borderRadius={{ base: "lg", sm: "xl", md: "xl" }}
    size={{ base: "xs", sm: "sm", md: "sm" }}
    fontWeight="semibold"
    px={{ base: 2, sm: 3, md: 4 }}
    py={{ base: 1, sm: 2, md: 2 }}
    fontSize={{ base: "xs", sm: "sm", md: "sm" }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
  >
    {year}
  </MotionButton>
);


export const AlbumSelectableButton = ({ album, isSelected, onClick }) => (
  <MotionButton
    colorScheme={isSelected ? "blue" : "gray"}
    onClick={onClick}
    borderRadius={{ base: "lg", sm: "xl", md: "xl" }}
    size={{ base: "xs", sm: "sm", md: "sm" }}
    fontWeight="semibold"
    px={{ base: 2, sm: 3, md: 4 }}
    py={{ base: 1, sm: 2, md: 2 }}
    fontSize={{ base: "xs", sm: "sm", md: "sm" }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
  >
    {album.name}
  </MotionButton>
);
