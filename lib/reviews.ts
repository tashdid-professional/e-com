import { supabase } from './supabase';

export async function canUserReviewProduct(userId: string, productId: string): Promise<boolean> {
  // Get user email to check orders (for backward compatibility with existing orders)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  // Check if user has ordered this product and it was delivered
  // Check both user_id (for new orders) and customer_email (for existing orders)
  const { data: deliveredOrders } = await supabase
    .from('orders')
    .select(`
      id,
      order_items!inner(product_id)
    `)
    .eq('status', 'delivered')
    .eq('order_items.product_id', productId)
    .or(`user_id.eq.${userId},customer_email.eq.${user.email}`);

  return (deliveredOrders && deliveredOrders.length > 0);
}

export async function hasUserReviewedProduct(userId: string, productId: string): Promise<boolean> {
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  return existingReview !== null;
}

export async function getUserDeliveredOrderForProduct(userId: string, productId: string) {
  // Get user email to check orders (for backward compatibility with existing orders)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: order } = await supabase
    .from('orders')
    .select(`
      id,
      order_items!inner(product_id)
    `)
    .eq('status', 'delivered')
    .eq('order_items.product_id', productId)
    .or(`user_id.eq.${userId},customer_email.eq.${user.email}`)
    .limit(1)
    .single();

  return order;
}