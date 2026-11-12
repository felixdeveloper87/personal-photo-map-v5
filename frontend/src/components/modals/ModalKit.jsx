/**
 * Atlas modal kit — building blocks shared by every modal.
 * Compose them inside <BaseModal>; see src/design/README.md for the rules.
 */
import { forwardRef, useState } from 'react';
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiEye,
  HiEyeSlash,
  HiInformationCircle,
  HiXCircle,
} from 'react-icons/hi2';
import { color, radius, resolveTone, type } from '../../design/tokens';

/* ─── Layout ──────────────────────────────────────────────────── */

/**
 * Footer action row. Put the secondary action first and the primary last:
 * desktop shows them right-aligned side by side, mobile stacks them full-width
 * with the primary on top (closest to the thumb is the safe choice).
 */
export const ModalActions = ({ children, align = 'end', stretch = false, ...props }) => (
  <Stack
    direction={{ base: 'column-reverse', sm: 'row' }}
    spacing={2.5}
    justify={align === 'between' ? 'space-between' : `flex-${align}`}
    w="full"
    sx={{ '& > *': { width: { base: '100%', sm: stretch ? '100%' : 'auto' }, flex: stretch ? { sm: 1 } : undefined } }}
    {...props}
  >
    {children}
  </Stack>
);

/** A titled group inside the body (mono eyebrow + optional action on the right). */
export const ModalSection = ({ title, icon, action, children, spacing = 3, ...props }) => (
  <Box {...props}>
    {(title || action) && (
      <HStack justify="space-between" align="center" mb={spacing}>
        <HStack spacing={2}>
          {icon && <Icon as={icon} boxSize={3.5} color={color.primary} />}
          <Text {...type.eyebrow} color={color.textMuted}>
            {title}
          </Text>
        </HStack>
        {action}
      </HStack>
    )}
    {children}
  </Box>
);

/** Inset panel — the standard container for grouped content inside a modal. */
export const Panel = forwardRef(function Panel({ children, tone, interactive = false, ...props }, ref) {
  const tn = tone ? resolveTone(tone) : null;
  return (
    <Box
      ref={ref}
      p={4}
      borderRadius={radius.lg}
      bg={tn ? tn.softer : 'rgba(236,231,220,0.025)'}
      border="1px solid"
      borderColor={tn ? tn.border : color.hairline}
      transition="border-color .2s ease, background .2s ease"
      _hover={interactive ? { borderColor: tn ? tn.fg : color.hairlineMid, bg: color.surfaceHover } : undefined}
      {...props}
    >
      {children}
    </Box>
  );
});

/** Hairline divider, optionally with a centred mono label ("or continue with"). */
export const ModalDivider = ({ label, ...props }) =>
  label ? (
    <HStack spacing={3} {...props}>
      <Box flex={1} h="1px" bg={color.hairline} />
      <Text {...type.label} color={color.textMuted} whiteSpace="nowrap">
        {label}
      </Text>
      <Box flex={1} h="1px" bg={color.hairline} />
    </HStack>
  ) : (
    <Box h="1px" bg={color.hairline} {...props} />
  );

/* ─── Atoms ───────────────────────────────────────────────────── */

/** Square icon tile in a tone — used in headers, list rows and stats. */
export const IconTile = ({ icon, tone = 'brand', size = 'md', ...props }) => {
  const tn = resolveTone(tone);
  const dims = { sm: ['32px', 3.5], md: ['40px', 4], lg: ['56px', 6] }[size] || ['40px', 4];
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w={dims[0]}
      h={dims[0]}
      minW={dims[0]}
      borderRadius={size === 'lg' ? radius.lg : radius.md}
      bg={tn.soft}
      border="1px solid"
      borderColor={tn.border}
      color={tn.fg}
      {...props}
    >
      <Icon as={icon} boxSize={dims[1]} />
    </Box>
  );
};

/** Small pill label (status, plan, counts). */
export const ToneBadge = ({ children, tone = 'brand', icon, ...props }) => {
  const tn = resolveTone(tone);
  return (
    <HStack
      as="span"
      display="inline-flex"
      spacing={1.5}
      px={2.5}
      py={1}
      borderRadius="full"
      bg={tn.soft}
      border="1px solid"
      borderColor={tn.border}
      color={tn.fg}
      {...props}
    >
      {icon && <Icon as={icon} boxSize={3} />}
      <Text as="span" {...type.label} color="inherit">
        {children}
      </Text>
    </HStack>
  );
};

/** Selectable chip (filters, year pickers, segmented options). */
export const Chip = ({ children, isActive = false, onClick, icon, ...props }) => (
  <Box
    as="button"
    type="button"
    onClick={onClick}
    aria-pressed={isActive}
    display="inline-flex"
    alignItems="center"
    justifyContent="center"
    gap={1.5}
    h="34px"
    px={3.5}
    borderRadius="full"
    fontSize="sm"
    fontWeight="600"
    border="1px solid"
    transition="all .15s ease"
    bg={isActive ? color.primary : 'rgba(236,231,220,0.03)'}
    color={isActive ? color.textOnBrand : color.textSoft}
    borderColor={isActive ? color.primary : color.hairlineMid}
    _hover={isActive ? undefined : { borderColor: color.primarySoftBorder, color: color.text, bg: color.primarySoftBg }}
    _focusVisible={{ outline: 'none', boxShadow: `0 0 0 3px ${color.focusRing}` }}
    {...props}
  >
    {icon && <Icon as={icon} boxSize={3.5} />}
    {children}
  </Box>
);

/** Two or more mutually exclusive options rendered as one control. */
export const Segmented = ({ options, value, onChange, ...props }) => (
  <HStack
    role="radiogroup"
    spacing={1}
    p={1}
    borderRadius={radius.md}
    bg={color.surfaceSubtle}
    border="1px solid"
    borderColor={color.hairline}
    w="full"
    {...props}
  >
    {options.map((opt) => {
      const active = opt.value === value;
      return (
        <Box
          key={opt.value}
          as="button"
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(opt.value)}
          flex={1}
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          h="38px"
          borderRadius="9px"
          fontSize="sm"
          fontWeight="600"
          transition="all .15s ease"
          bg={active ? color.surfaceRaised : 'transparent'}
          color={active ? color.text : color.textMuted}
          boxShadow={active ? `inset 0 0 0 1px ${color.primarySoftBorder}, 0 4px 14px -6px rgba(0,0,0,0.6)` : 'none'}
          _hover={active ? undefined : { color: color.text }}
          _focusVisible={{ outline: 'none', boxShadow: `0 0 0 3px ${color.focusRing}` }}
        >
          {opt.icon && <Icon as={opt.icon} boxSize={3.5} color={active ? color.primary : 'inherit'} />}
          {opt.label}
        </Box>
      );
    })}
  </HStack>
);

/** Metric tile: icon, big mono value, small label. */
export const ModalStat = ({ icon, value, label, tone = 'brand', ...props }) => (
  <Panel textAlign="center" py={4} px={3} {...props}>
    {icon && <IconTile icon={icon} tone={tone} size="sm" mb={2.5} />}
    <Text {...type.data} fontSize={{ base: 'lg', sm: 'xl' }} color={color.text}>
      {value}
    </Text>
    <Text {...type.label} color={color.textMuted} mt={1.5}>
      {label}
    </Text>
  </Panel>
);

/** Thin progress bar in a tone. */
export const ToneProgress = ({ value = 0, tone = 'brand', h = '6px', ...props }) => {
  const tn = resolveTone(tone);
  return (
    <Box w="full" h={h} borderRadius="full" bg={tn.soft} overflow="hidden" {...props}>
      <Box
        h="full"
        w={`${Math.max(0, Math.min(value, 100))}%`}
        borderRadius="full"
        bg={tn.fg}
        boxShadow={`0 0 10px ${tn.glow}`}
        transition="width .5s ease"
      />
    </Box>
  );
};

/* ─── Feedback ────────────────────────────────────────────────── */

const NOTICE_ICONS = {
  info: HiInformationCircle,
  success: HiCheckCircle,
  warning: HiExclamationTriangle,
  danger: HiXCircle,
  brand: HiInformationCircle,
};

/** Inline callout. Replaces Chakra <Alert> inside modals. */
export const ModalNotice = ({ tone = 'info', title, children, icon, action, ...props }) => {
  const tn = resolveTone(tone);
  return (
    <HStack
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      align="start"
      spacing={3}
      p={3.5}
      borderRadius={radius.md}
      bg={tn.softer}
      border="1px solid"
      borderColor={tn.border}
      {...props}
    >
      <Icon as={icon || NOTICE_ICONS[tone] || HiInformationCircle} boxSize={5} color={tn.fg} flexShrink={0} mt="1px" />
      <Box flex={1} minW={0}>
        {title && (
          <Text fontSize="sm" fontWeight="700" color={color.text} mb={children ? 0.5 : 0}>
            {title}
          </Text>
        )}
        {children && (
          <Box fontSize="sm" color={color.textSoft} lineHeight="1.55">
            {children}
          </Box>
        )}
      </Box>
      {action}
    </HStack>
  );
};

/** Centred loading / empty / error state for a modal body. */
export const ModalState = ({ kind = 'loading', icon, title, children, action, ...props }) => {
  const tn = resolveTone(kind === 'error' ? 'danger' : 'neutral');
  return (
    <VStack spacing={4} py={10} px={4} textAlign="center" {...props}>
      {kind === 'loading' ? (
        <Spinner size="lg" thickness="3px" speed="0.7s" color={color.primary} emptyColor={color.hairline} />
      ) : (
        <IconTile icon={icon || (kind === 'error' ? HiExclamationTriangle : HiInformationCircle)} tone={kind === 'error' ? 'danger' : 'neutral'} size="lg" />
      )}
      {title && (
        <Text {...(kind === 'loading' ? type.eyebrow : type.title)} color={kind === 'loading' ? color.textMuted : color.text}>
          {title}
        </Text>
      )}
      {children && (
        <Text {...type.body} color={kind === 'error' ? tn.fg : color.textSoft} maxW="360px">
          {children}
        </Text>
      )}
      {action}
    </VStack>
  );
};

/* ─── Forms ───────────────────────────────────────────────────── */

/**
 * Labelled input with optional leading icon, helper/error text and a built-in
 * show/hide toggle for `type="password"`. Styling comes from the Chakra theme.
 */
export const ModalField = forwardRef(function ModalField(
  { label, icon, error, helper, type: inputType = 'text', isRequired, children, rightElement, ...inputProps },
  ref
) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = inputType === 'password';
  const hasRight = isPassword || rightElement;

  return (
    <FormControl isInvalid={!!error} isRequired={isRequired}>
      {label && <FormLabel variant="atlas">{label}</FormLabel>}
      {children || (
        <InputGroup>
          {icon && (
            <InputLeftElement pointerEvents="none">
              <Icon as={icon} boxSize={3.5} />
            </InputLeftElement>
          )}
          <Input
            ref={ref}
            type={isPassword && revealed ? 'text' : inputType}
            pl={icon ? 10 : undefined}
            pr={hasRight ? 11 : undefined}
            {...inputProps}
          />
          {isPassword && (
            <InputRightElement>
              <IconButton
                aria-label={revealed ? 'Hide password' : 'Show password'}
                icon={<Icon as={revealed ? HiEyeSlash : HiEye} boxSize={4} />}
                size="sm"
                variant="unstyled"
                display="inline-flex"
                color={color.textMuted}
                _hover={{ color: color.text }}
                onClick={() => setRevealed((v) => !v)}
              />
            </InputRightElement>
          )}
          {!isPassword && rightElement && <InputRightElement>{rightElement}</InputRightElement>}
        </InputGroup>
      )}
      {helper && !error && <FormHelperText>{helper}</FormHelperText>}
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
});

/** Bullet row with a tone check icon (feature / benefit lists). */
export const CheckItem = ({ children, icon = HiCheckCircle, tone = 'brand' }) => (
  <HStack spacing={2.5} align="start">
    <Icon as={icon} boxSize={4} color={resolveTone(tone).fg} mt="2px" flexShrink={0} />
    <Text fontSize="sm" color={color.textSoft} lineHeight="1.55">
      {children}
    </Text>
  </HStack>
);
