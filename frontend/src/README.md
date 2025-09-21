# 📁 Estrutura de Pastas do Projeto Photomap

## 🎯 **Visão Geral da Organização**

Este projeto segue as **melhores práticas de organização** para aplicações React modernas, com foco em **escalabilidade**, **manutenibilidade** e **desenvolvimento em equipe**.

## 🏗️ **Estrutura de Pastas**

```
src/
├── components/          # Componentes React
│   ├── ui/            # Componentes base reutilizáveis
│   │   ├── buttons/   # Botões customizados
│   │   ├── forms/     # Componentes de formulário
│   │   └── index.js   # Exportações centralizadas
│   ├── features/      # Componentes específicos de features
│   │   ├── CountryDetails/    # Feature de detalhes do país
│   │   ├── landing/           # Componentes da landing page
│   │   └── index.js           # Exportações centralizadas
│   ├── layout/        # Componentes de layout
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Sidebar.jsx
│   └── modals/        # Todos os modais
│       └── index.js   # Exportações centralizadas
├── pages/             # Páginas/rotas da aplicação
├── hooks/             # Custom hooks reutilizáveis
├── services/          # Serviços e API calls
├── stores/            # Estado global (Context, Redux)
├── types/             # TypeScript types/interfaces
├── utils/             # Funções utilitárias
├── constants/         # Constantes e configurações
├── assets/            # Imagens, ícones, etc.
└── styles/            # Estilos globais
```

## 🔧 **Princípios de Organização**

### **1. Separação por Responsabilidade**
- **`ui/`**: Componentes base reutilizáveis
- **`features/`**: Componentes específicos de funcionalidades
- **`layout/`**: Componentes de estrutura da página
- **`modals/`**: Todos os modais centralizados

### **2. Arquivos de Índice (index.js)**
- **Centralizam exportações** para importações mais limpas
- **Facilitam refatoração** e manutenção
- **Melhoram a legibilidade** do código

### **3. Nomenclatura Consistente**
- **PascalCase** para componentes React
- **camelCase** para arquivos utilitários
- **kebab-case** para pastas quando necessário

## 📦 **Como Usar a Nova Estrutura**

### **Importações Antigas:**
```javascript
import SignInButton from '../components/ui/buttons/CustomButtons';
import CountryDetails from '../components/CountryDetails/CountryDetails';
```

### **Importações Novas (Recomendadas):**
```javascript
import { SignInButton } from '../components/ui';
import { CountryDetails } from '../components/features';
import { LoginModal } from '../components/modals';
```

## 🚀 **Benefícios da Nova Estrutura**

### **Para Desenvolvedores:**
- ✅ **Imports mais limpos** e organizados
- ✅ **Fácil localização** de componentes
- ✅ **Refatoração simplificada**
- ✅ **Reutilização melhorada**

### **Para o Projeto:**
- ✅ **Escalabilidade** para novos features
- ✅ **Manutenibilidade** a longo prazo
- ✅ **Onboarding** de novos devs mais rápido
- ✅ **Code review** mais eficiente

## 🔄 **Migração Gradual**

### **Fase 1: Criar estrutura (✅ Concluído)**
- Criar pastas organizadas
- Criar arquivos de índice

### **Fase 2: Mover componentes**
- Mover componentes para pastas apropriadas
- Atualizar imports gradualmente

### **Fase 3: Limpeza**
- Remover arquivos antigos
- Otimizar imports restantes

## 📚 **Próximos Passos**

1. **Mover componentes** para suas pastas apropriadas
2. **Atualizar imports** nos arquivos existentes
3. **Criar componentes base** reutilizáveis
4. **Implementar lazy loading** para melhor performance
5. **Adicionar testes** para cada feature

## 🎨 **Exemplo de Componente Organizado**

```javascript
// src/components/features/CountryDetails/CountryDetails.jsx
import React from 'react';
import { 
  HeroHeader, 
  AnalyticsSection, 
  CountryInsightsSection 
} from '../index';
import { useCountries } from '../../../hooks';
import { countryService } from '../../../services';

const CountryDetails = ({ countryCode }) => {
  // Componente organizado e limpo
};
```

---

**💡 Dica:** Esta estrutura segue os padrões da indústria e é usada por empresas como Airbnb, Netflix e Uber para projetos React de grande escala.
