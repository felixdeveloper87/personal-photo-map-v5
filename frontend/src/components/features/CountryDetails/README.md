# CountryDetails Components

Esta pasta contém todos os componentes relacionados à página de detalhes do país, organizados de forma modular e profissional.

## Estrutura de Arquivos

```
CountryDetails/
├── index.js                    # Arquivo de índice para exportações
├── EnhancedFlag.jsx           # Componente de bandeira com fallback
├── InfoBox.jsx                # Componente de caixa de informação
├── HeroHeader.jsx             # Cabeçalho principal com bandeira e nome
├── AnalyticsSection.jsx       # Seção de análises e informações
├── TravelSection.jsx          # Seção de informações de viagem
├── PhotoGallerySection.jsx    # Seção da galeria de fotos
├── LoadingState.jsx           # Estado de carregamento
├── services.js                # Funções de API e serviços
└── README.md                  # Esta documentação
```

## Componentes

### EnhancedFlag.jsx
- Gerencia a exibição de bandeiras com sistema de fallback
- Suporte para diferentes formatos (SVG, PNG)
- Tratamento de erros e estados de carregamento

### InfoBox.jsx
- Componente reutilizável para exibir informações
- Suporte para ícones, labels e valores
- Esquemas de cores personalizáveis

### HeroHeader.jsx
- Cabeçalho principal da página
- Integra bandeira, nome do país e botão de voltar
- Grid de informações principais (tempo, capital, temperatura, etc.)

### AnalyticsSection.jsx
- Seção de análises econômicas e sociais
- Integra modais de informações detalhadas
- Dados do World Bank e CIA Factbook

### TravelSection.jsx
- Informações de viagem para a capital
- Link para Google Flights
- Renderização condicional baseada na disponibilidade de dados

### PhotoGallerySection.jsx
- Galeria de fotos do país
- Integra com o PhotoManager
- Design consistente com outros componentes

### LoadingState.jsx
- Estado de carregamento elegante
- Animação de pulso
- Mensagens informativas

## Serviços

### services.js
- `fetchCountryData()`: Busca dados básicos do país
- `fetchWeatherData()`: Busca dados meteorológicos
- `fetchExchangeRate()`: Busca taxas de câmbio
- Sistema de fallback para APIs

## Benefícios da Refatoração

1. **Manutenibilidade**: Cada componente tem uma responsabilidade específica
2. **Reutilização**: Componentes podem ser reutilizados em outras partes da aplicação
3. **Testabilidade**: Mais fácil de testar componentes individuais
4. **Legibilidade**: Código mais limpo e organizado
5. **Performance**: Melhor tree-shaking e lazy loading
6. **Colaboração**: Múltiplos desenvolvedores podem trabalhar em componentes diferentes

## Uso

```jsx
import {
  HeroHeader,
  AnalyticsSection,
  TravelSection,
  PhotoGallerySection,
  LoadingState
} from './CountryDetails';

// Uso dos componentes
<HeroHeader 
  countryId={countryId}
  countryInfo={countryInfo}
  weatherData={weatherData}
  currentTime={currentTime}
  exchangeRate={exchangeRate}
  navigate={navigate}
/>
```

## Padrões de Desenvolvimento

- **Props**: Sempre tipadas e documentadas
- **Estados**: Gerenciados localmente quando possível
- **Estilos**: CSS classes para estilos específicos
- **Ícones**: React Icons para consistência
- **Erros**: Tratamento robusto de erros e fallbacks
