import { defaultSchedule, type Schedule } from "@/lib/schedule"

// TODO: Replace with real fetch from https://data.wortle.app/schedule.json
export const fetchSchedule = (): Promise<Schedule> => Promise.resolve(defaultSchedule)
