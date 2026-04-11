/**
 * =============================================================================
 * Payment Gateway Components - SunnyGPT Enterprise
 * =============================================================================
 * Complete payment system with multiple gateway support
 * Including: PayPal, Stripe, Square, Apple Pay, Google Pay, Amazon Pay,
 * Venmo, Cash App, Zelle, Alipay, WeChat Pay, bKash, Nagad, UPay, Nsave, Skrill, Oxapay
 * =============================================================================
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Building, 
  QrCode,
  CheckCircle,
  Loader2,
  Lock,
  Globe,
  DollarSign
} from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { Select } from './select'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card'
import { Badge } from './badge'

// ============================================================================
// PAYMENT GATEWAY TYPES & CONFIGURATION
// ============================================================================

export interface PaymentGateway {
  id: string
  name: string
  displayName: string
  icon: React.ReactNode
  iconEmoji: string
  description: string
  supportedCurrencies: string[]
  type: 'card' | 'wallet' | 'mobile' | 'bank' | 'crypto'
  isEnabled: boolean
  feePercentage: number
  fixedFee: number
  regions: string[]
}

export const PAYMENT_GATEWAYS: PaymentGateway[] = [
  // ==================== GLOBAL PAYMENT SERVICES ====================
  {
    id: 'paypal',
    name: 'paypal',
    displayName: 'PayPal',
    icon: <Wallet className="w-6 h-6 text-blue-600" />,
    iconEmoji: '🅿️',
    description: 'World\'s most popular online payment service',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'JPY', 'AUD', 'CAD'],
    type: 'wallet',
    isEnabled: true,
    feePercentage: 2.99,
    fixedFee: 0.30,
    regions: ['Global'],
  },
  {
    id: 'stripe',
    name: 'stripe',
    displayName: 'Stripe',
    icon: <CreditCard className="w-6 h-6 text-purple-600" />,
    iconEmoji: '💳',
    description: 'Global card payments for businesses',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'JPY', 'AUD', 'CAD', 'SGD'],
    type: 'card',
    isEnabled: true,
    feePercentage: 2.9,
    fixedFee: 0.30,
    regions: ['Global'],
  },
  {
    id: 'square',
    name: 'square',
    displayName: 'Square',
    icon: <Building className="w-6 h-6 text-black" />,
    iconEmoji: '⬛',
    description: 'Point-of-sale and online payments',
    supportedCurrencies: ['USD', 'GBP', 'CAD', 'AUD', 'JPY'],
    type: 'card',
    isEnabled: true,
    feePercentage: 2.6,
    fixedFee: 0.10,
    regions: ['USA', 'UK', 'Canada', 'Australia', 'Japan'],
  },
  {
    id: 'apple_pay',
    name: 'apple_pay',
    displayName: 'Apple Pay',
    icon: <Smartphone className="w-6 h-6 text-gray-900" />,
    iconEmoji: '🍎',
    description: 'Mobile payment from Apple',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'],
    type: 'wallet',
    isEnabled: true,
    feePercentage: 0,
    fixedFee: 0,
    regions: ['Global'],
  },
  {
    id: 'google_pay',
    name: 'google_pay',
    displayName: 'Google Pay',
    icon: <Smartphone className="w-6 h-6 text-blue-600" />,
    iconEmoji: '🔵',
    description: 'Digital wallet by Google',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'SGD'],
    type: 'wallet',
    isEnabled: true,
    feePercentage: 0,
    fixedFee: 0,
    regions: ['Global'],
  },
  {
    id: 'amazon_pay',
    name: 'amazon_pay',
    displayName: 'Amazon Pay',
    icon: <Globe className="w-6 h-6 text-orange-600" />,
    iconEmoji: '📦',
    description: 'Pay with your Amazon account',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'INR'],
    type: 'wallet',
    isEnabled: true,
    feePercentage: 2.9,
    fixedFee: 0.30,
    regions: ['USA', 'UK', 'Germany', 'Japan', 'India'],
  },
  {
    id: 'venmo',
    name: 'venmo',
    displayName: 'Venmo',
    icon: <Wallet className="w-6 h-6 text-teal-600" />,
    iconEmoji: '💚',
    description: 'Peer-to-peer payments by PayPal',
    supportedCurrencies: ['USD'],
    type: 'wallet',
    isEnabled: true,
    feePercentage: 3,
    fixedFee: 0,
    regions: ['USA'],
  },
  {
    id: 'cash_app',
    name: 'cash_app',
    displayName: 'Cash App',
    icon: <DollarSign className="w-6 h-6 text-black" />,
    iconEmoji: '💵',
    description: 'Mobile payments by Square',
    supportedCurrencies: ['USD', 'GBP'],
    type: 'wallet',
    isEnabled: true,
    feePercentage: 3,
    fixedFee: 0,
    regions: ['USA', 'UK'],
  },
  {
    id: 'zelle',
    name: 'zelle',
    displayName: 'Zelle',
    icon: <DollarSign className="w-6 h-6 text-red-600" />,
    iconEmoji: '⚡',
    description: 'US bank-to-bank transfers',
    supportedCurrencies: ['USD'],
    type: 'bank',
    isEnabled: true,
    feePercentage: 0,
    fixedFee: 0,
    regions: ['USA'],
  },
  // ==================== ASIAN PAYMENT SERVICES ====================
  {
    id: 'alipay',
    name: 'alipay',
    displayName: 'Alipay',
    icon: <Globe className="w-6 h-6 text-blue-600" />,
    iconEmoji: '🔶',
    description: 'China\'s leading online payment platform',
    supportedCurrencies: ['CNY', 'USD'],
    type: 'wallet',
    isEnabled: true,
    feePercentage: 0.6,
    fixedFee: 0,
    regions: ['China', 'Global'],
  },
  {
    id: 'wechat_pay',
    name: 'wechat_pay',
    displayName: 'WeChat Pay',
    icon: <Smartphone className="w-6 h-6 text-green-600" />,
    iconEmoji: '💬',
    description: 'Integrated payment in WeChat',
    supportedCurrencies: ['CNY', 'USD'],
    type: 'wallet',
    isEnabled: true,
    feePercentage: 0.6,
    fixedFee: 0,
    regions: ['China', 'Global'],
  },
  // ==================== BANGLADESH PAYMENT SERVICES ====================
  {
    id: 'bkash',
    name: 'bkash',
    displayName: 'bKash',
    icon: <Smartphone className="w-6 h-6 text-pink-600" />,
    iconEmoji: '💕',
    description: 'Bangladesh mobile wallet',
    supportedCurrencies: ['BDT'],
    type: 'mobile',
    isEnabled: true,
    feePercentage: 1.5,
    fixedFee: 5,
    regions: ['Bangladesh'],
  },
  {
    id: 'nagad',
    name: 'nagad',
    displayName: 'Nagad',
    icon: <Smartphone className="w-6 h-6 text-orange-600" />,
    iconEmoji: '🌙',
    description: 'Digital payment service Bangladesh',
    supportedCurrencies: ['BDT'],
    type: 'mobile',
    isEnabled: true,
    feePercentage: 1.5,
    fixedFee: 5,
    regions: ['Bangladesh'],
  },
  {
    id: 'upay',
    name: 'upay',
    displayName: 'UPay',
    icon: <Smartphone className="w-6 h-6 text-purple-600" />,
    iconEmoji: '✨',
    description: 'Universal payment solution',
    supportedCurrencies: ['BDT'],
    type: 'mobile',
    isEnabled: true,
    feePercentage: 1.2,
    fixedFee: 3,
    regions: ['Bangladesh'],
  },
  {
    id: 'nsave',
    name: 'nsave',
    displayName: 'Nsave',
    icon: <Wallet className="w-6 h-6 text-indigo-600" />,
    iconEmoji: '💰',
    description: 'Digital wallet and savings',
    supportedCurrencies: ['BDT', 'USD'],
    type: 'wallet',
    isEnabled: true,
    feePercentage: 1,
    fixedFee: 2,
    regions: ['Bangladesh'],
  },
  // ==================== INTERNATIONAL WALLETS & CRYPTO ====================
  {
    id: 'skrill',
    name: 'skrill',
    displayName: 'Skrill',
    icon: <Wallet className="w-6 h-6 text-teal-600" />,
    iconEmoji: '💸',
    description: 'International e-wallet',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    type: 'wallet',
    isEnabled: true,
    feePercentage: 2.5,
    fixedFee: 0.50,
    regions: ['Global'],
  },
  {
    id: 'oxapay',
    name: 'oxapay',
    displayName: 'Oxapay',
    icon: <Globe className="w-6 h-6 text-indigo-600" />,
    iconEmoji: '🔗',
    description: 'Crypto and fiat gateway',
    supportedCurrencies: ['USD', 'EUR', 'BTC', 'ETH', 'USDT'],
    type: 'crypto',
    isEnabled: true,
    feePercentage: 3,
    fixedFee: 0,
    regions: ['Global'],
  },
  {
    id: 'payoneer',
    name: 'payoneer',
    displayName: 'Payoneer',
    icon: <Globe className="w-6 h-6 text-orange-600" />,
    iconEmoji: '🌍',
    description: 'Global payments and mass payouts',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'BDT'],
    type: 'wallet',
    isEnabled: true,
    feePercentage: 0,
    fixedFee: 0,
    regions: ['Global'],
  },
  {
    id: 'bank_transfer',
    name: 'bank_transfer',
    displayName: 'Bank Transfer',
    icon: <Building className="w-6 h-6 text-gray-600" />,
    iconEmoji: '🏦',
    description: 'Direct bank transfer',
    supportedCurrencies: ['USD', 'BDT', 'EUR', 'GBP', 'INR'],
    type: 'bank',
    isEnabled: true,
    feePercentage: 0,
    fixedFee: 0,
    regions: ['Global'],
  },
]

// ============================================================================
// CURRENCY CONFIGURATION
// ============================================================================

export interface Currency {
  code: string
  symbol: string
  name: string
  decimalPlaces: number
  exchangeRate: number // Exchange rate to USD
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', decimalPlaces: 2, exchangeRate: 1 },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', decimalPlaces: 2, exchangeRate: 120 },
  { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2, exchangeRate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimalPlaces: 2, exchangeRate: 0.79 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2, exchangeRate: 83 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2, exchangeRate: 7.24 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0, exchangeRate: 157 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2, exchangeRate: 1.53 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2, exchangeRate: 1.36 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimalPlaces: 2, exchangeRate: 1.34 },
]

// ============================================================================
// PAYMENT GATEWAY SELECTOR COMPONENT
// ============================================================================

interface PaymentGatewaySelectorProps {
  onSelect: (gateway: PaymentGateway) => void
  selectedGateway?: string
  amount?: number
  currency?: string
  className?: string
}

export function PaymentGatewaySelector({
  onSelect,
  selectedGateway,
  amount,
  currency = 'USD',
  className,
}: PaymentGatewaySelectorProps) {
  const [search, setSearch] = React.useState('')

  const filteredGateways = PAYMENT_GATEWAYS.filter(
    (gw) =>
      gw.isEnabled &&
      gw.supportedCurrencies.includes(currency) &&
      (gw.displayName.toLowerCase().includes(search.toLowerCase()) ||
        gw.name.toLowerCase().includes(search.toLowerCase()))
  )

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'card':
        return '💳'
      case 'wallet':
        return '👛'
      case 'mobile':
        return '📱'
      case 'bank':
        return '🏦'
      case 'crypto':
        return '₿'
      default:
        return '💰'
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Input
        placeholder="Search payment methods..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<span>🔍</span>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredGateways.map((gateway) => (
          <button
            key={gateway.id}
            type="button"
            onClick={() => onSelect(gateway)}
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
              selectedGateway === gateway.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <div className="text-2xl">{getGatewayIcon(gateway.type)}</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{gateway.displayName}</p>
              <p className="text-xs text-gray-500">{gateway.description}</p>
            </div>
            {selectedGateway === gateway.id && (
              <CheckCircle className="w-5 h-5 text-indigo-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// PAYMENT FORM COMPONENT
// ============================================================================

interface PaymentFormProps {
  gateway: PaymentGateway
  amount: number
  currency: string
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
}

export function PaymentForm({
  gateway,
  amount,
  currency,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Calculate fees
  const feePercentage = (amount * gateway.feePercentage) / 100
  const totalAmount = amount + feePercentage + gateway.fixedFee

  const renderGatewayForm = () => {
    switch (gateway.id) {
      case 'stripe':
      case 'payoneer':
        return (
          <>
            <Input label="Card Number" placeholder="1234 5678 9012 3456" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Expiry Date" placeholder="MM/YY" />
              <Input label="CVC" placeholder="123" type="password" />
            </div>
            <Input label="Cardholder Name" placeholder="John Doe" />
          </>
        )

      case 'bkash':
      case 'nagad':
      case 'upay':
        return (
          <>
            <Input label="Mobile Number" placeholder="01XXXXXXXXX" helperText="Enter your registered mobile number" />
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <QrCode className="w-32 h-32 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Scan QR to pay</p>
            </div>
          </>
        )

      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Bank Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Bank Name:</span> <span className="font-medium">Bank Asia</span></p>
                <p><span className="text-gray-600">Account Number:</span> <span className="font-medium">1234567890</span></p>
                <p><span className="text-gray-600">Branch:</span> <span className="font-medium">Gulshan Branch</span></p>
                <p><span className="text-gray-600">Routing Number:</span> <span className="font-medium">123456789</span></p>
              </div>
            </div>
            <Input label="Transaction ID" placeholder="Enter your transaction ID" helperText="You must send the amount first, then enter the transaction ID" />
          </div>
        )

      case 'oxapay':
        return (
          <div className="space-y-4">
            <Select
              label="Select Cryptocurrency"
              options={[
                { value: 'btc', label: 'Bitcoin (BTC)' },
                { value: 'eth', label: 'Ethereum (ETH)' },
                { value: 'usdt', label: 'Tether (USDT)' },
              ]}
              onChange={() => {}}
              placeholder="Select crypto"
            />
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Send exactly this amount:</p>
              <p className="text-2xl font-bold text-gray-900">0.001234 BTC</p>
            </div>
          </div>
        )

      default:
        return <p className="text-gray-500">Payment form for {gateway.displayName}</p>
    }
  }

  return (
    <div className="space-y-6">
      {/* Amount Summary */}
      <div className="p-4 bg-gray-50 rounded-xl space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{currency} {amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Processing Fee ({gateway.feePercentage}%)</span>
          <span className="font-medium">{currency} {feePercentage.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Fixed Fee</span>
          <span className="font-medium">{currency} {gateway.fixedFee.toFixed(2)}</span>
        </div>
        <div className="h-px bg-gray-200 my-2" />
        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-indigo-600">{currency} {totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Gateway Form */}
      <div className="space-y-4">{renderGatewayForm()}</div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Lock className="w-4 h-4" />
        <span>Your payment is secure and encrypted</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          onClick={async () => {
            setLoading(true)
            setError(null)
            try {
              await onSubmit({ gateway: gateway.id, amount: totalAmount })
            } catch (err: any) {
              setError(err.message || 'Payment failed')
            } finally {
              setLoading(false)
            }
          }}
          loading={loading}
          className="flex-1"
        >
          Pay {currency} {totalAmount.toFixed(2)}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// PAYMENT METHOD CARD COMPONENT
// ============================================================================

interface PaymentMethodCardProps {
  gateway: PaymentGateway
  isDefault?: boolean
  onSetDefault?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function PaymentMethodCard({
  gateway,
  isDefault = false,
  onSetDefault,
  onEdit,
  onDelete,
}: PaymentMethodCardProps) {
  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="w-6 h-6 text-indigo-600" />
      case 'wallet': return <Wallet className="w-6 h-6 text-emerald-600" />
      case 'mobile': return <Smartphone className="w-6 h-6 text-blue-600" />
      case 'bank': return <Building className="w-6 h-6 text-amber-600" />
      case 'crypto': return <Globe className="w-6 h-6 text-purple-600" />
      default: return <CreditCard className="w-6 h-6" />
    }
  }

  return (
    <div className={cn(
      'p-4 rounded-xl border-2',
      isDefault ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getGatewayIcon(gateway.type)}
          <div>
            <p className="font-medium text-gray-900">{gateway.displayName}</p>
            <p className="text-xs text-gray-500">{gateway.supportedCurrencies.join(', ')}</p>
          </div>
        </div>
        {isDefault && <Badge variant="primary">Default</Badge>}
      </div>
      <div className="flex gap-2 mt-3">
        {onSetDefault && !isDefault && (
          <button onClick={onSetDefault} className="text-xs text-indigo-600 hover:underline">
            Set as default
          </button>
        )}
        {onEdit && (
          <button onClick={onEdit} className="text-xs text-gray-600 hover:underline">
            Edit
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="text-xs text-red-600 hover:underline">
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// INVOICE COMPONENT
// ============================================================================

interface InvoicePreviewProps {
  invoiceNumber: string
  date: string
  dueDate: string
  customer: {
    name: string
    email: string
    address?: string
  }
  items: {
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
}

export function InvoicePreview({
  invoiceNumber,
  date,
  dueDate,
  customer,
  items,
  subtotal,
  taxRate,
  taxAmount,
  total,
  currency,
  status,
}: InvoicePreviewProps) {
  const statusColors: Record<typeof status, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'> = {
    draft: 'default',
    sent: 'info',
    paid: 'success',
    overdue: 'danger',
  }

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || currency

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-2xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
          <p className="text-gray-500">#{invoiceNumber}</p>
        </div>
        <Badge variant={statusColors[status]}>{status.toUpperCase()}</Badge>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Issue Date</p>
          <p className="font-medium">{date}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Due Date</p>
          <p className="font-medium">{dueDate}</p>
        </div>
      </div>

      {/* Customer */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500 mb-1">Bill To:</p>
        <p className="font-medium">{customer.name}</p>
        <p className="text-sm text-gray-600">{customer.email}</p>
        {customer.address && <p className="text-sm text-gray-600">{customer.address}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 text-sm text-gray-500">Description</th>
            <th className="text-right py-2 text-sm text-gray-500">Qty</th>
            <th className="text-right py-2 text-sm text-gray-500">Price</th>
            <th className="text-right py-2 text-sm text-gray-500">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-3">{item.description}</td>
              <td className="py-3 text-right">{item.quantity}</td>
              <td className="py-3 text-right">{currencySymbol}{item.unitPrice.toFixed(2)}</td>
              <td className="py-3 text-right font-medium">{currencySymbol}{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>{currencySymbol}{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax ({taxRate}%)</span>
          <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>Total</span>
          <span className="text-indigo-600">{currencySymbol}{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}