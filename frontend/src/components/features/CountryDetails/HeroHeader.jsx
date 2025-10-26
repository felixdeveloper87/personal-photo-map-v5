import {
  Box,
  Flex,
  Text,
  IconButton,
  useColorModeValue,
  useDisclosure,
  Collapse,
  Button,
  Grid,
  chakra,
  useBreakpointValue,
} from '@chakra-ui/react'
import { ArrowBackIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import countries from 'i18n-iso-countries'
import moment from 'moment-timezone'
import { FaLanguage, FaUsers, FaThermometerHalf, FaChartLine, FaPoundSign, FaHeartbeat, FaChartBar, FaPlane, FaBed } from 'react-icons/fa'
import EnhancedFlag from './EnhancedFlag'
import InfoBox from './InfoBox'
import BaseModal from '../../modals/BaseModal'
import IndicatorsModal from './IndicatorsModal'

export default function HeroHeader({
  countryId,
  countryInfo,
  weatherData,
  currentTime,
  exchangeRate,
  indicatorsData,
  factbookData,
  navigate,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isExpanded, onToggle } = useDisclosure({ defaultIsOpen: true })

  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textPrimary = useColorModeValue('gray.900', 'gray.100')
  const textSecondary = useColorModeValue('gray.600', 'gray.400')
  const dateFaded = useColorModeValue('gray.500', 'gray.400')
  const isSmall = useBreakpointValue({ base: true, md: false })
  const buttonText = useBreakpointValue({ base: 'View Data', sm: 'View Data', md: 'View Indicators' })
  const flightsButtonText = useBreakpointValue({ base: 'Flights', md: 'Check Flights' })
  const hotelsButtonText = useBreakpointValue({ base: 'Hotels', md: 'Find Hotels' })

  const countryName =
    countries.getName(countryId?.toUpperCase() || '', 'en') || countryId?.toUpperCase()

  const dateFormatted = weatherData?.timezone
    ? moment().utcOffset(weatherData.timezone / 60).format('DD/MM/YYYY')
    : moment().format('DD/MM/YYYY')

  const headerBg = useColorModeValue(
    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
  )

  // Linha principal (País • Capital • Hora • Data)
  const OneLine = () => (
    <Text
      fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
      color={textPrimary}
      noOfLines={1}
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
    >
      <chakra.span fontWeight="bold">{countryName}</chakra.span>
      {countryInfo?.capital && (
        <chakra.span color={textSecondary}> • {countryInfo.capital}</chakra.span>
      )}
      <chakra.span color={textSecondary}> • {currentTime}</chakra.span>
      <chakra.span
        color={isSmall ? dateFaded : textSecondary}
        fontSize={isSmall ? '10px' : 'inherit'}
      >
        {' '}
        • {dateFormatted}
      </chakra.span>
    </Text>
  )

   const compactBoxProps = {
     size: 'compact',
     sx: {
       p: { base: 1.5, sm: 2, md: 3 },
       minH: { base: '70px', sm: '80px', md: '100px' },
       fontSize: { base: '10px', sm: 'xs', md: 'sm' },
       '.chakra-icon': { fontSize: { base: '14px', sm: '16px', md: '18px' } },
       '.chakra-text': {
         fontSize: { base: '9px', sm: '10px', md: 'xs' },
       },
     },
   }

  return (
    <Box mb={2} w="100%">
      {/* Header principal */}
      <Box
        bg={headerBg}
        px={{ base: 3, sm: 4, md: 6 }}
        py={{ base: 2, sm: 3 }}
        borderRadius="md"
        border="1px solid"
        borderColor={borderColor}
        boxShadow={useColorModeValue(
          '0 2px 10px rgba(0,0,0,0.05)',
          '0 2px 10px rgba(0,0,0,0.25)'
        )}
      >
        <Grid templateColumns="auto 1fr auto" alignItems="center" columnGap={2}>
          <IconButton
            aria-label="Go back"
            icon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            size="sm"
            variant="ghost"
            colorScheme="blue"
          />

          <Box minW={0} textAlign="center">
            <OneLine />
          </Box>

          <IconButton
            aria-label="Toggle details"
            icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={onToggle}
            size="sm"
            variant="ghost"
            colorScheme="blue"
          />
        </Grid>
      </Box>

      {/* Detalhes colapsáveis */}
      <Collapse in={isExpanded} animateOpacity>
  <Box
    mt={4}
    borderRadius="lg"
    border="1px solid"
    borderColor={borderColor}
    p={{ base: 3, sm: 4, md: 5 }}
    boxShadow={useColorModeValue(
      '0 4px 12px rgba(0,0,0,0.06)',
      '0 4px 12px rgba(0,0,0,0.3)'
    )}
    bg={useColorModeValue('rgba(255,255,255,0.7)', 'rgba(0,0,0,0.3)')}
    backdropFilter="blur(12px)"
  >
    <Flex
      direction={{ base: 'column', md: 'row' }}
      align="stretch"
      gap={{ base: 4, md: 6 }}
    >
      {/* ====== LEFT: FLAG ====== */}
      <Box
        flex={{ base: 'none', md: '1 1 45%' }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderRadius="lg"
        overflow="hidden"
        h={{ base: '180px', sm: '200px', md: '280px', lg: '320px' }}
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.600')}
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow="md"
        position="relative"
        sx={{
          backgroundImage: useColorModeValue(
            `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(59, 130, 246, 0.08) 10px,
                rgba(59, 130, 246, 0.08) 20px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 10px,
                rgba(139, 92, 246, 0.08) 10px,
                rgba(139, 92, 246, 0.08) 20px
              ),
              radial-gradient(circle at 20% 50%, rgba(59,130,246,0.12), transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(139,92,246,0.12), transparent 50%)
            `,
            `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(59,130,246,0.05) 10px,
                rgba(59,130,246,0.05) 20px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 10px,
                rgba(139,92,246,0.05) 10px,
                rgba(139,92,246,0.05) 20px
              ),
              radial-gradient(circle at 20% 50%, rgba(59,130,246,0.08), transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(139,92,246,0.08), transparent 50%)
            `
          ),
          backgroundSize: '40px 40px, 40px 40px, 100% 100%, 100% 100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: useColorModeValue(
              'radial-gradient(circle, rgba(59,130,246,0.5) 1px, transparent 1px)',
              'radial-gradient(circle, rgba(139,92,246,0.3) 1px, transparent 1px)'
            ),
            backgroundSize: '20px 20px',
            opacity: useColorModeValue(0.4, 0.25),
            pointerEvents: 'none',
          },
        }}
      >
        <EnhancedFlag countryCode={countryId?.toUpperCase()} isHero={false} />
      </Box>

      {/* ====== RIGHT: INFOBOXES + BUTTONS ====== */}
      <Flex
        flex={{ base: 'none', md: '1 1 55%' }}
        direction="column"
        justify="space-between"
      >
        {/* InfoBoxes line */}
        <Grid
          templateColumns="repeat(3, 1fr)"
          gap={{ base: 2, sm: 3 }}
          mb={{ base: 3, md: 4 }}
          w="full"
        >
          <InfoBox
            icon={FaLanguage}
            label="Language"
            value={countryInfo?.officialLanguage}
            colorScheme="orange"
            {...compactBoxProps}
          />
          <InfoBox
            icon={FaUsers}
            label="Population"
            value={
              countryInfo?.population
                ? countryInfo.population.toLocaleString('en-US')
                : 'N/A'
            }
            colorScheme="green"
            {...compactBoxProps}
          />
          <InfoBox
            icon={FaThermometerHalf}
            label="Temperature"
            value={
              weatherData?.temperature !== undefined
                ? `${weatherData.temperature}°C`
                : 'N/A'
            }
            colorScheme="red"
            {...compactBoxProps}
          />
        </Grid>

        {/* Second row of InfoBoxes - Only visible on MD+ */}
        <Grid
          templateColumns="repeat(3, 1fr)"
          gap={{ base: 2, sm: 3 }}
          mb={{ base: 3, md: 4 }}
          w="full"
          display={{ base: 'none', md: 'grid' }}
        >
          <InfoBox
            icon={FaChartLine}
            label="GDP per capita"
            value={indicatorsData?.gdpPerCapitaCurrent?.value || 'N/A'}
            colorScheme="purple"
            {...compactBoxProps}
          />
          <InfoBox
            icon={FaPoundSign}
            label="Exchange Rate"
            value={exchangeRate ? `£1 = ${exchangeRate} ${countryInfo?.currency || ''}` : 'N/A'}
            colorScheme="teal"
            {...compactBoxProps}
          />
          <InfoBox
            icon={FaHeartbeat}
            label="Life Expectancy"
            value={indicatorsData?.lifeExpectancy?.value || 'N/A'}
            colorScheme="pink"
            {...compactBoxProps}
          />
        </Grid>

        {/* Buttons full-width */}
        <Grid
          templateColumns="repeat(3, 1fr)"
          gap={{ base: 1.5, sm: 2 }}
          w="full"
        >
          <Button
            onClick={onOpen}
            leftIcon={<FaChartBar />}
            bg="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
            color="white"
            size="sm"
            borderRadius="lg"
            height={{ base: '40px', md: '44px' }}
            fontWeight="600"
            fontSize={{ base: 'xs', sm: 'sm' }}
            boxShadow="md"
            sx={{
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
              bg: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            }}
            _active={{
              transform: 'translateY(0px)',
              boxShadow: 'md',
            }}
            transition="all 0.2s ease"
          >
            {buttonText}
          </Button>
          <Button
            onClick={() =>
              window.open(
                `https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(
                  countryName
                )}`,
                '_blank'
              )
            }
            leftIcon={<FaPlane />}
            variant="outline"
            borderWidth="2px"
            borderColor="green.400"
            color={useColorModeValue('green.600', 'green.300')}
            size="sm"
            borderRadius="lg"
            height={{ base: '40px', md: '44px' }}
            fontWeight="600"
            fontSize={{ base: 'xs', sm: 'sm' }}
            bg={useColorModeValue('white', 'gray.800')}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
              bg: useColorModeValue('green.50', 'green.900'),
              borderColor: 'green.500',
            }}
            _active={{
              transform: 'translateY(0px)',
            }}
            transition="all 0.2s ease"
          >
            {flightsButtonText}
          </Button>
          <Button
            onClick={() =>
              window.open(
                `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
                  countryName
                )}`,
                '_blank'
              )
            }
            leftIcon={<FaBed />}
            variant="outline"
            borderWidth="2px"
            borderColor="yellow.400"
            color={useColorModeValue('yellow.600', 'yellow.300')}
            size="sm"
            borderRadius="lg"
            height={{ base: '40px', md: '44px' }}
            fontWeight="600"
            fontSize={{ base: 'xs', sm: 'sm' }}
            bg={useColorModeValue('white', 'gray.800')}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
              bg: useColorModeValue('yellow.50', 'yellow.900'),
              borderColor: 'yellow.500',
            }}
            _active={{
              transform: 'translateY(0px)',
            }}
            transition="all 0.2s ease"
          >
            {hotelsButtonText}
          </Button>
        </Grid>
      </Flex>
    </Flex>
  </Box>
</Collapse>


      {/* Modal de Indicadores */}
      <BaseModal isOpen={isOpen} onClose={onClose} title="Detailed Indicators">
        <IndicatorsModal
          indicatorsData={indicatorsData}
          weatherData={weatherData}
          exchangeRate={exchangeRate}
          countryInfo={countryInfo}
          factbookData={factbookData}
        />
      </BaseModal>
    </Box>
  )
}
