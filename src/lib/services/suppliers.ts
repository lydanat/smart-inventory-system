import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { SupplierFormInput } from '@/lib/validation/supplier';
import { AppError } from '@/lib/errors';

export async function getSuppliers(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('suppliers')
    .select('*, items(count)')
    .eq('business_id', businessId)
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createSupplier(businessId: string, input: SupplierFormInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      business_id: businessId,
      name: input.name,
      contact_name: input.contactName,
      phone: input.phone,
      email: input.email,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateSupplier(
  businessId: string,
  supplierId: string,
  input: SupplierFormInput
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('suppliers')
    .update({
      name: input.name,
      contact_name: input.contactName,
      phone: input.phone,
      email: input.email,
      notes: input.notes,
    })
    .eq('id', supplierId)
    .eq('business_id', businessId)
    .select()
    .single();

  if (error || !data) {
    throw error || new AppError('Supplier not found', 'NOT_FOUND', 404);
  }

  return data;
}

export async function deleteSupplier(businessId: string, supplierId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', supplierId)
    .eq('business_id', businessId);

  if (error) {
    throw error;
  }

  return { success: true };
}
