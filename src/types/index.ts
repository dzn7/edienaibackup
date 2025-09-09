export interface Crediario {
  id: string;
  data: {
    customerName: string;
    isActive: boolean;
    createdAt: {
      _seconds: number;
      _nanoseconds: number;
    };
    updatedAt: {
      _seconds: number;
      _nanoseconds: number;
    };
  };
  subcollections: {
    history: Array<{
      id: string;
      data: {
        type: 'consumption' | 'payment';
        amount: number;
        description: string;
        date: {
          _seconds: number;
          _nanoseconds: number;
        };
        reason?: string;
        timestamp?: {
          _seconds: number;
          _nanoseconds: number;
        };
      };
    }>;
  };
}

export interface ProcessedCrediario extends Crediario {
  totalConsumption: number;
  totalPayments: number;
  currentBalance: number;
  transactionCount: number;
  aiConnection?: {
    crediarioId: string;
    pedidoIds: string[];
    confidence: number;
    matchDetails: {
      nameMatch: number;
      valueMatch: number;
      dateMatch: number;
    };
  };
  connectedPedidos?: Pedido[];
}

export interface Pedido {
  id: string;
  data: {
    orderId: string;
    customerName: string;
    customerEmail?: string;
    items: Array<{
      productId: string;
      name: string;
      quantity: number;
      basePrice: number;
      unitPriceWithComplements: number;
      complements: any[];
      totalItemPrice: number;
    }>;
    totalAmount: number;
    total?: number;
    status: string;
    sentAt: {
      _seconds: number;
      _nanoseconds: number;
    };
    tableNumber?: number;
    paymentMethod?: string;
    observations?: string;
    deliveryOption?: {
      type: string;
      address?: string;
    };
  };
}

export interface Produto {
  id: string;
  data: {
    nome: string;
    categoria: string;
    preco: number;
    descricao?: string;
    disponivel: boolean;
    imagem?: string;
  };
}

export interface Estoque {
  id: string;
  data: {
    productId: string;
    productName: string;
    currentStock: number;
    minStock: number;
    lastUpdated: {
      _seconds: number;
      _nanoseconds: number;
    };
  };
}

export interface Mesa {
  id: string;
  data: {
    tableNumber: number;
    isOccupied: boolean;
    capacity: number;
    currentOrder?: string;
  };
}

export interface Usuario {
  id: string;
  data: {
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: {
      _seconds: number;
      _nanoseconds: number;
    };
  };
}

export interface Despesa {
  id: string;
  data: {
    description: string;
    amount: number;
    category: string;
    date: {
      _seconds: number;
      _nanoseconds: number;
    };
  };
}

export interface RealtimeOrder {
  id: string;
  data: {
    orderId: string;
    customerName: string;
    status: string;
    items: any[];
    totalAmount: number;
    createdAt: {
      _seconds: number;
      _nanoseconds: number;
    };
  };
}

export interface Complemento {
  id: string;
  data: {
    nome: string;
    categoria: string;
    preco: number;
    disponivel: boolean;
  };
}

export type CollectionData = {
  crediarios: Crediario[];
  pedidos: Pedido[];
  produtos: Produto[];
  estoque: Estoque[];
  mesas: Mesa[];
  users: Usuario[];
  expenses: Despesa[];
  realtime_orders: RealtimeOrder[];
  complementos_disponiveis: Complemento[];
};
