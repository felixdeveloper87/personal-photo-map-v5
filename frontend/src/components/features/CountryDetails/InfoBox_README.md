# InfoBox Component - Professional Edition

O InfoBox foi completamente redesenhado para oferecer uma experiência visual profissional e moderna, com animações suaves, gradientes elegantes e múltiplas variantes de design.

## 🚀 Novas Funcionalidades

### 1. **Variantes de Design**
- **`default`**: Design clássico com fundo sólido
- **`gradient`**: Fundo com gradiente colorido baseado no colorScheme
- **`glass`**: Efeito glassmorphism com transparência e blur

### 2. **Esquemas de Cores Profissionais**
- **9 cores predefinidas** com gradientes únicos
- **Sombras coloridas** que combinam com cada esquema
- **Bordas coordenadas** para consistência visual

### 3. **Animações Avançadas**
- **Entrada suave** com fade-in e scale
- **Hover interativo** com elevação e rotação de ícones
- **Micro-interações** para feedback visual
- **Transições fluidas** com curvas de easing personalizadas

### 4. **Estados Visuais**
- **Loading state** com skeleton loaders
- **Hover effects** aprimorados
- **Focus states** para acessibilidade
- **Active states** para interações

### 5. **Recursos de UX**
- **Tooltips informativos** opcionais
- **Ícones com fundo** e bordas sutis
- **Tipografia aprimorada** com melhor hierarquia
- **Responsividade refinada** para todos os dispositivos

## 📱 Uso Básico

```jsx
// InfoBox padrão
<InfoBox 
  icon={FaUsers} 
  label="Population" 
  value="1.4B" 
  colorScheme="green" 
/>

// InfoBox com gradiente
<InfoBox 
  icon={FaThermometerHalf} 
  label="Temperature" 
  value="25°C" 
  colorScheme="red" 
  variant="gradient"
/>

// InfoBox glassmorphism
<InfoBox 
  icon={FaCity} 
  label="Capital" 
  value="Tokyo" 
  colorScheme="purple" 
  variant="glass"
/>
```

## 🎨 Propriedades Disponíveis

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `icon` | ReactIcon | - | Ícone a ser exibido |
| `label` | string | - | Texto do label |
| `value` | string/number | 'N/A' | Valor a ser exibido |
| `colorScheme` | string | 'blue' | Esquema de cores |
| `onClick` | function | undefined | Função de clique |
| `size` | string | 'default' | Tamanho do componente |
| `isLoading` | boolean | false | Estado de carregamento |
| `tooltip` | string | null | Texto do tooltip |
| `variant` | string | 'default' | Variante de design |

## 🎯 Tamanhos Disponíveis

- **`default`**: 140x140px (desktop) / 100x100px (mobile)
- **`large`**: 180x180px (desktop) / 120x120px (mobile)  
- **`mobile`**: 80x80px (otimizado para mobile)

## 🌈 Esquemas de Cores

- **`blue`**: Azul para tecnologia/informação
- **`green`**: Verde para sucesso/crescimento
- **`red`**: Vermelho para alertas/temperatura
- **`orange`**: Laranja para energia/atenção
- **`purple`**: Roxo para criatividade/luxo
- **`yellow`**: Amarelo para otimismo/energia
- **`cyan`**: Ciano para água/calma
- **`pink`**: Rosa para saúde/amor
- **`indigo`**: Índigo para sabedoria/educação

## ✨ Exemplos de Uso Avançado

### InfoBox com Tooltip
```jsx
<InfoBox 
  icon={FaUsers} 
  label="Population" 
  value="1.4B" 
  colorScheme="green" 
  variant="gradient"
  tooltip="Total population count as of 2024"
/>
```

### InfoBox com Loading State
```jsx
<InfoBox 
  icon={FaThermometerHalf} 
  label="Temperature" 
  value={temperature} 
  colorScheme="red" 
  variant="gradient"
  isLoading={isLoadingWeather}
/>
```

### InfoBox Interativo
```jsx
<InfoBox 
  icon={FaMapMarkerAlt} 
  label="Location" 
  value="Tokyo, Japan" 
  colorScheme="blue" 
  variant="glass"
  onClick={() => handleLocationClick()}
/>
```

## 🔧 Customização

### Estilos Personalizados
O componente usa Chakra UI para estilos, permitindo fácil customização através de props ou theme.

### Animações
As animações são baseadas em Framer Motion e podem ser customizadas modificando os `variants`.

### Responsividade
O componente se adapta automaticamente a diferentes tamanhos de tela usando breakpoints do Chakra UI.

## 🎭 Variantes Visuais

### Default
- Fundo sólido com bordas sutis
- Sombras suaves
- Ideal para informações básicas

### Gradient  
- Fundos com gradientes coloridos
- Texto branco com sombras
- Efeito de brilho sutil no hover
- Perfeito para destaque visual

### Glass
- Transparência com blur
- Bordas translúcidas
- Efeito moderno e elegante
- Ideal para overlays e modais

## 🚀 Performance

- **Lazy loading** de animações
- **Otimização de re-renders** com React.memo
- **Animações CSS** quando possível
- **Bundle size** otimizado

## 🔮 Roadmap

- [ ] Suporte a imagens como ícones
- [ ] Animações de entrada em sequência
- [ ] Temas personalizáveis
- [ ] Suporte a badges e indicadores
- [ ] Integração com sistema de notificações
