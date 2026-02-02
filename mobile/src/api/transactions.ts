import api from './client';
import {
  TransactionWithDetails,
  CreateTransactionInput,
  UpdateTransactionInput,
  PaginatedResult,
  ActionResult,
} from '../types';

interface TransactionFilters {
  type?: string;
  category_id?: string;
  necessity?: string;
  event_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<PaginatedResult<TransactionWithDetails>> {
  const { data } = await api.get('/transactions', { params: filters });
  return data;
}

export async function getTransaction(id: string): Promise<TransactionWithDetails> {
  const { data } = await api.get(`/transactions/${id}`);
  return data;
}

export async function createTransaction(
  input: CreateTransactionInput
): Promise<ActionResult<TransactionWithDetails>> {
  const { data } = await api.post('/transactions', input);
  return data;
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput
): Promise<ActionResult<TransactionWithDetails>> {
  const { data } = await api.patch(`/transactions/${id}`, input);
  return data;
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const { data } = await api.delete(`/transactions/${id}`);
  return data;
}
