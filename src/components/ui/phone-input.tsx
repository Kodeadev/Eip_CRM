'use client'

import * as React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Country {
  name: string
  iso_code: string
  phone_prefix: string
  flag_emoji: string
  is_default: boolean
}

interface PhoneInputProps {
  prefixValue: string
  phoneValue: string
  onPrefixChange: (value: string) => void
  onPhoneChange: (value: string) => void
  countries: Country[]
  placeholder?: string
  className?: string
  id?: string
  disabled?: boolean
}

export function PhoneInput({
  prefixValue,
  phoneValue,
  onPrefixChange,
  onPhoneChange,
  countries,
  placeholder = "Ej. 6123-4567",
  className,
  id,
  disabled = false
}: PhoneInputProps) {
  // Encontrar el país seleccionado actualmente
  const selectedCountry = countries.find(c => c.phone_prefix === prefixValue) || countries.find(c => c.is_default)

  // Asegurar que si no hay prefijo seleccionado, se elija el por defecto
  React.useEffect(() => {
    if (!prefixValue && selectedCountry) {
      onPrefixChange(selectedCountry.phone_prefix)
    }
  }, [prefixValue, selectedCountry, onPrefixChange])

  return (
    <div className={cn("flex items-center gap-1 w-full", className)}>
      <Select
        value={prefixValue || (selectedCountry?.phone_prefix ?? '')}
        onValueChange={(val) => onPrefixChange(val || '')}
        disabled={disabled}
      >
        <SelectTrigger className="w-[110px] shrink-0 bg-white dark:bg-slate-950 border-r-0 rounded-r-none focus:ring-0 focus:ring-offset-0">
          <SelectValue>
            {selectedCountry ? (
              <span className="flex items-center gap-1.5">
                <img
                  src={`https://flagcdn.com/w40/${selectedCountry.iso_code.toLowerCase()}.png`}
                  alt={selectedCountry.name}
                  className="w-5 h-3.5 object-cover rounded-sm shrink-0 shadow-sm border border-slate-100 dark:border-slate-800"
                />
                <span className="text-sm font-medium">{selectedCountry.phone_prefix}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">+507</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]" side="bottom" align="start" alignItemWithTrigger={false} sideOffset={4}>
          {countries.map((country) => (
            <SelectItem key={`${country.iso_code}-${country.phone_prefix}`} value={country.phone_prefix}>
              <span className="flex items-center gap-2.5">
                <img
                  src={`https://flagcdn.com/w40/${country.iso_code.toLowerCase()}.png`}
                  alt={country.name}
                  className="w-5 h-3.5 object-cover rounded-sm shrink-0 shadow-sm border border-slate-100 dark:border-slate-800"
                />
                <span className="font-medium">{country.name}</span>
                <span className="text-muted-foreground text-xs">({country.phone_prefix})</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        value={phoneValue || ''}
        onChange={(e) => {
          const value = e.target.value

          // Detectar país automáticamente SOLO si se ingresa explícitamente el signo "+" (ej. al copiar y pegar un número completo con prefijo)
          if (value.startsWith('+')) {
            const sortedCountries = [...countries].sort((a, b) => b.phone_prefix.length - a.phone_prefix.length)
            for (const country of sortedCountries) {
              if (value.startsWith(country.phone_prefix)) {
                const remainder = value.slice(country.phone_prefix.length).trim()
                onPrefixChange(country.phone_prefix)
                onPhoneChange(remainder)
                return
              }
            }
          }

          onPhoneChange(value)
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="rounded-l-none border-l-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary focus:border-l"
      />
    </div>
  )
}
