import { etiqueta, peaje } from "@stellar-scaffold/app-lib/clients"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useState } from "react"
import { useNotification } from "../hooks/useNotification"
import { ZONE } from "./config"
import { friendlyError } from "./contracts"
import { knownPlates, plateHash } from "./plates"
import { usdcBalance } from "./token"

/** Todas las lecturas cuelgan de "zbe" para refrescarlas juntas tras escribir */
const POLL = { refetchInterval: 3000 }

/** Segundos Unix, actualizado cada segundo (cuenta atrás de alegación) */
export const useNow = () => {
	const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))
	useEffect(() => {
		const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
		return () => clearInterval(id)
	}, [])
	return now
}

export const useBono = (owner?: string) =>
	useQuery({
		queryKey: ["zbe", "bono", owner],
		queryFn: async () => (await peaje.balance({ owner: owner! })).result,
		enabled: !!owner,
		...POLL,
	})

export const useCharges = (owner?: string) =>
	useQuery({
		queryKey: ["zbe", "charges", owner],
		queryFn: async () =>
			(await peaje.get_charges({ owner: owner! })).result.slice().reverse(),
		enabled: !!owner,
		...POLL,
	})

export const useAllCharges = () =>
	useQuery({
		queryKey: ["zbe", "all-charges"],
		queryFn: async () => {
			const count = (await peaje.charge_count()).result
			const charges = (
				await peaje.list_charges({ from: 0n, limit: Number(count) })
			).result
			return charges.slice().reverse()
		},
		...POLL,
	})

export const useCollected = () =>
	useQuery({
		queryKey: ["zbe", "collected"],
		queryFn: async () => (await peaje.collected()).result,
		...POLL,
	})

export const useZone = (zoneId = ZONE) =>
	useQuery({
		queryKey: ["zbe", "zone", zoneId],
		queryFn: async () => (await peaje.get_zone({ zone_id: zoneId })).result,
	})

export const useConfig = () =>
	useQuery({
		queryKey: ["zbe", "config"],
		queryFn: async () => (await peaje.get_config()).result,
	})

export const useUsdcBalance = (address?: string) =>
	useQuery({
		queryKey: ["zbe", "usdc", address],
		queryFn: () => usdcBalance(address!),
		enabled: !!address,
		...POLL,
	})

/** Etiquetas de todas las matrículas conocidas, con su hash */
export const useLabels = () =>
	useQuery({
		queryKey: ["zbe", "labels"],
		queryFn: async () =>
			Promise.all(
				knownPlates().map(async (p) => {
					const hash = await plateHash(p.plate)
					const label = (await etiqueta.get({ plate_hash: hash })).result
					return { ...p, hash: hash.toString("hex"), label }
				}),
			),
		...POLL,
	})

/**
 * Ejecuta una acción que firma algo: muestra el error en español, refresca
 * las lecturas y expone `pending` para deshabilitar botones.
 */
export const useAction = () => {
	const queryClient = useQueryClient()
	const { addNotification } = useNotification()
	const [pending, setPending] = useState<string>()

	const run = useCallback(
		async <T>(key: string, fn: () => Promise<T>, success?: string) => {
			setPending(key)
			try {
				const out = await fn()
				if (success) addNotification(success, "success")
				return out
			} catch (e) {
				console.error(e)
				addNotification(friendlyError(e), "error")
				return undefined
			} finally {
				setPending(undefined)
				await queryClient.invalidateQueries({ queryKey: ["zbe"] })
			}
		},
		[addNotification, queryClient],
	)

	return { run, pending }
}
