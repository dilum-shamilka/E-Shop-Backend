import axios from 'axios';

const API_BASE_URL = '/api/orders';

interface CODOrderRequest {
  products: {
    product: string;
    quantity: number;
  }[];
  total?: number;
  subtotal?: number;
  shipping?: number;
  address?: {
    fullName?: string;
    name?: string;
    phone?: string;
    phoneNumber?: string;
    street?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  shippingAddress?: CODOrderRequest['address'];
}

interface CODOrderResponse {
  message: string;
  order: {
    _id: string;
    user: string;
    products: any[];
    total: number;
    address: {
      fullName: string;
      phone: string;
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    paymentMethod: 'COD';
    status: 'pending';
    createdAt: string;
    updatedAt: string;
  };
}

export const paymentService = {
  initiatePayment: async (data: CODOrderRequest): Promise<CODOrderResponse> => {
    try {
      // Safely fetches bearer token variants from application LocalStorage 
      const token = typeof localStorage !== 'undefined'
        ? localStorage.getItem('accessToken') || localStorage.getItem('token')
        : '';

      const calculatedTotal =
        data.total ??
        ((typeof data.subtotal === 'number' ? data.subtotal : 0) +
          (typeof data.shipping === 'number' ? data.shipping : 0));

      const normalizedAddress = data.address || data.shippingAddress || {};
      
      const response = await axios.post<CODOrderResponse>(
        `${API_BASE_URL}`,
        {
          ...data,
          total: calculatedTotal,
          address: normalizedAddress,
          paymentMethod: 'COD'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ COD Order placement error:', error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Unable to place COD order. Please try again.');
    }
  },
};