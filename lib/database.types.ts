export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          category: string | null;
          stock: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          category?: string | null;
          stock?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          category?: string | null;
          stock?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address: string;
          total_amount: number;
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address: string;
          total_amount: number;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          shipping_address?: string;
          total_amount?: number;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          display_order?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
