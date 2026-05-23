import { useState, useEffect } from 'react'
import {
  catalogService,
  FALLBACK_SOCIETY_STATUSES,
  FALLBACK_USER_ROLES,
  FALLBACK_PAYMENT_METHODS,
  FALLBACK_REMINDER_PRIORITIES,
  FALLBACK_COUNTRIES,
  FALLBACK_POSITIONS
} from '@/services/catalog.service'
import { LEGAL_PERSON_TYPES } from '@/constants/legal-person-types'

export function useCatalogs() {
  const [legalPersonTypes, setLegalPersonTypes] = useState<{ name: string; is_common: boolean }[]>(
    LEGAL_PERSON_TYPES.map((type, idx) => ({ name: type, is_common: idx < 5 }))
  )
  const [societyStatuses, setSocietyStatuses] = useState(FALLBACK_SOCIETY_STATUSES)
  const [userRoles, setUserRoles] = useState(FALLBACK_USER_ROLES)
  const [paymentMethods, setPaymentMethods] = useState(FALLBACK_PAYMENT_METHODS)
  const [reminderPriorities, setReminderPriorities] = useState(FALLBACK_REMINDER_PRIORITIES)
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES)
  const [positions, setPositions] = useState<string[]>(FALLBACK_POSITIONS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCatalogs() {
      try {
        const [types, statuses, roles, methods, priorities, fetchedCountries, fetchedPositions] = await Promise.all([
          catalogService.getLegalPersonTypes(),
          catalogService.getSocietyStatuses(),
          catalogService.getUserRoles(),
          catalogService.getPaymentMethods(),
          catalogService.getReminderPriorities(),
          catalogService.getCountries(),
          catalogService.getContactPositions()
        ])

        setLegalPersonTypes(types)
        setSocietyStatuses(statuses)
        setUserRoles(roles)
        setPaymentMethods(methods)
        setReminderPriorities(priorities)
        setCountries(fetchedCountries)
        setPositions(fetchedPositions)
      } catch (err) {
        console.warn('Could not load database catalogs, using front-end fallbacks.', err)
      } finally {
        setLoading(false)
      }
    }

    loadCatalogs()
  }, [])

  return {
    legalPersonTypes,
    societyStatuses,
    userRoles,
    paymentMethods,
    reminderPriorities,
    countries,
    positions,
    loading
  }
}
