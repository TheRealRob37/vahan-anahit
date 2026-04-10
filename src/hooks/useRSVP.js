import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { config } from '../config/wedding'

const {
  rsvp: { defaultGuestCount, sides, tableName },
  copy: {
    rsvp: { errorMessage },
  },
} = config

export function useRSVP() {
  const [attending, setAttending] = useState(null)
  const [host, setHost]           = useState(sides[0]?.value ?? '')
  const [guests, setGuests]       = useState(defaultGuestCount)
  const [name1, setName1]         = useState('')
  const [surname1, setSurname1]   = useState('')
  const [name2, setName2]         = useState('')
  const [surname2, setSurname2]   = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState(null)
  const [loading, setLoading]     = useState(false)

  const isValid = useCallback(() => {
    if (!attending) return false
    if (!name1.trim() || !surname1.trim()) return false
    if (guests === 2 && (!name2.trim() || !surname2.trim())) return false
    return true
  }, [attending, name1, surname1, guests, name2, surname2])

  const submit = useCallback(async (e) => {
    e.preventDefault()
    if (!isValid()) return
    setLoading(true)
    setError(null)
    try {
      const { error: sbError } = await supabase.from(tableName).insert([{
        attending,
        host,
        guests,
        name1: name1.trim(),
        surname1: surname1.trim(),
        name2: guests === 2 ? name2.trim() : null,
        surname2: guests === 2 ? surname2.trim() : null,
      }])
      if (sbError) throw sbError
      setSubmitted(true)
    } catch (err) {
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [isValid, attending, host, guests, name1, surname1, name2, surname2])

  return {
    attending, setAttending,
    host, setHost,
    guests, setGuests,
    name1, setName1,
    surname1, setSurname1,
    name2, setName2,
    surname2, setSurname2,
    submitted, error, loading,
    isValid, submit,
  }
}
