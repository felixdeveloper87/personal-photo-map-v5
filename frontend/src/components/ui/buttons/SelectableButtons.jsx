import { Icon } from '@chakra-ui/react';
import { HiCheck } from 'react-icons/hi2';
import { Chip } from '../../modals/ModalKit';

/**
 * Atlas filter chips (years, albums, "show all").
 * Real <button>s with aria-pressed, so they work with keyboard and screen readers.
 */
const SelectableChip = ({ children, isSelected, onClick, icon, ...props }) => (
  <Chip
    isActive={isSelected}
    onClick={onClick}
    h={{ base: '32px', sm: '36px' }}
    px={{ base: 3, sm: 4 }}
    fontSize={{ base: 'xs', sm: 'sm' }}
    {...props}
  >
    {isSelected && <Icon as={HiCheck} boxSize={3.5} />}
    {!isSelected && icon && <Icon as={icon} boxSize={3.5} />}
    {children}
  </Chip>
);

export const ShowAllButton = ({ isSelected, onClick, children }) => (
  <SelectableChip isSelected={isSelected} onClick={onClick}>
    {children || 'Show All'}
  </SelectableChip>
);

export const YearSelectableButton = ({ year, isSelected, onClick }) => (
  <SelectableChip isSelected={isSelected} onClick={onClick} fontFamily="mono">
    {year}
  </SelectableChip>
);

export const AlbumSelectableButton = ({ album, isSelected, onClick }) => (
  <SelectableChip isSelected={isSelected} onClick={onClick}>
    {album.name}
  </SelectableChip>
);
