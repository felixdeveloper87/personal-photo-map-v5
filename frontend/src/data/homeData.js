import {
  FaMapMarkedAlt,
  FaCamera,
  FaGlobe,
  FaUsers,
  FaRocket,
  FaStar,
  FaGraduationCap,
  FaChartLine,
  FaUniversity,
  FaBookOpen,
  FaGlobeAmericas,
  FaLightbulb,
  FaBrain
} from 'react-icons/fa';

export const features = [
  {
    icon: FaMapMarkedAlt,
    title: 'Interactive World Map',
    description: 'Explore countries through an interactive map with real-time data and educational insights for comprehensive global learning.',
    color: 'blue',
    gradient: 'linear(135deg, blue.400, cyan.500)'
  },
  {
    icon: FaGraduationCap,
    title: 'Educational Data',
    description: 'Access comprehensive economic, social, and cultural information for every country worldwide with verified sources.',
    color: 'purple',
    gradient: 'linear(135deg, purple.400, pink.500)'
  },
  {
    icon: FaCamera,
    title: 'Photo Organization',
    description: 'Organize your travel photos by country and create visual memories with educational context and learning insights.',
    color: 'green',
    gradient: 'linear(135deg, green.400, teal.500)'
  },
  {
    icon: FaChartLine,
    title: 'Real-time Statistics',
    description: 'View live economic indicators, population data, and social metrics from trusted sources with interactive visualizations.',
    color: 'orange',
    gradient: 'linear(135deg, orange.400, red.500)'
  }
];

export const educationalFeatures = [
  {
    icon: FaUniversity,
    title: 'Economic Indicators',
    description: 'GDP, PIB per capita, growth rates, inflation, and debt-to-GDP ratios from World Bank data with trend analysis.',
    color: 'teal',
    gradient: 'linear(135deg, teal.400, green.500)'
  },
  {
    icon: FaUsers,
    title: 'Social Metrics',
    description: 'Life expectancy, literacy rates, internet usage, urbanization, and health expenditure data with comparative analysis.',
    color: 'pink',
    gradient: 'linear(135deg, pink.400, purple.500)'
  },
  {
    icon: FaGlobeAmericas,
    title: 'Cultural Insights',
    description: 'Native languages, currencies, capitals, and demographic information with cultural context.',
    color: 'indigo',
    gradient: 'linear(135deg, indigo.400, blue.500)'
  },
  {
    icon: FaBookOpen,
    title: 'Geographic Data',
    description: 'Real-time weather, time zones, population statistics, and regional classifications with interactive maps.',
    color: 'cyan',
    gradient: 'linear(135deg, cyan.400, blue.500)'
  }
];

export const benefits = [
  {
    title: 'Learning Through Travel',
    description: 'Transform your travel experiences into educational opportunities with comprehensive country data and interactive learning modules.',
    icon: FaLightbulb,
    color: 'yellow',
    gradient: 'linear(135deg, yellow.400, orange.500)'
  },
  {
    title: 'Data-Driven Insights',
    description: 'Access real-time economic and social indicators from authoritative sources like World Bank with advanced analytics.',
    icon: FaChartLine,
    color: 'blue',
    gradient: 'linear(135deg, blue.400, cyan.500)'
  },
  {
    title: 'Cultural Understanding',
    description: 'Deepen your knowledge of world cultures and social development patterns through comprehensive research tools.',
    icon: FaGlobeAmericas,
    color: 'green',
    gradient: 'linear(135deg, green.400, teal.500)'
  },
  {
    title: 'Academic Research',
    description: 'Use reliable data for studies, presentations, or personal research on global development with citation-ready sources.',
    icon: FaBookOpen,
    color: 'purple',
    gradient: 'linear(135deg, purple.400, pink.500)'
  }
];

export const testimonials = [
  {
    name: 'Dr. Sarah Johnson',
    location: 'Geography Professor, NYU',
    text: 'This platform is incredible for teaching global development. The real-time data and interactive map make complex concepts accessible to students.',
    rating: 5,
    avatar: '👩‍🏫'
  },
  {
    name: 'Michael Chen',
    location: 'International Business Analyst, London',
    text: 'Perfect for understanding economic indicators and social metrics of countries I visit. The World Bank integration is invaluable.',
    rating: 5,
    avatar: '👨‍💼'
  },
  {
    name: 'Emma Rodriguez',
    location: 'Cultural Anthropologist, Barcelona',
    text: "I love how I can explore cultural data alongside my travel photos. It's like having a comprehensive world encyclopedia!",
    rating: 5,
    avatar: '👩‍🎓'
  }
];

export const learningSteps = [
  {
    step: '01',
    title: 'Explore Countries',
    description: 'Click on any country to access comprehensive educational data and statistics',
    icon: FaGlobe
  },
  {
    step: '02',
    title: 'Analyze Data',
    description: 'Study economic indicators, social metrics, and cultural information from trusted sources',
    icon: FaChartLine
  },
  {
    step: '03',
    title: 'Document & Learn',
    description: 'Upload photos and create a personal learning journey with visual context',
    icon: FaCamera
  }
];
